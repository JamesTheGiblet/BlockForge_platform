# Sign Studio Plugin

Sign Studio is a plugin for the BlockForge platform that allows users to design custom LEGO-style signs with text. It provides tools for text entry, color and border customization, and exporting the final sign design.

## Features

- Enter custom text for the sign (supports letters, numbers, and symbols)
- Adjustable text and background colors (shared palette or custom input)
- Selectable border styles (simple, double, or none)
- Real-time preview of the sign on a canvas
- Export the sign image
- Displays statistics on brick usage

## File Structure

- `sign-studio.js`: Main plugin logic and UI event handling
- `manifest.json`: Plugin metadata and configuration for BlockForge
- `assets/font-data.js`: (Deprecated) Font data, now unified in `src/shared/font-data.js`
- `README.md`: This documentation file

## Usage

1. Open Sign Studio in BlockForge.
2. Enter the desired text in the input field.
3. Select text color, background color, and border style as needed.
4. View the generated sign in the preview area.
5. Export the sign image as needed.

## Font Data

Sign Studio uses the shared font data from `src/shared/font-data.js` for all text rendering. The local font-data.js file is deprecated.

## Palette

Sign Studio uses the shared color palette from `src/shared/color-palette.js` for color selection. Custom colors are also supported.

## Developer Notes

- The plugin uses shared utilities from BlockForge (Voxelizer, FONT_DATA).
- The rendering logic is canvas-based and optimized for sign layouts.
- The plugin is modular and easy to extend or maintain.

## Migration

If updating from an older version, ensure you:

- Remove any direct dependencies on `assets/font-data.js` and use the shared font data instead.
- Update any custom color logic to reference the shared palette.

## License

This plugin is part of the BlockForge platform and follows the main repository's license.
