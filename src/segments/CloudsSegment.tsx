import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SoftStars, getStarTexture } from '../components/SoftStars';
import { cloudNoiseVertexShader, cloudNoiseFragmentShader } from '../shaders/cloudNoise';

function CloudLayer() {
  const refs = useRef<THREE.ShaderMaterial[]>([]);

  useFrame((_, delta) => {
    refs.current.forEach((mat) => {
      if (mat) mat.uniforms.uTime.value += delta * 0.1;
    });
  });

  const clouds = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      y: 0.5 + i * 1.4,
      scale: 50 + i * 18,
      opacity: i < 2 ? 0.10 + i * 0.08 : i < 5 ? 0.28 : i < 7 ? 0.10 : Math.max(0.02, 0.08 - (i - 7) * 0.012),
      uScale: 1.8 + i * 0.4,
      seed: i * 25,
      rotation: i * 0.25,
    }))
  , []);

  return (
    <group>
      {clouds.map((c, i) => (
        <mesh key={i} position={[0, c.y, 0]} rotation={[-Math.PI / 2, 0, c.rotation]}>
          <planeGeometry args={[c.scale, c.scale]} />
          <shaderMaterial
            ref={(el) => { if (el) refs.current[i] = el; }}
            transparent
            vertexShader={cloudNoiseVertexShader}
            fragmentShader={cloudNoiseFragmentShader}
            uniforms={{
              uOpacity: { value: c.opacity },
              uScale: { value: c.uScale },
              uTime: { value: c.seed },
            }}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Prominent Golden Gate Bridge — towers emerge above cloud layer as the main landmark
function GoldenGateBridge() {
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

  const cableCurve = useMemo(
    () => new THREE.CatmullRomCurve3(cablePoints),
    [cablePoints]
  );

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

  const bridgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: bridgeColor,
        emissive: new THREE.Color(bridgeColor),
        emissiveIntensity: 0.35,
      }),
    []
  );

  const Tower = ({ x }: { x: number }) => (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 3.5, -0.45]} material={bridgeMat}>
        <boxGeometry args={[0.3, 7, 0.3]} />
      </mesh>
      <mesh position={[0, 3.5, 0.45]} material={bridgeMat}>
        <boxGeometry args={[0.3, 7, 0.3]} />
      </mesh>
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
    <group position={[-6, 5, -2]} rotation={[0, 0.2, 0]} scale={1.0}>
      <Tower x={-8} />
      <Tower x={8} />

      {/* Road deck */}
      <mesh position={[0, 1.2, 0]} material={bridgeMat}>
        <boxGeometry args={[20, 0.14, 1.0]} />
      </mesh>

      {/* 3D tube cables on each side */}
      <group position={[0, 0, -0.5]}>
        <mesh>
          <tubeGeometry args={[cableCurve, 64, 0.05, 8, false]} />
          <meshStandardMaterial color={bridgeColor} emissive={bridgeColor} emissiveIntensity={0.3} />
        </mesh>
      </group>
      <group position={[0, 0, 0.5]}>
        <mesh>
          <tubeGeometry args={[cableCurve, 64, 0.05, 8, false]} />
          <meshStandardMaterial color={bridgeColor} emissive={bridgeColor} emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Suspender cables */}
      <lineSegments geometry={suspenderLines}>
        <lineBasicMaterial color={bridgeColor} transparent opacity={0.6} />
      </lineSegments>

      {/* Red aviation lights on tower tops */}
      <pointLight position={[-8, 7.5, 0]} intensity={1.5} distance={12} color="#ff3320" />
      <pointLight position={[8, 7.5, 0]} intensity={1.5} distance={12} color="#ff3320" />
      {/* Warm road glow */}
      <pointLight position={[0, 1.8, 0]} intensity={1} distance={8} color="#ffaa44" />
    </group>
  );
}

// Terrain with bay
function BayTerrain() {
  return (
    <group>
      {/* Peninsula land */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, -3, 5]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#152010" roughness={0.9} />
      </mesh>

      {/* East Bay land */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[30, -3, -5]}>
        <planeGeometry args={[40, 60]} />
        <meshStandardMaterial color="#1a2815" roughness={0.9} />
      </mesh>

      {/* Bay water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, -2.8, -2]}>
        <planeGeometry args={[35, 40]} />
        <meshStandardMaterial color="#050e1a" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Pacific Ocean (west) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-35, -2.8, 0]}>
        <planeGeometry args={[40, 80]} />
        <meshStandardMaterial color="#040c16" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* City glow (visual bridge from city segment) */}
      <pointLight position={[-5, -1, 8]} intensity={8} distance={40} color="#ff8833" />
      <pointLight position={[-10, -1, 5]} intensity={5} distance={35} color="#ffaa44" />
      <pointLight position={[0, -1, 12]} intensity={4} distance={30} color="#ff9944" />

      {/* Marin Headlands glow */}
      <pointLight position={[-30, 0, -15]} intensity={1} distance={25} color="#334422" />
    </group>
  );
}

// Tiny city buildings visible from clouds altitude
function DistantCity() {
  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    for (let i = 0; i < 800; i++) {
      const x = (srand(i * 3 + 9000) - 0.5) * 25 - 5;
      const z = srand(i * 3 + 9002) * 20 + 2;
      pos.push(x, -2.5 + srand(i * 3 + 9001) * 1.5, z);
      col.push(0.9, 0.7, 0.35);
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
        size={0.12}
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

const srand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

interface CloudsSegmentProps {
  currentSlide: number;
  visible: boolean;
}

export function CloudsSegment({ visible }: CloudsSegmentProps) {
  return (
    <group visible={visible}>
      <ambientLight intensity={0.2} color="#556688" />
      <directionalLight position={[30, 50, 20]} intensity={1.0} color="#ffeedd" />
      <directionalLight position={[-20, 30, -10]} intensity={0.3} color="#8899bb" />

      <CloudLayer />
      <BayTerrain />
      <GoldenGateBridge />
      <DistantCity />

      {/* Faint stars above clouds */}
      <SoftStars count={2000} radius={200} minSize={0.2} maxSize={0.6} opacity={0.4} />

      <fog attach="fog" args={['#080e1a', 20, 120]} />
    </group>
  );
}
