# RESONANCE — Technical Architecture

This document describes the architectural design, decoupling contracts, and data flow of **RESONANCE**.

---

## 1. High-Level Data Flow

```text
[ Audio Source ]
      │ (Web Audio Node)
      ▼
[ Audio Analyzer ]
      │ (Raw AudioFeatures: [0.0 - 1.0])
      ▼
[ Music State Engine ]
      │ (Smoothed MusicState & State Machine)
      ▼
[ Music World Mapper ]
      │ (WorldMusicParameters)
      ▼
[ World Engine & Simulation ]
      │ (Autonomous Driving, Road, Biomes, Traffic, Day/Night)
      ▼
[ FrameBuffer & Depth Sorter ]
      │ (ASCII Cell Matrix with Transparency & Z-Buffer)
      ▼
[ ASCII DOM Renderer ]
      │ (Optimized Span-Batched Output)
      ▼
[ Screen Viewport ]
```

---

## 2. Decoupled Audio Subsystem

### 2.1 `AudioSource` Contract

RESONANCE does not hardcode local file reading into the engine. Instead, it relies on an abstract `AudioSource` base class:

```ts
abstract class AudioSource {
  abstract load(input: unknown): Promise<void>;
  abstract play(): Promise<void>;
  abstract pause(): void;
  abstract seek(timeSeconds: number): void;
  abstract getCurrentTime(): number;
  abstract getDuration(): number;
  abstract isPlaying(): boolean;
  abstract isLoaded(): boolean;
  abstract getTitle(): string;
  abstract connect(context: AudioContext, destinationNode: AudioNode): AudioNode;
  abstract dispose(): void;
}
```

- **Current Implementation**: `LocalFileSource` uses native `HTMLAudioElement` and `MediaElementAudioSourceNode` to support standard browser formats (MP3, WAV, FLAC, OGG, M4A) with streaming and seeking.
- **Future Implementations**: `SpotifySource`, `YouTubeSource`, `MicrophoneSource`, or `WebStreamSource` can be plugged in seamlessly without altering `AudioAnalyzer` or `WorldEngine`.

### 2.2 `AudioAnalyzer`

Extracts instantaneous spectral data from an `AnalyserNode` and normalizes all metrics into $[0.0, 1.0]$:
- Frequency band partitioning (Bass $20-250\text{ Hz}$, Mids $250-4000\text{ Hz}$, Treble $4000-16000\text{ Hz}$).
- Spectral Centroid (brightness / center of spectral mass).
- Spectral Flux (half-wave rectified onset transients).
- Dynamic Threshold Beat Detection with refractory window protection.

### 2.3 `MusicStateEngine`

Transforms noisy instantaneous FFT features into organic parameters:
- Asymmetric exponential smoothing (snappy attack, smooth decay).
- Musical tension tracking.
- Contextual state machine with hysteresis (`calm`, `rising`, `energetic`, `breakdown`, `drop`, `silence`).

---

## 3. Music → World Decoupling (`MusicWorldMapper`)

The `MusicWorldMapper` acts as an anti-corruption layer:
- The audio engine knows nothing about roads, cars, or trees.
- The world engine knows nothing about FFT bins or audio buffers.
- `MusicWorldMapper` translates `MusicState` into concrete simulation parameters:
  - `targetSpeedBonus`: Speed boost during high energy / drops.
  - `cameraBounce`: Bass and beat impulse camera kick.
  - `fovPulse`: Camera FOV expansion on punchy kicks.
  - `tension`: Road curve sharpness and weather storms.
  - `particleDensity`: Roadside ambient neon sparks.
  - `environmentalGlow`: Lighting saturation, star brightness, and road highlights.

---

## 4. World Engine & Simulation

### 4.1 Autonomous Driving & Perception

The vehicle is driven autonomously by `AutonomousDriver` across three distinct phases:
1. **Perception**: Scans forward along the road curve vector and evaluates traffic in all lanes.
2. **Decision**: State machine transitioning between `CRUISE`, `CORNERING`, `OVERTAKE`, `BRAKING`, and `RECOVER`.
3. **Actuation**: Modulates lateral lane steering and longitudinal throttle/brake forces.

### 4.2 Traffic Alignment & Contact Lifecycle Collisions

- `TrafficController` spawns and recycles ambient vehicles (sedans, trucks).
- Each vehicle evaluates road curvature $x(z)$ at its **own** longitudinal $z$ coordinate (`road.getCurveAt(vehicle.z)`).
- `CollisionSystem` implements an explicit contact lifecycle:
  - `ENTER`: Triggered on initial bounding box overlap $\to$ counts collision once, applies camera shake, sets driver to `RECOVER`.
  - `STAY`: Ongoing overlap $\to$ applies lateral separation push without duplicate impact increments.
  - `EXIT`: Overlap ends $\to$ resets contact pair.

### 4.3 Config-Driven Biomes & Continuous Transitions

- Biomes (`TROPICAL`, `DESERT`, `FOREST`, `ALPINE`, `NEON_CITY`, `VOLCANIC`) are defined entirely as configuration data structures (palettes, vegetation pools, structure pools, obstacle pools, terrain characters).
- `BiomeTransitionSystem` uses an S-curve cosine blend across a transition window (e.g. 700m). Palettes interpolate smoothly across RGB space, and scenery sprites and terrain characters are sampled probabilistically without hard visual pop-ins.

### 4.4 5-Minute Continuous Day / Night Cycle

- `DayNightCycle` runs continuously over 300 seconds.
- Interpolates between `DAWN`, `DAY`, `DUSK`, and `NIGHT`.
- Modulates sun/moon elevation and shape, starfield density, sky gradients, and ambient lighting multipliers with headlight beams on night roads.

---

## 5. Pure ASCII FrameBuffer & Rendering

### 5.1 FrameBuffer & Transparency Semantics

- A 2D matrix of `Cell { char: string, color: string, bg?: string, z: number }`.
- **Background Painting vs. Sprite Transparency**:
  - Direct scene layers (sky, ground, road, headlights) can write space characters with background colors (`isSprite = false`).
  - Sprites (`isSprite = true`) treat spaces `' '` as strictly transparent, preventing black box artifacts.
- **Depth Buffering**: Smaller $z$ indicates closer distance to camera; occluded background pixels are rejected.

### 5.2 Sprite Level of Detail (LOD)

- All vehicle, scenery, and obstacle sprites define multiple LOD variants (`close`, `near`, `medium`, `far`).
- `DepthSorter` chooses the appropriate LOD variant automatically according to projected distance $Z$.

### 5.3 High-Performance DOM Span Batching

- `AsciiRenderer` iterates across the FrameBuffer and compresses continuous runs of same-colored characters into contiguous `<span style="color:...">` elements per row.
- Delivers locked 60 FPS performance without per-character DOM overhead.
