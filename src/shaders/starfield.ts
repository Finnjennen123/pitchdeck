export const starfieldVertexShader = /* glsl */ `
varying vec3 vWorldPosition;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const starfieldFragmentShader = /* glsl */ `
varying vec3 vWorldPosition;

float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

void main() {
  vec3 dir = normalize(vWorldPosition);
  float scale = 300.0;
  vec3 grid = floor(dir * scale);

  float starHash = hash(grid);
  float brightness = 0.0;

  if (starHash > 0.975) {
    vec3 starPos = (grid + vec3(hash(grid + 1.0), hash(grid + 2.0), hash(grid + 3.0))) / scale;
    float dist = length(dir - normalize(starPos));
    brightness = smoothstep(0.0025, 0.0, dist);
    brightness *= 0.4 + 0.6 * hash(grid + 5.0);
  }

  vec3 color = vec3(1.0);
  float colorHash = hash(grid + 10.0);
  if (colorHash > 0.7) color = vec3(1.0, 0.92, 0.75);
  else if (colorHash > 0.5) color = vec3(0.75, 0.88, 1.0);

  gl_FragColor = vec4(color * brightness, brightness);
}
`;
