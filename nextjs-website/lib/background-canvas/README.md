# Background Canvas (GLSL Glass Overlay)

Purpose: Provide a performant, opt-in WebGL2 overlay that reproduces and enhances the Gloo glass effect using a blurred scene base, refraction, subtle chromatic aberration, and rim lighting — with safe fallbacks.

## Architecture
- Transparent overlay canvas fixed to viewport, managed by a provider (RAF-driven).
- Regions registered via a React hook. Each region supplies its DOM rect and options.
- Scene capture: render underlying DOM region to an offscreen canvas (downscaled), apply separable blur to emulate `backdrop-filter`.
- Shader pass: fragment shader samples blurred scene, applies refraction/aberration/tint/rim, masks to region shape, composites with premultiplied alpha.
- Decoupled cadence: capture/blur at low FPS (6–12); animate distortion at higher FPS (24–60) depending on device and settings.

## Public API (planned)
- <GlassProvider quality="auto" fpsCap={60} preferredMode="glsl|css|auto" />
- const { ref } = useGlassRegion({
  intensity: 0.6,
  dispersion: 0.0025,
  aberration: 0.003,
  rimStrength: 0.25,
  tintStrength: 0.2,
  radius: 10,
  dynamicSampling: 'hover' // 'always' | 'hover' | 'never'
})
- <div ref={ref} data-glass>

## Files
- core/renderer.ts: Overlay WebGL2 init, RAF, FBO/texture pooling, draw loop.
- core/regions.ts: Region registration, mask/radius, rect tracking, visibility.
- core/capture.ts: DOM capture + downscale + separable blur (CPU or GPU pass).
- shaders/passthrough.vert: Fullscreen quad vertex shader.
- shaders/glass.frag: Refraction + chromatic aberration + rim + tint.
- shaders/blurH.frag, shaders/blurV.frag: Separable Gaussian blur passes.
- react/GlassProvider.tsx: Context/provider mounting overlay canvas.
- react/useGlassRegion.ts: Hook to register/unregister and update options.
- utils/colorTokens.ts: Read CSS vars (Gloo) and convert to linear RGB uniforms.
- utils/perf.ts: fps cap, reduced motion, resolution scale helpers.

## Performance & Accessibility
- Quality modes: auto detects device performance (drops res/fps), low locks to ~0.5 res and 15–24 fps, high tries 60 fps and 0.75–1.0 res.
- Prefers-reduced-motion: freezes animation and/or uses CSS glass fallback.
- WebGL unsupported: fallback to CSS glass classes automatically.
- Memory management: reuse framebuffers and textures; throttle resizes.

## Visual Goals (Apple Glass parity)
- Backdrop-like blur base matching CSS presets.
- Subtle, physically inspired refraction; minimal chromatic aberration.
- Edge rim highlight derived from mask gradient; compact radius.
- Palette-aware tint from Gloo tokens; optional region-average color bias.

## Testing
- Visual: deterministic seed/time; snapshot frames at t=0s and t=1s.
- Unit: region UV/mask correctness; token mapping; quality mode selection.
- Perf: ensure frame time and memory within perf.budgets.json.

## Rollout
1) Land scaffolding (this folder) with typed stubs to keep builds green.
2) Implement capture+blur and minimal shader; wire to a demo region.
3) Tune colors/intensity to match CSS glass; add tests and budgets.
4) Expand to additional regions; document best practices.
