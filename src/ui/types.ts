import { MusicState } from '../audio/types';
import { WorldState } from '../world/WorldState';

export interface UiTelemetryData {
  fps: number;
  worldState: WorldState;
  musicState: MusicState;
  totalCollisions: number;
  activeTrafficCount: number;
  seed: number;
}
