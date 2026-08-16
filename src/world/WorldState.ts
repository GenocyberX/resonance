import { PlayerVehicle } from '../entities/PlayerVehicle';
import { TrafficVehicle } from '../entities/TrafficVehicle';
import { SceneryObject } from '../entities/SceneryObject';
import { Camera } from '../road/types';
import { BiomeBlendState, DayNightState, WeatherState, WorldMusicParameters, SkyState } from './types';

export class WorldState {
  public distance: number = 0;       // Global longitudinal travel distance
  public worldTime: number = 0;      // World simulation time
  public camera: Camera;
  public player: PlayerVehicle;
  public traffic: TrafficVehicle[] = [];
  public scenery: SceneryObject[] = [];

  public biomeBlend!: BiomeBlendState;
  public dayNight!: DayNightState;
  public weather!: WeatherState;
  public sky!: SkyState;
  public musicParams: WorldMusicParameters = {
    targetSpeedBonus: 0,
    cameraBounce: 0,
    fovPulse: 0,
    tension: 0,
    particleDensity: 0,
    environmentalGlow: 0,
  };

  public cameraShake: number = 0;

  constructor() {
    this.player = new PlayerVehicle(100);
    this.camera = {
      x: 0,
      y: 600,
      z: 0,
      distanceToPlane: 0.85,
      pitch: -0.05,
      fovPulse: 0,
    };
  }
}
