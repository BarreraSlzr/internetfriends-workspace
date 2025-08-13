import { generateStamp } from "@/lib/utils/timestamp";
"use client";

import dynamic from "next/dynamic";

const PerformanceMetricsInitializer = dynamic(
  () => import("@/components/perf/performance_metrics_initializer"),
  {
    ssr: false,
    loading: () => null,
  },
);

export function ClientRUMWrapper() {
  return <PerformanceMetricsInitializer />;
}

export default ClientRUMWrapper;
