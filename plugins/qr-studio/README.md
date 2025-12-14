# QR Studio Plugin

QR Studio is a plugin for the BlockForge platform that enables users to generate LEGO-style QR codes. It provides a simple interface for entering data, customizing QR code size and colors, and exporting the resulting design.

## Features

- Enter any text or URL to generate a QR code
- Adjustable QR code size (controls grid resolution)
- Choose foreground and background colors from a shared palette or custom input
- Real-time preview of the QR code as a LEGO mosaic
- Export the QR code image
- Displays statistics on brick usage

## File Structure

- `qr-studio.js`: Main plugin logic and UI event handling
- `manifest.json`: Plugin metadata and configuration for BlockForge
- `README.md`: This documentation file

## Usage

1. Open QR Studio in BlockForge.
2. Enter the desired text or URL in the input field.
3. Adjust the QR code size and select colors as needed.
4. View the generated QR code in the preview area.
5. Export the QR code image as needed.

## Font Data

QR Studio uses the shared font data from `src/shared/font-data.js` for any text rendering. (If text-based QR code features are added.)

## Palette

QR Studio uses the shared color palette from `src/shared/color-palette.js` for color selection. Custom colors are also supported.

## Developer Notes

- The plugin uses shared utilities from BlockForge (ColorUtils, FONT_DATA).
- The rendering logic is canvas-based and optimized for QR code patterns.
- The plugin is modular and easy to extend or maintain.

## Migration

If updating from an older version, ensure you:

- Remove any direct dependencies on local font or palette files and use the shared resources instead.
- Update any custom color logic to reference the shared palette.

## License

This plugin is part of the BlockForge platform and follows the main repository's license.
