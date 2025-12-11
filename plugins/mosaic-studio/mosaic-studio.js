import { 
  Voxelizer, 
  BrickOptimizer, 
  ColorUtils,
  FileUtils,
  Exporters
} from '@shared/index.js';
import { MOSAIC_PALETTE } from './assets/mosaic-palette.js';

class MosaicStudio {
  constructor() {
    this.image = null;
    this.width = 48;
    this.colorCount = 20;
    this.ditherAlgorithm = 'floyd-steinberg';
    this.voxelGrid = null;
    this.brickLayout = null;
    this.canvas = null;
    this.ctx = null;
  }

  init() {
    console.log('✅ Mosaic Studio initialized');
    
    this.canvas = document.getElementById('signCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.setupEventListeners();
    this.syncUI();
    this.updateLabels();
  }

  /**
   * Called when plugin is reactivated
   */
  async onActivate() {
    this.syncUI();
    this.updateLabels();
    this.render();
  }

  syncUI() {
    const widthInput = document.getElementById('width');
    if (widthInput) widthInput.value = this.width;

    const colorsInput = document.getElementById('colors');
    if (colorsInput) colorsInput.value = this.colorCount;

    const ditherSelect = document.getElementById('dither');
    if (ditherSelect) ditherSelect.value = this.ditherAlgorithm;
  }

  updateLabels() {
    const l1 = document.getElementById('stat-label-1');
    const l2 = document.getElementById('stat-label-2');
    const l3 = document.getElementById('stat-label-3');
    if (l1) l1.textContent = 'Total Bricks';
    if (l2) l2.textContent = 'Unique Colors';
    if (l3) l3.textContent = 'Est. Cost';
  }

  setupEventListeners() {
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          this.image = await FileUtils.loadImage(file);
          this.render();
        }
      });
    }

    const widthInput = document.getElementById('width');
    if (widthInput) {
      widthInput.addEventListener('change', (e) => {
        this.width = parseInt(e.target.value);
        if (this.image) this.render();
      });
    }

    const colorsInput = document.getElementById('colors');
    if (colorsInput) {
      colorsInput.addEventListener('change', (e) => {
        this.colorCount = parseInt(e.target.value);
        if (this.image) this.render();
      });
    }

    const ditherSelect = document.getElementById('dither');
    if (ditherSelect) {
      ditherSelect.addEventListener('change', (e) => {
        this.ditherAlgorithm = e.target.value;
        if (this.image) this.render();
      });
    }
  }

  render() {
    console.log('🎨 Rendering mosaic');

    if (!this.image) {
      this.clearCanvas();
      return;
    }

    // Voxelize image
    this.voxelGrid = Voxelizer.fromImage(this.image, this.width, {
      colorCount: this.colorCount,
      palette: MOSAIC_PALETTE,
      similarityThreshold: 60,
      dither: this.ditherAlgorithm
    });

    // Optimize with brick bonding
    this.brickLayout = BrickOptimizer.optimize(this.voxelGrid, {
      allowTiles: true,
      allowDots: false,
      colorMatch: true
    });

    this.renderToCanvas();
    this.updateStats();
  }

  renderToCanvas() {
    if (!this.brickLayout) return;

    const bounds = this.brickLayout.getBounds();
    const width = bounds.max.x - bounds.min.x + 1;
    const height = bounds.max.y - bounds.min.y + 1;
    const studSize = 12;

    this.canvas.width = width * studSize;
    this.canvas.height = height * studSize;

    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.brickLayout.bricks.forEach(brick => {
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
    if (!this.brickLayout) return;

    const counts = this.brickLayout.getBrickCounts();
    const colorCounts = this.brickLayout.getColorCounts();
    const total = this.brickLayout.getTotalBricks();
    const costPerBrick = 0.10;
    const totalCost = (total * costPerBrick).toFixed(2);

    const textCountEl = document.getElementById('text-count');
    if (textCountEl) textCountEl.textContent = total.toLocaleString();

    const bgCountEl = document.getElementById('bg-count');
    if (bgCountEl) bgCountEl.textContent = Object.keys(colorCounts).length;

    const borderCountEl = document.getElementById('border-count');
    if (borderCountEl) borderCountEl.textContent = '$' + totalCost;

    const dimensionsEl = document.getElementById('dimensions');
    if (dimensionsEl) {
      const bounds = this.brickLayout.getBounds();
      const width = bounds.max.x - bounds.min.x + 1;
      const height = bounds.max.y - bounds.min.y + 1;
      dimensionsEl.innerHTML = `
        Dimensions: ${width}×${height} studs
      `;
    }

    console.log(`📊 Mosaic: ${total} bricks`);
  }

  clearCanvas() {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  async export(format) {
    console.log('📥 Exporting mosaic:', format);

    if (!this.brickLayout) {
      alert('Please generate a mosaic first!');
      return;
    }

    switch (format) {
      case 'png':
        this.canvas.toBlob(blob => {
          FileUtils.downloadBlob(blob, 'blockforge-mosaic.png');
        });
        break;

      case 'csv':
        const csv = Exporters.toCSV(this.brickLayout, { includeColors: true });
        FileUtils.downloadBlob(new Blob([csv], { type: 'text/csv' }), 'blockforge-mosaic.csv');
        break;

      case 'html':
        const html = Exporters.toHTML(this.brickLayout, {
          title: 'BlockForge Mosaic',
          includePartsList: true
        });
        FileUtils.downloadBlob(new Blob([html], { type: 'text/html' }), 'blockforge-mosaic.html');
        break;
    }
  }
}

export default MosaicStudio;