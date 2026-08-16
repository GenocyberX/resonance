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
    // Remove leading/trailing empty lines if any
    while (rawLines.length > 0 && rawLines[0].trim() === '') rawLines.shift();
    while (rawLines.length > 0 && rawLines[rawLines.length - 1].trim() === '') rawLines.pop();

    const height = rawLines.length;
    let maxWidth = 0;
    for (const line of rawLines) {
      if (line.length > maxWidth) maxWidth = line.length;
    }

    // Pad lines to uniform width
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
