import { MusicState } from '../audio/types';
import { WorldState } from '../world/WorldState';

export interface PlayerContainmentTelemetry {
  maxDriveableOffset: number;
  cameraTargetX: number;
  playerScreenX: number;
  roadCenterAtPlayerY: number;
  roadHalfWidthAtPlayerY: number;
  roadLeftAtPlayerY: number;
  roadRightAtPlayerY: number;
  isVisualClamped: boolean;
  isWorldClamped: boolean;
}

export interface RenderTelemetry {
  simFps: number;
  visualFps: number;
  domRenderMs: number;
  rowsUpdated: number;
  rowsTotal: number;
  spanCount: number;
  resizeCount: number;
  frameHash: string;
}

export interface UiTelemetryData {
  fps: number;
  worldState: WorldState;
  musicState: MusicState;
  totalCollisions: number;
  activeTrafficCount: number;
  seed: number;
  visualTestMode?: {
    isVisualTest: boolean;
    scenario: string;
    time?: string;
    stability?: string;
  };
  containment?: PlayerContainmentTelemetry;
  renderStats?: RenderTelemetry;
}
