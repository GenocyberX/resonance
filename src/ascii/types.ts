export type LODLevel = 'close' | 'near' | 'medium' | 'far';

export type SpriteCategory =
  | 'VEHICLE'
  | 'VEGETATION_SMALL'
  | 'VEGETATION_LARGE'
  | 'BUILDING'
  | 'LANDMARK'
  | 'ROADSIDE'
  | 'WATERCRAFT'
  | 'OBSTACLE';

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
  anchorX: number;           // Horizontal center anchor (e.g. Math.floor(width / 2))
  anchorY: number;           // Vertical bottom contact point (e.g. height - 1)
}

export interface SpriteDefinition {
  id: string;
  name: string;
  category?: SpriteCategory;
  defaultColor: string;
  worldWidth?: number;       // Nominal world width in world units (e.g. 80 for car, 180 for palm)
  worldHeight?: number;      // Nominal world height in world units (e.g. 50 for car, 220 for palm, 420 for lighthouse)
  visualScale?: number;      // Optional visual scale multiplier (default: 1.0)
  variants: Partial<Record<LODLevel, SpriteVariant>>;
}

export interface RenderableEntity {
  screenX: number;
  screenY: number;
  z: number;                 // Camera-relative depth (relZ)
  sprite: SpriteDefinition;
  colorOverride?: string;
  lod?: LODLevel;
  desiredScreenHeight?: number; // Pre-calculated projected screen height
}
