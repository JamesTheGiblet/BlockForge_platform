# Sign Studio Plugin

Creates 2D horizontal LEGO signs and nameplates with customizable text, colors, and borders.

## Features

- **Text Input:** Up to 12 characters using 5x5 pixel font
- **Three Size Modes:** Compact (7 studs), Bold (9 studs), Large (11 studs)
- **Border Styles:** Thin (1 stud), Medium (2 studs), Thick (3 studs)
- **Color Customization:** Text, background, and border colors
- **Real-time Preview:** Canvas rendering with brick studs
- **Multiple Exports:** PNG image, CSV parts list, HTML instructions

## Usage

1. Enter text (max 12 characters)
2. Select size and border style
3. Choose colors
4. Click "Generate" to render
5. Export in your preferred format

## Exports

### PNG Image

High-quality preview image showing the complete sign with brick studs rendered.

### CSV Parts List

Brick inventory sorted by type and quantity:

- tile-1x3 (most used for horizontal fills)
- tile-1x2 (medium fills)
- tile-1x1 (single studs and fill-ins)

### HTML Instructions

Printable build guide with:

- Total brick count
- Dimensions in studs
- Complete parts breakdown table
- Professional styling for printing

## Technical Details

### Font System

Uses 5x5 pixel font stored in `assets/font-data.js`. Each character is defined as a 5-row array where 1 = filled pixel, 0 = empty.

Supported characters: A-Z, 0-9, space, hyphen, exclamation, question mark

### Voxelization

Text is converted to a voxel grid using `Voxelizer.fromText()` with:

- 1 stud spacing between characters
- Configurable padding around text
- Configurable border thickness

### Brick Optimization

Uses greedy optimization algorithm:

1. Try to place 1x3 tiles first (most efficient)
2. Fall back to 1x2 tiles
3. Fill remaining with 1x1 tiles
4. Color matching ensures contiguous areas use larger bricks

### Canvas Rendering

Each brick stud rendered as:

- Base color rectangle
- White highlight circle (rgba 255,255,255,0.3)
- Black shadow circle (rgba 0,0,0,0.1)
- Border outline (rgba 0,0,0,0.1)

## Implementation Notes

### What's in Shared Library

- `Voxelizer.fromText()` - Text to voxel grid conversion
- `BrickOptimizer.optimize()` - Greedy brick packing algorithm
- `ColorUtils` - Hex/RGB conversion utilities
- `FileUtils.downloadBlob()` - File download helper
- `Exporters.toCSV()` - CSV generation
- `Exporters.toHTML()` - HTML instruction generation

### What's Plugin-Specific

- 5x5 pixel font data (`assets/font-data.js`)
- Canvas rendering with stud effects
- Stats calculation by color
- Event handlers for UI controls
- Export filename generation

## Performance

- **Rendering:** ~5ms for typical 12-character sign
- **Optimization:** ~10ms for 400-500 bricks
- **Export:** Instant for PNG/CSV, <100ms for HTML

## Future Enhancements

Potential improvements for future versions:

- [ ] Live color pickers in UI
- [ ] Custom font support
- [ ] Multi-line text
- [ ] Vertical orientation option
- [ ] Advanced brick types (plates, slopes)
- [ ] PDF export with step-by-step instructions
- [ ] 3D preview mode
- [ ] BrickLink XML export

## Credits

Created as part of BlockForge Platform migration.  
Original standalone version: `sign.html` (700 LOC)  
Plugin version: `sign-studio.js` (270 LOC)

Reduction achieved through shared library extraction.
