# Solstice

**Solstice** is a modular browser studio and shader pack collection for **Minecraft Java Edition** (Iris & OptiFine), styled with the Totone Midnight Navy studio UI.

## Project Structure

```text
Solstice/
├── index.html          # Main entry point (GitHub Pages ready)
├── css/
│   ├── core.css        # Totone Midnight Navy design tokens, header, controls, status bar
│   └── studio.css      # Shader Packs gallery, WebGL2 Builder, Texture Studio styles
├── js/
│   ├── sol-data.js     # GLSL shader templates, 81 options, 15 presets & color grades
│   ├── sol-engine.js   # Shader pack generator, GLSL ES 3.00 transpiler, ZIP/UNZIP engine
│   ├── preview-gl.js   # Miniature WebGL2 shader pipeline for live previews
│   ├── tex-catalog.js  # Minecraft texture paths & pack_format version map
│   ├── tex-studio.js   # Resolution-aware Texture Pack Maker & image-to-pixel-art converter
│   └── app.js          # App controller, gallery thumbnail renderer & Shader Builder UI
└── packs/              # 15 pre-built Solstice_*.zip shader packs
```

## Features

- **Shader Packs Gallery** — 15 curated packs (*Standard*, *Cinematic*, *Unique*) with live WebGL2-rendered thumbnails, GPU cost indicators, feature badges, search/filters, and instant `.zip` downloads.
- **Live WebGL2 Shader Builder** — 81 shader options across 10 categories, real-time GLSL preview, camera & time-of-day controls, Hold-to-Compare Default, saved custom presets, JSON import/export, and PNG screenshots.
- **Texture Studio** — Resolution-aware resource pack maker (`16×16` to `256×256`):
  - Drag-and-drop, click, or `Ctrl+V` image-to-texture converter (Cover / Contain / Stretch, stepped smooth vs pixelated downscaling, background removal, palette quantization & Bayer dithering, lossless re-conversion).
  - Batch multi-image upload, Resize All to Pack Resolution, and existing `.zip` resource pack import.
  - Pixel art editor with Pencil, Eraser, Line, Rect, Circle, Fill, Eyedropper, Brush size & opacity, Mirror X/Y, Grid, seamless tiling nudge / ½ Shift, Brightness/Contrast/Pixel-Noise effects, Undo/Redo, 3D isometric block preview, and 3×3 tiled preview.

## Installation (Minecraft Java Edition)

- **Shader Packs:** Put any `Solstice_*.zip` (do not unzip) into `.minecraft/shaderpacks/` and select it under **Options → Video Settings → Shader Packs** (requires Iris or OptiFine).
- **Texture Packs:** Export from **Texture Studio**, put the `.zip` into `.minecraft/resourcepacks/`, and enable it under **Options → Resource Packs**.
