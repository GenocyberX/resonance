import { describe, it, expect } from 'vitest';
import { SeededRandom } from '../src/procedural/SeededRandom';

describe('SeededRandom', () => {
  it('produces deterministic output for the same seed', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);

    for (let i = 0; i < 50; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('generates numbers within requested range', () => {
    const rng = new SeededRandom(999);
    for (let i = 0; i < 100; i++) {
      const val = rng.range(10, 20);
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThan(20);
    }
  });

  it('generates integers within requested range inclusive', () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 100; i++) {
      const val = rng.rangeInt(1, 6);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(6);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('correctly picks deterministic array choices', () => {
    const rng1 = new SeededRandom(777);
    const rng2 = new SeededRandom(777);
    const items = ['A', 'B', 'C', 'D', 'E'];

    for (let i = 0; i < 20; i++) {
      expect(rng1.choice(items)).toBe(rng2.choice(items));
    }
  });
});
