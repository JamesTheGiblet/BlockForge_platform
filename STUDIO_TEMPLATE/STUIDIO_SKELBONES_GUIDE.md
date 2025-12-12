# [Studio Plugin Template Guide]

This document provides a skeleton and instructions for creating a new BlockForge Studio plugin.

## [STUDIO NAME] Plugin

[DESCRIPTION]

import {
  Voxelizer,
  BrickOptimizer,
  ColorUtils,
  FileUtils,
  Exporters
} from '../../src/shared/index.js';

class [StudioName]Studio {
  constructor() {
    // State
    this.[mainInput] = null;

    // Generated data
    this.voxelGrid = null;
    this.brickLayout = null;
    
    // DOM references
    this.canvas = null;
    this.ctx = null;
  }

  /**

* Initialize plugin
   */
  async init() {
    console.log('✅ [Studio Name] initialized');

    // Get canvas
    this.canvas = document.getElementById('[canvas-id]');
    this.ctx = this.canvas?.getContext('2d');

    // Setup event listeners
    this.setupEventListeners();

    // Initial render (if needed)
    // this.render();
  }

  /**

* Setup event listeners for UI controls
   */
  setupEventListeners() {
    // TODO: Wire up manifest.json tool IDs to handlers

    // Example: File upload
    const fileInput = document.getElementById('[tool-id]');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        // Handle input
        this.render();
      });
    }
  }

  /**

* Main render function
   */
  render() {
    console.log('🎨 Rendering [studio name]');

    if (!this.[mainInput]) {
      this.clearCanvas();
      return;
    }

    // 1. Voxelize input
    this.voxelGrid = Voxelizer.from[InputType](this.[mainInput], {
      // options
    });

    // 2. Optimize to bricks
    this.brickLayout = BrickOptimizer.optimize(this.voxelGrid, {
      allowTiles: true,
      colorMatch: true
    });

    // 3. Render to canvas
    this.renderToCanvas();

    // 4. Update stats
    this.updateStats();
  }

  /**

* Render brick layout to canvas
   */
  renderToCanvas() {
    if (!this.brickLayout) return;

    // TODO: Implement rendering logic
  }

  /**

* Update stats display
   */
  updateStats() {
    if (!this.brickLayout) return;

    const typeCounts = this.brickLayout.getSourceTypeCounts();
    const total = this.brickLayout.getTotalBricks();

    // TODO: Update DOM elements
  }

  /**

* Clear canvas
   */
  clearCanvas() {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**

* Export function
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

* Export as PNG
   */
  exportPNG() {
    this.canvas.toBlob(blob => {
      const filename = `blockforge-[studio]-${Date.now()}.png`;
      FileUtils.downloadBlob(blob, filename);
    });
  }

  /**

* Export as CSV parts list
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

* Export as HTML instructions
   */
  async exportHTML() {
    const html = Exporters.toHTML(this.brickLayout, {
      title: `BlockForge [Studio Name]`,
      includePartsList: true
    });

    const blob = new Blob([html], { type: 'text/html' });
    const filename = `blockforge-[studio]-instructions.html`;
    FileUtils.downloadBlob(blob, filename);
  }
}

// Export plugin class
export default [StudioName]Studio;
