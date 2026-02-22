import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SoftStars, getStarTexture } from '../components/SoftStars';

const NODE_COUNT = 500;
const GALAXY_COUNT = 300000;
const SPACE_SIZE = 500;
const CONNECTION_THRESHOLD = 130;

const seed = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function CosmicWeb({ visible }: { visible: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push(new THREE.Vector3(
        (seed(i * 3) - 0.5) * SPACE_SIZE,
        (seed(i * 3 + 1) - 0.5) * SPACE_SIZE,
        (seed(i * 3 + 2) - 0.5) * SPACE_SIZE
      ));
    }

    const edges: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceToSquared(nodes[j]) < CONNECTION_THRESHOLD * CONNECTION_THRESHOLD) {
          edges.push([nodes[i], nodes[j]]);
        }
      }
    }

    const pos = new Float32Array(GALAXY_COUNT * 3);
    const col = new Float32Array(GALAXY_COUNT * 3);
    const galaxyColor = new THREE.Color();

    for (let i = 0; i < GALAXY_COUNT; i++) {
      const i3 = i * 3;
      if (edges.length > 0) {
        const edge = edges[Math.floor(seed(i * 7 + 100) * edges.length)];
        const t = seed(i * 11 + 200);
        const scatter = 4 + seed(i * 13 + 300) * 6;
        pos[i3] = edge[0].x + (edge[1].x - edge[0].x) * t + (seed(i * 17 + 400) - 0.5) * scatter;
        pos[i3 + 1] = edge[0].y + (edge[1].y - edge[0].y) * t + (seed(i * 19 + 500) - 0.5) * scatter;
        pos[i3 + 2] = edge[0].z + (edge[1].z - edge[0].z) * t + (seed(i * 23 + 600) - 0.5) * scatter;
      }

      // Rich color variation - galaxies have diverse colors
      const colorChoice = seed(i * 29 + 700);
      if (colorChoice > 0.7) {
        // Warm galaxies - golden/amber
        galaxyColor.setHSL(0.1, 0.5 + seed(i * 31 + 800) * 0.3, 0.4 + seed(i * 33 + 850) * 0.5);
      } else if (colorChoice > 0.45) {
        // Blue galaxies - spiral
        galaxyColor.setHSL(0.6, 0.3 + seed(i * 37 + 900) * 0.4, 0.35 + seed(i * 39 + 950) * 0.5);
      } else if (colorChoice > 0.25) {
        // White/silver galaxies
        const b = 0.5 + seed(i * 41 + 1000) * 0.5;
        galaxyColor.setRGB(b, b * 0.98, b * 0.95);
      } else {
        // Red/pink galaxies - starburst
        galaxyColor.setHSL(0.02 + seed(i * 43 + 1050) * 0.06, 0.5, 0.3 + seed(i * 47 + 1100) * 0.3);
      }

      col[i3] = galaxyColor.r;
      col[i3 + 1] = galaxyColor.g;
      col[i3 + 2] = galaxyColor.b;
    }

    return { positions: pos, colors: col };
  }, []);

  const tex = useMemo(() => getStarTexture(), []);

  useFrame((_, delta) => {
    if (!visible) return;
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={1.0}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Bright supercluster nodes — larger, glowing points
function Superclusters() {
  const { positions, colors } = useMemo(() => {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (seed(i * 3 + 5000) - 0.5) * SPACE_SIZE * 0.85;
      pos[i3 + 1] = (seed(i * 3 + 5001) - 0.5) * SPACE_SIZE * 0.85;
      pos[i3 + 2] = (seed(i * 3 + 5002) - 0.5) * SPACE_SIZE * 0.85;
      const b = 0.7 + seed(i + 6000) * 0.3;
      const hue = seed(i + 6500);
      if (hue > 0.6) {
        col[i3] = b;
        col[i3 + 1] = b * 0.9;
        col[i3 + 2] = b * 0.7;
      } else if (hue > 0.3) {
        col[i3] = b * 0.8;
        col[i3 + 1] = b * 0.85;
        col[i3 + 2] = b;
      } else {
        col[i3] = b;
        col[i3 + 1] = b;
        col[i3 + 2] = b * 0.95;
      }
    }
    return { positions: pos, colors: col };
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
        size={2.8}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Dense background field of distant galaxies — the "unthinkable amount" layer
function DeepField({ visible }: { visible: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 200000;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Fill a larger volume than the cosmic web
      const r = SPACE_SIZE * 0.3 + Math.pow(seed(i * 3 + 8000), 0.5) * SPACE_SIZE * 0.5;
      const theta = seed(i * 3 + 8001) * Math.PI * 2;
      const phi = Math.acos(2 * seed(i * 3 + 8002) - 1);

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      // Dimmer, more varied colors
      const b = 0.2 + seed(i + 9000) * 0.4;
      const hue = seed(i + 9500);
      if (hue > 0.5) {
        col[i3] = b * 1.1;
        col[i3 + 1] = b * 0.95;
        col[i3 + 2] = b * 0.8;
      } else {
        col[i3] = b * 0.85;
        col[i3 + 1] = b * 0.9;
        col[i3 + 2] = b * 1.05;
      }
    }

    return { positions: pos, colors: col };
  }, []);

  const tex = useMemo(() => getStarTexture(), []);

  useFrame((_, delta) => {
    if (!visible) return;
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.001;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={0.5}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function UniverseBoundary() {
  return (
    <mesh>
      <sphereGeometry args={[SPACE_SIZE * 0.48, 64, 64]} />
      <meshBasicMaterial color="#1a1a3a" transparent opacity={0.06} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

interface UniverseSegmentProps {
  currentSlide: number;
  visible: boolean;
}

export function UniverseSegment({ visible }: UniverseSegmentProps) {
  return (
    <group visible={visible}>
      <DeepField visible={visible} />
      <CosmicWeb visible={visible} />
      <Superclusters />
      <UniverseBoundary />
      <SoftStars count={20000} radius={600} minSize={0.3} maxSize={1.2} opacity={0.6} warmth={0.3} />
    </group>
  );
}
