# BlockForge Plugin Manifest Schema v1.0

## Overview

The plugin manifest is a JSON file that describes a BlockForge studio plugin. Each plugin lives in its own directory (`/plugins/{plugin-id}/`) and contains a `manifest.json` file that tells the platform how to load and initialize it.

**Purpose:** Enable rapid scaling by allowing new studios to be added through simple JSON configuration without modifying core platform code.

---

## Schema Structure

```json
{
  "id": "qr-studio",
  "name": "QR Studio",
  "version": "1.0.0",
  "description": "Generate scannable QR codes in LEGO bricks",
  "entry": "qr-studio.js",
  "ui": {
    "tools": [...],
    "panels": [...]
  }
}
```

---

## Field Definitions

### `id` (required)

- **Type:** `string`
- **Format:** `kebab-case` (lowercase with hyphens)
- **Purpose:** Machine-readable unique identifier used internally by the platform
- **Example:** `"qr-studio"`, `"text-studio"`, `"architect-studio"`
- **Rules:**
  - Must be unique across all plugins
  - Used for routing, file paths, and code references
  - Cannot contain spaces or special characters except hyphens

---

### `name` (required)

- **Type:** `string`
- **Format:** Human-readable title case
- **Purpose:** Display name shown in the UI (navigation, headers, documentation)
- **Example:** `"QR Studio"`, `"Text Studio"`, `"Architect Studio"`
- **Rules:**
  - Should be clear and descriptive
  - Displayed to end users
  - Can contain spaces and proper capitalization

---

### `version` (required)

- **Type:** `string`
- **Format:** Semantic versioning (`major.minor.patch`)
- **Purpose:** Track plugin versions for compatibility and updates
- **Example:** `"1.0.0"`, `"2.1.3"`
- **Rules:**
  - Follow semver conventions
  - Increment appropriately:
    - **Major:** Breaking changes to plugin API
    - **Minor:** New features, backwards compatible
    - **Patch:** Bug fixes, no API changes

---

### `description` (required)

- **Type:** `string`
- **Format:** One-line summary
- **Purpose:** Brief explanation of what the plugin does
- **Example:** `"Generate scannable QR codes in LEGO bricks"`
- **Rules:**
  - Keep concise (1-2 sentences max)
  - Focus on user value, not technical details
  - Used in plugin selection UI and documentation

---

### `entry` (required)

- **Type:** `string`
- **Format:** Relative file path from plugin directory
- **Purpose:** Points to the main JavaScript file containing the plugin implementation
- **Example:** `"qr-studio.js"`
- **Rules:**
  - File must exist in `/plugins/{plugin-id}/{entry}`
  - Must be a `.js` file
  - File must export the required lifecycle hooks (see below)

**File Structure Example:**

```
/plugins/
  /qr-studio/
    manifest.json
    qr-studio.js  ← entry file
```

---

### `ui` (required)

- **Type:** `object`
- **Purpose:** Defines the user interface configuration for the plugin
- **Structure:** Contains `tools` and `panels` arrays

#### `ui.tools` (required)

- **Type:** `array`
- **Purpose:** Define the input controls and settings available to the user
- **Example:**

```json
"tools": [
  {
    "id": "qr-data",
    "type": "textarea",
    "label": "QR Data",
    "placeholder": "Enter text or URL...",
    "default": ""
  },
  {
    "id": "size",
    "type": "slider",
    "label": "Size",
    "min": 10,
    "max": 50,
    "default": 25
  }
]
```

**Tool Properties:**

- `id`: Unique identifier within this plugin
- `type`: Input type (`text`, `textarea`, `slider`, `select`, `checkbox`, `color`, `file`)
- `label`: Display label shown to user
- `placeholder`: Optional hint text
- `default`: Optional default value
- Additional properties based on type (min/max for sliders, options for selects, etc.)

#### `ui.panels` (required)

- **Type:** `array`
- **Purpose:** Define the output/display areas for the plugin
- **Example:**

```json
"panels": [
  {
    "id": "preview",
    "title": "3D Preview",
    "type": "canvas"
  },
  {
    "id": "brick-list",
    "title": "Brick List",
    "type": "table"
  },
  {
    "id": "instructions",
    "title": "Build Instructions",
    "type": "pdf-viewer"
  }
]
```

**Panel Properties:**

- `id`: Unique identifier within this plugin
- `title`: Display title shown in panel header
- `type`: Panel type (`canvas`, `table`, `text`, `pdf-viewer`, `image`, `html`)

---

## Plugin Lifecycle Hooks

The JavaScript file specified in `entry` must export an object or class with these methods:

### `init()`

- **Purpose:** Initialize the plugin, set up resources, load initial state
- **Called:** Once when plugin is loaded by the platform
- **Returns:** `void` or `Promise<void>`
- **Example Use:**
  - Load default settings
  - Initialize Three.js scene
  - Set up event listeners
  - Prepare data structures

### `render()`

- **Purpose:** Generate and display the 3D preview
- **Called:** When user changes inputs or requests preview update
- **Returns:** `void` or `Promise<void>`
- **Example Use:**
  - Process user input from tools
  - Run voxelization algorithm
  - Optimize brick layout
  - Render to Three.js canvas

### `export(format)`

- **Purpose:** Generate downloadable output files
- **Called:** When user clicks export button
- **Parameters:**
  - `format`: String indicating export type (`"instructions-pdf"`, `"ldraw"`, `"brick-list"`, `"stl"`, etc.)
- **Returns:** `Blob` or download trigger
- **Example Use:**
  - Generate PDF build instructions
  - Create LDraw (.ldr) file
  - Export brick list as CSV
  - Generate 3D model files

---

## Platform Assumptions

### Shared Library Access

**All plugins automatically have access to the complete shared library**, including:

- Voxelization engine
- Brick optimization algorithms
- Three.js renderer and scene management
- Export generators (PDF, LDraw, CSV, STL, OBJ)
- Utility functions (color conversions, geometry helpers, etc.)

**Why:** Simplifies plugin development. No need to declare dependencies or manage imports. If a plugin doesn't use something, it's fine—no performance penalty.

### Asset Loading

**Plugins load assets freely** from the shared `/assets` directory structure:

```
/assets/
  /fonts/
  /textures/
  /bricks/
  /templates/
```

**Why:** Centralized asset management. Plugins reference assets directly without manifest declarations. Easier to share resources between plugins.

### Export Format Support

**All plugins support all export formats.** The platform doesn't restrict what formats are available per plugin.

**Why:** Simplifies architecture. The shared export library handles format generation. If a plugin's output doesn't make sense for certain formats (e.g., QR codes as STL), the export handler can return a graceful message.

### UI Structure Consistency

**All plugins use the same `tools` + `panels` UI pattern.** This creates a consistent user experience across all studios.

**Why:** Users learn the interface once. Platform can provide standard UI components. Future plugins inherit the familiar layout.

**Note:** If a plugin needs special UI behavior not covered by this pattern, handle it as an edge case during implementation. The schema supports 99% of use cases.

---

## File Structure Example

```
/plugins/
  /qr-studio/
    manifest.json       ← Plugin manifest
    qr-studio.js        ← Plugin implementation
    /assets/            ← Plugin-specific assets (optional)
      logo.png
      
  /text-studio/
    manifest.json
    text-studio.js
    
  /architect-studio/
    manifest.json
    architect-studio.js
```

---

## Adding a New Plugin

To add a new studio to BlockForge Platform:

1. Create a new directory in `/plugins/` using the plugin ID
2. Create `manifest.json` following this schema
3. Create the entry JavaScript file with `init()`, `render()`, `export()` methods
4. Define tools and panels in the UI config
5. Drop the folder into `/plugins/`—the platform will auto-discover it

**That's it.** No core platform code changes required.

---

## Design Philosophy

**Simplicity over flexibility:** This schema prioritizes ease of plugin creation over maximum configurability. Better to have 90% of plugins work with zero configuration than require elaborate setup for every plugin.

**Convention over configuration:** Shared libraries, assets, and export formats are available by default. Plugins opt-in to what they need without declaring everything upfront.

**Rapid scaling:** The primary goal is to enable adding new studios by dropping in a JSON file and a JavaScript implementation. The faster you can go from idea to working plugin, the faster BlockForge grows.

---

## Version History

- **v1.0.0** (2024-12-11): Initial schema design based on 7 existing studio demos

---

## Next Steps

1. Build the plugin loader (reads manifests, loads entry files)
2. Migrate first studio as proof-of-concept
3. Refine schema based on real-world usage
4. Document any additional fields discovered during migration
