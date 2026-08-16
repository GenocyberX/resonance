import { SpriteDefinition, SpriteVariant } from './types';

export class Sprite {
  /**
   * Helper to create a SpriteVariant from raw multiline string template.
   */
  public static createVariant(
    rawText: string,
    anchorXRatio: number = 0.5,
    anchorYRatio: number = 1.0,
    colorMask?: string[]
  ): SpriteVariant {
    const rawLines = rawText.split('\n');
    while (rawLines.length > 0 && rawLines[0].trim() === '') rawLines.shift();
    while (rawLines.length > 0 && rawLines[rawLines.length - 1].trim() === '') rawLines.pop();

    const height = rawLines.length;
    let maxWidth = 0;
    for (const line of rawLines) {
      if (line.length > maxWidth) maxWidth = line.length;
    }

    const lines = rawLines.map(line => line.padEnd(maxWidth, ' '));
    const width = maxWidth;

    return {
      lines,
      width,
      height,
      anchorX: Math.round((width - 1) * anchorXRatio),
      anchorY: Math.round((height - 1) * anchorYRatio),
      colorMask,
    };
  }

  /**
   * Helper to create a multi-color SpriteVariant with per-character color mapping.
   * If rawMask is supplied, each char in rawMask maps to a color in colorMapping.
   * If rawMask is omitted, chars in rawText map directly to colorMapping.
   */
  public static createColoredVariant(
    rawText: string,
    colorMapping: Record<string, string>,
    rawMask?: string,
    anchorXRatio: number = 0.5,
    anchorYRatio: number = 1.0
  ): SpriteVariant {
    const variant = Sprite.createVariant(rawText, anchorXRatio, anchorYRatio);
    const colors: string[][] = [];

    let maskLines: string[] = [];
    if (rawMask) {
      maskLines = rawMask.split('\n');
      while (maskLines.length > 0 && maskLines[0].trim() === '') maskLines.shift();
      while (maskLines.length > 0 && maskLines[maskLines.length - 1].trim() === '') maskLines.pop();
    }

    for (let r = 0; r < variant.lines.length; r++) {
      const line = variant.lines[r];
      const maskLine = maskLines[r] || '';
      const rowColors: string[] = [];

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === ' ') {
          rowColors.push('');
          continue;
        }

        const lookupKey = maskLine[c] || char;
        const color = colorMapping[lookupKey] || colorMapping['*'] || '';
        rowColors.push(color);
      }
      colors.push(rowColors);
    }

    variant.colors = colors;
    return variant;
  }

  public static define(
    id: string,
    name: string,
    defaultColor: string,
    variants: SpriteDefinition['variants']
  ): SpriteDefinition {
    return {
      id,
      name,
      defaultColor,
      variants,
    };
  }
}
