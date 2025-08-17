export const defaultEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  return vec2(
    sin(p.x * i + common) * cos(p.y * i + common),
    sin(length(p.x) + common) * cos(length(p.y) + common)
  );
}`;

export const spiralEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float r = length(p);
  float theta = atan(p.y, p.x);
  float spiral = sin(r * 10.0 - theta * 3.0 + common);
  return vec2(
    sin(p.x * i + spiral + common) * cos(p.y * i + spiral + common),
    sin(length(p.x + spiral) + common) * cos(length(p.y + spiral) + common)
  );
}`;

export const waveEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float wave = sin(p.x * 5.0 + common) * cos(p.y * 5.0 + common);
  return vec2(
    sin(p.x * i + wave + common) * cos(p.y * i + wave + common),
    sin(length(p.x + wave) + common) * cos(length(p.y + wave) + common)
  );
}`;

export const vortexEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float r = length(p);
  float theta = atan(p.y, p.x);
  float vortex = sin(r * 10.0 + theta * 5.0 + common);
  return vec2(
    sin(p.x * i + vortex + common) * cos(p.y * i + vortex + common),
    sin(length(p.x + vortex) + common) * cos(length(p.y + vortex) + common)
  );
}`;

export const pulseEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float pulse = common * 0.5 + 0.5;
  return vec2(
    sin(p.x * i + pulse * 10.0 + common) * cos(p.y * i + pulse * 10.0 + common),
    sin(length(p.x * pulse) + common) * cos(length(p.y * pulse) + common)
  );
}`;

export const rippleEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float ripple = sin(length(p) * 10.0 - common) * 0.5;
  return vec2(
    sin(p.x * i + ripple + common) * cos(p.y * i + ripple + common),
    sin(length(p.x + ripple) + common) * cos(length(p.y + ripple) + common)
  );
}`;

export const twistEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float r = length(p);
  float theta = atan(p.y, p.x) + common * 0.5;
  return vec2(
    r * cos(theta + i + common),
    r * sin(theta + i + common)
  );
}`;

export const oscillateEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float osc = sin(p.x * 3.0 + common) * cos(p.y * 3.0 + common);
  return vec2(
    sin(p.x * i + osc + common) * cos(p.y * i + osc + common),
    sin(length(p.x + osc) + common) * cos(length(p.y + osc) + common)
  );
}`;

export const fractalEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float fractal = sin(length(p) * 5.0 + common) * cos(length(p) * 3.0 + common);
  return vec2(
    sin(p.x * i + fractal + common) * cos(p.y * i + fractal + common),
    sin(length(p.x + fractal) + common) * cos(length(p.y + fractal) + common)
  );
}`;

export const swirlEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float r = length(p);
  float theta = atan(p.y, p.x) + r * common;
  return vec2(
    r * cos(theta + i + common),
    r * sin(theta + i + common)
  );
}`;

export const bounceEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed);
  float bounce = abs(common);
  return vec2(
    sin(p.x * i + bounce + common) * cos(p.y * i + bounce + common),
    sin(length(p.x + bounce) + common) * cos(length(p.y + bounce) + common)
  );
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

// POKEMON HOLOGRAPHIC EFFECTS - NEW!
export const holographicEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed * 0.7);
  
  // Holographic interference patterns like Pokemon cards
  float interference1 = sin(p.x * 20.0 + p.y * 15.0 + common * 3.0) * 0.15;
  float interference2 = cos(p.x * 12.0 - p.y * 18.0 + common * 2.0) * 0.12;
  float interference3 = sin(p.x * 25.0 + p.y * 8.0 + common * 4.0) * 0.08;
  
  // Rainbow diffraction effect
  float diffraction = sin(length(p) * 30.0 + common * 5.0) * 0.1;
  
  float holoPattern = interference1 + interference2 + interference3 + diffraction;
  
  return vec2(
    sin(p.x * i + holoPattern + common) * cos(p.y * i + holoPattern + common),
    sin(length(p.x + holoPattern) + common) * cos(length(p.y + holoPattern) + common)
  ) * 0.5;
}`;

export const iridescentEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed * 0.5);
  
  // Iridescent oil-slick patterns
  float r = length(p);
  float theta = atan(p.y, p.x);
  
  float layer1 = sin(r * 40.0 + theta * 8.0 + common * 6.0) * 0.1;
  float layer2 = cos(r * 30.0 - theta * 6.0 + common * 4.0) * 0.08;
  float layer3 = sin(r * 50.0 + theta * 10.0 + common * 8.0) * 0.06;
  
  // Add subtle metallic shimmer
  float shimmer = sin(p.x * 35.0 + p.y * 35.0 + common * 7.0) * 0.05;
  
  float iridescence = layer1 + layer2 + layer3 + shimmer;
  
  return vec2(
    sin(p.x * i + iridescence + common) * cos(p.y * i + iridescence + common),
    sin(length(p.x + iridescence) + common) * cos(length(p.y + iridescence) + common)
  ) * 0.45;
}`;

export const prismEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed * 0.8);
  
  // Light refraction through prism patterns
  float prism1 = sin(p.x * 18.0 + common * 3.0) * cos(p.y * 22.0 + common * 2.5) * 0.12;
  float prism2 = cos(p.x * 14.0 - common * 2.0) * sin(p.y * 16.0 + common * 3.5) * 0.1;
  float prism3 = sin((p.x + p.y) * 20.0 + common * 4.0) * 0.08;
  
  // Chromatic aberration effect
  float chromatic = sin(length(p) * 25.0 + common * 6.0) * 0.06;
  
  float prismPattern = prism1 + prism2 + prism3 + chromatic;
  
  return vec2(
    sin(p.x * i + prismPattern + common) * cos(p.y * i + prismPattern + common),
    sin(length(p.x + prismPattern) + common) * cos(length(p.y + prismPattern) + common)
  ) * 0.48;
}`;

export const holoPearlEffect = String.raw`vec2 effect(vec2 p, float i, float time) {
  float common = sin(time * speed * 0.6);
  
  // Pearl-like luminescence with Pokemon holo effect
  float r = length(p);
  float theta = atan(p.y, p.x);
  
  // Multiple interference layers for depth
  float layer1 = sin(r * 32.0 + theta * 12.0 + common * 5.0) * 0.13;
  float layer2 = cos(r * 24.0 - theta * 8.0 + common * 3.5) * 0.11;
  float layer3 = sin(r * 45.0 + theta * 16.0 + common * 7.0) * 0.09;
  float layer4 = cos(r * 18.0 + theta * 6.0 + common * 2.5) * 0.07;
  
  // Add fine detail patterns
  float microPattern = sin(p.x * 60.0 + p.y * 55.0 + common * 10.0) * 0.04;
  
  float pearl = layer1 + layer2 + layer3 + layer4 + microPattern;
  
  return vec2(
    sin(p.x * i + pearl + common) * cos(p.y * i + pearl + common),
    sin(length(p.x + pearl) + common) * cos(length(p.y + pearl) + common)
  ) * 0.52;
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
  holographicEffect,
  iridescentEffect,
  prismEffect,
  holoPearlEffect,
];
