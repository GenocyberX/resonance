export type LODLevel = 'close' | 'near' | 'medium' | 'far';

export interface Cell {
  char: string;
  color: string;
  bg?: string;
  z: number;
}

export interface SpriteVariant {
  lines: string[];
  colors?: string[][];       // Optional per-character color overrides
  colorMask?: string[];      // Color key mapping mask
  width: number;
  height: number;
  anchorX: number;           // Horizontal center anchor (e.g. width / 2)
  anchorY: number;           // Vertical bottom anchor (e.g. height - 1)
}

export interface SpriteDefinition {
  id: string;
  name: string;
  defaultColor: string;
  variants: Partial<Record<LODLevel, SpriteVariant>>;
}

export interface RenderableEntity {
  screenX: number;
  screenY: number;
  z: number;
  sprite: SpriteDefinition;
  colorOverride?: string;
  lod?: LODLevel;
}
