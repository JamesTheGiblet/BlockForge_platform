import { FileUtils } from '@shared/index.js';

// Internal state
const DEFAULT_STATE = {
  content: 'https://blockforge.com',
  eccLevel: 'M',
  scale: 1,
  fgColor: '#111111',
  bgColor: '#f4f4f4'
};

export default class QrStudio {
  constructor() {
    this.state = { ...DEFAULT_STATE };
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Initialize the plugin
   */
  async init(api) {
    console.log('✅ QR Studio initialized');
    
    // Reset state to defaults when switching back to this studio
    this.state = { ...DEFAULT_STATE };
    
    // Dynamically load the QRCode library
    try {
      // Try cdnjs first (usually more reliable for MIME types)
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.1/qrcode.min.js');
      console.log('📦 QRCode library loaded (cdnjs)');
    } catch (e) {
      console.warn('cdnjs failed, trying unpkg fallback...', e);
      try {
        await loadScript('https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js');
        console.log('📦 QRCode library loaded (unpkg)');
      } catch (e2) {
        console.error('Failed to load QRCode library from all sources', e2);
      }
    }

    this.canvas = document.getElementById('qr-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'qr-canvas';
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Initial render
    this.render();

    // Retry render shortly after to ensure DOM is fully mounted
    setTimeout(() => this.render(), 200);
  }

  /**
   * Handle UI tool changes
   */
  async onToolChange(toolId, value, api) {
    console.log(`QR Tool Update: ${toolId}`, value);

    switch (toolId) {
      case 'qrContent':
        this.state.content = value;
        this.render();
        break;

      case 'eccLevel':
        this.state.eccLevel = value;
        this.render();
        break;

      case 'scale':
        this.state.scale = parseInt(value, 10);
        this.render();
        break;

      case 'fgColor':
        this.state.fgColor = value;
        this.render();
        break;

      case 'bgColor':
        this.state.bgColor = value;
        this.render();
        break;
    }
  }

  /**
   * Handle UI actions
   */
  async onAction(actionId, api) {
    switch (actionId) {
      case 'exportPng':
        if (this.canvas) {
          this.canvas.toBlob(blob => {
            FileUtils.downloadBlob(blob, 'blockforge-qr.png');
          });
        }
        break;
    }
  }

  /**
   * Core rendering logic
   */
  render() {
    // Always try to find the live canvas in the DOM
    const liveCanvas = document.getElementById('qr-canvas');
    if (liveCanvas && liveCanvas !== this.canvas) {
      this.canvas = liveCanvas;
      this.ctx = this.canvas.getContext('2d');
      console.log('🎨 QR Studio: Switched to live canvas');
    }

    // If we still don't have a visible canvas, schedule a retry
    if (!this.canvas || !this.canvas.isConnected) {
      if (!this._retryTimer) {
        this._retryTimer = setTimeout(() => {
          this._retryTimer = null;
          this.render();
        }, 100);
      }
      return; // Stop rendering to invisible canvas
    }

    // Ensure context exists and library is loaded
    if (!this.ctx || !this.state.content || !window.QRCode) return;

    console.log('🎨 Generating QR Code', this.state);

    // Generate QR Data
    const qr = window.QRCode.create(this.state.content, { errorCorrectionLevel: this.state.eccLevel });
    const modules = qr.modules; // The BitMatrix
    const size = modules.size;  // e.g., 21, 25, etc.

    const studSize = 12;
    const pixelSize = studSize * this.state.scale;
    const boardSize = size * pixelSize;

    this.canvas.width = boardSize + (pixelSize * 2); // Add padding
    this.canvas.height = boardSize + (pixelSize * 2);

    // Background (White Plate)
    this.ctx.fillStyle = this.state.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Modules
    const padding = pixelSize;
    const studRadius = studSize * 0.35;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isDark = modules.get(x, y);
        const startX = padding + (x * pixelSize);
        const startY = padding + (y * pixelSize);
        const brickColor = isDark ? this.state.fgColor : this.state.bgColor;

        // Draw base brick
        this.ctx.fillStyle = brickColor;
        this.ctx.fillRect(startX, startY, pixelSize - 1, pixelSize - 1);

        // Draw studs (handle scaling for 2x2, 3x3 etc)
        for (let i = 0; i < this.state.scale; i++) {
          for (let j = 0; j < this.state.scale; j++) {
            const cx = startX + (i * studSize) + (studSize / 2);
            const cy = startY + (j * studSize) + (studSize / 2);

            // Stud Shadow
            this.ctx.beginPath();
            this.ctx.arc(cx + 1, cy + 1, studRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.fill();

            // Stud Top
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, studRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = brickColor;
            this.ctx.fill();

            // Highlight
            this.ctx.beginPath();
            this.ctx.arc(cx - studRadius * 0.3, cy - studRadius * 0.3, studRadius * 0.25, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
            this.ctx.fill();
          }
        }
      }
    }
  }
}

/**
 * Helper to load external scripts
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.QRCode) {
      resolve();
      return;
    }

    // If script exists but global is missing, remove it to avoid hanging on missed events
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}