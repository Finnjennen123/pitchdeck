import { useMemo } from 'react';
import * as THREE from 'three';

// Create a soft circular gradient texture for star points (not square blocks)
function createStarTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.08, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.18, 'rgba(255,255,255,0.7)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.2)');
  gradient.addColorStop(0.55, 'rgba(255,255,255,0.05)');
  gradient.addColorStop(0.8, 'rgba(255,255,255,0.01)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Shared singleton texture
let _starTexture: THREE.Texture | null = null;
export function getStarTexture(): THREE.Texture {
  if (!_starTexture) _starTexture = createStarTexture();
  return _starTexture;
}

interface SoftStarsProps {
  count?: number;
  radius?: number;
  minSize?: number;
  maxSize?: number;
  opacity?: number;
  warmth?: number; // 0 = white, 1 = warm color mix
}

// Replacement for drei's <Stars> that renders soft circles instead of squares
export function SoftStars({
  count = 5000,
  radius = 300,
  minSize = 0.3,
  maxSize = 1.2,
  opacity = 0.9,
  warmth = 0.3,
}: SoftStarsProps) {
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    const seed = (n: number) => {
      const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Distribute on a sphere shell
      const theta = seed(i * 3) * Math.PI * 2;
      const phi = Math.acos(2 * seed(i * 3 + 1) - 1);
      const r = radius * (0.8 + seed(i * 3 + 2) * 0.4);

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      // Star color variation
      const colorSeed = seed(i * 7 + 100);
      if (colorSeed > (1 - warmth * 0.4)) {
        // Warm star (orange/yellow)
        col[i3] = 1.0;
        col[i3 + 1] = 0.85 + seed(i * 11 + 200) * 0.1;
        col[i3 + 2] = 0.65 + seed(i * 13 + 300) * 0.15;
      } else if (colorSeed > (1 - warmth * 0.7)) {
        // Blue star
        col[i3] = 0.7 + seed(i * 11 + 200) * 0.1;
        col[i3 + 1] = 0.8 + seed(i * 13 + 300) * 0.1;
        col[i3 + 2] = 1.0;
      } else {
        // White star
        const b = 0.85 + seed(i * 11 + 200) * 0.15;
        col[i3] = b;
        col[i3 + 1] = b;
        col[i3 + 2] = b;
      }

      // Size variation - most stars small, few bright ones
      const sizeSeed = seed(i * 17 + 400);
      sz[i] = sizeSeed < 0.95
        ? minSize + sizeSeed * (maxSize - minSize) * 0.3
        : minSize + sizeSeed * (maxSize - minSize);
    }

    return { positions: pos, colors: col, sizes: sz };
  }, [count, radius, minSize, maxSize, warmth]);

  const starTex = useMemo(() => getStarTexture(), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        map={starTex}
        size={maxSize}
        sizeAttenuation
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
