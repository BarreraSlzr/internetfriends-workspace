// LEGEND: Canonical timestamp utilities
// Use only these re-exports for all fossil creation and metadata
// All usage must comply with this LEGEND and the LICENSE
// NOTE: Within this canonical module it's acceptable to access Date directly.

/**
 * Returns an ISO 8601 timestamp (auditable canonical form)
 */
export function getIsoTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generates a short, sortable, human-traceable stamp combining date + random segment.
 * Format: YYYYMMDD-HHMMSS-xxxxx
 */
export function generateStamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const datePart = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
  const timePart = `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
  const rand = Math.random().toString(36).slice(2, 7);
  return `${datePart}-${timePart}-${rand}`;
}

/**
 * Convenience helper returning both timestamp and stamp.
 */
export function getTimestampBundle() {
  return {
    iso: getIsoTimestamp(),
    stamp: generateStamp(),
  } as const;
}
