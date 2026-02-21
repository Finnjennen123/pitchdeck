// Process raw Overpass API OSM data into compact building footprints
// Output: array of { coords: [x,z][], height: number }
// Where x,z are local coordinates in meters relative to Financial District center

import { readFileSync, writeFileSync } from 'fs';

const raw = JSON.parse(readFileSync('src/data/sf-buildings-raw.json', 'utf8'));

// Reference point: center of SF Financial District
const REF_LAT = 37.7925;
const REF_LNG = -122.3990;
const METERS_PER_DEG_LAT = 111320;
const METERS_PER_DEG_LNG = 111320 * Math.cos(REF_LAT * Math.PI / 180);

// Build a lookup of node ID -> [lat, lng]
const nodes = new Map();
for (const el of raw.elements) {
  if (el.type === 'node') {
    nodes.set(el.id, [el.lat, el.lon]);
  }
}

// Known SF building heights (meters) by name or address
const KNOWN_HEIGHTS = {
  'Salesforce Tower': 326,
  'Transamerica Pyramid': 260,
  '181 Fremont Street': 244,
  '555 California Street': 237,
  'Millennium Tower': 197,
  'One Rincon Hill South Tower': 184,
  '50 Fremont Center': 183,
  'Four Embarcadero Center': 174,
  '345 California Center': 212,
  'Embarcadero Center': 174,
  'First Market Tower': 161,
  'Spear Tower': 174,
  '101 California Street': 183,
  '44 Montgomery Street': 172,
  '425 Market Street': 161,
  'McKesson Plaza': 161,
  'One Market Plaza': 160,
};

function getHeight(tags) {
  if (!tags) return null;

  // Direct height tag (meters)
  if (tags.height) {
    const h = parseFloat(tags.height);
    if (!isNaN(h)) return h;
  }

  // Building levels
  if (tags['building:levels']) {
    const levels = parseFloat(tags['building:levels']);
    if (!isNaN(levels)) return levels * 3.5;
  }

  // Known buildings by name
  if (tags.name) {
    for (const [name, height] of Object.entries(KNOWN_HEIGHTS)) {
      if (tags.name.includes(name)) return height;
    }
  }

  return null;
}

// Process building ways
const buildings = [];
let skipped = 0;
let noHeight = 0;

for (const el of raw.elements) {
  if (el.type !== 'way' || !el.tags || !el.tags.building) continue;

  // Get coordinates for this building's nodes
  const coords = [];
  let valid = true;
  for (const nodeId of el.nodes) {
    const node = nodes.get(nodeId);
    if (!node) { valid = false; break; }
    const [lat, lng] = node;
    const x = (lng - REF_LNG) * METERS_PER_DEG_LNG;
    const z = -(lat - REF_LAT) * METERS_PER_DEG_LAT;
    coords.push([Math.round(x * 10) / 10, Math.round(z * 10) / 10]);
  }

  if (!valid || coords.length < 3) { skipped++; continue; }

  let height = getHeight(el.tags);
  if (height === null) {
    // Default height based on building type
    const type = el.tags.building;
    if (type === 'skyscraper' || type === 'tower') height = 80;
    else if (type === 'commercial' || type === 'office') height = 25;
    else if (type === 'residential') height = 12;
    else height = 15; // generic default
    noHeight++;
  }

  // Round height
  height = Math.round(height * 10) / 10;

  buildings.push({ c: coords, h: height });
}

console.log(`Processed ${buildings.length} buildings (${skipped} skipped, ${noHeight} default height)`);
console.log(`Tallest: ${Math.max(...buildings.map(b => b.h))}m`);

// Write compact output
const output = JSON.stringify(buildings);
writeFileSync('src/data/sf-buildings.json', output);
console.log(`Output: ${(output.length / 1024).toFixed(0)}KB`);
