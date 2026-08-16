import { SpriteDefinition, SpriteCategory } from './types';
// Vehicles
import { SportsCarSprite } from '../sprites/vehicles/SportsCarSprite';
import { TrafficCoupeSprite } from '../sprites/vehicles/TrafficCoupeSprite';
import { TrafficSedanSprite } from '../sprites/vehicles/TrafficSedanSprite';
import { TruckSprite } from '../sprites/vehicles/TruckSprite';

// Vegetation
import { PalmTreeSprite } from '../sprites/scenery/PalmTreeSprite';
import { ShortPalmSprite } from '../sprites/scenery/ShortPalmSprite';
import { TropicalBushSprite } from '../sprites/scenery/TropicalBushSprite';
import { CoastalGrassSprite } from '../sprites/scenery/CoastalGrassSprite';
import { PineTreeSprite } from '../sprites/scenery/PineTreeSprite';
import { DeciduousTreeSprite } from '../sprites/scenery/DeciduousTreeSprite';
import { SnowPineSprite } from '../sprites/scenery/SnowPineSprite';
import { CactusSprite } from '../sprites/scenery/CactusSprite';
import { DeadTreeSprite } from '../sprites/scenery/DeadTreeSprite';
import { ForestFernSprite } from '../sprites/scenery/ForestFernSprite';
import { WildflowerPatchSprite } from '../sprites/scenery/WildflowerPatchSprite';
import { AlpineShrubSprite } from '../sprites/scenery/AlpineShrubSprite';
import { JoshuaTreeSprite } from '../sprites/scenery/JoshuaTreeSprite';

// Landmarks & Structures
import { LighthouseSprite } from '../sprites/scenery/LighthouseSprite';
import { CoastalHotelSprite } from '../sprites/scenery/CoastalHotelSprite';
import { BeachShackSprite } from '../sprites/scenery/BeachShackSprite';
import { RoadsideCafeSprite } from '../sprites/scenery/RoadsideCafeSprite';
import { PierSprite } from '../sprites/scenery/PierSprite';
import { LifeguardHutSprite } from '../sprites/scenery/LifeguardHutSprite';
import { CanyonMesaSprite } from '../sprites/scenery/CanyonMesaSprite';
import { CanyonButteSprite } from '../sprites/scenery/CanyonButteSprite';
import { AlpinePeakSprite } from '../sprites/scenery/AlpinePeakSprite';
import { NeonTowerSprite } from '../sprites/scenery/NeonTowerSprite';
import { HoloAdTotemSprite } from '../sprites/scenery/HoloAdTotemSprite';
import { CyberGantrySprite } from '../sprites/scenery/CyberGantrySprite';

// Geology & Natural Elements
import { BoulderClusterSprite } from '../sprites/scenery/BoulderClusterSprite';
import { DesertDuneSprite } from '../sprites/scenery/DesertDuneSprite';
import { FallenLogSprite } from '../sprites/scenery/FallenLogSprite';
import { IceSpireSprite } from '../sprites/scenery/IceSpireSprite';
import { VolcanicVentSprite } from '../sprites/scenery/VolcanicVentSprite';
import { BasaltCragSprite } from '../sprites/scenery/BasaltCragSprite';
import { CoastalRockSprite } from '../sprites/scenery/CoastalRockSprite';

// Watercraft & Marine
import { SailboatSprite } from '../sprites/scenery/SailboatSprite';
import { SmallBoatSprite } from '../sprites/scenery/SmallBoatSprite';
import { OceanBuoySprite } from '../sprites/scenery/OceanBuoySprite';

// Roadside & Safety
import { BillboardSprite } from '../sprites/scenery/BillboardSprite';
import { DirectionSignSprite } from '../sprites/scenery/DirectionSignSprite';
import { WarningSignSprite } from '../sprites/scenery/WarningSignSprite';
import { StreetLampSprite } from '../sprites/scenery/StreetLampSprite';
import { CyberStreetLampSprite } from '../sprites/scenery/CyberStreetLampSprite';
import { HighwayMileMarkerSprite } from '../sprites/scenery/HighwayMileMarkerSprite';
import { GuardrailSprite } from '../sprites/scenery/GuardrailSprite';
import { TrafficConeSprite } from '../sprites/obstacles/TrafficConeSprite';
import { RockSprite } from '../sprites/obstacles/RockSprite';

export class SpriteLibrary {
  private static sprites: Map<string, SpriteDefinition> = new Map();

  public static initialize(): void {
    const list: SpriteDefinition[] = [
      // Vehicles
      SportsCarSprite,
      TrafficCoupeSprite,
      TrafficSedanSprite,
      TruckSprite,

      // Vegetation
      PalmTreeSprite,
      ShortPalmSprite,
      TropicalBushSprite,
      CoastalGrassSprite,
      PineTreeSprite,
      DeciduousTreeSprite,
      SnowPineSprite,
      CactusSprite,
      DeadTreeSprite,
      ForestFernSprite,
      WildflowerPatchSprite,
      AlpineShrubSprite,
      JoshuaTreeSprite,

      // Landmarks & Structures
      LighthouseSprite,
      CoastalHotelSprite,
      BeachShackSprite,
      RoadsideCafeSprite,
      PierSprite,
      LifeguardHutSprite,
      CanyonMesaSprite,
      CanyonButteSprite,
      AlpinePeakSprite,
      NeonTowerSprite,
      HoloAdTotemSprite,
      CyberGantrySprite,

      // Geology & Natural Elements
      BoulderClusterSprite,
      DesertDuneSprite,
      FallenLogSprite,
      IceSpireSprite,
      VolcanicVentSprite,
      BasaltCragSprite,
      CoastalRockSprite,

      // Marine & Watercraft
      SailboatSprite,
      SmallBoatSprite,
      OceanBuoySprite,

      // Roadside & Safety
      BillboardSprite,
      DirectionSignSprite,
      WarningSignSprite,
      StreetLampSprite,
      CyberStreetLampSprite,
      HighwayMileMarkerSprite,
      GuardrailSprite,
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

  public static getByCategory(category: SpriteCategory): SpriteDefinition[] {
    return Array.from(this.sprites.values()).filter(s => s.category === category);
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
