import { Cell, SpriteVariant } from './types';

export class FrameBuffer {
  public width: number = 0;
  public height: number = 0;
  public cells: Cell[][] = [];

  constructor(width: number = 120, height: number = 40) {
    this.resize(width, height);
  }

  public resize(width: number, height: number): void {
    const clampedW = Math.max(10, Math.floor(width));
    const clampedH = Math.max(10, Math.floor(height));

    if (this.width === clampedW && this.height === clampedH && this.cells.length > 0) {
      return;
    }

    this.width = clampedW;
    this.height = clampedH;
    this.cells = new Array(this.height);

    for (let y = 0; y < this.height; y++) {
      this.cells[y] = new Array(this.width);
      for (let x = 0; x < this.width; x++) {
        this.cells[y][x] = {
          char: ' ',
          color: '#ffffff',
          bg: '#000000',
          z: Infinity,
        };
      }
    }
  }

  public clear(fillChar: string = ' ', fillColor: string = '#10141e', fillBg?: string): void {
    for (let y = 0; y < this.height; y++) {
      const row = this.cells[y];
      for (let x = 0; x < this.width; x++) {
        const cell = row[x];
        cell.char = fillChar;
        cell.color = fillColor;
        cell.bg = fillBg;
        cell.z = Infinity;
      }
    }
  }

  /**
   * Sets a single cell at (x, y) with optional sprite transparency and z-buffering.
   * Background layers can set space characters ' ' with colors/backgrounds without rejection.
   */
  public setCell(
    x: number,
    y: number,
    char: string,
    color: string,
    z: number = 0,
    bg?: string,
    isSprite: boolean = false
  ): boolean {
    if (char.length > 1) {
      throw new Error(`[FrameBuffer] setCell() only accepts a single character/grapheme. Received string with length ${char.length}: "${char}"`);
    }

    const ix = Math.round(x);
    const iy = Math.round(y);

    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
      return false;
    }

    // Space transparency: spaces within sprites are transparent
    if (isSprite && char === ' ') {
      return false;
    }

    const currentCell = this.cells[iy][ix];

    // Depth check: smaller z is closer to the camera
    if (z > currentCell.z) {
      return false;
    }

    currentCell.char = char;
    currentCell.color = color;
    currentCell.z = z;
    if (bg !== undefined) {
      currentCell.bg = bg;
    }

    return true;
  }

  /**
   * Computes a fast, deterministic 32-bit FNV-1a hash across all cells in the FrameBuffer.
   * Used for static frame stability verification and regression testing.
   */
  public getFrameHash(): number {
    let hash = 0x811c9dc5;
    for (let y = 0; y < this.height; y++) {
      const row = this.cells[y];
      for (let x = 0; x < this.width; x++) {
        const cell = row[x];
        const code = cell.char.charCodeAt(0) || 32;
        hash ^= code;
        hash = Math.imul(hash, 0x01000193);

        const colorCode = cell.color.charCodeAt(1) || 0;
        hash ^= colorCode;
        hash = Math.imul(hash, 0x01000193);

        if (cell.bg) {
          const bgCode = cell.bg.charCodeAt(1) || 0;
          hash ^= bgCode;
          hash = Math.imul(hash, 0x01000193);
        }
      }
    }
    return hash >>> 0;
  }

  /**
   * Writes a horizontal line of characters (e.g. background bands, road lines).
   */
  public drawHLine(
    startX: number,
    endX: number,
    y: number,
    char: string,
    color: string,
    z: number = 0,
    bg?: string
  ): void {
    const iy = Math.round(y);
    if (iy < 0 || iy >= this.height) return;

    const x1 = Math.max(0, Math.min(Math.round(startX), Math.round(endX)));
    const x2 = Math.min(this.width - 1, Math.max(Math.round(startX), Math.round(endX)));

    for (let x = x1; x <= x2; x++) {
      this.setCell(x, iy, char, color, z, bg, false);
    }
  }

  /**
   * Writes a string of text at (x, y).
   */
  public drawString(
    x: number,
    y: number,
    text: string,
    color: string,
    z: number = 0,
    bg?: string
  ): void {
    const iy = Math.round(y);
    if (iy < 0 || iy >= this.height) return;

    let curX = Math.round(x);
    for (let i = 0; i < text.length; i++) {
      if (curX >= 0 && curX < this.width) {
        this.setCell(curX, iy, text[i], color, z, bg, false);
      }
      curX++;
    }
  }

  /**
   * Renders a sprite variant onto the framebuffer with depth sorting and space transparency.
   */
  public drawSprite(
    screenX: number,
    screenY: number,
    variant: SpriteVariant,
    defaultColor: string,
    z: number = 0,
    colorOverride?: string,
    forceColorOverride: boolean = false
  ): void {
    const startX = Math.round(screenX - variant.anchorX);
    const startY = Math.round(screenY - variant.anchorY);
    const renderColor = colorOverride || defaultColor;

    for (let row = 0; row < variant.lines.length; row++) {
      const targetY = startY + row;
      if (targetY < 0 || targetY >= this.height) continue;

      const line = variant.lines[row];
      for (let col = 0; col < line.length; col++) {
        const targetX = startX + col;
        if (targetX < 0 || targetX >= this.width) continue;

        const char = line[col];
        if (char === ' ') continue; // Transparent space in sprite

        // Per-character color or global color
        let charColor = renderColor;
        if (!forceColorOverride && variant.colors && variant.colors[row] && variant.colors[row][col]) {
          charColor = variant.colors[row][col];
        }

        this.setCell(targetX, targetY, char, charColor, z, undefined, true);
      }
    }
  }
}
