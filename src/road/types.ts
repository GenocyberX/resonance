export interface RoadSegment {
  index: number;
  z: number;              // Longitudinal start position
  length: number;         // Length in world units
  curve: number;          // Lateral curvature offset
  elevation: number;      // Height above ground
  roadWidth: number;      // Total road width in world units
  lanes: number;          // Number of lanes (e.g. 3)
}

export interface Camera {
  x: number;              // Lateral offset
  y: number;              // Height offset above road
  z: number;              // Longitudinal position along track
  distanceToPlane: number;// Projection distance factor
  pitch: number;          // Pitch / vertical angle
  fovPulse: number;       // Dynamic FOV pulse from bass/beats
}

export interface ProjectedPoint {
  screenX: number;        // Screen column (ASCII grid)
  screenY: number;        // Screen row (ASCII grid)
  scale: number;          // Scale factor (1 / depth)
  depth: number;          // Z distance from camera
  visible: boolean;
}
