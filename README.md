# RESONANCE — A Procedural Audio Journey

**RESONANCE** is a real-time procedural ASCII audiovisual application that interprets audio signals using the Web Audio API and generates an autonomous journey through pseudo-3D roads, biomes, day/night cycles, dynamic weather, and music-reactive visual elements.

Rendered purely with colored ASCII characters — no Canvas, no Three.js, no WebGL, and no external raster images.

---

## Key Features

- **Decoupled Audio Pipeline**: `AudioSource` abstraction with `LocalFileSource` for local audio files (MP3, WAV, FLAC, OGG, M4A).
- **Web Audio Signal Analysis**: FFT spectrum extraction into normalized continuous metrics (`bass`, `mids`, `treble`, `energy`, `rms`, `spectralCentroid`, `spectralFlux`, and dynamic `beat` onset detection).
- **Music State Machine**: Organic exponential smoothing, tension tracking, decay filters, and discrete musical states (`calm`, `rising`, `energetic`, `breakdown`, `drop`, `silence`).
- **Autonomous Driving**: AI driver system with perception, decision-making, overtaking, cornering deceleration, and post-collision recovery.
- **Physical Collision System**: Proximity collision detection between player, traffic vehicles (sedans, trucks), and road obstacles with lateral pushback and camera shake.
- **Config-Driven Biomes & Transitions**: 6 registered biomes (`TROPICAL`, `DESERT`, `FOREST`, `ALPINE`, `NEON_CITY`, `VOLCANIC`) with continuous probabilistic palette and object blending.
- **Day & Night Simulation**: 5-minute real-time cycle (`DAWN` → `DAY` → `DUSK` → `NIGHT` → `DAWN`) with sky gradients, stars, sun/moon, and ambient lighting.
- **Pure ASCII FrameBuffer Renderer**: Space transparency (`' '`), Depth sorting ($z$-buffer), Level of Detail (LOD) sprites, and span-batched high performance DOM updates.
- **Demo Mode**: Runs an autonomous road trip immediately upon launching even without music loaded.

---

## Technology Stack

- **Runtime**: Browser Native (HTML5, CSS3, Web Audio API)
- **Language**: TypeScript (Strict Mode)
- **Bundler / Dev Server**: Vite
- **Testing**: Vitest
- **Linting**: ESLint

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

- `npm run dev`: Launch local development server.
- `npm run build`: Build production bundle into `dist/`.
- `npm run typecheck`: Run TypeScript compiler check without emitting files.
- `npm run test`: Run unit tests with Vitest.
- `npm run lint`: Run ESLint across TypeScript codebase.

---

## Project Structure

```text
src/
├── main.ts                     # Entry point & bootstrap
├── app/
│   ├── ResonanceApp.ts         # Main application orchestrator
│   └── config.ts               # Global constants and settings
├── audio/
│   ├── AudioEngine.ts          # Master Web Audio controller
│   ├── AudioAnalyzer.ts        # FFT spectral feature extractor
│   ├── MusicStateEngine.ts     # Organic smoothing & state machine
│   ├── types.ts                # Audio metric contracts
│   └── sources/
│       ├── AudioSource.ts      # Audio source base class
│       └── LocalFileSource.ts  # Browser file input audio source
├── world/
│   ├── WorldEngine.ts          # Complete world simulation coordinator
│   ├── WorldDirector.ts        # Procedural scenery & obstacle spawning
│   ├── WorldState.ts           # World simulation data state
│   ├── types.ts                # World & Biome type definitions
│   ├── biomes/                 # Config-driven biome definitions
│   │   ├── BiomeRegistry.ts
│   │   └── definitions/
│   ├── weather/
│   │   └── WeatherEngine.ts    # Procedural ASCII weather particles
│   └── transitions/
│       ├── BiomeTransitionSystem.ts # Continuous distance-based biome blending
│       └── DayNightCycle.ts    # 5-minute continuous day/night cycle
├── road/
│   ├── RoadGenerator.ts        # Continuous procedural 3D curves & elevation
│   ├── Perspective.ts          # 3D to 2D ASCII grid projection
│   └── types.ts
├── driving/
│   ├── AutonomousDriver.ts     # Perception -> Decision AI controller
│   ├── TrafficController.ts    # Ambient traffic spawner & recycler
│   └── CollisionSystem.ts      # Physical proximity & collision resolution
├── entities/
│   ├── Entity.ts               # Base entity class
│   ├── Vehicle.ts              # Vehicle base class
│   ├── PlayerVehicle.ts        # Protagonist sports car
│   ├── TrafficVehicle.ts       # Ambient sedan & truck
│   └── SceneryObject.ts        # Roadside vegetation and obstacles
├── procedural/
│   ├── SeededRandom.ts         # Deterministic Mulberry32 PRNG
│   └── Noise.ts                # 1D & 2D Perlin gradient noise
├── music-world/
│   └── MusicWorldMapper.ts     # Translates MusicState to World modifiers
├── ascii/
│   ├── FrameBuffer.ts          # 2D cell grid with space transparency & z-buffer
│   ├── AsciiRenderer.ts        # Span-batched DOM renderer
│   ├── ColorPalette.ts         # Hex/RGB interpolation & fog utilities
│   ├── DepthSorter.ts          # Back-to-front entity sorting & LOD selector
│   ├── Sprite.ts               # Sprite definition helpers
│   ├── SpriteLibrary.ts        # Global registered sprite library
│   └── types.ts
├── sprites/                    # ASCII Sprite definitions with LOD
│   ├── vehicles/
│   ├── scenery/
│   └── obstacles/
├── ui/
│   ├── AudioControls.ts        # Track upload, transport & timeline
│   ├── Hud.ts                  # Real-time HUD & spectrum visualizer
│   └── DebugPanel.ts           # Collapsible engine telemetry overlay
└── styles/
    ├── global.css
    ├── resonance.css
    └── hud.css
```

---

## License

Private Project.
