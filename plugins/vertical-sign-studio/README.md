# Vertical Sign Studio Plugin

Vertical Sign Studio is a plugin for the BlockForge platform that allows users to design custom vertical LEGO-style signs with 3D rendering. It provides tools for text entry, color customization, sign height adjustment, and exporting the final design.

## Features

- Enter custom text for the vertical sign (supports letters, numbers, and symbols)
- Adjustable text and background colors (shared palette or custom input)
- Adjustable sign height
- Real-time 3D preview using Three.js
- Interactive rotation of the sign in the preview
- Export options for saving the sign image (future: STL export)
- Displays statistics on brick usage

## File Structure

- `vertical-sign-studio.js`: Main plugin logic, 3D rendering, and UI event handling
- `manifest.json`: Plugin metadata and configuration for BlockForge
- `assets/font-data.js`: (Deprecated) Font data, now unified in `src/shared/font-data.js`
- `README.md`: This documentation file

## Usage

1. Open Vertical Sign Studio in BlockForge.
2. Enter the desired text in the input field.
3. Select text color, background color, and sign height as needed.
4. View and interact with the 3D sign in the preview area.
5. Export the sign image or (in future) STL file as needed.

## Font Data

Vertical Sign Studio uses the shared font data from `src/shared/font-data.js` for all text rendering. The local font-data.js file is deprecated.

## Palette

Vertical Sign Studio uses the shared color palette from `src/shared/color-palette.js` for color selection. Custom colors are also supported.

## Developer Notes

- The plugin uses shared utilities from BlockForge (Voxelizer, FONT_DATA).
- The rendering logic is 3D-based using Three.js and supports interactive manipulation.
- The plugin is modular and easy to extend or maintain.

## Migration

If updating from an older version, ensure you:

- Remove any direct dependencies on `assets/font-data.js` and use the shared font data instead.
- Update any custom color logic to reference the shared palette.

## License

This plugin is part of the BlockForge platform and follows the main repository's license.
