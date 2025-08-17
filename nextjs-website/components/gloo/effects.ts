export const defaultEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  return vec2(
    sin(p.x * i + common) * cos(p.y * i + common),
    sin(length(p.x) + common) * cos(length(p.y) + common)
  ) * 0.55;
}`;

export const spiralEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float r = length(p);
  float theta = atan(p.y, p.x);
  float spiral = sin(r * 10.0 - theta * 3.0 + common);
  return vec2(
    sin(p.x * i + spiral + common) * cos(p.y * i + spiral + common),
    sin(length(p.x + spiral) + common) * cos(length(p.y + spiral) + common)
  ) * 0.55;
}`;

export const waveEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float wave = sin(p.x * 5.0 + common) * cos(p.y * 5.0 + common);
  return vec2(
    sin(p.x * i + wave + common) * cos(p.y * i + wave + common),
    sin(length(p.x + wave) + common) * cos(length(p.y + wave) + common)
  ) * 0.55;
}`;

export const vortexEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float r = length(p);
  float theta = atan(p.y, p.x);
  float vortex = sin(r * 10.0 + theta * 5.0 + common);
  return vec2(
    sin(p.x * i + vortex + common) * cos(p.y * i + vortex + common),
    sin(length(p.x + vortex) + common) * cos(length(p.y + vortex) + common)
  ) * 0.55;
}`;

export const pulseEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float pulse = common * 0.5 + 0.5;
  return vec2(
    sin(p.x * i + pulse * 10.0 + common) * cos(p.y * i + pulse * 10.0 + common),
    sin(length(p.x * pulse) + common) * cos(length(p.y * pulse) + common)
  ) * 0.55;
}`;

export const rippleEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float ripple = sin(length(p) * 10.0 - common) * 0.5;
  return vec2(
    sin(p.x * i + ripple + common) * cos(p.y * i + ripple + common),
    sin(length(p.x + ripple) + common) * cos(length(p.y + ripple) + common)
  ) * 0.55;
}`;

export const twistEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float r = length(p);
  float theta = atan(p.y, p.x) + common * 0.5;
  return vec2(
    r * cos(theta + i + common),
    r * sin(theta + i + common)
  ) * 0.55;
}`;

export const oscillateEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float osc = sin(p.x * 3.0 + common) * cos(p.y * 3.0 + common);
  return vec2(
    sin(p.x * i + osc + common) * cos(p.y * i + osc + common),
    sin(length(p.x + osc) + common) * cos(length(p.y + osc) + common)
  ) * 0.55;
}`;

export const fractalEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float fractal = sin(length(p) * 5.0 + common) * cos(length(p) * 3.0 + common);
  return vec2(
    sin(p.x * i + fractal + common) * cos(p.y * i + fractal + common),
    sin(length(p.x + fractal) + common) * cos(length(p.y + fractal) + common)
  ) * 0.55;
}`;

export const swirlEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float r = length(p);
  float theta = atan(p.y, p.x) + r * common;
  return vec2(
    r * cos(theta + i + common),
    r * sin(theta + i + common)
  ) * 0.55;
}`;

export const bounceEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float bounce = abs(common);
  return vec2(
    sin(p.x * i + bounce + common) * cos(p.y * i + bounce + common),
    sin(length(p.x + bounce) + common) * cos(length(p.y + bounce) + common)
  ) * 0.55;
}`;

export const octopusEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed * 0.8);
  float r = length(p);
  float theta = atan(p.y, p.x);
  
  // Create flowing tentacle-like movements
  float tentacle1 = sin(r * 8.0 + theta * 4.0 + common * 2.0) * 0.3;
  float tentacle2 = cos(r * 6.0 - theta * 3.0 + common * 1.5) * 0.25;
  float tentacle3 = sin(r * 12.0 + theta * 2.0 + common * 3.0) * 0.2;
  
  float flow = tentacle1 + tentacle2 + tentacle3;
  
  return vec2(
    sin(p.x * i + flow + common) * cos(p.y * i + flow + common),
    sin(length(p.x + flow) + common) * cos(length(p.y + flow) + common)
  ) * 0.65;
}`;

export const modernFlowEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed * 0.6);
  
  // Flat, modern movement inspired by octopus.do
  float flatWave = sin(p.x * 2.0 + common) * 0.4;
  float verticalFlow = cos(p.y * 3.0 + common * 1.2) * 0.3;
  float diagonal = sin((p.x + p.y) * 1.5 + common * 0.8) * 0.25;
  
  float modernPattern = flatWave + verticalFlow + diagonal;
  
  return vec2(
    sin(p.x * i + modernPattern + common) * cos(p.y * i + modernPattern + common),
    sin(length(p.x + modernPattern) + common) * cos(length(p.y + modernPattern) + common)
  ) * 0.45;
}`;

export const minimalistEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed * 0.4);
  
  // Clean, subtle movement
  float gentle = sin(length(p) * 3.0 + common) * 0.2;
  float breath = cos(common * 0.5) * 0.1;
  
  return vec2(
    sin(p.x * i + gentle + common + breath) * cos(p.y * i + gentle + common + breath),
    sin(length(p.x + gentle) + common + breath) * cos(length(p.y + gentle) + common + breath)
  ) * 0.35;
}`;

export const retinalEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  
  // High DPI optimized subtle patterns
  float fine = sin(p.x * 15.0 + common) * cos(p.y * 15.0 + common) * 0.1;
  float coarse = sin(p.x * 3.0 + common * 0.7) * cos(p.y * 3.0 + common * 0.7) * 0.3;
  
  float retinaPattern = fine + coarse;
  
  return vec2(
    sin(p.x * i + retinaPattern + common) * cos(p.y * i + retinaPattern + common),
    sin(length(p.x + retinaPattern) + common) * cos(length(p.y + retinaPattern) + common)
  ) * 0.4;
}`;

export const effectFunctions = [
  defaultEffect,
  spiralEffect,
  waveEffect,
  vortexEffect,
  pulseEffect,
  rippleEffect,
  twistEffect,
  oscillateEffect,
  fractalEffect,
  swirlEffect,
  bounceEffect,
  octopusEffect,
  modernFlowEffect,
  minimalistEffect,
  retinalEffect,
];
