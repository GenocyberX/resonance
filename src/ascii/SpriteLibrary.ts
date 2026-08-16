import { SpriteDefinition } from './types';
import { SportsCarSprite } from '../sprites/vehicles/SportsCarSprite';
import { TrafficCoupeSprite } from '../sprites/vehicles/TrafficCoupeSprite';
import { TrafficSedanSprite } from '../sprites/vehicles/TrafficSedanSprite';
import { TruckSprite } from '../sprites/vehicles/TruckSprite';
import { PalmTreeSprite } from '../sprites/scenery/PalmTreeSprite';
import { PineTreeSprite } from '../sprites/scenery/PineTreeSprite';
import { SnowPineSprite } from '../sprites/scenery/SnowPineSprite';
import { CactusSprite } from '../sprites/scenery/CactusSprite';
import { DeciduousTreeSprite } from '../sprites/scenery/DeciduousTreeSprite';
import { LighthouseSprite } from '../sprites/scenery/LighthouseSprite';
import { CoastalHotelSprite } from '../sprites/scenery/CoastalHotelSprite';
import { BeachShackSprite } from '../sprites/scenery/BeachShackSprite';
import { SailboatSprite } from '../sprites/scenery/SailboatSprite';
import { CanyonMesaSprite } from '../sprites/scenery/CanyonMesaSprite';
import { CanyonButteSprite } from '../sprites/scenery/CanyonButteSprite';
import { AlpinePeakSprite } from '../sprites/scenery/AlpinePeakSprite';
import { RoadsideCafeSprite } from '../sprites/scenery/RoadsideCafeSprite';
import { DirectionSignSprite } from '../sprites/scenery/DirectionSignSprite';
import { BillboardSprite } from '../sprites/scenery/BillboardSprite';
import { StreetLampSprite } from '../sprites/scenery/StreetLampSprite';
import { ShortPalmSprite } from '../sprites/scenery/ShortPalmSprite';
import { TropicalBushSprite } from '../sprites/scenery/TropicalBushSprite';
import { CoastalGrassSprite } from '../sprites/scenery/CoastalGrassSprite';
import { SmallBoatSprite } from '../sprites/scenery/SmallBoatSprite';
import { PierSprite } from '../sprites/scenery/PierSprite';
import { LifeguardHutSprite } from '../sprites/scenery/LifeguardHutSprite';
import { TrafficConeSprite } from '../sprites/obstacles/TrafficConeSprite';
import { RockSprite } from '../sprites/obstacles/RockSprite';
import { MountainSprite } from '../sprites/scenery/MountainSprite';
import { NeonTowerSprite } from '../sprites/scenery/NeonTowerSprite';

export class SpriteLibrary {
  private static sprites: Map<string, SpriteDefinition> = new Map();

  public static initialize(): void {
    const list: SpriteDefinition[] = [
      // 15 Mandatory Hero Assets
      SportsCarSprite,
      TrafficCoupeSprite,
      TrafficSedanSprite,
      TruckSprite,
      PalmTreeSprite,
      PineTreeSprite,
      SnowPineSprite,
      CactusSprite,
      LighthouseSprite,
      CoastalHotelSprite,
      BeachShackSprite,
      SailboatSprite,
      CanyonMesaSprite,
      CanyonButteSprite,
      AlpinePeakSprite,

      // Supporting World Assets
      RoadsideCafeSprite,
      DeciduousTreeSprite,
      DirectionSignSprite,
      BillboardSprite,
      StreetLampSprite,
      ShortPalmSprite,
      TropicalBushSprite,
      CoastalGrassSprite,
      SmallBoatSprite,
      PierSprite,
      LifeguardHutSprite,
      TrafficConeSprite,
      RockSprite,
      MountainSprite,
      NeonTowerSprite,
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

  public static getHeroSprites(): SpriteDefinition[] {
    return [
      SportsCarSprite,
      TrafficCoupeSprite,
      TrafficSedanSprite,
      TruckSprite,
      PalmTreeSprite,
      PineTreeSprite,
      SnowPineSprite,
      CactusSprite,
      LighthouseSprite,
      CoastalHotelSprite,
      BeachShackSprite,
      SailboatSprite,
      CanyonMesaSprite,
      CanyonButteSprite,
      AlpinePeakSprite,
    ];
  }
}

// Auto-initialize standard library
SpriteLibrary.initialize();
