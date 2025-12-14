# Mosaic Studio Plugin

Mosaic Studio is a plugin for the BlockForge platform that enables users to create LEGO-style mosaics from images. It provides a simple interface for uploading images, adjusting mosaic size, and exporting results, making it easy to turn any picture into a brick mosaic.

## Features

- Upload an image to generate a LEGO mosaic
- Adjustable mosaic width (controls resolution and size)
- Uses a unified, shared color palette for brick color matching
- Real-time preview of the mosaic on a canvas
- Displays top used colors and brick count statistics
- Export options for saving the mosaic image and materials list

## File Structure

- `mosaic-studio.js`: Main plugin logic and UI event handling
- `manifest.json`: Plugin metadata and configuration for BlockForge
- `assets/palette.js`: (Deprecated) Color palette, now unified in `src/shared/color-palette.js`
- `README.md`: This documentation file

## Usage

1. Open Mosaic Studio in BlockForge.
2. Upload an image using the provided input.
3. Adjust the mosaic width slider to set the desired resolution.
4. View the generated mosaic in the preview area.
5. Review the top colors and brick count in the stats panel.
6. Export the mosaic image or materials list as needed.

## Palette

Mosaic Studio uses the shared color palette from `src/shared/color-palette.js` for all color assignments. The local palette file is deprecated.

## Developer Notes

- The plugin uses shared utilities from BlockForge (Voxelizer, FileUtils).
- The rendering logic is canvas-based and optimized for pixel-art style mosaics.
- The plugin is modular and easy to extend or maintain.

## Migration

If updating from an older version, ensure you:

- Remove any direct dependencies on `assets/palette.js` and use the shared palette instead.
- Update any custom color logic to reference the shared palette.

## License

This plugin is part of the BlockForge platform and follows the main repository's license.
