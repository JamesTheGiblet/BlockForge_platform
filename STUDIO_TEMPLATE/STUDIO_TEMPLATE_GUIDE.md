# BlockForge Studio Template & Migration Guide

> **Purpose**: Standardized template and process for creating new studios or migrating existing HTML demos to the BlockForge plugin architecture.

**Last Updated**: December 2024  
**Applies To**: BlockForge Platform v0.1.0+

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Studio Template Files](#studio-template-files)
3. [Migration Process](#migration-process)
4. [Shared Library Decision Tree](#shared-library-decision-tree)
5. [Common Patterns](#common-patterns)
6. [Testing Checklist](#testing-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### For New Studios (Built From Scratch)

```bash
# 1. Copy template
cp -r STUDIO_TEMPLATE plugins/my-new-studio

# 2. Rename files
mv plugins/my-new-studio/studio-template.js plugins/my-new-studio/my-new-studio.js

# 3. Fill in TODOs in manifest.json and plugin class

# 4. Scan and test
npm run scan-plugins
npm run dev
```

### For Migrating Existing HTML Demos

Follow the [Migration Process](#migration-process) below (60 min average).

---

## Studio Template Files

### Directory Structure

```txt
STUDIO_TEMPLATE/
├── manifest.json           # Plugin metadata and UI config
├── studio-template.js      # Complete plugin class skeleton
├── assets/                 # Fonts, palettes, data files
│   └── README.md          # What goes in assets/
└── README.md              # Studio documentation template
```

---

### Template: manifest.json

```json
{
  "id": "[studio-id]",
  "name": "[Studio Name]",
  "version": "1.0.0",
  "description": "[Brief description of what this studio does]",
  "entry": "[studio-id].js",
  
  "ui": {
    "tools": [
      {
        "id": "[tool-id]",
        "type": "[text|file|range|select|checkbox|color]",
        "label": "[Label Text]",
        "placeholder": "[Optional placeholder]",
        "default": "[default value]",
        
        "_comment": "For range:",
        "min": 1,
        "max": 100,
        
        "_comment": "For select:",
        "options": [
          {"value": "option1", "label": "Option 1"},
          {"value": "option2", "label": "Option 2"}
        ],
        
        "_comment": "For file:",
        "accept": "image/*"
      }
    ],
    
    "panels": [
      {
        "id": "preview",
        "title": "[Preview Title]",
        "type": "canvas"
      },
      {
        "id": "stats",
        "title": "[Stats Title]",
        "type": "html"
      }
    ]
  }
}
```

**Key Fields**:

- `id`: Lowercase-with-hyphens, must match folder name
- `entry`: JavaScript filename, should be `[id].js`
- `tools`: Input controls defined in manifest, wired in plugin
- `panels`: Display areas (canvas for preview, html for stats/text)

---

### Template: studio-template.js

```javascript
/**
 * [Studio Name] Plugin
 * [Detailed description of functionality]
 * 
 * Input: [What this studio accepts - images, text, 3D models, etc.]
 * Output: [What it generates - mosaics, signs, QR codes, etc.]
 * Exports: PNG, CSV, HTML
 */

import { 
  Voxelizer, 
  BrickOptimizer, 
  ColorUtils,
  FileUtils,
  Exporters
} from '../../src/shared/index.js';

// TODO: Import any studio-specific assets
// import { STUDIO_DATA } from './assets/data.js';

class [StudioName]Studio {
  constructor() {
    // ========================================
    // STATE - Store user inputs and settings
    // ========================================
    
    // TODO: Add your main input property
    this.[mainInput] = null;  // e.g., this.image, this.text, this.qrData
    
    // TODO: Add configuration properties from manifest tools
    this.[setting1] = 'default-value';
    this.[setting2] = 48;
    
    // ========================================
    // GENERATED DATA - Results of processing
    // ========================================
    
    this.voxelGrid = null;      // 3D grid of voxels (from Voxelizer)
    this.brickLayout = null;    // Optimized brick placement (from BrickOptimizer)
    
    // ========================================
    // DOM REFERENCES - Canvas and UI elements
    // ========================================
    
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Initialize plugin
   * Called once when plugin is loaded
   */
  async init() {
    console.log('✅ [Studio Name] initialized');
    
    // Get canvas element (create if doesn't exist)
    this.canvas = document.getElementById('[canvas-id]') || 
                  document.getElementById('signCanvas') || 
                  document.getElementById('qrCanvas');
    
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = '[canvas-id]';
      // TODO: Append to appropriate container if needed
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Optional: Load external libraries if needed
    // await this.loadExternalLibrary();
    
    // Optional: Render default/empty state
    // this.render();
  }

  /**
   * Setup event listeners for UI controls
   * Wire manifest.json tool IDs to handler functions
   */
  setupEventListeners() {
    // ========================================
    // FILE UPLOAD HANDLER
    // ========================================
    
    const fileInput = document.getElementById('[file-upload-tool-id]');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          // TODO: Load file using FileUtils
          this.[mainInput] = await FileUtils.loadImage(file);
          // or: await FileUtils.loadText(file)
          // or: await FileUtils.loadJSON(file)
          
          this.render();
        }
      });
    }
    
    // ========================================
    // TEXT INPUT HANDLER
    // ========================================
    
    const textInput = document.getElementById('[text-tool-id]');
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        this.[textProperty] = e.target.value;
        this.render();
      });
    }
    
    // ========================================
    // RANGE SLIDER HANDLER
    // ========================================
    
    const rangeInput = document.getElementById('[range-tool-id]');
    if (rangeInput) {
      rangeInput.addEventListener('change', (e) => {
        this.[settingProperty] = parseInt(e.target.value);
        if (this.[mainInput]) this.render();
      });
    }
    
    // ========================================
    // SELECT DROPDOWN HANDLER
    // ========================================
    
    const selectInput = document.getElementById('[select-tool-id]');
    if (selectInput) {
      selectInput.addEventListener('change', (e) => {
        this.[settingProperty] = e.target.value;
        if (this.[mainInput]) this.render();
      });
    }
    
    // ========================================
    // CHECKBOX HANDLER
    // ========================================
    
    const checkboxInput = document.getElementById('[checkbox-tool-id]');
    if (checkboxInput) {
      checkboxInput.addEventListener('change', (e) => {
        this.[booleanProperty] = e.target.checked;
        if (this.[mainInput]) this.render();
      });
    }
    
    // TODO: Add more handlers as needed
  }

  /**
   * Main render function
   * Converts input → voxels → bricks → canvas
   */
  render() {
    console.log('🎨 Rendering [studio name]');

    // Early return if no input
    if (!this.[mainInput]) {
      this.clearCanvas();
      return;
    }

    // ========================================
    // STEP 1: VOXELIZE INPUT
    // ========================================
    
    // TODO: Choose appropriate Voxelizer method:
    
    // For text:
    // this.voxelGrid = Voxelizer.fromText(this.text, FONT_DATA, {
    //   spacing: 1,
    //   padding: 2,
    //   borderWidth: 2,
    //   color: this.textColor
    // });
    
    // For images (mosaics):
    // this.voxelGrid = Voxelizer.fromImage(this.image, this.width, {
    //   colorCount: this.colorCount,
    //   palette: PALETTE
    // });
    
    // For QR codes:
    // this.voxelGrid = Voxelizer.fromQRCode(this.qrMatrix, {
    //   fgColor: this.fgColor,
    //   bgColor: this.bgColor
    // });
    
    // For height maps (Relief Studio):
    // this.voxelGrid = Voxelizer.fromHeightMap(this.image, this.width, {
    //   maxHeight: this.maxHeight,
    //   invert: this.invertDepth
    // });
    
    // TODO: Replace with your actual voxelization call
    this.voxelGrid = Voxelizer.from[Type](this.[mainInput], {
      // options
    });

    // ========================================
    // STEP 2: OPTIMIZE TO BRICKS
    // ========================================
    
    this.brickLayout = BrickOptimizer.optimize(this.voxelGrid, {
      allowTiles: true,     // Use tile pieces (smooth top)
      allowDots: false,     // Use 1x1 round dots
      colorMatch: true      // Only combine same-color voxels
    });

    // ========================================
    // STEP 3: RENDER TO CANVAS
    // ========================================
    
    this.renderToCanvas();

    // ========================================
    // STEP 4: UPDATE STATS DISPLAY
    // ========================================
    
    this.updateStats();
  }

  /**
   * Render brick layout to canvas
   * This is highly studio-specific - customize heavily
   */
  renderToCanvas() {
    if (!this.brickLayout) return;

    const studSize = 20; // pixels per stud
    const bounds = this.brickLayout.getBounds();
    const width = bounds.max.x - bounds.min.x + 1;
    const height = bounds.max.y - bounds.min.y + 1;

    // Set canvas size
    this.canvas.width = width * studSize;
    this.canvas.height = height * studSize;

    // Clear canvas
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // ========================================
    // RENDERING STYLE OPTIONS
    // ========================================
    
    // TODO: Choose rendering style:
    
    // STYLE A: Square bricks with circular studs (Sign Studio)
    this.renderSquareBricks();
    
    // STYLE B: Circular studs only (QR Studio)
    // this.renderCircularStuds();
    
    // STYLE C: Isometric 3D view (Relief Studio)
    // this.renderIsometric();
    
    // STYLE D: Custom rendering
    // this.renderCustom();
  }

  /**
   * Render as square bricks with circular studs
   * Standard LEGO brick appearance
   */
  renderSquareBricks() {
    const studSize = 20;
    const bounds = this.brickLayout.getBounds();
    
    this.brickLayout.bricks.forEach(brick => {
      const px = (brick.position.x - bounds.min.x) * studSize;
      const py = (brick.position.y - bounds.min.y) * studSize;
      const dims = brick.getDimensions();
      const brickWidth = dims.width * studSize;
      const brickHeight = dims.height * studSize;
      
      // Draw brick base
      const colorHex = ColorUtils.rgbToHex(brick.color);
      this.ctx.fillStyle = colorHex;
      this.ctx.fillRect(px, py, brickWidth, brickHeight);
      
      // Draw studs on each unit
      for (let sy = 0; sy < dims.height; sy++) {
        for (let sx = 0; sx < dims.width; sx++) {
          const studX = px + (sx * studSize) + (studSize / 2);
          const studY = py + (sy * studSize) + (studSize / 2);
          const studRadius = studSize * 0.35;
          
          // Stud highlight
          this.ctx.beginPath();
          this.ctx.arc(studX, studY, studRadius, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          this.ctx.fill();
          
          // Stud shadow
          this.ctx.beginPath();
          this.ctx.arc(studX + 1, studY + 1, studRadius, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          this.ctx.fill();
        }
      }
      
      // Brick outline
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(px, py, brickWidth, brickHeight);
    });
  }

  /**
   * Render as circular studs only (no brick outlines)
   * QR code appearance
   */
  renderCircularStuds() {
    const studSize = 20;
    const bounds = this.brickLayout.getBounds();
    
    this.brickLayout.bricks.forEach(brick => {
      const px = (brick.position.x - bounds.min.x) * studSize;
      const py = (brick.position.y - bounds.min.y) * studSize;
      const radius = (studSize / 2) - 1;
      const colorHex = ColorUtils.rgbToHex(brick.color);

      // Draw circular stud body
      this.ctx.fillStyle = colorHex;
      this.ctx.beginPath();
      this.ctx.arc(px + studSize/2, py + studSize/2, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Stud highlight
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(px + studSize/2 - 2, py + studSize/2 - 2, 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Stud shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      this.ctx.beginPath();
      this.ctx.arc(px + studSize/2 + 1, py + studSize/2 + 1, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /**
   * Update stats display
   * Shows brick counts, dimensions, estimated cost
   */
  updateStats() {
    if (!this.brickLayout) return;

    const bounds = this.brickLayout.getBounds();
    const width = bounds.max.x - bounds.min.x + 1;
    const height = bounds.max.y - bounds.min.y + 1;

    // Get counts by source type
    const typeCounts = this.brickLayout.getSourceTypeCounts();
    const totalBricks = this.brickLayout.getTotalBricks();
    
    // Calculate cost (adjust per-brick cost as needed)
    const costPerBrick = 0.10; // $0.10 per brick
    const totalCost = (totalBricks * costPerBrick).toFixed(2);

    // ========================================
    // UPDATE DOM ELEMENTS
    // ========================================
    
    // TODO: Match these IDs to your manifest panels
    
    // Update individual type counts
    const textCountEl = document.getElementById('text-count');
    if (textCountEl) {
      textCountEl.textContent = (typeCounts.text || 0).toLocaleString();
    }

    const bgCountEl = document.getElementById('bg-count');
    if (bgCountEl) {
      bgCountEl.textContent = (typeCounts.background || 0).toLocaleString();
    }

    const borderCountEl = document.getElementById('border-count');
    if (borderCountEl) {
      borderCountEl.textContent = (typeCounts.border || 0).toLocaleString();
    }

    // Update dimensions and cost summary
    const dimensionsEl = document.getElementById('dimensions');
    if (dimensionsEl) {
      dimensionsEl.innerHTML = `
        Dimensions: ${width}×${height} studs<br>
        Total Bricks: <strong>${totalBricks.toLocaleString()}</strong><br>
        Est. Cost: <strong>$${totalCost}</strong> @ $${costPerBrick.toFixed(2)}/brick
      `;
    }

    console.log(`📊 Stats: ${totalBricks} total bricks`);
  }

  /**
   * Clear canvas
   * Resets to empty gray background
   */
  clearCanvas() {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Export function
   * Handles all export format routing
   * 
   * @param {string} format - 'png', 'csv', or 'html'
   */
  async export(format) {
    console.log('📥 Exporting as:', format);

    if (!this.brickLayout) {
      alert('Please generate something first!');
      return;
    }

    switch (format) {
      case 'png':
        this.exportPNG();
        break;

      case 'csv':
        this.exportCSV();
        break;

      case 'html':
        await this.exportHTML();
        break;

      default:
        console.error('Unknown export format:', format);
    }
  }

  /**
   * Export as PNG image
   * Captures current canvas as downloadable image
   */
  exportPNG() {
    this.canvas.toBlob(blob => {
      const filename = `blockforge-[studio]-${Date.now()}.png`;
      FileUtils.downloadBlob(blob, filename);
    });
  }

  /**
   * Export as CSV parts list
   * Generates brick inventory with quantities and colors
   */
  exportCSV() {
    const csv = Exporters.toCSV(this.brickLayout, {
      includeColors: true
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const filename = `blockforge-[studio]-parts.csv`;
    FileUtils.downloadBlob(blob, filename);
  }

  /**
   * Export as HTML build instructions
   * Generates printable instructions page
   */
  async exportHTML() {
    const html = Exporters.toHTML(this.brickLayout, {
      title: `BlockForge [Studio Name]`,
      includePartsList: true,
      stepByStep: false,
      interactive: false
    });
    
    const blob = new Blob([html], { type: 'text/html' });
    const filename = `blockforge-[studio]-instructions.html`;
    FileUtils.downloadBlob(blob, filename);
  }
}

// Export plugin class as default
export default [StudioName]Studio;
```

---

### Template: README.md (Studio Documentation)

```markdown
# [Studio Name] Plugin

[Brief description of what this studio does]

## Features

- **[Feature 1]:** [Description]
- **[Feature 2]:** [Description]
- **[Feature 3]:** [Description]
- **Exports:** PNG, CSV, HTML

## Usage

1. [Step 1]
2. [Step 2]
3. [Step 3]
4. Click "Generate"
5. Export in preferred format

## Exports

### PNG Image
[What the PNG contains]

### CSV Parts List
[What's in the CSV - brick types, quantities, etc.]

### HTML Instructions
[What the HTML includes - parts list, dimensions, etc.]

## Technical Details

### Input Processing
[How input is converted to voxels]

### Brick Optimization
[What optimization strategy is used]

### Rendering Style
[How the canvas preview is rendered]

## Implementation Notes

### What's in Shared Library
- `Voxelizer.[method]()` - [Description]
- `BrickOptimizer.optimize()` - [Description]
- `Exporters` - [Which export methods]

### What's Plugin-Specific
- [Unique algorithms/data]
- [Custom rendering logic]
- [Event handlers]

## Performance

- **Processing Time:** [Typical time for average input]
- **Memory Usage:** [Rough estimate for large inputs]
- **Browser Compatibility:** [Any known issues]

## Future Enhancements

Potential improvements:
- [ ] [Enhancement idea 1]
- [ ] [Enhancement idea 2]
- [ ] [Enhancement idea 3]

## Credits

Created as part of BlockForge Platform migration.  
Original standalone version: `[filename].html` ([LOC] lines)  
Plugin version: `[studio-id].js` ([LOC] lines)
```

---

## Migration Process

### Timeline: ~60 Minutes Per Studio

**Phase A: Audit (10 min)**
**Phase B: Setup (5 min)**
**Phase C: Extract & Implement (30 min)**
**Phase D: Test (10 min)**
**Phase E: Document (5 min)**

---

### Phase A: Audit Original HTML (10 min)

Open the original standalone HTML file and identify:

#### ✅ Checklist

- [ ] **Input types** - What does user provide? (image, text, file, data)
- [ ] **Unique algorithms** - Custom logic not in shared library
- [ ] **Dependencies** - External libraries (CDN scripts, npm packages)
- [ ] **UI controls** - Sliders, dropdowns, checkboxes, file uploads
- [ ] **Export formats** - PNG, CSV, HTML, PDF, STL, etc.
- [ ] **Rendering style** - Canvas 2D, WebGL, SVG, isometric, 3D
- [ ] **Data files** - Fonts, palettes, lookup tables
- [ ] **Performance notes** - Heavy computation, async operations

#### 📝 Audit Template

```markdown
## [Studio Name] Audit

**Input Types:**
- [ ] File upload (image/model/data)
- [ ] Text input
- [ ] Sliders/ranges
- [ ] Dropdowns
- [ ] Color pickers

**Unique Algorithms:**
1. [Algorithm name] - [Line numbers in HTML]
2. [Algorithm name] - [Line numbers in HTML]

**Dependencies:**
- [Library name] - [CDN URL or npm package]

**UI Controls:**
| Control Type | ID/Name | Purpose |
|--------------|---------|---------|
| Range slider | width   | Set mosaic width |
| File input   | upload  | Load image |

**Export Formats:**
- [ ] PNG
- [ ] CSV
- [ ] HTML
- [ ] PDF
- [ ] STL
- [ ] Other: ___

**Rendering:**
- Style: [2D canvas / isometric / 3D]
- Special effects: [Shadows, highlights, gradients]

**Data Files:**
- [filename.js] - [What it contains]

**Performance Notes:**
- [Any heavy computations]
- [Async operations needed]
```

---

### Phase B: Setup Plugin Structure (5 min)

#### Step 1: Copy Template

```bash
cd plugins
cp -r ../STUDIO_TEMPLATE [new-studio-name]
cd [new-studio-name]
```

#### Step 2: Rename Files

```bash
# Rename the main plugin file
mv studio-template.js [studio-id].js
```

#### Step 3: Update manifest.json

Open `manifest.json` and fill in:

```json
{
  "id": "[studio-id]",           // ← Match folder name
  "name": "[Display Name]",       // ← Human-readable
  "version": "1.0.0",
  "description": "[One-line description]",
  "entry": "[studio-id].js",      // ← Match renamed file
  
  "ui": {
    "tools": [
      // ← Copy from audit notes
    ],
    "panels": [
      {"id": "preview", "title": "Preview", "type": "canvas"},
      {"id": "stats", "title": "Stats", "type": "html"}
    ]
  }
}
```

---

### Phase C: Extract & Implement (30 min)

#### Step 1: Extract Data Files (5 min)

Move any data to `assets/`:

```bash
# Example: Font data
cp ../original-demo/font-data.js assets/

# Example: Color palette
cp ../original-demo/palette.js assets/
```

Update imports in plugin file:

```javascript
import { FONT_DATA } from './assets/font-data.js';
import { PALETTE } from './assets/palette.js';
```

---

#### Step 2: Identify Shared vs. Plugin Code (5 min)

**Extract to Shared Library IF:**

- ✅ Used by 2+ studios
- ✅ Manipulates voxels or bricks
- ✅ Pure algorithm (no DOM interaction)
- ✅ Reusable utility function

**Keep in Plugin IF:**

- ✅ Studio-specific algorithm
- ✅ UI rendering (canvas drawing)
- ✅ Event handlers
- ✅ DOM manipulation
- ✅ Only used by this one studio

**Decision Examples:**

| Code | Shared or Plugin? | Reason |
|------|-------------------|--------|
| Text → voxel grid | **Shared** | Voxelizer.fromText() used by multiple studios |
| K-means clustering | **Shared** | Algorithm usable by any studio |
| Draw brick with studs | **Plugin** | Rendering is studio-specific visual style |
| QR code generation | **Plugin** | External library, only QR Studio needs it |
| Color palette matching | **Shared** | ColorUtils - universally useful |
| Event handler setup | **Plugin** | Wires manifest to specific UI |

---

#### Step 3: Extend Shared Library If Needed (10 min)

If the studio needs a new Voxelizer method:

```javascript
// In: src/shared/voxelizer.js

/**
 * New method for [Studio Name]
 */
static from[NewType](input, options = {}) {
  const {
    // extract options
  } = options;
  
  // Create voxel grid
  const voxelGrid = new VoxelGrid(width, height, depth);
  
  // Fill voxel grid
  // ... algorithm here ...
  
  return voxelGrid;
}
```

**Common Extensions:**

- `Voxelizer.fromHeightMap()` - Relief Studio
- `Voxelizer.from3DModel()` - 3D Studio
- `BrickOptimizer.optimizeWithBonding()` - Mosaic Studio structural patterns

---

#### Step 4: Implement Plugin Class (15 min)

Fill in the template TODOs:

## A Constructor - Set Initial State

```javascript
constructor() {
  // Replace [mainInput] with actual property
  this.image = null;  // or this.text, this.modelData, etc.
  
  // Add settings from manifest
  this.width = 48;
  this.colorCount = 20;
  this.maxHeight = 6;
  
  // Keep these
  this.voxelGrid = null;
  this.brickLayout = null;
  this.canvas = null;
  this.ctx = null;
}
```

## B) setupEventListeners() - Wire Manifest Tools**

```javascript
setupEventListeners() {
  // File upload
  const fileInput = document.getElementById('file-upload'); // ← manifest tool ID
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      this.image = await FileUtils.loadImage(e.target.files[0]);
      this.render();
    });
  }
  
  // Range slider
  const widthSlider = document.getElementById('width'); // ← manifest tool ID
  if (widthSlider) {
    widthSlider.addEventListener('change', (e) => {
      this.width = parseInt(e.target.value);
      if (this.image) this.render();
    });
  }
  
  // Repeat for all manifest tools
}
```

## C) render() - Core Pipeline

```javascript
render() {
  console.log('🎨 Rendering [studio]');
  
  if (!this.image) {
    this.clearCanvas();
    return;
  }
  
  // 1. Voxelize
  this.voxelGrid = Voxelizer.fromImage(this.image, this.width, {
    colorCount: this.colorCount,
    palette: PALETTE
  });
  
  // 2. Optimize
  this.brickLayout = BrickOptimizer.optimize(this.voxelGrid, {
    allowTiles: true,
    colorMatch: true
  });
  
  // 3. Render
  this.renderToCanvas();
  
  // 4. Stats
  this.updateStats();
}
```

## D) renderToCanvas() - Studio-Specific Visuals

Choose rendering style from template or create custom.

---

### Phase D: Test (10 min)

#### Test Checklist

```bash
# 1. Scan plugins
npm run scan-plugins
# ✅ Should show: "✅ [Your Studio] (studio-id) - v1.0.0"

# 2. Start dev server
npm run dev
# ✅ Browser opens to localhost:3000

# 3. Load plugin
# ✅ Select your studio from dropdown
# ✅ Console shows: "✅ [Your Studio] initialized"

# 4. Test input
# ✅ Upload file / enter text
# ✅ Console shows: "🎨 Rendering [studio]"
# ✅ Canvas displays output

# 5. Test controls
# ✅ Change sliders/dropdowns
# ✅ Output updates

# 6. Test exports
# ✅ Click "Download PNG" - file downloads
# ✅ Click "Download CSV" - parts list downloads
# ✅ Click "Download HTML" - instructions download

# 7. Test plugin switching
# ✅ Switch to another studio - works
# ✅ Switch back - still works
```

#### Common Issues

**Canvas Not Showing:**

- Check canvas ID matches `getElementById()` call
- Verify canvas is appended to DOM
- Check CSS display/visibility

**Controls Don't Work:**

- Verify tool IDs in manifest match `getElementById()` calls
- Check browser console for errors
- Ensure event listeners are registered in `setupEventListeners()`

**Exports Fail:**

- Check `this.brickLayout` is not null
- Verify FileUtils.downloadBlob() is called
- Test blob creation with browser DevTools

**Plugin Won't Load:**

- Run `npm run scan-plugins` again
- Check `manifest.json` is valid JSON (use JSONLint)
- Verify `entry` field matches filename
- Check browser console for import errors

---

### Phase E: Document (5 min)

#### Step 1: Update Plugin README

Fill in `plugins/[studio-id]/README.md` with:

- Features list
- Usage instructions
- Export format descriptions
- Technical implementation details
- Performance notes

#### Step 2: Update Main README

In root `README.md`, add to "Available Studios" section:

```markdown
#### [Studio Name] ✅ (MIGRATED)
- **Status:** Fully functional
- **Features:** [Brief feature list]
- **Exports:** PNG, CSV, HTML
- **Lines of Code:** [New LOC] (down from [Old LOC] in standalone)
- **Dependencies:** [If any external libs]
```

Update progress tracker:

```markdown
**Phase 2 Progress:** [X]/6 tasks complete ([%]%)
```

#### Step 3: Commit

```bash
git add .
git commit -m "Task 2-[X] complete: [Studio Name] migrated

IMPLEMENTED:
- [Studio Name] plugin with [key feature]
- [Shared library addition if any]
- [Unique algorithms]

TESTED:
- All three export formats working
- [Specific test cases]

STATS:
- [Old LOC] LOC → [New LOC] LOC ([%]% reduction)
"

git push
```

---

## Shared Library Decision Tree

Use this flowchart to decide where code belongs:

```txt
┌─────────────────────────────────────┐
│ Is this code used by 2+ studios?   │
└──────────┬────────────────┬─────────┘
           │ YES            │ NO
           ▼                ▼
    ┌────────────┐   ┌──────────────┐
    │ EXTRACT TO │   │ KEEP IN      │
    │ SHARED LIB │   │ PLUGIN       │
    └────────────┘   └──────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Does it manipulate voxels/bricks?   │
└──────────┬────────────────┬─────────┘
           │ YES            │ NO
           ▼                ▼
    ┌────────────┐   ┌──────────────┐
    │ Voxelizer  │   │ Utils folder │
    │ or Brick   │   │ (color,      │
    │ Optimizer  │   │ geometry,    │
    └────────────┘   │ files, etc.) │
                     └──────────────┘
```

### Specific Decisions

| Code Type | Location | Example |
|-----------|----------|---------|
| Input → Voxels | `Voxelizer.from[Type]()` | Text to grid, image to grid |
| Voxels → Bricks | `BrickOptimizer.optimize()` | Greedy packing, structural bonding |
| Color operations | `ColorUtils` | Hex/RGB conversion, palette matching |
| File I/O | `FileUtils` | Image loading, blob downloads |
| Export generation | `Exporters` | CSV, HTML, PDF creation |
| Canvas rendering | Plugin | Drawing studs, isometric, custom styles |
| Event handlers | Plugin | Wiring manifest tools to functions |
| UI updates | Plugin | Updating stats display, panels |
| External libraries | Plugin (usually) | QRCode.js, Three.js, jsPDF |
| Data files | Plugin `assets/` | Fonts, palettes, lookup tables |

---

## Common Patterns

### Pattern 1: Image-Based Studios

**Examples:** Mosaic, Relief, Architect

**Standard Flow:**

1. Upload image via `<input type="file">`
2. Load with `FileUtils.loadImage()`
3. Voxelize with `Voxelizer.fromImage()` or `fromHeightMap()`
4. Optimize with `BrickOptimizer.optimize()`
5. Render to canvas (studio-specific style)

**Template Code:**

```javascript
// In setupEventListeners()
const fileInput = document.getElementById('file-upload');
fileInput.addEventListener('change', async (e) => {
  this.image = await FileUtils.loadImage(e.target.files[0]);
  this.render();
});

// In render()
this.voxelGrid = Voxelizer.fromImage(this.image, this.width, {
  colorCount: this.colorCount,
  palette: PALETTE
});
```

---

### Pattern 2: Text-Based Studios

**Examples:** Sign, Vertical Sign

**Standard Flow:**

1. Text input via `<input type="text">`
2. Font data in `assets/font-data.js`
3. Voxelize with `Voxelizer.fromText()`
4. Optimize (usually needs custom border/padding logic)
5. Render square bricks with studs

**Template Code:**

```javascript
// In setupEventListeners()
const textInput = document.getElementById('text-input');
textInput.addEventListener('input', (e) => {
  this.text = e.target.value.toUpperCase();
  this.render();
});

// In render()
this.voxelGrid = Voxelizer.fromText(this.text, FONT_DATA, {
  spacing: 1,
  padding: this.padding,
  borderWidth: this.borderWidth,
  color: this.textColor
});
```

---

### Pattern 3: Data-Based Studios

**Examples:** QR Studio

**Standard Flow:**

1. Text/structured data input
2. Generate data format (QR matrix, encoded string, etc.)
3. Convert to voxel grid
4. Render (often with special style requirements)

**Template Code:**

```javascript
// In render()
// Step 1: Generate data (e.g., QR code)
const qrMatrix = this.generateQRMatrix(this.qrData);

// Step 2: Convert to voxels
this.voxelGrid = Voxelizer.fromQRCode(qrMatrix, {
  fgColor: { r: 0, g: 0, b: 0 },
  bgColor: { r: 255, g: 255, b: 255 }
});

// Step 3: No optimization (precision needed)
this.brickLayout = BrickOptimizer.optimize(this.voxelGrid, {
  allowTiles: true,
  colorMatch: true
});
```

---

### Pattern 4: External Library Integration

**Examples:** QR Studio (QRCode.js), 3D Studio (Three.js)

**Loading Pattern:**

```javascript
async init() {
  console.log('✅ [Studio] initialized');
  
  // Load external library
  await this.loadExternalLibrary();
  
  // Continue init
  this.canvas = document.getElementById('canvas');
  this.setupEventListeners();
}

async loadExternalLibrary() {
  return new Promise((resolve, reject) => {
    if (window.LibraryName) {
      console.log('✓ Library already loaded');
      resolve();
      return;
    }

    console.log('⏳ Loading library from CDN...');
    const script = document.createElement('script');
    script.src = 'https://cdn.example.com/library.min.js';
    script.onload = () => {
      console.log('✓ Library loaded');
      resolve();
    };
    script.onerror = () => {
      console.error('✗ Failed to load library');
      reject(new Error('Library load failed'));
    };
    document.head.appendChild(script);
  });
}
```

---

## Testing Checklist

### Pre-Migration Test (Original HTML)

Test the original standalone HTML to document expected behavior:

- [ ] What inputs work? (test files, text, edge cases)
- [ ] What does the output look like?
- [ ] What are the export filenames?
- [ ] Any browser console warnings/errors?
- [ ] Performance with large inputs?

Document as "Expected Behavior" to compare against migrated version.

---

### Post-Migration Test

#### ✅ Core Functionality

- [ ] Plugin appears in dropdown
- [ ] Selecting plugin shows correct UI
- [ ] Console shows initialization message
- [ ] Input controls are responsive
- [ ] Canvas displays preview
- [ ] Stats panel updates correctly

#### ✅ Input Handling

- [ ] File upload works
- [ ] Text input works
- [ ] Range sliders update live
- [ ] Dropdowns change settings
- [ ] Checkboxes toggle options
- [ ] Invalid input handled gracefully

#### ✅ Rendering

- [ ] Canvas displays output correctly
- [ ] Output matches original HTML studio
- [ ] Studs/bricks rendered properly
- [ ] Colors accurate
- [ ] Dimensions correct
- [ ] No visual glitches

#### ✅ Exports

- [ ] PNG downloads with correct filename
- [ ] CSV contains brick data
- [ ] HTML instructions are formatted
- [ ] Files open correctly
- [ ] Data is accurate

#### ✅ Edge Cases

- [ ] Empty input handled
- [ ] Very large input (performance)
- [ ] Very small input
- [ ] Invalid file types rejected
- [ ] Special characters in text
- [ ] Browser back/forward buttons

#### ✅ Plugin Switching

- [ ] Can switch to another studio
- [ ] Can switch back
- [ ] State persists appropriately
- [ ] No memory leaks
- [ ] No console errors

#### ✅ Browser Compatibility

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if accessible)
- [ ] Mobile browsers (if applicable)

---

## Troubleshooting

### Issue: Plugin Not Appearing in Dropdown

**Symptoms:**

- `npm run scan-plugins` doesn't show your plugin
- Plugin doesn't appear in browser dropdown

**Solutions:**

1. Check `manifest.json` is valid JSON (use JSONLint.com)
2. Verify folder structure: `plugins/[studio-id]/manifest.json`
3. Ensure `manifest.json` has required fields: `id`, `name`, `version`, `entry`
4. Run `npm run scan-plugins` again
5. Check console for scanner errors

---

### Issue: Canvas Not Rendering

**Symptoms:**

- Plugin loads but canvas is blank
- Console shows rendering messages but no visuals

**Solutions:**

1. Check canvas element exists: `console.log(this.canvas)`
2. Verify canvas ID matches `getElementById()` call
3. Check canvas dimensions are set: `this.canvas.width`, `this.canvas.height`
4. Ensure `renderToCanvas()` is being called
5. Check for JavaScript errors in console
6. Verify `this.brickLayout` is not null when rendering

**Debug Code:**

```javascript
renderToCanvas() {
  console.log('Canvas:', this.canvas);
  console.log('Layout:', this.brickLayout);
  console.log('Bricks:', this.brickLayout?.bricks.length);
  
  if (!this.brickLayout) {
    console.error('No brick layout to render!');
    return;
  }
  
  // ... rest of rendering
}
```

---

### Issue: Event Handlers Not Working

**Symptoms:**

- Clicking controls does nothing
- No console messages when interacting

**Solutions:**

1. Check element IDs match manifest tool IDs
2. Verify `setupEventListeners()` is called in `init()`
3. Check elements exist: `console.log(document.getElementById('tool-id'))`
4. Ensure event type is correct: `'change'` vs `'input'` vs `'click'`
5. Check for JavaScript errors preventing listener registration

**Debug Code:**

```javascript
setupEventListeners() {
  const input = document.getElementById('my-input');
  console.log('Input element:', input); // Should not be null
  
  if (input) {
    input.addEventListener('change', (e) => {
      console.log('Input changed:', e.target.value);
      this.render();
    });
  } else {
    console.error('Input element not found!');
  }
}
```

---

### Issue: Exports Failing

**Symptoms:**

- Export buttons don't download files
- Console shows errors on export

**Solutions:**

1. Check `this.brickLayout` exists before exporting
2. Verify `FileUtils.downloadBlob()` is imported correctly
3. Test blob creation manually in console
4. Check for popup blocker (may block downloads)
5. Ensure filenames are valid (no special characters)

**Debug Code:**

```javascript
exportPNG() {
  console.log('Exporting PNG...');
  console.log('Canvas:', this.canvas);
  console.log('Brick layout:', this.brickLayout);
  
  this.canvas.toBlob(blob => {
    console.log('Blob created:', blob);
    if (!blob) {
      console.error('Failed to create blob!');
      return;
    }
    
    const filename = `test-export-${Date.now()}.png`;
    console.log('Downloading:', filename);
    FileUtils.downloadBlob(blob, filename);
  });
}
```

---

### Issue: Shared Library Import Errors

**Symptoms:**

- Console error: "Failed to resolve module specifier"
- Plugin doesn't load

**Solutions:**

1. Check import path is correct: `'../../src/shared/index.js'`
2. Verify shared library exports match imports
3. Ensure Vite glob pattern includes plugin files
4. Check for typos in import names
5. Clear browser cache / hard refresh

**Check Imports:**

```javascript
// In plugin file
import { 
  Voxelizer,      // ← Check spelling
  BrickOptimizer, // ← Check spelling
  ColorUtils,     // ← Check spelling
  FileUtils,      // ← Check spelling
  Exporters       // ← Check spelling
} from '../../src/shared/index.js'; // ← Check path
```

**Check Exports:**

```javascript
// In src/shared/index.js
export { Voxelizer, VoxelGrid } from './voxelizer.js';
export { BrickOptimizer, BrickLayout, Brick } from './brick-optimizer.js';
export { ColorUtils } from './utils/color.js';
export { FileUtils } from './utils/files.js';
export { Exporters } from './exporters.js';
```

---

### Issue: Performance Problems

**Symptoms:**

- UI freezes on large inputs
- Browser becomes unresponsive
- Memory leaks over time

**Solutions:**

1. Add loading indicators for long operations
2. Use `requestAnimationFrame` for rendering
3. Implement progressive loading for large files
4. Add debouncing to input handlers
5. Clean up resources in `dispose()` method

**Optimization Patterns:**

```javascript
// Debounce text input
setupEventListeners() {
  let timeout;
  const textInput = document.getElementById('text-input');
  
  textInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      this.text = e.target.value;
      this.render();
    }, 300); // Wait 300ms after typing stops
  });
}

// Progressive rendering for large datasets
renderToCanvas() {
  const chunks = this.chunkBricks(this.brickLayout.bricks, 100);
  let index = 0;
  
  const renderChunk = () => {
    if (index >= chunks.length) return;
    
    const chunk = chunks[index];
    chunk.forEach(brick => this.drawBrick(brick));
    
    index++;
    requestAnimationFrame(renderChunk);
  };
  
  renderChunk();
}
```

---

## Quick Reference

### File Paths Cheat Sheet

```txt
BlockForge_platform/
├── plugins/
│   └── [studio-id]/
│       ├── manifest.json              ← Plugin config
│       ├── [studio-id].js             ← Main plugin class
│       ├── assets/                    ← Data files
│       │   ├── font-data.js
│       │   └── palette.js
│       └── README.md                  ← Documentation
├── src/
│   ├── shared/
│   │   ├── voxelizer.js               ← Import: Voxelizer, VoxelGrid
│   │   ├── brick-optimizer.js         ← Import: BrickOptimizer, BrickLayout, Brick
│   │   ├── exporters.js               ← Import: Exporters
│   │   ├── utils/
│   │   │   ├── color.js               ← Import: ColorUtils
│   │   │   └── files.js               ← Import: FileUtils
│   │   └── index.js                   ← Barrel export (import from here)
│   ├── core/
│   │   └── plugin-loader.js           ← Platform code (don't modify)
│   ├── main.js                        ← Platform code (don't modify)
│   └── index.html                     ← Platform code (don't modify)
└── scripts/
    └── scan-plugins.js                ← Run: npm run scan-plugins
```

---

### Import Statements

```javascript
// Import shared library (in plugin file)
import { 
  Voxelizer, 
  VoxelGrid,
  BrickOptimizer, 
  BrickLayout, 
  Brick,
  ColorUtils,
  FileUtils,
  Exporters
} from '../../src/shared/index.js';

// Import plugin assets
import { FONT_DATA } from './assets/font-data.js';
import { PALETTE } from './assets/palette.js';
```

---

### Manifest Tool Types

```json
{
  "tools": [
    {
      "id": "text-input",
      "type": "text",
      "label": "Text",
      "placeholder": "Enter text",
      "maxLength": 12,
      "default": "HELLO"
    },
    {
      "id": "file-upload",
      "type": "file",
      "label": "Upload Image",
      "accept": "image/*"
    },
    {
      "id": "width-slider",
      "type": "range",
      "label": "Width",
      "min": 16,
      "max": 128,
      "default": 48
    },
    {
      "id": "size-dropdown",
      "type": "select",
      "label": "Size",
      "options": [
        {"value": "small", "label": "Small"},
        {"value": "large", "label": "Large"}
      ],
      "default": "small"
    },
    {
      "id": "invert-checkbox",
      "type": "checkbox",
      "label": "Invert",
      "default": false
    },
    {
      "id": "color-picker",
      "type": "color",
      "label": "Color",
      "default": "#000000"
    }
  ]
}
```

---

### Event Handler Patterns

```javascript
// Text input
const textInput = document.getElementById('text-input');
textInput.addEventListener('input', (e) => {
  this.text = e.target.value;
  this.render();
});

// File upload
const fileInput = document.getElementById('file-upload');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    this.image = await FileUtils.loadImage(file);
    this.render();
  }
});

// Range slider
const slider = document.getElementById('width-slider');
slider.addEventListener('change', (e) => {
  this.width = parseInt(e.target.value);
  if (this.image) this.render();
});

// Select dropdown
const select = document.getElementById('size-dropdown');
select.addEventListener('change', (e) => {
  this.size = e.target.value;
  this.render();
});

// Checkbox
const checkbox = document.getElementById('invert-checkbox');
checkbox.addEventListener('change', (e) => {
  this.invert = e.target.checked;
  this.render();
});

// Color picker
const colorPicker = document.getElementById('color-picker');
colorPicker.addEventListener('change', (e) => {
  this.color = ColorUtils.hexToRGB(e.target.value);
  this.render();
});
```

---

### Voxelizer Methods

```javascript
// Text to voxels
Voxelizer.fromText(text, fontData, {
  spacing: 1,
  padding: 2,
  borderWidth: 2,
  color: { r, g, b }
});

// Image to voxels (mosaic)
Voxelizer.fromImage(image, targetWidth, {
  colorCount: 20,
  palette: PALETTE
});

// QR code matrix to voxels
Voxelizer.fromQRCode(qrMatrix, {
  fgColor: { r: 0, g: 0, b: 0 },
  bgColor: { r: 255, g: 255, b: 255 }
});

// Image to height map (relief)
Voxelizer.fromHeightMap(image, targetWidth, {
  maxHeight: 6,
  invert: false
});

// 3D model to voxels
Voxelizer.fromModel(modelData, resolution, {
  // options
});
```

---

### BrickOptimizer Options

```javascript
BrickOptimizer.optimize(voxelGrid, {
  allowTiles: true,     // Use flat tile pieces
  allowDots: false,     // Use 1x1 round dots
  colorMatch: true      // Only combine same colors
});
```

---

### Canvas Rendering Snippets

```javascript
// Set canvas size
this.canvas.width = width * studSize;
this.canvas.height = height * studSize;

// Clear canvas
this.ctx.fillStyle = '#f8f9fa';
this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

// Draw brick base
this.ctx.fillStyle = ColorUtils.rgbToHex(brick.color);
this.ctx.fillRect(x, y, width, height);

// Draw circular stud
this.ctx.beginPath();
this.ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
this.ctx.fillStyle = color;
this.ctx.fill();

// Draw stud highlight
this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
this.ctx.beginPath();
this.ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
this.ctx.fill();

// Draw stud shadow
this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
this.ctx.beginPath();
this.ctx.arc(x + 1, y + 1, radius, 0, Math.PI * 2);
this.ctx.fill();
```

---

### FileUtils Methods

```javascript
// Load image file
const image = await FileUtils.loadImage(file);

// Load text file
const text = await FileUtils.loadText(file);

// Load JSON file
const data = await FileUtils.loadJSON(file);

// Download blob as file
FileUtils.downloadBlob(blob, filename);
```

---

### Exporters Methods

```javascript
// Export to CSV
const csv = Exporters.toCSV(brickLayout, {
  includeColors: true
});

// Export to HTML
const html = Exporters.toHTML(brickLayout, {
  title: 'Build Instructions',
  includePartsList: true,
  stepByStep: false,
  interactive: false
});

// Export to PDF (if implemented)
const pdf = await Exporters.toPDF(brickLayout, {
  // options
});
```

---

### ColorUtils Methods

```javascript
// Hex to RGB
const rgb = ColorUtils.hexToRGB('#FF5722');
// Returns: { r: 255, g: 87, b: 34 }

// RGB to Hex
const hex = ColorUtils.rgbToHex(255, 87, 34);
// Returns: '#FF5722'

// Or with object:
const hex = ColorUtils.rgbToHex({ r: 255, g: 87, b: 34 });

// Color distance
const dist = ColorUtils.colorDistance(color1, color2);

// Check equality
const same = ColorUtils.equals(color1, color2);

// Interpolate
const midColor = ColorUtils.interpolate(color1, color2, 0.5);
```

---

### BrickLayout Methods

```javascript
// Get brick counts by type
const counts = brickLayout.getBrickCounts();
// Returns: { "tile-1x1": 100, "tile-1x2": 50, ... }

// Get counts by source type
const typeCounts = brickLayout.getSourceTypeCounts();
// Returns: { "text": 100, "background": 200, "border": 50 }

// Get color counts
const colorCounts = brickLayout.getColorCounts();

// Get bounding box
const bounds = brickLayout.getBounds();
// Returns: { min: {x, y, z}, max: {x, y, z} }

// Get total bricks
const total = brickLayout.getTotalBricks();
```

---

### Common npm Commands

```bash
# Install dependencies
npm install

# Scan for new plugins
npm run scan-plugins

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

### Git Workflow

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Task 2-X complete: [Studio Name] migrated"

# Push to GitHub
git push

# Create new branch for experimentation
git checkout -b feature/[studio-name]

# Switch back to main
git checkout main
```

---

## Appendix: Example Migrations

### Example 1: Sign Studio (Simple Text-Based)

**Original:** 700 LOC standalone HTML  
**Migrated:** 270 LOC plugin  
**Time:** 45 minutes

**Key Extractions:**

- `Voxelizer.fromText()` - Text to voxel grid with 5x5 font
- Font data moved to `assets/font-data.js`
- Canvas rendering with circular studs
- Border/padding logic integrated into voxelization

**Lessons Learned:**

- sourceType tracking needed for accurate stats
- Event listeners need debouncing for text input
- Canvas size calculation critical for layout

---

### Example 2: QR Studio (External Library Integration)

**Original:** 850 LOC standalone HTML  
**Migrated:** 350 LOC plugin  
**Time:** 40 minutes

**Key Extractions:**

- `Voxelizer.fromQRCode()` - QR matrix to voxel grid
- Dynamic QRCode.js loading from CDN
- Circular stud-only rendering (no brick outlines)
- WiFi/Contact encoding helpers

**Lessons Learned:**

- External libraries can be loaded on-demand
- No brick optimization needed (1x1 precision for scanning)
- Different rendering style (circles vs squares)

---

### Example 3: Mosaic Studio (Image Processing)

**Original:** 750 LOC standalone HTML  
**Migrated:** 180 LOC plugin  
**Time:** 40 minutes

**Key Extractions:**

- `Voxelizer.fromImage()` - Image downsampling and color quantization
- K-means clustering algorithm
- 48-color LEGO palette in `assets/mosaic-palette.js`
- Color matching to palette

**Lessons Learned:**

- Image processing is compute-intensive (needs loading indicator)
- K-means iterations can be optimized
- Palette matching is critical for realistic output

---

## Resources

### Documentation

- [Plugin Manifest Schema](../PLUGIN_MANIFEST_SCHEMA.md)
- [Shared Library Architecture](../SHARED_LIBRARY_ARCHITECTURE.md)
- [Plugin Lifecycle Examples](../PLUGIN_LIFECYCLE_EXAMPLES.md)

### Tools

- [JSONLint](https://jsonlint.com/) - Validate manifest.json
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Vite Docs](https://vitejs.dev/) - Build tool reference

### Libraries

- [Three.js](https://threejs.org/) - 3D rendering (for 3D Studio, Vertical Sign)
- [QRCode.js](https://davidshimjs.github.io/qrcodejs/) - QR generation (for QR Studio)
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation (optional enhancement)

---

## Changelog

**v1.0.0** - December 2024

- Initial template and guide created
- Based on Sign, QR, and Mosaic Studio migrations
- Includes complete plugin skeleton and migration process

---

**Built with ☕ and systematic refactoring.**

Let's turn those HTML demos into a professional plugin platform. 🚀
