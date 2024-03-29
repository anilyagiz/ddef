varying vec2 vUv;
varying float vDistort;

uniform float uTime;
uniform float uIntensity;

vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}     

void main() {
  float distort = vDistort * uIntensity;
  
  vec3 brightness = vec3(0.5, 0.5, 0.5);
  vec3 contrast = vec3(1.0, 0.9, 0.5);
  vec3 oscilation = vec3(1.0, 1.0, 0.6);
  vec3 phase = vec3(0.30, 0.20, 0.20);

  vec3 color = cosPalette(distort, brightness, contrast, oscilation, phase);
  
  gl_FragColor = vec4(color, 1.0);
}