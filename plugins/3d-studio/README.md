# Vertical Sign Studio Plugin

Create self-standing 3D brick signs where letters are stacked vertically.

## Features

- **3D Rendering:** Uses Three.js to visualize the sign in full 3D.
- **Custom Text:** Supports A-Z and 0-9 characters.
- **Adjustable Height:** Change the thickness of the sign (number of brick layers).
- **Color Customization:** Set text and background colors independently.

## Usage

1. **Enter Text:** Type up to 10 characters in the input field.
2. **Set Colors:** Choose colors for the text and the surrounding bricks.
3. **Adjust Height:** Use the slider to determine how many bricks deep the sign should be.
4. **Rotate View:** Click and drag on the preview to rotate the 3D model.

## Technical Details

### Voxelization

Uses `Voxelizer.fromText` with a standard 5x5 pixel font. The 2D grid returned by the voxelizer is extruded along the Y-axis in Three.js to create the vertical stack.

### Rendering

Renders using **Three.js**.

- Each "pixel" from the font becomes a stack of 1x1 bricks.
- Studs are added as cylinders on top of each brick.
- Shadows and lighting are applied for depth perception.

### Exports

- **STL:** (Coming Soon) For 3D printing the base structure.
- **CSV:** Parts list for ordering bricks.

## Credits

Part of BlockForge Platform.
