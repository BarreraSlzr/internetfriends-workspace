// Capture+blur scaffold. Will implement DOM region capture and separable blur.
export interface CaptureOptions {
  scale?: number; // 0.5 - 1.0
  blurRadius?: number; // px
  fps?: number; // capture cadence
}

export async function captureRegionBlurred(_el: HTMLElement, _opts: CaptureOptions): Promise<HTMLCanvasElement | null> {
  return null; // stub until implemented
}
