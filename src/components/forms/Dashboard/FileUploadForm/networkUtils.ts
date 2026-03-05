/**
 * Adaptive chunk sizing based on network conditions.
 * Stronger/faster network → larger chunks (fewer requests, faster upload).
 * Weaker/slower network → smaller chunks (more reliable, easier resume).
 *
 * Uses Network Information API when available (Chrome, Edge, some mobile).
 * Falls back to 5MB when API is unavailable.
 */

const CHUNK_MIN_MB = 5;
const CHUNK_MAX_MB = 50;

/** Chunk size presets in bytes */
export const CHUNK_SIZES = {
  /** Slow/unstable: 2G, slow-2g, saveData, or downlink < 1 Mbps */
  slow: 5 * 1024 * 1024,
  /** Medium: 3G or downlink 1–5 Mbps */
  medium: 10 * 1024 * 1024,
  /** Fast: 4G or downlink 5–15 Mbps */
  fast: 20 * 1024 * 1024,
  /** Very fast: downlink > 15 Mbps */
  veryFast: 50 * 1024 * 1024,
} as const;

type NetworkConnection = {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
  rtt?: number;
};

function getConnection(): NetworkConnection | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & { connection?: NetworkConnection };
  return nav.connection ?? null;
}

/**
 * Get chunk size in bytes based on current network conditions.
 * Min 5MB, max 50MB. Used before multipart-init to optimize chunk count.
 */
export function getAdaptiveChunkSize(): number {
  const conn = getConnection();
  if (!conn) return CHUNK_SIZES.slow;

  if (conn.saveData) return CHUNK_SIZES.slow;

  const effectiveType = conn.effectiveType?.toLowerCase() ?? "";
  const downlink = conn.downlink ?? 0;

  if (effectiveType === "slow-2g" || effectiveType === "2g") {
    return CHUNK_SIZES.slow;
  }
  if (effectiveType === "3g") {
    return downlink >= 5 ? CHUNK_SIZES.medium : CHUNK_SIZES.slow;
  }
  if (effectiveType === "4g") {
    if (downlink >= 15) return CHUNK_SIZES.veryFast;
    if (downlink >= 5) return CHUNK_SIZES.fast;
    return CHUNK_SIZES.medium;
  }

  if (downlink >= 15) return CHUNK_SIZES.veryFast;
  if (downlink >= 5) return CHUNK_SIZES.fast;
  if (downlink >= 1) return CHUNK_SIZES.medium;

  return CHUNK_SIZES.slow;
}

/** Get human-readable label for current chunk size */
export function getChunkSizeLabel(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb}MB`;
}

/** Clamp chunk size to valid range (5MB–50MB) */
export function clampChunkSize(bytes: number): number {
  const min = CHUNK_MIN_MB * 1024 * 1024;
  const max = CHUNK_MAX_MB * 1024 * 1024;
  return Math.max(min, Math.min(max, bytes));
}
