// RUM System Entry Point
export { rum as default } from "./collector";
export { useRUM, useComponentPerformance, usePagePerformance } from "./hooks";
export type { RUMMetric, WebVitalsData } from "./collector";