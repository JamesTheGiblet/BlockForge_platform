# Mosaic Studio Plugin

Converts digital photos into detailed LEGO mosaics using advanced color quantization, dithering algorithms, and noise reduction.

## Features

- **Advanced Dithering:** 4 algorithms (Floyd-Steinberg, Jarvis, Atkinson, None) for smooth gradients
- **Customizable Size:** Adjust width from 16 to 128 studs (aspect ratio preserved)
- **Color Palette:** Uses 48 official LEGO colors for accurate real-world building
- **Color Reduction:** Limit the number of unique colors (2-48) to manage budget/complexity
- **Noise Reduction:** "Sticky color" logic prevents single-pixel noise for sturdier builds
- **Real-time Preview:** Instant feedback as you adjust settings
- **Cost Estimation:** Real-time calculation based on brick count

## Usage

1. **Upload Image:** Select a JPG or PNG file.
2. **Set Width:** Adjust the width slider (16-128 studs). Height is calculated automatically.
3. **Limit Colors:** Reduce the color count to simplify the build or fit a budget.
4. **Choose Dithering:** Select an algorithm to control how colors blend (see below).
5. **Export:** Download the design as PNG, CSV parts list, or HTML instructions.

## Dithering Algorithms

Dithering helps create the illusion of more colors by arranging pixels in patterns. This is crucial for LEGO mosaics where the color palette is limited.

### 1. Floyd-Steinberg (Default)

The industry standard for image dithering. It diffuses quantization error to neighboring pixels (right, below-left, below, below-right).

- **Best for:** Most photographs, smooth gradients.
- **Result:** Balanced, natural look.

### 2. Jarvis

Diffuses error to pixels further away (up to 2 steps).

- **Best for:** High-detail images where sharpness is priority.
- **Result:** Sharper but can be "noisier" than Floyd-Steinberg.

### 3. Atkinson

Preserves high-contrast edges better by only diffusing 75% of the error. Famous for its use in early Macintosh graphics.

- **Best for:** Line art, logos, or high-contrast photos.
- **Result:** Clean, distinct patterns; less "muddy" than others.

### 4. None

Maps each pixel directly to the closest LEGO color without error diffusion.

- **Best for:** Cartoons, pixel art, or simple logos.
- **Result:** Solid blocks of color; gradients will look banded.

## Exports

### PNG Image

High-resolution preview of the final mosaic with stud details rendered.

### CSV Parts List

Complete inventory compatible with BrickLink/Rebrickable.
Columns: `Type`, `Quantity`, `Color (RGB)`.

### HTML Instructions

Printable guide including:

- Project summary (dimensions, total parts, cost)
- Visual parts list
- Build statistics

## Technical Details

### Color Quantization

Uses a K-means clustering approach (via `Voxelizer.fromImage`) to identify the dominant colors in your image, then maps them to the nearest available LEGO colors from the 48-color palette.

### Palette

The plugin uses a curated list of 48 common LEGO colors (`assets/mosaic-palette.js`) including:

- **Grayscale:** Black, White, Light/Dark Bluish Gray
- **Vibrant:** Red, Blue, Yellow, Orange, Lime
- **Earth Tones:** Reddish Brown, Tan, Dark Tan, Olive Green
- **Pastels:** Pink, Lavender, Azure, Sand Green

### Noise Reduction (Hysteresis)

To prevent the "confetti effect" (scattered single 1x1 plates), the engine uses a `similarityThreshold`. If a pixel is similar enough to the previously assigned color, it reuses that color. This creates larger contiguous areas, making the mosaic structurally stronger and easier to assemble.

### Optimization

While mosaics are typically built with 1x1 plates, the engine runs the `BrickOptimizer` which can combine adjacent identical pixels into larger plates (1x2, 1x3, etc.) to reduce part count and cost where possible.

## Performance

- **Processing:** <100ms for typical 48x48 mosaics
- **Dithering:** Performed in real-time on the main thread using optimized `Float32Array` buffers.
- **Rendering:** Canvas-based rendering with cached stud geometry.

## Future Enhancements

- [ ] Split large mosaics into multiple baseplates (32x32 or 48x48 chunks)
- [ ] PDF export with numbered grid instructions
- [ ] Custom palette selection (e.g., "Grayscale only", "Sepia")
- [ ] "Paint by numbers" style instruction generation

## Credits

Created as part of BlockForge Platform.
Uses standard image processing algorithms adapted for voxel grids.
