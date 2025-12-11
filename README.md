
# 🏗️ BlockForge Platform

> **Production-grade platform for converting digital content into LEGO-compatible brick designs**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-yellow.svg)]()
[![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-green.svg)]()

---

## Current Status

### Phase 1: Foundation ✅ (COMPLETE)

**Progress:** 5/5 tasks complete (100%)

- ✅ Task 1-1: Repository created with MIT license
- ✅ Task 1-2: Plugin manifest schema designed
- ✅ Task 1-3: Plugin loader implemented (Node.js scanner + browser loader)
- ✅ Task 1-4: Build system configured (Vite + ES6 modules)
- ✅ Task 1-5: First studio migrated (Sign Studio)

**Time:** 45 minutes (estimated 3.5 hours)

### Phase 2: Refine & Migrate ⏳ (IN PROGRESS)

**Progress:** 2/6 tasks complete (33%)

- ✅ Task 2-1: Refine shared library (15 min)
- ✅ Task 2-2: Migrate QR Studio (40 min)
- ⏭️ Task 2-3: Migrate Mosaic Studio
- ⏭️ Task 2-4: Migrate remaining studios
- ⏭️ Task 2-5: Consolidate and optimize
- ⏭️ Task 2-6: Fix critical QA bugs

**Time so far:** 55 minutes  
**Estimated remaining:** 7-10 hours

### Available Studios

#### Sign Studio ✅ (MIGRATED)

- **Status:** Fully functional
- **Features:** Text signs with customizable colors, sizes, borders
- **Exports:** PNG, CSV, HTML
- **Lines of Code:** 270 (down from 700 in standalone)

#### QR Studio ✅ (MIGRATED)

- **Status:** Fully functional
- **Features:** Scannable QR codes (URL, WiFi, Contact, Phone)
- **Exports:** PNG, CSV, HTML
- **Baseplate Sizes:** 32×32, 48×48, 64×64
- **Lines of Code:** 350 (down from 850 in standalone)
- **Dependencies:** QRCode.js (loaded from CDN)

#### Architect Studio ✅ (MIGRATED)

- **Status:** Functional (mock data)
- **Features:** Converts building photos into brick facades
- **Exports:** PNG, CSV, HTML
- **Lines of Code:** 286

### Shared Library Modules

All modules operational with Sign Studio:

1. **Voxelizer** - Text to voxel grid conversion
2. **BrickOptimizer** - Greedy brick packing algorithm  
3. **ColorUtils** - Color conversion and matching
4. **FileUtils** - File loading and downloads
5. **Exporters** - CSV and HTML generation

## Quick Start

```bash
# Install dependencies
npm install

# Scan for plugins
npm run scan-plugins

# Start dev server
npm run dev
```

Navigate to <http://localhost:3000> and select Sign Studio from the dropdown.

## Project Structure

```txt
BlockForge_platform/
├── plugins/
│   ├── sign-studio/           # Sign Studio plugin
│   │   ├── manifest.json      # Plugin metadata
│   │   ├── sign-studio.js     # Plugin implementation
│   │   ├── assets/
│   │   │   └── font-data.js   # 5x5 pixel font
│   │   └── README.md          # Plugin documentation
│   └── test-plugin/           # Test plugin
├── src/
│   ├── core/
│   │   └── plugin-loader.js   # Dynamic plugin loading
│   ├── shared/                # Shared library
│   │   ├── voxelizer.js       # Voxel grid operations
│   │   ├── brick-optimizer.js # Brick optimization
│   │   ├── exporters.js       # Export functions
│   │   ├── utils/
│   │   │   ├── color.js       # Color utilities
│   │   │   └── files.js       # File utilities
│   │   └── index.js           # Barrel export
│   ├── main.js                # App entry point
│   └── index.html             # Main HTML
├── scripts/
│   └── scan-plugins.js        # Plugin scanner
├── public/
│   └── plugin-registry.json   # Generated plugin registry
└── vite.config.js             # Vite configuration
```

## Documentation

- [Plugin Manifest Schema](PLUGIN_MANIFEST_SCHEMA.md)
- [Shared Library Architecture](SHARED_LIBRARY_ARCHITECTURE.md)
- [Plugin Lifecycle Examples](PLUGIN_LIFECYCLE_EXAMPLES.md)
- [Sign Studio Migration Plan](SIGN_STUDIO_MIGRATION_PLAN.md)
- [UI Layout Specification](UI_LAYOUT_SPECIFICATION.md)

## Next Steps: Phase 2

**Goal:** Refine architecture and migrate more studios

1. Task 2-1: Refine shared library after learning from Sign Studio
2. Task 2-2: Migrate QR Studio (next simplest)
3. Task 2-3: Migrate Mosaic Studio
4. Task 2-4: Migrate remaining studios
5. Task 2-5: Consolidate and optimize
6. Task 2-6: Fix critical QA bugs from original audit

**Estimated time:** 8-12 hours

---

*Built with ☕ and an unhealthy obsession with LEGO bricks.*

**Let's build something amazing.**
