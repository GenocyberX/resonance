import { FrameBuffer } from './FrameBuffer';

export interface RenderStats {
  domRenderTimeMs: number;
  rowsUpdated: number;
  rowsTotal: number;
  spanCount: number;
  resizeCount: number;
}

interface CompiledRun {
  text: string;
  color: string;
  bg: string;
}

interface DomNode {
  className?: string;
  style: Record<string, string>;
  textContent?: string;
  children: DomNode[];
  appendChild(child: DomNode): DomNode;
  removeChild(child: DomNode): DomNode;
  lastChild?: DomNode | null;
  getBoundingClientRect?(): { width: number; height: number };
}

function createDomElement(tag: string): DomNode {
  if (typeof document !== 'undefined') {
    return document.createElement(tag) as unknown as DomNode;
  }
  // Headless Mock Node for tests / SSR
  const children: DomNode[] = [];
  const node: DomNode = {
    style: {},
    children,
    appendChild(child: DomNode) {
      children.push(child);
      node.lastChild = child;
      return child;
    },
    removeChild(child: DomNode) {
      const idx = children.indexOf(child);
      if (idx >= 0) children.splice(idx, 1);
      node.lastChild = children.length > 0 ? children[children.length - 1] : null;
      return child;
    },
    lastChild: null,
    getBoundingClientRect() {
      return { width: 1000, height: 600 };
    },
  };
  return node;
}

export class AsciiRenderer {
  private targetElement: DomNode;
  private frameBuffer: FrameBuffer;
  private charWidthPx: number = 8.2;
  private charHeightPx: number = 14.5;
  private preElement: DomNode;

  // Persistent DOM rows and diff signatures
  private rowElements: DomNode[] = [];
  private previousRowSignatures: string[] = [];

  // Resize caching and debounce
  private lastContainerWidth: number = 0;
  private lastContainerHeight: number = 0;
  private resizeCount: number = 0;

  // Performance telemetry
  private stats: RenderStats = {
    domRenderTimeMs: 0,
    rowsUpdated: 0,
    rowsTotal: 0,
    spanCount: 0,
    resizeCount: 0,
  };

  constructor(targetElement: HTMLElement | DomNode, initialCols: number = 120, initialRows: number = 42) {
    this.targetElement = targetElement as DomNode;
    this.frameBuffer = new FrameBuffer(initialCols, initialRows);

    this.preElement = createDomElement('pre');
    this.preElement.className = 'ascii-viewport-pre';
    this.preElement.style.margin = '0';
    this.preElement.style.padding = '0';
    this.preElement.style.display = 'block';
    this.preElement.style.fontFamily = 'Courier, monospace';
    this.preElement.style.fontSize = '14px';
    this.preElement.style.lineHeight = '1.0';
    this.preElement.style.letterSpacing = '0px';
    this.preElement.style.fontVariantLigatures = 'none';
    this.preElement.style.whiteSpace = 'pre';
    this.preElement.style.overflow = 'hidden';
    this.preElement.style.userSelect = 'none';

    if (this.targetElement.appendChild) {
      this.targetElement.appendChild(this.preElement);
    }

    this.syncRowElements(initialRows);
  }

  public getFrameBuffer(): FrameBuffer {
    return this.frameBuffer;
  }

  public getStats(): RenderStats {
    return { ...this.stats, resizeCount: this.resizeCount };
  }

  /**
   * Synchronizes the persistent row container elements with the target row count.
   */
  private syncRowElements(targetRowCount: number): void {
    while (this.rowElements.length < targetRowCount) {
      const rowSpan = createDomElement('span');
      rowSpan.className = 'ascii-row';
      rowSpan.style.display = 'block';
      rowSpan.style.margin = '0';
      rowSpan.style.padding = '0';
      rowSpan.style.lineHeight = '1.0';
      rowSpan.style.whiteSpace = 'pre';
      rowSpan.style.overflow = 'hidden';
      this.preElement.appendChild(rowSpan);
      this.rowElements.push(rowSpan);
    }

    while (this.rowElements.length > targetRowCount) {
      const extra = this.rowElements.pop();
      if (extra) {
        this.preElement.removeChild(extra);
      }
    }

    if (this.previousRowSignatures.length !== targetRowCount) {
      this.previousRowSignatures = new Array(targetRowCount).fill('');
    }
  }

  /**
   * Resizes framebuffer to fit target element container bounds with strict stability.
   */
  public resizeToContainer(): boolean {
    const rect = this.targetElement.getBoundingClientRect
      ? this.targetElement.getBoundingClientRect()
      : { width: 1000, height: 600 };
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);

    // Skip redundant resizes when dimensions haven't changed by at least 2 pixels
    if (Math.abs(w - this.lastContainerWidth) < 2 && Math.abs(h - this.lastContainerHeight) < 2) {
      return false;
    }

    this.lastContainerWidth = w;
    this.lastContainerHeight = h;

    const cols = Math.max(60, Math.floor(w / this.charWidthPx));
    const rows = Math.max(25, Math.floor(h / this.charHeightPx));

    if (cols === this.frameBuffer.width && rows === this.frameBuffer.height) {
      return false;
    }

    this.frameBuffer.resize(cols, rows);
    this.syncRowElements(rows);
    this.resizeCount++;
    return true;
  }

  /**
   * High-performance incremental DOM renderer using persistent rows and run-level diffing.
   * Completely eliminates full innerHTML rebuilds and layout/paint flashing.
   */
  public render(): void {
    const startTime = performance.now();
    const fb = this.frameBuffer;
    const rows = fb.height;
    const cols = fb.width;
    const cells = fb.cells;

    if (this.rowElements.length !== rows) {
      this.syncRowElements(rows);
    }

    let rowsUpdated = 0;
    let totalSpans = 0;

    for (let y = 0; y < rows; y++) {
      const row = cells[y];
      const runs: CompiledRun[] = [];

      let currentColor = row[0].color || '#ffffff';
      let currentBg = row[0].bg || '';
      let currentText = '';
      let rowSig = '';

      for (let x = 0; x < cols; x++) {
        const cell = row[x];
        const cellColor = cell.color || '#ffffff';
        const cellBg = cell.bg || '';
        const char = cell.char || ' ';

        if (cellColor === currentColor && cellBg === currentBg) {
          currentText += char;
        } else {
          if (currentText.length > 0) {
            runs.push({ text: currentText, color: currentColor, bg: currentBg });
            rowSig += `${currentColor};${currentBg};${currentText}|`;
          }
          currentColor = cellColor;
          currentBg = cellBg;
          currentText = char;
        }
      }

      if (currentText.length > 0) {
        runs.push({ text: currentText, color: currentColor, bg: currentBg });
        rowSig += `${currentColor};${currentBg};${currentText}`;
      }

      totalSpans += runs.length;

      // Row Diffing: if the row hasn't changed, skip DOM mutation entirely
      if (rowSig === this.previousRowSignatures[y]) {
        continue;
      }

      this.previousRowSignatures[y] = rowSig;
      rowsUpdated++;

      const rowElement = this.rowElements[y];
      const existingSpans = rowElement.children;

      // In-place node reuse
      for (let i = 0; i < runs.length; i++) {
        const run = runs[i];
        if (i < existingSpans.length) {
          const span = existingSpans[i] as unknown as DomNode;
          if (span.textContent !== run.text) {
            span.textContent = run.text;
          }
          if (span.style.color !== run.color) {
            span.style.color = run.color;
          }
          const targetBg = run.bg || '';
          if (span.style.backgroundColor !== targetBg) {
            span.style.backgroundColor = targetBg;
          }
        } else {
          const newSpan = createDomElement('span');
          newSpan.textContent = run.text;
          newSpan.style.color = run.color;
          if (run.bg) {
            newSpan.style.backgroundColor = run.bg;
          }
          rowElement.appendChild(newSpan);
        }
      }

      // Remove excess span nodes if run count decreased
      while (rowElement.children.length > runs.length) {
        rowElement.removeChild(rowElement.lastChild!);
      }
    }

    this.stats.domRenderTimeMs = performance.now() - startTime;
    this.stats.rowsUpdated = rowsUpdated;
    this.stats.rowsTotal = rows;
    this.stats.spanCount = totalSpans;
  }
}
