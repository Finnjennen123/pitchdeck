import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { SoftStars, getStarTexture } from '../components/SoftStars';

const PLANETS = [
  { name: 'Mercury', distance: 4.5, size: 0.12, color: '#8c7e6d', speed: 4.1, emissive: '#1a1510' },
  { name: 'Venus', distance: 7, size: 0.28, color: '#c4a35a', speed: 1.6, emissive: '#2a1f10' },
  { name: 'Earth', distance: 10, size: 0.30, color: '#4a90d9', speed: 1.0, highlight: true, emissive: '#0a1530' },
  { name: 'Mars', distance: 13, size: 0.18, color: '#c1440e', speed: 0.53, emissive: '#2a0800' },
  { name: 'Jupiter', distance: 20, size: 1.3, color: '#c88b3a', speed: 0.084, emissive: '#1a1008' },
  { name: 'Saturn', distance: 28, size: 1.1, color: '#ead6a6', speed: 0.034, rings: true, emissive: '#1a1508' },
  { name: 'Uranus', distance: 37, size: 0.55, color: '#72b5c4', speed: 0.012, emissive: '#081a1f' },
  { name: 'Neptune', distance: 46, size: 0.50, color: '#3f54ba', speed: 0.006, emissive: '#080a20' },
];

// Massive, hyper-detailed particle sun — 350K particles
const SUN_CORE_COUNT = 250000;
const SUN_CORONA_COUNT = 100000;
const SUN_TOTAL = SUN_CORE_COUNT + SUN_CORONA_COUNT;
const SUN_CORE_RADIUS = 2.5;
const SUN_CORONA_OUTER = 5.0;

function ParticleSun() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(SUN_TOTAL * 3);
    const col = new Float32Array(SUN_TOTAL * 3);

    const white = new THREE.Color('#fffff8');
    const hotYellow = new THREE.Color('#fff5b0');
    const brightOrange = new THREE.Color('#ffaa30');
    const redOrange = new THREE.Color('#ff5500');
    const darkRed = new THREE.Color('#cc2200');

    // Core particles: dense sphere, white-hot center → orange edges
    for (let i = 0; i < SUN_CORE_COUNT; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 0.35) * SUN_CORE_RADIUS;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      const t = r / SUN_CORE_RADIUS;
      let color: THREE.Color;
      if (t < 0.12) {
        color = white.clone().lerp(hotYellow, t / 0.12);
      } else if (t < 0.35) {
        color = hotYellow.clone().lerp(brightOrange, (t - 0.12) / 0.23);
      } else if (t < 0.65) {
        color = brightOrange.clone().lerp(redOrange, (t - 0.35) / 0.3);
      } else {
        color = redOrange.clone().lerp(darkRed, (t - 0.65) / 0.35);
      }

      col[i3] = color.r;
      col[i3 + 1] = color.g;
      col[i3 + 2] = color.b;
    }

    // Corona particles: diffuse halo extending outward
    for (let i = 0; i < SUN_CORONA_COUNT; i++) {
      const idx = SUN_CORE_COUNT + i;
      const i3 = idx * 3;
      const r = SUN_CORE_RADIUS + Math.pow(Math.random(), 0.5) * (SUN_CORONA_OUTER - SUN_CORE_RADIUS);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      const t = (r - SUN_CORE_RADIUS) / (SUN_CORONA_OUTER - SUN_CORE_RADIUS);
      const color = redOrange.clone().lerp(darkRed, t);
      const brightness = 1.0 - t * 0.6;
      col[i3] = color.r * brightness;
      col[i3 + 1] = color.g * brightness;
      col[i3 + 2] = color.b * brightness;
    }

    return { positions: pos, colors: col };
  }, []);

  const tex = useMemo(() => getStarTexture(), []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.025;
      pointsRef.current.rotation.x += delta * 0.008;
    }
  });

  return (
    <group>
      {/* 350K particle body */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={tex}
          size={0.07}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Bright inner glow */}
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial
          color="#fff8e0"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Mid glow */}
      <mesh>
        <sphereGeometry args={[5.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa33"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Outer halo */}
      <mesh>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial
          color="#ff6622"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight intensity={10} distance={200} color="#fff5e0" />
    </group>
  );
}

// Earth in the solar system uses the real texture
function SolarEarth({ distance, speed }: { distance: number; speed: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const initialAngle = useMemo(() => 2.1, []);

  const [dayMap] = useLoader(TextureLoader, ['/textures/earth_day_4k.jpg']);

  useFrame((state) => {
    if (groupRef.current) {
      const angle = initialAngle + state.clock.elapsedTime * speed * 0.1;
      groupRef.current.position.x = Math.cos(angle) * distance;
      groupRef.current.position.z = Math.sin(angle) * distance;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.30, 32, 32]} />
        <meshStandardMaterial map={dayMap} />
      </mesh>
      <mesh position={[0.6, 0.1, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.9} />
      </mesh>
      <pointLight intensity={0.3} distance={3} color="#4488ff" />
    </group>
  );
}

function Planet({ distance, size, color, speed, rings, emissive }: {
  distance: number; size: number; color: string; speed: number;
  rings?: boolean; emissive?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (groupRef.current) {
      const angle = initialAngle + state.clock.elapsedTime * speed * 0.1;
      groupRef.current.position.x = Math.cos(angle) * distance;
      groupRef.current.position.z = Math.sin(angle) * distance;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          metalness={0.15}
          emissive={emissive || '#000000'}
          emissiveIntensity={0.4}
        />
      </mesh>
      {rings && (
        <mesh rotation={[Math.PI * 0.4, 0.1, 0]}>
          <ringGeometry args={[size * 1.4, size * 2.3, 64]} />
          <meshStandardMaterial
            color="#d4c090"
            side={THREE.DoubleSide}
            transparent
            opacity={0.5}
            roughness={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

function OrbitRings() {
  return (
    <group>
      {PLANETS.map((planet) => (
        <mesh key={planet.name} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.distance - 0.015, planet.distance + 0.015, 128]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.04} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function AsteroidBelt() {
  const { positions } = useMemo(() => {
    const count = 800;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 16 + (Math.random() - 0.5) * 2.5;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return { positions: pos };
  }, []);

  const tex = useMemo(() => getStarTexture(), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={0.1}
        color="#aa9977"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

interface SolarSegmentProps {
  currentSlide: number;
  visible: boolean;
}

export function SolarSegment({ visible }: SolarSegmentProps) {
  return (
    <group visible={visible}>
      <ambientLight intensity={0.04} />
      <ParticleSun />

      <Suspense fallback={null}>
        <SolarEarth distance={10} speed={1.0} />
      </Suspense>

      {PLANETS.filter(p => p.name !== 'Earth').map((planet) => (
        <Planet key={planet.name} {...planet} />
      ))}

      <OrbitRings />
      <AsteroidBelt />

      <SoftStars count={10000} radius={500} minSize={0.4} maxSize={1.8} opacity={0.85} warmth={0.25} />
    </group>
  );
}
