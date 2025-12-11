import { Voxelizer } from '@shared/voxelizer.js';
import { BrickOptimizer } from '@shared/brick-optimizer.js';
import { Exporters } from '@shared/exporters.js';
import { FileUtils } from '@shared/utils/files.js';
import { LegoColors } from '@shared/index.js';

// Basic 5x5 font data
const FONT_DATA = {
  'A': [[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  'B': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0]],
  'C': [[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,1]],
  'D': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  'E': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,1,1,1]],
  'F': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
  'G': [[0,1,1,1,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[0,1,1,1,0]],
  'H': [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  'I': [[0,1,1,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  'J': [[0,0,1,1,1],[0,0,0,1,0],[0,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
  'K': [[1,0,0,0,1],[1,0,0,1,0],[1,1,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'L': [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
  'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'P': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
  'Q': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,1,0],[0,1,1,0,1]],
  'R': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1]],
  'S': [[0,1,1,1,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
  'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'U': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'V': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
  'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  'X': [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
  'Y': [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'Z': [[1,1,1,1,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
  ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
};

// Proxy to handle missing characters
const fontProxy = new Proxy(FONT_DATA, {
  get: (target, prop) => target[prop] || target[' ']
});

export default class SignStudio {
  constructor() {
    this.brickLayout = null;
    this.textColor = LegoColors.getLegoColor(11).rgb; // Black
    this.borderColor = LegoColors.getLegoColor(5).rgb; // Red
    this.bgColor = LegoColors.getLegoColor(1).rgb; // White
  }

  async init() {
    this.populateColorSelects();
    this.bindEvents();
    this.updateLabels();
    this.update();
  }

  /**
   * Called when plugin is reactivated
   */
  async onActivate() {
    this.populateColorSelects();
    this.updateLabels();
    
    this.update();
  }

  populateColorSelects() {
    // Use opaque colors for signs
    const colors = LegoColors.getColorsByCategory('opaque');
    
    const createOptions = (selectedId) => {
      return colors.map(c => 
        `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.name}</option>`
      ).join('');
    };

    const textSelect = document.getElementById('text-color-select');
    const borderSelect = document.getElementById('border-color-select');
    const bgSelect = document.getElementById('bg-color-select');

    if (textSelect) textSelect.innerHTML = createOptions(11); // Default Black
    if (borderSelect) borderSelect.innerHTML = createOptions(5); // Default Red
    if (bgSelect) bgSelect.innerHTML = createOptions(1); // Default White
  }

  updateLabels() {
    const l1 = document.getElementById('stat-label-1');
    const l2 = document.getElementById('stat-label-2');
    const l3 = document.getElementById('stat-label-3');
    if (l1) l1.textContent = 'Text';
    if (l2) l2.textContent = 'Background';
    if (l3) l3.textContent = 'Border';
  }

  bindEvents() {
    const inputs = ['text-input', 'size-select', 'border-style', 'text-color-select', 'border-color-select', 'bg-color-select'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.update());
      }
    });
  }

  update() {
    const textInput = document.getElementById('text-input');
    const sizeSelect = document.getElementById('size-select');
    const borderStyle = document.getElementById('border-style');
    const textSelect = document.getElementById('text-color-select');
    const borderSelect = document.getElementById('border-color-select');
    const bgSelect = document.getElementById('bg-color-select');

    if (!textInput || !sizeSelect || !borderStyle) return;

    const text = textInput.value || 'BLOCK';
    const size = sizeSelect.value;
    const border = borderStyle.value;

    // Update colors from selection
    if (textSelect) this.textColor = LegoColors.getLegoColor(parseInt(textSelect.value)).rgb;
    if (borderSelect) this.borderColor = LegoColors.getLegoColor(parseInt(borderSelect.value)).rgb;
    if (bgSelect) this.bgColor = LegoColors.getLegoColor(parseInt(bgSelect.value)).rgb;

    // Map UI values to Voxelizer options
    const padding = size === 'compact' ? 1 : (size === 'large' ? 3 : 2);
    const borderWidth = border === 'thin' ? 1 : (border === 'thick' ? 3 : 2);

    // Generate voxels
    const voxelGrid = Voxelizer.fromText(text, fontProxy, {
      spacing: 1,
      padding,
      borderWidth,
      color: this.textColor,
      borderColor: this.borderColor,
      backgroundColor: this.bgColor
    });

    // Optimize to bricks
    this.brickLayout = BrickOptimizer.optimize(voxelGrid, {
      colorMatch: true
    });

    this.render();
    this.updateStats();
  }

  render() {
    const canvas = document.getElementById('signCanvas');
    if (!canvas || !this.brickLayout) return;

    const ctx = canvas.getContext('2d');
    const bounds = this.brickLayout.getBounds();
    const width = bounds.max.x - bounds.min.x + 1;
    const height = bounds.max.y - bounds.min.y + 1;
    const scale = 20;

    canvas.width = width * scale;
    canvas.height = height * scale;

    // Clear
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bricks
    this.brickLayout.bricks.forEach(brick => {
      const { x, y } = brick.position;
      const drawX = x - bounds.min.x;
      const drawY = y - bounds.min.y;
      const { width: w, height: h } = brick.getDimensions();
      
      ctx.fillStyle = `rgb(${brick.color.r},${brick.color.g},${brick.color.b})`;
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      
      ctx.fillRect(drawX * scale, drawY * scale, w * scale, h * scale);
      ctx.strokeRect(drawX * scale, drawY * scale, w * scale, h * scale);

      // Draw studs
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for (let bx = 0; bx < w; bx++) {
        for (let by = 0; by < h; by++) {
          ctx.beginPath();
          ctx.arc(
            (drawX + bx + 0.5) * scale,
            (drawY + by + 0.5) * scale,
            scale * 0.3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    });
  }

  updateStats() {
    if (!this.brickLayout) return;

    // Count bricks by source type
    const typeCounts = this.brickLayout.getSourceTypeCounts();
    const textCount = typeCounts.text || 0;
    const bgCount = typeCounts.background || 0;
    const borderCount = typeCounts.border || 0;

    // Update UI
    const textCountEl = document.getElementById('text-count');
    const bgCountEl = document.getElementById('bg-count');
    const borderCountEl = document.getElementById('border-count');
    const dimEl = document.getElementById('dimensions');

    if (textCountEl) textCountEl.textContent = textCount;
    if (bgCountEl) bgCountEl.textContent = bgCount;
    if (borderCountEl) borderCountEl.textContent = borderCount;

    if (dimEl) {
      const bounds = this.brickLayout.getBounds();
      const w = bounds.max.x - bounds.min.x + 1;
      const h = bounds.max.y - bounds.min.y + 1;
      dimEl.textContent = `Size: ${w} x ${h} studs`;
    }
  }

  /**
   * Unified export method
   */
  export(format) {
    switch (format) {
      case 'png':
        this.downloadPNG();
        break;
      case 'csv':
        this.downloadCSV();
        break;
      case 'html':
        this.downloadHTML();
        break;
    }
  }

  downloadPNG() {
    const canvas = document.getElementById('signCanvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'blockforge-sign.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  }

  downloadCSV() {
    if (!this.brickLayout) return;
    const csv = Exporters.toCSV(this.brickLayout);
    const blob = new Blob([csv], { type: 'text/csv' });
    FileUtils.downloadBlob(blob, 'blockforge-parts.csv');
  }

  downloadHTML() {
    if (!this.brickLayout) return;
    const html = Exporters.toHTML(this.brickLayout, { title: 'Sign Build Instructions' });
    const blob = new Blob([html], { type: 'text/html' });
    FileUtils.downloadBlob(blob, 'blockforge-instructions.html');
  }
}