import { describe, it, expect } from 'vitest';
import { FrameBuffer } from '../src/ascii/FrameBuffer';
import { Sprite } from '../src/ascii/Sprite';

describe('FrameBuffer Transparency & Background Painting', () => {
  it('allows background layer to paint space characters with custom background colors', () => {
    const fb = new FrameBuffer(20, 10);
    // Background layer paints space with blue sky background color
    const success = fb.setCell(5, 5, ' ', '#ffffff', 1000, '#0000ff', false);

    expect(success).toBe(true);
    expect(fb.cells[5][5].char).toBe(' ');
    expect(fb.cells[5][5].bg).toBe('#0000ff');
  });

  it('treats spaces in sprites as transparent so they do not overwrite underlying cells', () => {
    const fb = new FrameBuffer(20, 10);
    // 1. Paint background with ground character and color
    fb.setCell(4, 5, '~', '#34d399', 500, '#064e3b', false);
    fb.setCell(5, 5, '~', '#34d399', 500, '#064e3b', false);
    fb.setCell(6, 5, '~', '#34d399', 500, '#064e3b', false);

    // 2. Define a 3-character sprite centered at index 1: ' A '
    const spriteVariant = Sprite.createVariant(' A ');

    // Draw sprite centered at (5, 5)
    fb.drawSprite(5, 5, spriteVariant, '#ffffff', 100);

    // Center character is 'A' (at x=5) -> should overwrite
    expect(fb.cells[5][5].char).toBe('A');

    // Adjacent cells at x=4 and x=6 where sprite has spaces ' ' must preserve background
    expect(fb.cells[5][4].char).toBe('~');
    expect(fb.cells[5][4].color).toBe('#34d399');
    expect(fb.cells[5][6].char).toBe('~');
    expect(fb.cells[5][6].color).toBe('#34d399');
  });

  it('renders solid cell pixels in sprites when background color is explicitly set on space characters', () => {
    const fb = new FrameBuffer(20, 10);
    // Background blue sky
    fb.setCell(5, 5, ' ', '#ffffff', 1000, '#0000ff', false);

    // Sprite with solid pixel (char: ' ', bg: '#ffffff') at z=500
    const success = fb.setCell(5, 5, ' ', '#ffffff', 500, '#ffffff', true);

    expect(success).toBe(true);
    expect(fb.cells[5][5].char).toBe(' ');
    expect(fb.cells[5][5].bg).toBe('#ffffff');
    expect(fb.cells[5][5].z).toBe(500);
  });
});
