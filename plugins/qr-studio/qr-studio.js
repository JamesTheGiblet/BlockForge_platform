/**
 * QR Studio Plugin
 * Creates scannable LEGO QR codes
 */

import { 
  Voxelizer, 
  BrickOptimizer, 
  ColorUtils,
  FileUtils,
  Exporters
} from '@shared/index.js';

class QRStudio {
  constructor() {
    // State
    this.qrType = 'url';
    this.qrData = 'https://blockforge.studio';
    this.gridSize = 32;
    this.fgColor = { r: 0, g: 0, b: 0 };        // Black
    this.bgColor = { r: 255, g: 255, b: 255 };  // White
    
    // Generated data
    this.qrMatrix = null;  // 2D array from QRCode.js
    this.voxelGrid = null;
    this.brickLayout = null;
    
    // DOM references
    this.canvas = null;
    this.ctx = null;
    
    // QRCode library
    this.QRCode = null;
  }

  /**
   * Initialize plugin
   */
  async init() {
    console.log('✅ QR Studio initialized');
    
    // Load QRCode.js library
    await this.loadQRCodeLibrary();
    
    // Get DOM references
    this.canvas = document.getElementById('qrCanvas') || document.getElementById('signCanvas');
    if (!this.canvas) {
      // Create canvas if it doesn't exist
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'qrCanvas';
      const previewArea = document.querySelector('.panel:nth-child(2)') || document.body;
      previewArea.appendChild(this.canvas);
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initial render
    this.render();
  }

  /**
   * Called when plugin is reactivated
   */
  async onActivate() {
    this.render();
  }

  /**
   * Load QRCode.js from CDN
   */
  async loadQRCodeLibrary() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.QRCode) {
        console.log('✓ QRCode.js already loaded');
        this.QRCode = window.QRCode;
        resolve();
        return;
      }

      console.log('⏳ Loading QRCode.js from CDN...');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.onload = () => {
        console.log('✓ QRCode.js loaded');
        this.QRCode = window.QRCode;
        resolve();
      };
      script.onerror = () => {
        console.error('✗ Failed to load QRCode.js');
        reject(new Error('Failed to load QRCode.js'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // QR type selector
    const qrTypeSelect = document.getElementById('qr-type');
    if (qrTypeSelect) {
      qrTypeSelect.addEventListener('change', (e) => {
        this.qrType = e.target.value;
        this.updatePlaceholder();
      });
    }

    // QR data input
    const qrDataInput = document.getElementById('qr-data');
    if (qrDataInput) {
      qrDataInput.addEventListener('input', (e) => {
        this.qrData = e.target.value;
      });
    }

    // Grid size selector
    const gridSizeSelect = document.getElementById('grid-size');
    if (gridSizeSelect) {
      gridSizeSelect.addEventListener('change', (e) => {
        this.gridSize = parseInt(e.target.value);
        this.render();
      });
    }
  }

  /**
   * Update input placeholder based on QR type
   */
  updatePlaceholder() {
    const input = document.getElementById('qr-data');
    if (!input) return;

    const placeholders = {
      url: 'https://example.com',
      wifi: 'WIFI:T:WPA;S:NetworkName;P:password;;',
      contact: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:555-1234\nEND:VCARD',
      phone: 'tel:+1234567890'
    };

    input.placeholder = placeholders[this.qrType] || 'Enter data';
  }

  /**
   * Main render function
   */
  render() {
    console.log('🎨 Rendering QR code:', this.qrType);

    if (!this.qrData || this.qrData.length === 0) {
      this.clearCanvas();
      return;
    }

    // 1. Generate QR code using QRCode.js
    this.generateQRCode();
  }

  /**
   * Generate QR code and convert to matrix
   */
  generateQRCode() {
    // Create temporary container for QRCode.js
    const tempDiv = document.createElement('div');
    tempDiv.id = 'temp-qr';
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);

    try {
      // Generate QR code
      new this.QRCode(tempDiv, {
        text: this.qrData,
        width: this.gridSize * 10,
        height: this.gridSize * 10,
        correctLevel: this.QRCode.CorrectLevel.H
      });

      // Wait for QR to render, then process
      setTimeout(() => {
        this.processQRCode(tempDiv);
        document.body.removeChild(tempDiv);
      }, 100);

    } catch (error) {
      console.error('Error generating QR code:', error);
      document.body.removeChild(tempDiv);
    }
  }

  /**
   * Process QR code image to matrix
   */
  processQRCode(container) {
    const qrImg = container.querySelector('img');
    if (!qrImg) {
      console.error('QR image not found');
      return;
    }

    // Create temporary canvas to read pixels
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.gridSize;
    tempCanvas.height = this.gridSize;
    const ctx = tempCanvas.getContext('2d');

    // Disable smoothing for crisp pixels
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrImg, 0, 0, this.gridSize, this.gridSize);

    // Read pixel data
    const imgData = ctx.getImageData(0, 0, this.gridSize, this.gridSize).data;
    this.qrMatrix = [];

    for (let y = 0; y < this.gridSize; y++) {
      const row = [];
      for (let x = 0; x < this.gridSize; x++) {
        const i = (y * this.gridSize + x) * 4;
        const isDark = imgData[i] < 128; // Dark pixel threshold
        row.push(isDark ? 1 : 0);
      }
      this.qrMatrix.push(row);
    }

    // 2. Voxelize QR matrix
    this.voxelGrid = Voxelizer.fromQRCode(this.qrMatrix, {
      fgColor: this.fgColor,
      bgColor: this.bgColor
    });

    // 3. Optimize (but force 1x1 only for QR codes)
    this.brickLayout = BrickOptimizer.optimize(this.voxelGrid, {
      allowTiles: true,
      allowDots: false,
      colorMatch: true
    });

    // 4. Render to canvas
    this.renderToCanvas();

    // 5. Update stats
    this.updateStats();
  }

  /**
   * Render brick layout to canvas
   */
  renderToCanvas() {
    if (!this.brickLayout) return;

    const studSize = 20; // pixels per stud
    const margin = 20;

    // Set canvas size
    this.canvas.width = (this.gridSize * studSize) + (margin * 2);
    this.canvas.height = (this.gridSize * studSize) + (margin * 2);

    // Clear canvas
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw each brick as circular stud
    this.brickLayout.bricks.forEach(brick => {
      const px = margin + (brick.position.x * studSize);
      const py = margin + (brick.position.y * studSize);
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
   */
  updateStats() {
    if (!this.brickLayout) return;

    const typeCounts = this.brickLayout.getSourceTypeCounts();
    const fgCount = typeCounts.foreground || 0;
    const bgCount = typeCounts.background || 0;
    const totalBricks = this.brickLayout.getTotalBricks();
    const costPerBrick = 0.06;
    const totalCost = (totalBricks * costPerBrick).toFixed(2);

    // Update DOM
    const textCountEl = document.getElementById('text-count');
    if (textCountEl) textCountEl.textContent = fgCount.toLocaleString();

    const bgCountEl = document.getElementById('bg-count');
    if (bgCountEl) bgCountEl.textContent = bgCount.toLocaleString();

    const borderCountEl = document.getElementById('border-count');
    if (borderCountEl) borderCountEl.textContent = '0';

    const dimensionsEl = document.getElementById('dimensions');
    if (dimensionsEl) {
      dimensionsEl.innerHTML = `
        Dimensions: ${this.gridSize}×${this.gridSize} studs<br>
        Est. Cost: <strong>$${totalCost}</strong> @ $${costPerBrick.toFixed(2)}/brick
      `;
    }

    console.log(`📊 QR Stats: ${fgCount} dark, ${bgCount} light = ${totalBricks} total`);
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
    console.log('📥 Exporting QR as:', format);

    if (!this.brickLayout) {
      alert('Please generate a QR code first!');
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
      const filename = `blockforge-qr-${this.qrType}.png`;
      FileUtils.downloadBlob(blob, filename);
    });
  }

  /**
   * Export as CSV
   */
  exportCSV() {
    const csv = Exporters.toCSV(this.brickLayout, {
      includeColors: true
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const filename = `blockforge-qr-${this.qrType}-parts.csv`;
    FileUtils.downloadBlob(blob, filename);
  }

  /**
   * Export as HTML
   */
  async exportHTML() {
    const html = Exporters.toHTML(this.brickLayout, {
      title: `BlockForge QR Code: ${this.qrType}`,
      includePartsList: true,
      stepByStep: false,
      interactive: false
    });

    const blob = new Blob([html], { type: 'text/html' });
    const filename = `blockforge-qr-${this.qrType}-instructions.html`;
    FileUtils.downloadBlob(blob, filename);
  }
}

// Export plugin class
export default QRStudio;