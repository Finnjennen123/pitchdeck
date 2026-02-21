export const cloudNoiseVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const cloudNoiseFragmentShader = /* glsl */ `
varying vec2 vUv;
uniform float uOpacity;
uniform float uScale;
uniform float uTime;

float hash2D(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2D(i), hash2D(i + vec2(1.0, 0.0)), f.x),
    mix(hash2D(i + vec2(0.0, 1.0)), hash2D(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float total = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    total += noise2D(p) * amplitude;
    p *= 2.1;
    amplitude *= 0.5;
  }
  return total;
}

void main() {
  vec2 uv = vUv * uScale;
  float cloud = fbm(uv + uTime * 0.02);
  cloud = smoothstep(0.35, 0.65, cloud);

  float edgeFade = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x)
                 * smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);

  gl_FragColor = vec4(0.95, 0.95, 1.0, cloud * uOpacity * edgeFade);
}
`;
