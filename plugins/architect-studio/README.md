# Architect Studio Plugin

Transform real estate photos into premium LEGO architectural models. Designed for realtors, architects, and closing gifts.

## Features

- **Photo Analysis:** Upload a house photo to generate a matching brick facade.
- **Customizable Styles:** Choose from Modern, Traditional, Colonial, Victorian, and more.
- **Detail Control:** Adjust the brick resolution and complexity.
- **Landscaping:** Toggle trees, fences, and garden elements.
- **Client Personalization:** Add client name and property address for custom plaques.

## Usage

1. **Upload Photo:** Select a clear, front-facing photo of the property.
2. **Configure Model:** Set the architectural style and base size (8x8" to 20x20").
3. **Add Details:** Enable landscaping or fences as needed.
4. **Generate:** Create the 3D brick model preview.
5. **Export:** Download the parts list (CSV), render (PNG), or build guide (HTML).

## Technical Details

### Mock Generation

Currently, the plugin uses a mock generation algorithm to simulate the architectural analysis. In a production environment, this would connect to a backend service using computer vision to analyze the house structure.

### BOM Generation

The Bill of Materials (BOM) is calculated based on the base size and detail level, estimating the number of bricks required for roof, siding, windows, and landscaping.

## Exports

- **PNG:** High-resolution preview of the generated model.
- **CSV:** Detailed parts list for ordering bricks.
- **HTML:** Client-ready specification sheet with build details.

## Future Enhancements

- [ ] Integration with real computer vision API for accurate house mapping.
- [ ] 3D rotatable preview using Three.js.
- [ ] Automated BrickLink XML export for easy part ordering.
