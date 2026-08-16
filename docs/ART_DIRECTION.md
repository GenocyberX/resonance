# RESONANCE — ASCII PIXEL ART CANONICAL BIBLE
**Version 1.0 — Master Pass**

---

## 1. Core Philosophy: ASCII as High-Fidelity Pixel Art

In **RESONANCE**, every monospace character cell is treated as a deliberate artistic pixel with mass, volume, edge contour, and light response. We reject "text doodles", raw ASCII text labels (`[CAR]`, `[HOTEL]`), and decorative Unicode noise. Every glyph in every row exists to communicate shape, material, and spatial depth.

---

## 2. Shape Language & Silhouette Discipline

- **Organic Entities (Trees, Palms, Foliage, Clouds, Coastlines)**:
  - Asymmetric, fluid, curved silhouettes.
  - Multi-tier layered fronds and branch masses.
  - Strict prohibition of mathematical or radial symmetry in natural elements.
- **Mechanical & Vehicles (Player Car, Traffic Coupe, Sedan, Truck)**:
  - Low-slung, aerodynamic sports profiles.
  - Tapered glasshouses, defined shoulder lines, sculpted diffusers, and chrome exhausts.
  - Body mass widens toward the contact surface.
- **Architectural & Landmarks (Lighthouses, Hotels, Shacks, Towers)**:
  - Structural rhythm (cornices, balconies, entrance porticos, glowing window matrices).
  - Tapering geometry and solid granite/rock foundations.
- **Geological & Terrain (Mesas, Buttes, Alpine Peaks)**:
  - Stratified sedimentary layers, erosion gullies, fractured rock faces, scree slopes.
  - Razor-sharp alpine ridges with directional snow accumulation.

---

## 3. Cluster Discipline vs. Random Noise

- **Prohibited**: Random confetti noise (`* . : + * ~`).
- **Required**: Cohesive clusters:
  - Compact **highlight cluster** on the sunlit upper-left surfaces.
  - Connected **midtone mass** defining the core volume.
  - Grouped **shadow cluster** along lower-right crevices and undersides.
  - Deliberate **negative space** (e.g. gaps between palm fronds, space between vehicle tires, open timber framing of beach shacks).

---

## 4. Universal Lighting & Shading Model

- **Consistent Light Vector**: Upper-Front-Left.
- **Upper-Left Surfaces**: Sunlit highlights and brighter edge characters (`/`, `^`, `.`, `'`).
- **Frontal Surfaces**: Midtone body mass and material character textures (`=`, `|`, `o`, `*`).
- **Lower-Right Surfaces & Undersides**: Deep shadow tones, darker characters (`%`, `#`, `_`, `\`), and contact ground shadows.

---

## 5. Material Language & Color Ramps

1. **Vegetation (Palm & Spruce)**:
   - Deep forest shadow (`#064e3b`, `#065f46`) $\to$ Emerald midtone (`#059669`, `#10b981`) $\to$ Lime sunlit tip (`#84cc16`, `#a3e635`).
2. **Bark & Timber**:
   - Deep espresso shadow (`#451a03`, `#78350f`) $\to$ Warm amber brown (`#b45309`, `#d97706`) $\to$ Weathered wood highlight (`#fde047`).
3. **Vehicle Body & Glass**:
   - Deep navy glass (`#0f172a`) with sharp cyan/white reflection flare (`#38bdf8`, `#f8fafc`).
   - Saturated primary paint ramp (`#0284c7` $\to$ `#38bdf8` or `#be123c` $\to$ `#e11d48`) with black rubber tires (`#18181b`) and red LED taillights (`#991b1b` $\to$ `#ef4444`).
4. **Canyon Sandstone & Rock**:
   - Deep burgundy/crimson shadow (`#4c0519`, `#7f1d1d`) $\to$ Terracotta midtone (`#9a3412`, `#c2410c`) $\to$ Warm ochre (`#d97706`) $\to$ Desert sun highlight (`#fde047`).
5. **Alpine Snow & Ice**:
   - Deep indigo/violet crevasse shadow (`#1e1b4b`, `#312e81`) $\to$ Cyan glacier ice (`#60a5fa`, `#93c5fd`) $\to$ Pure sunlit snow mantle (`#ffffff`, `#f8fafc`).

---

## 6. Resolution & Complexity by LOD Level

- **FAR (2–4 rows)**: Crisp geometric silhouette for immediate instant recognition at horizon distance.
- **MEDIUM (5–8 rows)**: Primary shape, core silhouette breaks, main color ramp blocks.
- **NEAR (9–14 rows)**: Full volumetric mass, secondary branches, window matrices, material highlights.
- **CLOSE (14–24+ rows)**: AAA Hero Pixel Art with textured clusters, deep shadow cavities, fine edge bevels, and ground contact anchor detailing.

---

## 7. Ground Anchoring & Parallax Presence

- **Ground Contact Rule**: Every ground-based sprite must have its contact baseline at `anchorY === height - 1`.
- **Contact Shadows**: Soft contact shadow clusters (`▄`, `_`) anchor heavy props to prevent floating.
- **Parallax Scale**: Hero props at foreground depth may extend up to 20–24 rows and extend naturally beyond viewport borders, creating OutRun-style visceral speed.
