# Relief Studio Plugin

Converts 2D images into 3D LEGO bas-relief sculptures. Maps pixel brightness to brick height, creating tactile topography from flat photos.

## Features

- **Height Mapping:** Automatically converts image luminance into physical depth (lighter = higher)
- **Isometric Preview:** Real-time 2.5D visualization using custom canvas renderer
- **Layer Slicing:** Generates build instructions layer-by-layer for easy assembly
- **Depth Control:** Adjustable maximum height (1-10 plates)
- **Invert Mode:** Reverses mapping (darker = higher) for stamps or text-based logos
- **Exports:** PNG, CSV, HTML with layer-by-layer instructions

## Usage

1. Upload Image (JPG or PNG - high-contrast images work best)
2. Set Width (16-64 studs)
3. Set Max Height (how tall the highest point should be)
4. Toggle Invert Depth if needed (for stamp effect)
5. Export as PNG, CSV, or HTML instructions

## Technical Details

### Dependencies

None. Pure JavaScript with custom 2D canvas isometric renderer.

### Height Mapping Algorithm

```javascript
// Perceptual Luminance
let lum = (0.299 * R + 0.587 * G + 0.114 * B) / 255;

// Invert if requested
if (invertDepth) lum = 1.0 - lum;

// Map to plate height (1 to Max)
const height = Math.max(1, Math.round(lum * maxHeight));
```

### Isometric Rendering

- Projection: `screenX = centerX + (gridX - gridY) * tileWidth`
- Shading: Top (original), Right (20% darker), Left (40% darker)

## Exports

- **PNG:** Isometric preview image
- **CSV:** Height map data with coordinates and colors
- **HTML:** Layer-by-layer build instructions with visual grid for each layer

## Credits

Created as part of BlockForge Platform.
Lines of Code: ~200 (optimized from standalone version)
