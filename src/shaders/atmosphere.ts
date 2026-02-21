export const atmosphereVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const atmosphereFragmentShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDir = normalize(-vPosition);
  float intensity = pow(0.7 - dot(vNormal, viewDir), 4.0);
  vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
  gl_FragColor = vec4(atmosphereColor * intensity, intensity * 0.8);
}
`;
