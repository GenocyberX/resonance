/**
 * Deterministic Pseudo-Random Number Generator using Mulberry32 algorithm.
 * Ensures that the same seed produces the exact same procedural world journey.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number = 1337) {
    this.state = seed >>> 0;
  }

  /**
   * Reseeds the generator.
   */
  public reseed(seed: number): void {
    this.state = seed >>> 0;
  }

  /**
   * Generates next float in [0, 1).
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates float in [min, max).
   */
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generates integer in [min, max] inclusive.
   */
  public rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Generates boolean with given probability of being true (default 0.5).
   */
  public boolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Picks a random element from an array.
   */
  public choice<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    const idx = Math.floor(this.next() * array.length);
    return array[idx];
  }

  /**
   * Returns a new child SeededRandom branched deterministically from this generator.
   */
  public fork(offset: number = 0): SeededRandom {
    const nextSeed = Math.floor(this.next() * 0xffffffff) ^ (offset * 2654435761);
    return new SeededRandom(nextSeed);
  }
}
