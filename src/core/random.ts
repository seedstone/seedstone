function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

function scramble(seed: number): number {
  let z = (seed + 0x6d2b79f5) >>> 0;
  z = Math.imul(z ^ (z >>> 15), z | 1);
  z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
  return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
}

/** Returns a deterministic float in [0, 1) for an independently hashed label. */
export function sampleUnit(seed: string, label: string): number {
  return scramble(djb2(`${label}:${seed.length === 0 ? "seedstone" : seed}`));
}

/** Returns a deterministic Mulberry32 stream seeded by an integer. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashU32(n: number): number {
  n = n >>> 0;
  n = Math.imul(((n >>> 16) ^ n) >>> 0, 0x45d9f3b) >>> 0;
  n = Math.imul(((n >>> 16) ^ n) >>> 0, 0x45d9f3b) >>> 0;
  return ((n >>> 16) ^ n) >>> 0;
}

/** Returns a stateless deterministic float in [0, 1) from two integers. */
export function hash2D(seed: number, i: number): number {
  return hashU32((seed * 65537 + i) >>> 0) / 4294967295;
}
