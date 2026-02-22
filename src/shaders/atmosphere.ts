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
  // View direction in view space (camera is at 0,0,0)
  vec3 viewDirection = normalize(-vPosition);
  vec3 normal = normalize(vNormal);

  // BackSide rendering for halo:
  // Normals point away from camera (dot < 0).
  // Rim (outer edge of halo) is where dot ~ 0.
  // As we move inwards towards the planet, dot becomes more negative.
  
  // We want a "natural" fade:
  // - Transparent at the outer rim (dot = 0) to blend into space.
  // - Bright/Opaque near the planet surface (dot < 0).
  
  float edgeFactor = -dot(normal, viewDirection); // Positive value, 0 at rim, increasing inwards
  
  // Use smoothstep to control the fade distance.
  // Increase the range (0.0 to 0.45) for a much softer, more gradual falloff.
  // This makes the atmosphere look less like a shell and more like a gaseous layer.
  float intensity = smoothstep(0.0, 0.45, edgeFactor);
  
  // "Clean, natural" color: Slightly desaturated sky blue for realism
  vec3 atmosphereColor = vec3(0.35, 0.75, 0.95);
  
  // Output with even lower opacity for a "thin," delicate look
  gl_FragColor = vec4(atmosphereColor, intensity * 0.45);
}
`;