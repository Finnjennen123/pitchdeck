import { useRef, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { SoftStars } from '../components/SoftStars';
import { atmosphereVertexShader, atmosphereFragmentShader } from '../shaders/atmosphere';

const EARTH_RADIUS = 10;

function EarthGlobe({ visible }: { visible: boolean }) {
  const cloudsRef = useRef<THREE.Mesh>(null);
  const earthRef = useRef<THREE.Mesh>(null);

  const [dayMap, nightMap, cloudsMap] = useLoader(TextureLoader, [
    'textures/earth_day_4k.jpg',
    'textures/earth_night_4k.jpg',
    'textures/earth_clouds_2k.jpg',
  ]);

  useFrame((_, delta) => {
    if (!visible) return;
    // Only clouds rotate — Earth stays fixed so camera always finds California
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.006;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
        <meshPhongMaterial
          map={dayMap}
          emissiveMap={nightMap}
          emissive={new THREE.Color(0xffff88)}
          emissiveIntensity={1.5}
          shininess={25}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[EARTH_RADIUS + 0.06, 96, 96]} />
        <meshPhongMaterial map={cloudsMap} transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS + 0.5, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

interface EarthSegmentProps {
  currentSlide: number;
  visible: boolean;
}

export function EarthSegment({ visible }: EarthSegmentProps) {
  return (
    <group visible={visible}>
      <directionalLight position={[50, 15, 50]} intensity={2.2} color="#fffff0" />
      <ambientLight intensity={0.1} />

      <Suspense fallback={null}>
        <EarthGlobe visible={visible} />
      </Suspense>

      <SoftStars count={6000} radius={400} minSize={0.4} maxSize={1.5} opacity={0.85} warmth={0.3} />
    </group>
  );
}
