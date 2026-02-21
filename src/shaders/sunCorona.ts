export const sunCoronaVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const sunCoronaFragmentShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float uTime;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  return mix(
    mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
    mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec3 viewDir = normalize(-vPosition);
  float rim = 1.0 - dot(vNormal, viewDir);

  float coreGlow = pow(rim, 2.0) * 3.0;

  vec2 noiseCoord = vUv * 4.0 + vec2(uTime * 0.05);
  float corona = noise(noiseCoord) * pow(rim, 1.5);

  vec3 coreColor = vec3(1.0, 1.0, 0.95);
  vec3 coronaColor = vec3(1.0, 0.4, 0.1);
  vec3 finalColor = mix(coreColor, coronaColor, rim) * (coreGlow + corona);

  gl_FragColor = vec4(finalColor, coreGlow * 0.8 + corona * 0.3);
}
`;
