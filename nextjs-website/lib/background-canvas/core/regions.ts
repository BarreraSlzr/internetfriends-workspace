// Regions management scaffold. Will track DOMRects, masks, and visibility.
export type RegionId = number;
export type RegionOptions = Record<string, unknown>;

export function createRegionManager() {
  return {
    add: (_el: HTMLElement, _opts: RegionOptions) => ({ id: Math.floor(Math.random() * 1e9), update: (_o: RegionOptions) => {}, dispose: () => {} }),
  };
}
