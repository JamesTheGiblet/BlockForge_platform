# Architect Studio Plugin

Architect Studio is a modular plugin for the BlockForge platform, designed to help users generate architectural blueprints and visualizations from images. It provides tools for converting house photos into voxel-based blueprints, customizing architectural styles, and exporting material lists and images.

## Features

- Upload a house photo to generate a LEGO-style blueprint
- Adjustable detail level (controls blueprint resolution)
- Selectable architectural styles (e.g., traditional)
- Toggle features like trees and fences
- Customizable client name and closing date
- Real-time preview and interactive UI
- Export materials list as CSV and blueprint as PNG image

## File Structure

- `architect-studio.js`: Main plugin logic and UI event handling
- `manifest.json`: Plugin metadata and configuration for BlockForge
- `assets/palette.js`: (Deprecated) Color palette, now unified in `src/shared/color-palette.js`
- `README.md`: This documentation file

## Usage

1. Open Architect Studio in BlockForge.
2. Upload a house photo using the provided input.
3. Adjust detail level, style, and other options as desired.
4. View the generated blueprint in the preview area.
5. Export the materials list (CSV) or blueprint image (PNG) using the provided buttons.

## Palette

Architect Studio now uses the shared color palette from `src/shared/color-palette.js` for all color assignments. The local palette file is deprecated.

## Developer Notes

- The plugin uses modular imports from BlockForge's shared utilities (FileUtils, Exporters, Voxelizer, BrickOptimizer).
- The rendering logic is canvas-based and supports both placeholder and generated blueprints.
- The plugin is designed for easy extension and maintenance, following BlockForge's plugin architecture.

## Migration

If updating from an older version, ensure you:

- Remove any direct dependencies on `assets/palette.js` and use the shared palette instead.
- Update any custom color logic to reference the shared palette.

## License

This plugin is part of the BlockForge platform and follows the main repository's license.
