# Relief Studio Plugin

Converts 2D images into 3D topographical LEGO relief maps.

## Features

- **Height Mapping:** Converts image brightness (luminance) into stack height.
- **Isometric Preview:** Visualizes the 3D relief on a 2D canvas.
- **Customizable Depth:** Adjust maximum height from 1 to 12 plates.
- **Invert Mode:** Toggle whether dark or light pixels represent height.

## Usage

1. **Upload Image:** Select a grayscale height map or any photo.
2. **Adjust Width:** Set the base width (16-64 studs).
3. **Set Max Height:** Determine the peak height of the relief.
4. **Invert:** Check "Invert" if your height map uses black for high points (common in some formats).

## Technical Details

### Voxelization

Uses `Voxelizer.fromHeightMap` to scan the image.

- **Luminance Calculation:** `L = 0.299*R + 0.587*G + 0.114*B`
- **Height Scaling:** `Height = floor(Luminance * MaxHeight)`

### Rendering

Uses a custom isometric projection algorithm on the HTML5 Canvas.

- **Projection:** `x' = (x-y), y' = (x+y)/2 - z`
- **Painter's Algorithm:** Bricks are sorted by Z, then Y+X to ensure correct draw order.

### Optimization

Currently treats each pixel as a 1x1 stack. Future versions could optimize large flat areas into larger plates.

## Credits

Part of BlockForge Platform.
Uses standard LEGO color palette for terrain approximation.
