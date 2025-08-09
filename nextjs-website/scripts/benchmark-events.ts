#!/usr/bin/env bun
/**
 * benchmark-events.ts
 * InternetFriends Event System Benchmark
 *
 * Purpose:
 *  - Provide a lightweight, repeatable micro-benchmark of the event emission + listener pipeline
 *  - Capture baseline throughput for later performance optimization epics
 *  - Output JSON so other scripts / CI agents can parse and append to metrics
 *
 * Usage:
 *  bun run scripts/benchmark-events.ts
 *  bun run scripts/benchmark-events.ts --events=20000 --warmup=2000 --json
 *
 * Flags:
 *  --events=<number>    Total measured events to emit (default: 5000)
 *  --warmup=<number>    Events to emit before measurement (JIT / caches) (default: 1000)
 *  --listeners=<number> Number of listeners per event (default: 1)
 *  --type=<string>      Event type to emit (default: system.health.check)
 *  --json               Output JSON only (no human summary)
 *
 * NOTE:
 *  - This script assumes the existence of the base event system with emit/on APIs.
 *  - It will still succeed (degraded) if the validated emitter layer isn't used yet.
 *  - Keep this benchmark intentionally simple; for complex profiling use a dedicated suite.
 */

import { performance } from "perf_hooks";

// Dynamic import paths so that running this early in the epic (before full
// integration) won't crash if modules shift. Fallback to no-op if unavailable.
type EmitFn = (type: string, payload: any) => any;
type OnFn = (type: string, handler: (payload: any) => void) => any;

let emit: EmitFn;
let on: OnFn;

async function resolveEventSystem() {
  const candidates = [
    "./../lib/events/validated-emitter", // preferred (validated)
    "./../lib/events/event.system"       // fallback (raw)
  ];
  for (const c of candidates) {
    try {
      const mod = await import(c);
      if (mod.emitValidated) {
        emit = (type: string, payload: any) => mod.emitValidated(type, payload, { injectTimestamp: true });
      } else if (mod.emit) {
        emit = mod.emit;
      }
      if (mod.onValidated) {
        on = mod.onValidated;
      } else if (mod.on) {
        on = mod.on;
      }
      if (emit && on) return;
    } catch {
      // ignore – try next candidate
    }
  }
  // Graceful fallback
  emit = (type: string, _payload: any) => {};
  on = (_type: string, _handler: (p: any) => void) => {};
}

interface BenchmarkResult {
  eventType: string;
  events: number;
  warmup: number;
  listenersPerEvent: number;
  totalEmissions: number;
  durationMs: number;
  eventsPerSecond: number;
  avgPerEventMicro: number;
  timestamp: string;
  process: {
    pid: number;
    nodeVersion: string;
    bunVersion?: string;
    memoryMB: number;
  };
}

function parseFlag(name: string, fallback: number): number {
  const f = process.argv.find(a => a.startsWith(`--${name}=`));
  if (!f) return fallback;
  const v = parseInt(f.split("=")[1], 10);
  return Number.isFinite(v) ? v : fallback;
}

function parseStringFlag(name: string, fallback: string): string {
  const f = process.argv.find(a => a.startsWith(`--${name}=`));
  if (!f) return fallback;
  const v = f.split("=")[1];
  return v || fallback;
}

async function main() {
  await resolveEventSystem();

  const totalEvents = parseFlag("events", 5000);
  const warmupEvents = parseFlag("warmup", 1000);
  const listenersPerEvent = parseFlag("listeners", 1);
  const eventType = parseStringFlag("type", "system.health.check");
  const jsonOnly = process.argv.includes("--json");

  // Attach listeners
  let received = 0;
  for (let l = 0; l < listenersPerEvent; l++) {
    on(eventType, () => {
      received++;
    });
  }

  // Warmup phase
  for (let i = 0; i < warmupEvents; i++) {
    emit(eventType, {
      type: eventType,
      timestamp: new Date().toISOString(),
      status: "ok",
      latencyMs: 0.1
    });
  }

  // Measured phase
  const start = performance.now();
  for (let i = 0; i < totalEvents; i++) {
    emit(eventType, {
      type: eventType,
      timestamp: new Date().toISOString(),
      status: "ok",
      latencyMs: (Math.random() * 5) + 0.1
    });
  }
  const end = performance.now();

  const durationMs = end - start;
  const eventsPerSecond = totalEvents / (durationMs / 1000);
  const avgPerEventMicro = (durationMs / totalEvents) * 1000;

  const mem = process.memoryUsage();
  const memoryMB = (mem.rss / (1024 * 1024));

  const result: BenchmarkResult = {
    eventType,
    events: totalEvents,
    warmup: warmupEvents,
    listenersPerEvent,
    totalEmissions: totalEvents * listenersPerEvent,
    durationMs: +durationMs.toFixed(3),
    eventsPerSecond: +eventsPerSecond.toFixed(2),
    avgPerEventMicro: +avgPerEventMicro.toFixed(2),
    timestamp: new Date().toISOString(),
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      bunVersion: (globalThis as any).Bun?.version,
      memoryMB: +memoryMB.toFixed(2)
    }
  };

  if (jsonOnly) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("InternetFriends Event Benchmark");
    console.log("------------------------------------------------");
    console.log(`Event Type:             ${result.eventType}`);
    console.log(`Measured Events:        ${result.events}`);
    console.log(`Warmup Events:          ${result.warmup}`);
    console.log(`Listeners per Event:    ${result.listenersPerEvent}`);
    console.log(`Total Emissions:        ${result.totalEmissions}`);
    console.log(`Duration (ms):          ${result.durationMs}`);
    console.log(`Events / Second:        ${result.eventsPerSecond}`);
    console.log(`Avg Per Event (µs):     ${result.avgPerEventMicro}`);
    console.log(`Process RSS (MB):       ${result.process.memoryMB}`);
    console.log(`Runtime:                node=${result.process.nodeVersion} bun=${result.process.bunVersion || "n/a"}`);
    console.log("JSON Result:");
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch(err => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
