import { FrameBuffer } from './FrameBuffer';

export interface RendererOptions {
  charWidthPx: number;
  charHeightPx: number;
}

export class AsciiRenderer {
  private targetElement: HTMLElement;
  private frameBuffer: FrameBuffer;
  private charWidthPx: number = 8.2;
  private charHeightPx: number = 14.5;
  private preElement: HTMLPreElement;

  constructor(targetElement: HTMLElement, initialCols: number = 120, initialRows: number = 42) {
    this.targetElement = targetElement;
    this.frameBuffer = new FrameBuffer(initialCols, initialRows);

    this.preElement = document.createElement('pre');
    this.preElement.style.margin = '0';
    this.preElement.style.padding = '0';
    this.preElement.style.display = 'block';
    this.preElement.style.fontFamily = 'inherit';
    this.preElement.style.lineHeight = 'inherit';

    this.targetElement.innerHTML = '';
    this.targetElement.appendChild(this.preElement);
  }

  public getFrameBuffer(): FrameBuffer {
    return this.frameBuffer;
  }

  /**
   * Resizes framebuffer to fit target element container bounds.
   */
  public resizeToContainer(): void {
    const rect = this.targetElement.getBoundingClientRect();
    const cols = Math.max(60, Math.floor(rect.width / this.charWidthPx));
    const rows = Math.max(25, Math.floor(rect.height / this.charHeightPx));

    this.frameBuffer.resize(cols, rows);
  }

  /**
   * Compiles the 2D FrameBuffer matrix into optimized batched HTML spans and renders to DOM.
   */
  public render(): void {
    const fb = this.frameBuffer;
    const rows = fb.height;
    const cols = fb.width;
    const cells = fb.cells;

    let html = '';

    for (let y = 0; y < rows; y++) {
      const row = cells[y];
      let currentColor = '';
      let currentBg = '';
      let currentSpanText = '';

      for (let x = 0; x < cols; x++) {
        const cell = row[x];
        const cellColor = cell.color || '#ffffff';
        const cellBg = cell.bg || '';
        const char = cell.char || ' ';

        // Escape HTML special chars
        let safeChar = char;
        if (char === '&') safeChar = '&amp;';
        else if (char === '<') safeChar = '&lt;';
        else if (char === '>') safeChar = '&gt;';

        if (cellColor === currentColor && cellBg === currentBg) {
          currentSpanText += safeChar;
        } else {
          // Flush existing span
          if (currentSpanText.length > 0) {
            html += this.formatSpan(currentSpanText, currentColor, currentBg);
          }
          currentColor = cellColor;
          currentBg = cellBg;
          currentSpanText = safeChar;
        }
      }

      if (currentSpanText.length > 0) {
        html += this.formatSpan(currentSpanText, currentColor, currentBg);
      }

      if (y < rows - 1) {
        html += '\n';
      }
    }

    this.preElement.innerHTML = html;
  }

  private formatSpan(text: string, color: string, bg: string): string {
    let style = `color:${color};`;
    if (bg) {
      style += `background-color:${bg};`;
    }
    return `<span style="${style}">${text}</span>`;
  }
}
