export interface RGB {
  r: number;
  g: number;
  b: number;
}

export class ColorPalette {
  public static hexToRgb(hex: string): RGB {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  public static rgbToHex(rgb: RGB): string {
    const r = Math.max(0, Math.min(255, Math.round(rgb.r))).toString(16).padStart(2, '0');
    const g = Math.max(0, Math.min(255, Math.round(rgb.g))).toString(16).padStart(2, '0');
    const b = Math.max(0, Math.min(255, Math.round(rgb.b))).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  public static lerp(colorA: string, colorB: string, t: number): string {
    const clampedT = Math.max(0, Math.min(1, t));
    const a = this.hexToRgb(colorA);
    const b = this.hexToRgb(colorB);

    return this.rgbToHex({
      r: a.r + (b.r - a.r) * clampedT,
      g: a.g + (b.g - a.g) * clampedT,
      b: a.b + (b.b - a.b) * clampedT,
    });
  }

  public static scaleBrightness(hex: string, factor: number): string {
    const rgb = this.hexToRgb(hex);
    const f = Math.max(0, factor);
    return this.rgbToHex({
      r: rgb.r * f,
      g: rgb.g * f,
      b: rgb.b * f,
    });
  }

  public static blendWeighted(colorsWithWeights: { color: string; weight: number }[]): string {
    let totalWeight = 0;
    let r = 0;
    let g = 0;
    let b = 0;

    for (const item of colorsWithWeights) {
      if (item.weight <= 0) continue;
      const rgb = this.hexToRgb(item.color);
      r += rgb.r * item.weight;
      g += rgb.g * item.weight;
      b += rgb.b * item.weight;
      totalWeight += item.weight;
    }

    if (totalWeight <= 0) return '#000000';

    return this.rgbToHex({
      r: r / totalWeight,
      g: g / totalWeight,
      b: b / totalWeight,
    });
  }

  public static applyFog(colorHex: string, fogHex: string, depthFactor: number): string {
    const fog = Math.max(0, Math.min(1, depthFactor));
    return this.lerp(colorHex, fogHex, fog);
  }
}
