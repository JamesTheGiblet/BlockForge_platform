# Relief Studio Plugin

Converts 2D images into 3D LEGO bas-relief sculptures. This studio maps pixel brightness to brick height, creating tactile topography from flat photos.

## Rendering Style

Relief Studio uses an isometric 3D rendering style for its previews. The visualization is achieved with a custom 2D canvas renderer that simulates depth by stacking colored LEGO-like plates based on image brightness. Each brick is drawn in isometric projection, with distinct shading for the left, right, and top faces to create a 3D effect. This approach provides a visually clear, LEGO-inspired look, similar to classic isometric pixel art, but does not use true 3D rendering (no WebGL or 3D engine). The style emphasizes clarity, depth, and the tactile qualities of LEGO bricks.

## Features

- **Height Mapping:** Automatically converts image luminance into physical depth (lighter = higher).
- **Isometric Preview:** Real-time 2.5D visualization using a custom canvas renderer (no WebGL required).
- **Layer Slicing:** Generates build instructions layer-by-layer for easy assembly.
- **Depth Control:** Adjustable maximum height (1-20 plates) to control the dramatic effect.
- **Invert Mode:** Reverses the mapping (darker = higher), perfect for stamps or text-based logos.
- **Exports:** PNG, CSV, HTML.

## Usage

1. **Upload Image:** Select a JPG or PNG file. High-contrast images work best.
2. **Set Width:** Adjust the width slider (16-64 studs).
3. **Set Max Height:** Define how tall the highest point should be (in plates).
4. **Invert Depth:** Toggle this if you want dark areas to be raised (like a stamp).
5. **Export:** Download the design as PNG, CSV parts list, or HTML instructions.

## Exports

### PNG Image

High-resolution isometric preview of the final model.

### CSV Parts List

Complete inventory compatible with BrickLink/Rebrickable.
Columns: `Type`, `Quantity`, `Color (RGB)`.

### HTML Instructions

A specialized build guide that shows the model **layer by layer** (Z-slices). This is essential for building relief maps, as you build from the bottom plate up.

## Technical Details

### Dependencies

- **None.** This plugin is written in pure JavaScript and has no external library dependencies. Unlike other studios that may use libraries like Three.js, Relief Studio uses a custom 2D canvas renderer for its isometric preview, keeping it fast and lightweight.

### Height Mapping Algorithm

The engine converts RGB pixels to a grayscale luminance value to determine height:

```javascript
// Perceptual Luminance
let lum = (0.299 * R + 0.587 * G + 0.114 * B) / 255;

// Invert if requested
if (invertDepth) lum = 1.0 - lum;

// Map to plate height (1 to Max)
const height = Math.max(1, Math.round(lum * maxHeight));
```

### Isometric Rendering

The studio uses a lightweight 2D canvas renderer with an isometric projection formula. It draws bricks from back-to-front (Painter's Algorithm) to handle occlusion.

- **Projection:**
  - `screenX = centerX + (gridX - gridY) * tileWidth`
  - `screenY = topY + (gridX + gridY) * tileHeight - (z * plateHeight)`

- **Shading:**
  - Top Face: Original Color
  - Right Face: 20% Darker
  - Left Face: 40% Darker

### Color Matching

Uses a weighted HSL distance function to find the nearest LEGO color, prioritizing **Lightness** (3.0 weight) over Hue (2.0) and Saturation (1.5) to ensure the 3D shading effect is preserved in the physical bricks.

## Performance

- **Processing:** <50ms for typical 48x48 inputs.
- **Rendering:** Custom 2D loop is highly optimized for static geometry.

## Credits

Created as part of BlockForge Platform.
Original concept: `relief.html` (Standalone Demo).

---
*Built with ☕ and an unhealthy obsession with LEGO bricks.*
