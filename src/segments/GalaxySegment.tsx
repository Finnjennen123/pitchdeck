import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SoftStars } from '../components/SoftStars';

const PARTICLE_COUNT = 150000;
const BRANCHES = 4;
const SPIN = 1.8;
const RANDOMNESS = 0.5;
const MAX_RADIUS = 50;

function SpiralGalaxy({ visible }: { visible: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);

    const innerColor = new THREE.Color('#fff8e7');
    const midColor = new THREE.Color('#ffcc66');
    const outerColor = new THREE.Color('#ff6b35');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const radius = Math.pow(Math.random(), 0.6) * MAX_RADIUS;
      const spinAngle = radius * SPIN;
      const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const angle = branchAngle + spinAngle;

      const randomScale = RANDOMNESS * (radius / MAX_RADIUS) * 0.8 + 0.05;
      const rx = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * randomScale * MAX_RADIUS * 0.12;
      const ry = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * randomScale * MAX_RADIUS * 0.015;
      const rz = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * randomScale * MAX_RADIUS * 0.12;

      pos[i3] = Math.cos(angle) * radius + rx;
      pos[i3 + 1] = ry;
      pos[i3 + 2] = Math.sin(angle) * radius + rz;

      const t = radius / MAX_RADIUS;
      let mixedColor: THREE.Color;
      if (t < 0.3) {
        mixedColor = innerColor.clone().lerp(midColor, t / 0.3);
      } else {
        mixedColor = midColor.clone().lerp(outerColor, (t - 0.3) / 0.7);
      }
      col[i3] = mixedColor.r;
      col[i3 + 1] = mixedColor.g;
      col[i3 + 2] = mixedColor.b;
    }

    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (!visible) return;
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function GalacticCore({ visible }: { visible: boolean }) {
  const coreRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 40000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 2) * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.3;

      pos[i3] = Math.cos(theta) * Math.cos(phi) * r;
      pos[i3 + 1] = Math.sin(phi) * r * 0.3;
      pos[i3 + 2] = Math.sin(theta) * Math.cos(phi) * r;

      const brightness = 0.85 + Math.random() * 0.15;
      col[i3] = brightness;
      col[i3 + 1] = brightness * (0.92 + Math.random() * 0.08);
      col[i3 + 2] = brightness * (0.75 + Math.random() * 0.15);
    }

    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (!visible) return;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={coreRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function BackgroundStars() {
  return <SoftStars count={8000} radius={500} minSize={0.3} maxSize={1.5} opacity={0.7} warmth={0.2} />;
}

interface GalaxySegmentProps {
  currentSlide: number;
  visible: boolean;
}

export function GalaxySegment({ visible }: GalaxySegmentProps) {
  return (
    <group visible={visible}>
      <SpiralGalaxy visible={visible} />
      <GalacticCore visible={visible} />
      <BackgroundStars />
    </group>
  );
}
