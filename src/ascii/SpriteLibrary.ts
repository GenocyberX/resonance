import { SpriteDefinition } from './types';
import { SportsCarSprite } from '../sprites/vehicles/SportsCarSprite';
import { TrafficSedanSprite } from '../sprites/vehicles/TrafficSedanSprite';
import { TruckSprite } from '../sprites/vehicles/TruckSprite';
import { PalmTreeSprite } from '../sprites/scenery/PalmTreeSprite';
import { PineTreeSprite } from '../sprites/scenery/PineTreeSprite';
import { CactusSprite } from '../sprites/scenery/CactusSprite';
import { DeciduousTreeSprite } from '../sprites/scenery/DeciduousTreeSprite';
import { BillboardSprite } from '../sprites/scenery/BillboardSprite';
import { NeonTowerSprite } from '../sprites/scenery/NeonTowerSprite';
import { MountainSprite } from '../sprites/scenery/MountainSprite';
import { TrafficConeSprite } from '../sprites/obstacles/TrafficConeSprite';
import { RockSprite } from '../sprites/obstacles/RockSprite';

export class SpriteLibrary {
  private static sprites: Map<string, SpriteDefinition> = new Map();

  public static initialize(): void {
    const list: SpriteDefinition[] = [
      SportsCarSprite,
      TrafficSedanSprite,
      TruckSprite,
      PalmTreeSprite,
      PineTreeSprite,
      CactusSprite,
      DeciduousTreeSprite,
      BillboardSprite,
      NeonTowerSprite,
      MountainSprite,
      TrafficConeSprite,
      RockSprite,
    ];

    for (const s of list) {
      this.sprites.set(s.id, s);
    }
  }

  public static get(id: string): SpriteDefinition {
    const sprite = this.sprites.get(id);
    if (!sprite) {
      throw new Error(`Sprite with id "${id}" not found in SpriteLibrary.`);
    }
    return sprite;
  }

  public static getAll(): SpriteDefinition[] {
    return Array.from(this.sprites.values());
  }
}

// Auto-initialize standard library
SpriteLibrary.initialize();
