/**
 * 1D and 2D Perlin-style gradient noise for smooth, continuous procedural curves and terrain.
 */
export class Noise {
  private perm: number[] = [];

  constructor(seed: number = 42) {
    this.reseed(seed);
  }

  public reseed(seed: number): void {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    // Deterministic shuffle with seed
    let s = seed >>> 0;
    for (let i = 255; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    this.perm = new Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad1(hash: number, x: number): number {
    const h = hash & 15;
    const grad = 1 + (h & 7); // Gradient value 1.0, 2.0, ..., 8.0
    return (h & 8 ? -grad : grad) * x;
  }

  private grad2(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return (h & 1 ? -u : u) + (h & 2 ? -2.0 * v : 2.0 * v);
  }

  /**
   * 1D Perlin Noise, returns value roughly in [-1, 1]
   */
  public noise1D(x: number): number {
    const xi = Math.floor(x) & 255;
    const xf = x - Math.floor(x);
    const u = this.fade(xf);

    const g0 = this.grad1(this.perm[xi], xf);
    const g1 = this.grad1(this.perm[xi + 1], xf - 1);

    return this.lerp(u, g0, g1);
  }

  /**
   * 2D Perlin Noise, returns value roughly in [-1, 1]
   */
  public noise2D(x: number, y: number): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const aa = this.perm[this.perm[xi] + yi];
    const ab = this.perm[this.perm[xi] + yi + 1];
    const ba = this.perm[this.perm[xi + 1] + yi];
    const bb = this.perm[this.perm[xi + 1] + yi + 1];

    const x1 = this.lerp(u, this.grad2(aa, xf, yf), this.grad2(ba, xf - 1, yf));
    const x2 = this.lerp(u, this.grad2(ab, xf, yf - 1), this.grad2(bb, xf - 1, yf - 1));

    return this.lerp(v, x1, x2);
  }

  /**
   * Octave / Fractal Brownian Motion (FBM) noise
   */
  public fbm1D(x: number, octaves: number = 4, persistence: number = 0.5, lacunarity: number = 2.0): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise1D(x * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }
}
