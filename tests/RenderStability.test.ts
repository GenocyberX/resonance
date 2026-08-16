import { describe, it, expect } from 'vitest';
import { FrameBuffer } from '../src/ascii/FrameBuffer';
import { AsciiRenderer } from '../src/ascii/AsciiRenderer';
import { WorldEngine } from '../src/world/WorldEngine';

describe('P0 Render Stability & Flicker Elimination', () => {
  it('enforces cell invariant: setCell() strictly rejects multi-character strings', () => {
    const fb = new FrameBuffer(40, 20);

    // Single character succeeds
    expect(() => fb.setCell(5, 5, 'A', '#ffffff')).not.toThrow();
    expect(fb.cells[5][5].char).toBe('A');

    // Multi-character strings must throw
    expect(() => fb.setCell(5, 5, '~~', '#ffffff')).toThrow(/only accepts a single character/);
    expect(() => fb.setCell(5, 5, '_/\\_', '#ffffff')).toThrow(/only accepts a single character/);
    expect(() => fb.setCell(5, 5, '====', '#ffffff')).toThrow(/only accepts a single character/);
  });

  it('verifies drawString() writes multiple single cells correctly', () => {
    const fb = new FrameBuffer(40, 20);
    fb.drawString(10, 5, 'RESONANCE', '#38bdf8');

    const expected = 'RESONANCE';
    for (let i = 0; i < expected.length; i++) {
      expect(fb.cells[5][10 + i].char).toBe(expected[i]);
      expect(fb.cells[5][10 + i].color).toBe('#38bdf8');
    }
  });

  it('guarantees deterministic FrameBuffer hash for identical frozen world states', () => {
    const engine = new WorldEngine(2026);
    engine.setVisualTestMode(true, 'FLAT_STRAIGHT', 'day', false, 'static');

    const fb1 = new FrameBuffer(120, 42);
    const fb2 = new FrameBuffer(120, 42);

    engine.update(0, {
      targetSpeedBonus: 0,
      cameraBounce: 0,
      fovPulse: 0,
      tension: 0,
      particleDensity: 0,
      environmentalGlow: 0,
    }, 120, 42);
    engine.render(fb1);
    const hash1 = fb1.getFrameHash();

    engine.update(0, {
      targetSpeedBonus: 0,
      cameraBounce: 0,
      fovPulse: 0,
      tension: 0,
      particleDensity: 0,
      environmentalGlow: 0,
    }, 120, 42);
    engine.render(fb2);
    const hash2 = fb2.getFrameHash();

    expect(hash1).toBe(hash2);
    expect(hash1).toBeGreaterThan(0);
  });

  it('verifies AsciiRenderer row diffing skips DOM mutations on unchanged rows', () => {
    const container = {
      children: [],
      style: {},
      appendChild: () => {},
      removeChild: () => {},
    };
    const renderer = new AsciiRenderer(container as unknown as HTMLElement, 80, 25);
    const fb = renderer.getFrameBuffer();

    fb.clear(' ', '#ffffff', '#000000');
    fb.drawString(10, 5, 'STATIC HEADER', '#38bdf8');
    renderer.render();

    let stats = renderer.getStats();
    expect(stats.rowsUpdated).toBe(25); // Initial render updates all rows

    // Render exact same framebuffer content again
    renderer.render();
    stats = renderer.getStats();
    expect(stats.rowsUpdated).toBe(0); // 0 rows updated! Perfect diffing!

    // Modify only row 10
    fb.setCell(20, 10, 'X', '#f43f5e');
    renderer.render();
    stats = renderer.getStats();
    expect(stats.rowsUpdated).toBe(1); // Exactly 1 row updated!
  });

  it('ensures resize with unchanged dimensions does not trigger reallocations', () => {
    const container = {
      children: [],
      style: {},
      appendChild: () => {},
      removeChild: () => {},
    };
    const renderer = new AsciiRenderer(container as unknown as HTMLElement, 100, 30);
    const initialStats = renderer.getStats();

    const fb = renderer.getFrameBuffer();
    fb.resize(100, 30);
    expect(fb.width).toBe(100);
    expect(fb.height).toBe(30);

    const stats = renderer.getStats();
    expect(stats.resizeCount).toBe(initialStats.resizeCount);
  });
});
