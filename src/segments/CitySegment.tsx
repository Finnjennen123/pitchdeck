import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getStarTexture } from '../components/SoftStars';
import { cloudNoiseVertexShader, cloudNoiseFragmentShader } from '../shaders/cloudNoise';
import sfBuildingsData from '../data/sf-buildings.json';

// Scale: convert meters to scene units. 1 unit = ~50 meters
const SCALE = 1 / 50;

// Type for building data
interface BuildingData {
  c: number[][]; // coordinates [[x,z], ...] in meters from ref point
  h: number;     // height in meters
}

const sfBuildings = sfBuildingsData as BuildingData[];

// Deterministic pseudo-random
const srand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Known landmark heights for special treatment
const TRANSAMERICA_HEIGHT = 260;

function generateBuildingsFromOSM(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];

  for (let bi = 0; bi < sfBuildings.length; bi++) {
    const bld = sfBuildings[bi];
    const coords = bld.c;
    const height = bld.h * SCALE;

    if (coords.length < 3 || height < 0.05) continue;

    // Scale coords
    const scaledCoords = coords.map(c => [c[0] * SCALE, c[1] * SCALE] as [number, number]);

    // Building color based on height
    const colorSeed = srand(bi * 7 + 42);
    let r: number, g: number, b: number;

    if (height > 3) {
      // Tall glass towers - cool blue/steel with more variation
      r = 0.28 + colorSeed * 0.15;
      g = 0.33 + colorSeed * 0.13;
      b = 0.50 + colorSeed * 0.18;
    } else if (height > 1.5) {
      // Mid-rise - mix of concrete and glass
      if (colorSeed > 0.5) {
        r = 0.35 + srand(bi * 11) * 0.12;
        g = 0.30 + srand(bi * 13) * 0.10;
        b = 0.26 + srand(bi * 17) * 0.08;
      } else {
        r = 0.25 + srand(bi * 11) * 0.12;
        g = 0.29 + srand(bi * 13) * 0.12;
        b = 0.38 + srand(bi * 17) * 0.12;
      }
    } else {
      // Low-rise - warm brick/stucco tones
      r = 0.33 + srand(bi * 11) * 0.14;
      g = 0.27 + srand(bi * 13) * 0.10;
      b = 0.22 + srand(bi * 17) * 0.08;
    }

    // Special case: Transamerica Pyramid (260m) - taper it
    const isTransamerica = Math.abs(bld.h - TRANSAMERICA_HEIGHT) < 1;

    if (isTransamerica) {
      // Create tapered pyramid from base footprint
      const numSections = 12;
      for (let s = 0; s < numSections; s++) {
        const t0 = s / numSections;
        const t1 = (s + 1) / numSections;
        const y0 = t0 * height;
        const y1 = t1 * height;
        // Taper factor: 1 at base, ~0.05 at top
        const taper0 = 1 - t0 * 0.95;
        const taper1 = 1 - t1 * 0.95;

        // Compute centroid for tapering
        let cx = 0, cz = 0;
        for (const [x, z] of scaledCoords) { cx += x; cz += z; }
        cx /= scaledCoords.length;
        cz /= scaledCoords.length;

        for (let i = 0; i < scaledCoords.length - 1; i++) {
          const [ox1, oz1] = scaledCoords[i];
          const [ox2, oz2] = scaledCoords[i + 1];
          // Tapered positions
          const x1b = cx + (ox1 - cx) * taper0, z1b = cz + (oz1 - cz) * taper0;
          const x2b = cx + (ox2 - cx) * taper0, z2b = cz + (oz2 - cz) * taper0;
          const x1t = cx + (ox1 - cx) * taper1, z1t = cz + (oz1 - cz) * taper1;
          const x2t = cx + (ox2 - cx) * taper1, z2t = cz + (oz2 - cz) * taper1;

          // Two triangles per quad
          positions.push(x1b, y0, z1b, x2b, y0, z2b, x2t, y1, z2t);
          positions.push(x1b, y0, z1b, x2t, y1, z2t, x1t, y1, z1t);

          const dx = ox2 - ox1;
          const dz = oz2 - oz1;
          const len = Math.sqrt(dx * dx + dz * dz) || 1;
          const nx = -dz / len;
          const nz = dx / len;
          // Slight upward normal component for tapered faces
          const ny = 0.2 * (1 - taper0);
          const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz);

          for (let j = 0; j < 6; j++) {
            normals.push(nx / nlen, ny / nlen, nz / nlen);
            const fv = 0.85 + (s % 3) * 0.05;
            // Transamerica: white concrete color
            colors.push(0.55 * fv, 0.52 * fv, 0.48 * fv);
          }
        }
      }
      continue; // Skip normal extrusion
    }

    // Normal building extrusion: walls
    for (let i = 0; i < scaledCoords.length - 1; i++) {
      const [x1, z1] = scaledCoords[i];
      const [x2, z2] = scaledCoords[i + 1];

      // Wall quad (2 triangles)
      positions.push(x1, 0, z1, x2, 0, z2, x2, height, z2);
      positions.push(x1, 0, z1, x2, height, z2, x1, height, z1);

      // Normal: perpendicular to wall face
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz) || 1;
      const nx = -dz / len;
      const nz = dx / len;

      for (let j = 0; j < 6; j++) {
        normals.push(nx, 0, nz);
        const fv = 0.90 + (i % 3) * 0.04;
        colors.push(r * fv, g * fv, b * fv);
      }
    }

    // Top face - fan triangulation from centroid
    if (scaledCoords.length >= 3) {
      let cx = 0, cz = 0;
      for (const [x, z] of scaledCoords) { cx += x; cz += z; }
      cx /= scaledCoords.length;
      cz /= scaledCoords.length;

      for (let i = 0; i < scaledCoords.length - 1; i++) {
        const [x1, z1] = scaledCoords[i];
        const [x2, z2] = scaledCoords[i + 1];

        positions.push(cx, height, cz, x1, height, z1, x2, height, z2);
        normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);

        const topBright = 1.08;
        colors.push(r * topBright, g * topBright, b * topBright);
        colors.push(r * topBright, g * topBright, b * topBright);
        colors.push(r * topBright, g * topBright, b * topBright);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geo;
}

// Window lights positioned on actual building faces
function WindowLights() {
  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];

    for (let bi = 0; bi < sfBuildings.length; bi++) {
      const bld = sfBuildings[bi];
      const height = bld.h * SCALE;
      if (height < 0.4) continue;

      const coords = bld.c;
      // More lights on taller buildings
      const numLights = Math.min(Math.floor(height * 4), 30);

      for (let li = 0; li < numLights; li++) {
        const seed = bi * 100 + li;
        const edgeIdx = Math.floor(srand(seed) * (coords.length - 1));
        const t = srand(seed + 1);
        const c1 = coords[edgeIdx];
        const c2 = coords[Math.min(edgeIdx + 1, coords.length - 1)];

        const x = (c1[0] + (c2[0] - c1[0]) * t) * SCALE;
        const z = (c1[1] + (c2[1] - c1[1]) * t) * SCALE;
        const y = srand(seed + 2) * height * 0.85 + height * 0.08;

        // Slightly offset from wall surface
        pos.push(x, y, z);

        // Window colors - warmer mix
        const colorRoll = srand(seed + 3);
        if (colorRoll > 0.5) {
          col.push(1.0, 0.78, 0.38); // warm amber
        } else if (colorRoll > 0.2) {
          col.push(0.95, 0.88, 0.55); // warm yellow
        } else {
          col.push(0.85, 0.90, 1.0); // cool white (offices)
        }
      }
    }

    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }, []);

  const tex = useMemo(() => getStarTexture(), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={0.05}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Street grid drawn as lines
function StreetGrid() {
  const geo = useMemo(() => {
    const points: number[] = [];
    // SF street grid - rough approximation
    // Main streets running NW-SE (Market St direction ~-35 degrees)
    const angle = -35 * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Grid streets (NW-SE and perpendicular NE-SW)
    for (let i = -15; i <= 15; i += 0.8) {
      // NW-SE streets (like Market, Mission, etc.)
      const x1 = i * cos - (-15) * sin;
      const z1 = i * sin + (-15) * cos;
      const x2 = i * cos - 15 * sin;
      const z2 = i * sin + 15 * cos;
      points.push(x1 * SCALE * 50, 0.005, z1 * SCALE * 50);
      points.push(x2 * SCALE * 50, 0.005, z2 * SCALE * 50);

      // Perpendicular streets
      const px1 = (-15) * cos - i * sin;
      const pz1 = (-15) * sin + i * cos;
      const px2 = 15 * cos - i * sin;
      const pz2 = 15 * sin + i * cos;
      points.push(px1 * SCALE * 50, 0.005, pz1 * SCALE * 50);
      points.push(px2 * SCALE * 50, 0.005, pz2 * SCALE * 50);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return g;
  }, []);

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#1a1a2e" transparent opacity={0.4} />
    </lineSegments>
  );
}

// Thin cloud wisps — subtle atmospheric depth without obscuring aerial view
function HighClouds() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((_, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += delta * 0.12;
  });

  const layers = [
    { y: 11, opacity: 0.04, size: 50, uScale: 2.0, rotation: 0 },
    { y: 14, opacity: 0.06, size: 65, uScale: 2.5, rotation: 0.4 },
  ];

  return (
    <group>
      {layers.map((layer, i) => (
        <mesh key={i} position={[0, layer.y, 0]} rotation={[-Math.PI / 2, 0, layer.rotation]}>
          <planeGeometry args={[layer.size, layer.size]} />
          <shaderMaterial
            ref={i === 0 ? matRef : undefined}
            transparent
            vertexShader={cloudNoiseVertexShader}
            fragmentShader={cloudNoiseFragmentShader}
            uniforms={{
              uOpacity: { value: layer.opacity },
              uScale: { value: layer.uScale },
              uTime: { value: i * 30 },
            }}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Bay Area city lights visible from aerial altitude
function PeninsulaLights() {
  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];

    for (let i = 0; i < 5000; i++) {
      const seed = i * 3 + 7000;
      const x = (srand(seed) - 0.5) * 45 - 2;
      const z = (srand(seed + 1) - 0.5) * 45 + 2;

      // Density falloff from downtown center
      const dx = x + 2, dz = z - 2;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (srand(seed + 2) > Math.exp(-dist * 0.035)) continue;

      // Water cutouts: skip the bay and Pacific
      if (z < -12 && x > -8) continue;   // Bay strait
      if (x < -20 && z < 0) continue;     // Pacific west
      if (x > 18) continue;               // East bay water

      const y = 0.02 + srand(seed + 3) * 0.03;
      pos.push(x, y, z);

      // Warm city light palette
      const colorRoll = srand(seed + 4);
      if (colorRoll > 0.6) {
        col.push(1.0, 0.75, 0.35);   // amber streetlights
      } else if (colorRoll > 0.25) {
        col.push(0.95, 0.85, 0.50);  // warm yellow
      } else {
        col.push(0.85, 0.90, 1.0);   // cool white (offices)
      }
    }

    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }, []);

  const tex = useMemo(() => getStarTexture(), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={0.2}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Atmospheric haze particles for depth
function CityHaze() {
  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    for (let i = 0; i < 500; i++) {
      const x = (srand(i * 3 + 5000) - 0.5) * 40;
      const y = srand(i * 3 + 5001) * 5 + 0.5;
      const z = (srand(i * 3 + 5002) - 0.5) * 40;
      pos.push(x, y, z);
      // Warm haze particles
      col.push(0.6, 0.45, 0.3);
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }, []);

  const tex = useMemo(() => getStarTexture(), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={0.8}
        vertexColors
        transparent
        opacity={0.06}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Golden Gate Bridge — towers straddle the road with legs in Z, span along X
function GoldenGateBridge() {
  // Cable catenary curve
  const cablePoints = useMemo(() => {
    const a = 12;
    const span = 16;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * 2 - 1;
      const x = t * span;
      const y = a * (Math.cosh(t * 1.2) - 1) * 0.15;
      points.push(new THREE.Vector3(x, y + 3.5, 0));
    }
    return points;
  }, []);

  // 3D tube cables using CatmullRomCurve3
  const cableCurve = useMemo(
    () => new THREE.CatmullRomCurve3(cablePoints),
    [cablePoints]
  );

  // Suspender cables on both sides of the deck
  const suspenderLines = useMemo(() => {
    const lines: THREE.Vector3[] = [];
    for (let i = 3; i <= 57; i += 3) {
      const pt = cablePoints[i];
      lines.push(new THREE.Vector3(pt.x, pt.y, -0.45));
      lines.push(new THREE.Vector3(pt.x, 1.2, -0.45));
      lines.push(new THREE.Vector3(pt.x, pt.y, 0.45));
      lines.push(new THREE.Vector3(pt.x, 1.2, 0.45));
    }
    return new THREE.BufferGeometry().setFromPoints(lines);
  }, [cablePoints]);

  const bridgeColor = '#c83c23';

  // Shared material for all bridge parts
  const bridgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: bridgeColor,
        emissive: new THREE.Color(bridgeColor),
        emissiveIntensity: 0.15,
      }),
    []
  );

  // Tower component — two legs straddling the road (Z-axis), connected by cross-braces
  const Tower = ({ x }: { x: number }) => (
    <group position={[x, 0, 0]}>
      {/* Two vertical legs — spread in Z to straddle the roadway */}
      <mesh position={[0, 3.5, -0.45]} material={bridgeMat}>
        <boxGeometry args={[0.3, 7, 0.3]} />
      </mesh>
      <mesh position={[0, 3.5, 0.45]} material={bridgeMat}>
        <boxGeometry args={[0.3, 7, 0.3]} />
      </mesh>
      {/* Horizontal cross-braces between legs — Art Deco ladder pattern */}
      <mesh position={[0, 6.2, 0]} material={bridgeMat}>
        <boxGeometry args={[0.22, 0.15, 1.1]} />
      </mesh>
      <mesh position={[0, 5.2, 0]} material={bridgeMat}>
        <boxGeometry args={[0.18, 0.12, 1.1]} />
      </mesh>
      <mesh position={[0, 4.2, 0]} material={bridgeMat}>
        <boxGeometry args={[0.18, 0.12, 1.1]} />
      </mesh>
      <mesh position={[0, 3.2, 0]} material={bridgeMat}>
        <boxGeometry args={[0.18, 0.12, 1.1]} />
      </mesh>
      <mesh position={[0, 2.2, 0]} material={bridgeMat}>
        <boxGeometry args={[0.18, 0.12, 1.1]} />
      </mesh>
    </group>
  );

  return (
    <group position={[-25, 0, -22]} rotation={[0, Math.PI / 2 + 0.15, 0]} scale={0.8}>
      <Tower x={-8} />
      <Tower x={8} />

      {/* Road deck */}
      <mesh position={[0, 1.2, 0]} material={bridgeMat}>
        <boxGeometry args={[20, 0.14, 1.0]} />
      </mesh>

      {/* Side rails */}
      <mesh position={[0, 1.4, 0.5]} material={bridgeMat}>
        <boxGeometry args={[20, 0.1, 0.04]} />
      </mesh>
      <mesh position={[0, 1.4, -0.5]} material={bridgeMat}>
        <boxGeometry args={[20, 0.1, 0.04]} />
      </mesh>

      {/* Main cables — 3D tubes, one on each side of the road */}
      <group position={[0, 0, -0.5]}>
        <mesh>
          <tubeGeometry args={[cableCurve, 64, 0.05, 8, false]} />
          <meshStandardMaterial color={bridgeColor} emissive={bridgeColor} emissiveIntensity={0.1} />
        </mesh>
      </group>
      <group position={[0, 0, 0.5]}>
        <mesh>
          <tubeGeometry args={[cableCurve, 64, 0.05, 8, false]} />
          <meshStandardMaterial color={bridgeColor} emissive={bridgeColor} emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* Suspender cables */}
      <lineSegments geometry={suspenderLines}>
        <lineBasicMaterial color={bridgeColor} transparent opacity={0.5} />
      </lineSegments>

      {/* Road lights */}
      <pointLight position={[-6, 1.6, 0]} intensity={0.8} distance={4} color="#ffaa44" />
      <pointLight position={[0, 1.6, 0]} intensity={0.8} distance={4} color="#ffaa44" />
      <pointLight position={[6, 1.6, 0]} intensity={0.8} distance={4} color="#ffaa44" />
      {/* Tower top aviation lights */}
      <pointLight position={[-8, 7.2, 0]} intensity={0.6} distance={6} color="#ff4422" />
      <pointLight position={[8, 7.2, 0]} intensity={0.6} distance={6} color="#ff4422" />
    </group>
  );
}

interface CitySegmentProps {
  currentSlide: number;
  visible: boolean;
}

export function CitySegment({ visible }: CitySegmentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const buildingGeo = useMemo(() => generateBuildingsFromOSM(), []);

  useFrame((state) => {
    if (groupRef.current && visible) {
      // Very subtle sway
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.03) * 0.005;
    }
  });

  return (
    <group ref={groupRef} visible={visible}>
      {/* Lighting - dramatic night cityscape */}
      {/* Main moonlight from upper right */}
      <directionalLight position={[20, 30, 15]} intensity={1.8} color="#8899cc" />
      {/* Warm fill from lower left (city glow bounce) */}
      <directionalLight position={[-10, 3, 8]} intensity={0.8} color="#ff9955" />
      {/* Cool ambient */}
      <ambientLight intensity={0.35} color="#334466" />
      {/* Street-level warm lights */}
      <pointLight position={[0, 0.3, 0]} intensity={4} distance={25} color="#ff8833" />
      <pointLight position={[4, 0.3, -3]} intensity={3} distance={18} color="#ffaa44" />
      <pointLight position={[-3, 0.3, 3]} intensity={3} distance={18} color="#ff9944" />
      <pointLight position={[-5, 0.3, -5]} intensity={2.5} distance={15} color="#ffbb55" />
      {/* High tower accent lights */}
      <pointLight position={[3, 5, 6]} intensity={1.5} distance={12} color="#aabbff" />
      <pointLight position={[-7, 4, -6]} intensity={1.2} distance={10} color="#aabbff" />

      {/* Real SF buildings from OpenStreetMap */}
      <mesh geometry={buildingGeo}>
        <meshStandardMaterial
          vertexColors
          metalness={0.55}
          roughness={0.40}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Window lights */}
      <WindowLights />

      {/* Bay Area city lights — visible from aerial altitude */}
      <PeninsulaLights />

      {/* Street grid */}
      <StreetGrid />

      {/* Atmospheric haze */}
      <CityHaze />

      {/* Ground plane - dark asphalt (land area only) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 5]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0a0a14" metalness={0.2} roughness={0.95} />
      </mesh>

      {/* Bay water - large reflective surface covering the strait and bay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, -0.02, -20]}>
        <planeGeometry args={[100, 80]} />
        <meshStandardMaterial color="#040c18" metalness={0.97} roughness={0.03} />
      </mesh>

      {/* Golden Gate Bridge */}
      <GoldenGateBridge />

      {/* Thin cloud wisps */}
      <HighClouds />
    </group>
  );
}
