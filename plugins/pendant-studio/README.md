# Pendant Studio Plugin

Pendant Studio is a plugin for the BlockForge platform that allows users to design custom LEGO-style pendants with initials or short text. It provides tools for letter pattern placement, shape selection, color customization, and exporting the final design.

## Features

- Enter up to four initials or characters for the pendant
- Choose from different design styles (interlock, stacked, etc.)
- Select baseplate shapes (border, circle, heart)
- Adjustable pendant size (small, medium, large)
- Choose pendant color from a shared palette or custom input
- Real-time preview of the pendant design
- Export options for saving the pendant image or (future) STL export

## File Structure

- `pendant-studio.js`: Main plugin logic and UI event handling
- `manifest.json`: Plugin metadata and configuration for BlockForge
- `assets/letter-patterns.js`: (Deprecated) Letter patterns, now unified in `src/shared/font-data.js`
- `README.md`: This documentation file

## Usage

1. Open Pendant Studio in BlockForge.
2. Enter initials or short text in the input field.
3. Select design style, baseplate shape, size, and color as desired.
4. View the generated pendant in the preview area.
5. Export the pendant image or (in future) STL file as needed.

## Font Data

Pendant Studio uses the shared font data from `src/shared/font-data.js` for all letter patterns. The local letter-patterns.js file is deprecated.

## Palette

Pendant Studio uses the shared color palette from `src/shared/color-palette.js` for color selection. Custom colors are also supported.

## Developer Notes

- The plugin uses shared utilities from BlockForge (Exporters, FileUtils).
- The rendering logic is canvas-based and supports various pendant shapes and styles.
- The plugin is modular and easy to extend or maintain.

## Migration

If updating from an older version, ensure you:

- Remove any direct dependencies on `assets/letter-patterns.js` and use the shared font data instead.
- Update any custom color logic to reference the shared palette.

## License

This plugin is part of the BlockForge platform and follows the main repository's license.
