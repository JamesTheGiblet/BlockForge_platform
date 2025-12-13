import { 
  Voxelizer, 
  BrickOptimizer, 
  FileUtils,
  Exporters,
  ColorUtils,
  LegoColors
} from '@shared/index.js';

// Internal state
const DEFAULT_STATE = {
  image: null,
  width: 48,
  colorLimit: 32,
  ditheringAlgo: 'floyd-steinberg',
  paletteCategory: 'opaque',
  brickLayout: null,
  isProcessing: false
};

export default class MosaicStudio {
  constructor() {
    this.state = { ...DEFAULT_STATE };
    this.canvas = null;
    this.ctx = null;
    this.platformApi = null;
  }

  /**
   * Initialize the plugin
   */
  async init(api) {
    console.log('✅ Mosaic Studio initialized');
    
    // Reset state to defaults when switching back to this studio
    this.state = { ...DEFAULT_STATE };
    this.platformApi = api;
    
    // Try to find the canvas defined in ui-panels.json (assuming id="mosaic-canvas" or similar)
    // If not found, we create an off-screen one for processing/export purposes
    this.canvas = document.getElementById('mosaic-canvas');
    
    if (!this.canvas) {
      // Fallback: Create a canvas but don't attach it if the UI doesn't have a slot
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'mosaic-canvas'; 
    }
    
    this.ctx = this.canvas.getContext('2d');

    // Clear canvas to ensure "Upload" placeholder is visible
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.width = 0;
      this.canvas.height = 0;
    }
  }

  /**
   * Handle UI tool changes
   */
  async onToolChange(toolId, value, api) {
    console.log(`Tool Update: ${toolId}`, value);

    switch (toolId) {
      case 'sourceImage':
        if (value) {
          // Value is likely a File object
          this.state.image = await FileUtils.loadImage(value);
          this.render();
        }
        break;

      case 'width':
        this.state.width = parseInt(value, 10);
        this.render();
        break;

      case 'colorLimit':
        this.state.colorLimit = parseInt(value, 10);
        this.render();
        break;

      case 'ditheringAlgo':
        // Normalize string (e.g., "Floyd-Steinberg" -> "floyd-steinberg")
        this.state.ditheringAlgo = value.toLowerCase().replace(' ', '-');
        this.render();
        break;
    }
  }

  /**
   * Handle UI actions (buttons)
   */
  async onAction(actionId, api) {
    if (!this.state.brickLayout) {
      console.warn('No mosaic generated to export');
      return;
    }

    switch (actionId) {
      case 'exportPng':
        this.canvas.toBlob(blob => {
          FileUtils.downloadBlob(blob, 'blockforge-mosaic.png');
        });
        break;

      case 'exportCsv':
        const csv = Exporters.toCSV(this.state.brickLayout, { includeColors: true });
        FileUtils.downloadBlob(new Blob([csv], { type: 'text/csv' }), 'blockforge-mosaic.csv');
        break;

      case 'exportHtml':
        const html = Exporters.toHTML(this.state.brickLayout, {
          title: 'BlockForge Mosaic',
          includePartsList: true
        });
        FileUtils.downloadBlob(new Blob([html], { type: 'text/html' }), 'blockforge-mosaic.html');
        break;
    }
  }

  /**
   * Core rendering logic
   */
  render() {
    // Re-acquire canvas if it's missing or detached from DOM
    if (!this.canvas || !this.canvas.isConnected) {
      const el = document.getElementById('mosaic-canvas');
      if (el) {
        this.canvas = el;
        this.ctx = this.canvas.getContext('2d');
      }
    }

    if (!this.state.image || !this.ctx) return;
    
    console.log('🎨 Rendering mosaic', this.state);

    // Get colors based on category (defaulting to opaque for now)
    const sourceColors = LegoColors.getColorsByCategory(this.state.paletteCategory);

    // Map to palette format expected by Voxelizer
    const palette = sourceColors.map(c => ({
      r: c.rgb.r,
      g: c.rgb.g,
      b: c.rgb.b,
      id: c.id,
      name: c.name
    }));

    // Voxelize image
    const voxelGrid = Voxelizer.fromImage(this.state.image, this.state.width, {
      colorCount: this.state.colorLimit,
      palette: palette,
      similarityThreshold: 60,
      dither: this.state.ditheringAlgo
    });

    // Optimize with brick bonding
    this.state.brickLayout = BrickOptimizer.optimize(voxelGrid, {
      allowTiles: true,
      allowDots: false,
      colorMatch: true
    });

    this.renderToCanvas();
    this.updateStats();
  }

  renderToCanvas() {
    if (!this.state.brickLayout || !this.canvas || !this.ctx) return;

    const bounds = this.state.brickLayout.getBounds();
    const width = bounds.max.x - bounds.min.x + 1;
    const height = bounds.max.y - bounds.min.y + 1;
    const studSize = 12;

    this.canvas.width = width * studSize;
    this.canvas.height = height * studSize;

    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.state.brickLayout.bricks.forEach(brick => {
      const x = (brick.position.x - bounds.min.x) * studSize;
      const y = (brick.position.y - bounds.min.y) * studSize;
      const dims = brick.getDimensions();
      const brickWidth = dims.width * studSize;

      const colorHex = ColorUtils.rgbToHex(brick.color);

      // Brick base
      this.ctx.fillStyle = colorHex;
      this.ctx.fillRect(x + 1, y + 1, brickWidth - 2, studSize - 2);

      // Studs
      for (let i = 0; i < dims.width; i++) {
        const sx = x + i * studSize + studSize / 2;
        const sy = y + studSize / 2;
        const r = studSize * 0.35;

        // Shadow
        this.ctx.beginPath();
        this.ctx.arc(sx + 1, sy + 1, r, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fill();

        // Main stud
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, r, 0, Math.PI * 2);
        this.ctx.fillStyle = colorHex;
        this.ctx.fill();

        // Highlight
        this.ctx.beginPath();
        this.ctx.arc(sx - r * 0.3, sy - r * 0.3, r * 0.25, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
        this.ctx.fill();

        // Outline
        this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, r, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    });
  }

  updateStats() {
    if (!this.state.brickLayout) return;
    
    const total = this.state.brickLayout.getTotalBricks();
    const cost = (total * 0.10).toFixed(2); // Est. $0.10 per brick

    console.log(`📊 Mosaic Stats: ${total} bricks`);

    // Generate Parts List (BOM)
    const parts = {};
    this.state.brickLayout.bricks.forEach(brick => {
      const hex = ColorUtils.rgbToHex(brick.color);
      const dims = brick.getDimensions();
      // Assuming standard plates, depth is usually 1
      const size = `${dims.width}x${dims.depth || 1}`;
      const key = `${hex}_${size}`;

      if (!parts[key]) {
        parts[key] = {
          color: hex, // UI handles hex as color swatch
          size: size,
          quantity: 0
        };
      }
      parts[key].quantity++;
    });

    const tableData = Object.values(parts).sort((a, b) => b.quantity - a.quantity);

    if (this.platformApi) {
      this.platformApi.updateComponent('mosaic-stats', {
        totalBricks: total,
        estimatedCost: `$${cost}`
      });
      this.platformApi.updateComponent('mosaic-bom-table', tableData);
    }
  }
}