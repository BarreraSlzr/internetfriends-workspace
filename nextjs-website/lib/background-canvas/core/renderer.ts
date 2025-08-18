// Placeholder renderer to keep builds green. Real implementation will manage
// a transparent WebGL overlay canvas, RAF loop, FBOs, and draw calls.
export type RendererInitOptions = {
  fpsCap?: number;
  quality?: "auto" | "low" | "high";
};

export function initRenderer(_opts: RendererInitOptions) {
  // no-op for scaffolding
  return {
    start: () => {},
    stop: () => {},
    registerRegion: (_el: HTMLElement, _opts: unknown) => ({ update: (_o: unknown) => {}, dispose: () => {} }),
  };
}
