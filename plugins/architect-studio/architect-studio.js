import { 
  Voxelizer, 
  BrickOptimizer, 
  FileUtils, 
  Exporters,
  ColorUtils 
} from '../../src/shared/index.js';

// Architectural Color Palette
const ARCHITECTURE_PALETTE = [
  {name: "Dark Brown Roof", hex: "#582A12", type: "roof"},
  {name: "White Siding", hex: "#FFFFFF", type: "siding"},
  {name: "White Window", hex: "#FFFFFF", type: "window"},
  {name: "Red Door", hex: "#8B0000", type: "door"},
  {name: "Gray Foundation", hex: "#808080", type: "foundation"},
  {name: "Green Grass", hex: "#228B22", type: "landscape"},
  {name: "Dark Green Tree", hex: "#006400", type: "landscape"},
  {name: "Brown Tree Trunk", hex: "#8B4513", type: "landscape"}
];

export default class ArchitectStudio {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.houseImage = null;
    this.voxelGrid = null;
    this.brickLayout = null;
  }

  async init() {
    console.log('✅ Architect Studio initialized');
    // Try to find the canvas using common IDs
    this.canvas = document.getElementById('architectCanvas') || 
                  document.getElementById('preview') || 
                  document.getElementById('signCanvas');
                  
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    } else {
      console.error('❌ Architect Studio: Canvas element not found. Check manifest.json panel ID.');
      return;
    }
    
    // Set default date
    const dateInput = document.getElementById('closing-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    this.setupEventListeners();
    this.updateLabels();
    this.renderPlaceholder();
  }

  async onActivate() {
    this.updateLabels();
    if (this.brickLayout) {
      this.renderToCanvas();
    } else {
      if (!this.houseImage) this.renderPlaceholder();
    }
  }

  updateLabels() {
    const l1 = document.getElementById('stat-label-1');
    const l2 = document.getElementById('stat-label-2');
    const l3 = document.getElementById('stat-label-3');
    if (l1) l1.textContent = 'Total Bricks';
    if (l2) l2.textContent = 'Model Size';
    if (l3) l3.textContent = 'Weight';
  }

  setupEventListeners() {
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          this.houseImage = await FileUtils.loadImage(file);
          this.generateModel();
        }
      });
    }

    // Bind other inputs to regenerate model
    ['detail', 'style', 'base-size', 'include-trees', 'include-fence'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          if (this.houseImage) this.generateModel();
        });
      }
    });
  }

  renderPlaceholder() {
    const width = this.canvas.width = 800;
    const height = this.canvas.height = 600;
    
    this.ctx.fillStyle = '#f0f2f5';
    this.ctx.fillRect(0, 0, width, height);
    
    this.ctx.font = '24px Segoe UI';
    this.ctx.fillStyle = '#666';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Upload a house photo to begin', width/2, height/2);
  }

  generateModel() {
    if (!this.houseImage) return;

    console.log('🏗️ Generating Architect Model...');

    // Get settings
    const baseSizeInput = document.getElementById('base-size');
    const baseSize = baseSizeInput ? baseSizeInput.value : '12x12';
    
    // Map base size to studs (approx 32 studs = 10 inches/25cm)
    const sizeMap = {
      '8x8': 32,
      '12x12': 48,
      '16x16': 64,
      '20x20': 80
    };
    const width = sizeMap[baseSize] || 48;

    // 1. Voxelize Image
    this.voxelGrid = Voxelizer.fromImage(this.houseImage, width, {
      palette: ARCHITECTURE_PALETTE,
      colorCount: ARCHITECTURE_PALETTE.length,
      dither: true
    });

    // 2. Optimize Bricks
    this.brickLayout = BrickOptimizer.optimize(this.voxelGrid, {
      allowTiles: true,
      colorMatch: true
    });
    
    this.renderToCanvas();
    this.updateStats();
  }

  renderToCanvas() {
    if (!this.brickLayout || !this.canvas) return;
    
    const studSize = Math.floor(800 / this.voxelGrid.width); // Scale to fit canvas width 800
    const width = this.voxelGrid.width * studSize;
    const height = this.voxelGrid.height * studSize;
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Clear
    this.ctx.fillStyle = '#f0f2f5';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw bricks
    this.brickLayout.bricks.forEach(brick => {
      const x = brick.position.x * studSize;
      const y = brick.position.y * studSize;
      const w = brick.getDimensions().width * studSize;
      const h = brick.getDimensions().height * studSize;
      
      this.ctx.fillStyle = `rgb(${brick.color.r},${brick.color.g},${brick.color.b})`;
      this.ctx.fillRect(x, y, w, h);
      
      // Simple stud
      this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
      this.ctx.beginPath();
      this.ctx.arc(x + w/2, y + h/2, studSize/4, 0, Math.PI*2);
      this.ctx.fill();
      
      this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      this.ctx.strokeRect(x, y, w, h);
    });
  }

  updateStats() {
    if (!this.brickLayout) return;
    
    const count = this.brickLayout.getTotalBricks();
    const bounds = this.brickLayout.getBounds();
    const w = bounds.max.x - bounds.min.x + 1;
    const h = bounds.max.y - bounds.min.y + 1;
    
    const textCountEl = document.getElementById('text-count');
    const bgCountEl = document.getElementById('bg-count');
    const borderCountEl = document.getElementById('border-count');

    if (textCountEl) textCountEl.textContent = count.toLocaleString();
    if (bgCountEl) bgCountEl.textContent = `${w}x${h} studs`;
    if (borderCountEl) borderCountEl.textContent = `~${(count * 0.005).toFixed(1)} lbs`;
  }

  export(format) {
    if (!this.brickLayout) {
      alert('Please generate a model first!');
      return;
    }

    switch (format) {
      case 'png':
        const link = document.createElement('a');
        link.download = 'architectural-model.png';
        link.href = this.canvas.toDataURL();
        link.click();
        break;
      case 'csv':
        this.downloadCSV();
        break;
      case 'html':
        this.downloadHTML();
        break;
    }
  }

  downloadCSV() {
    const csv = Exporters.toCSV(this.brickLayout, {
      includeColors: true
    }); 
    
    const blob = new Blob([csv], {type: 'text/csv'});
    FileUtils.downloadBlob(blob, 'architectural-model-parts.csv');
  }

  downloadHTML() {
    const clientName = document.getElementById('client-name')?.value || 'Client';
    const address = document.getElementById('property-address')?.value || 'Address';
    const style = document.getElementById('style')?.value || 'Custom';
    
    // Get parts list from layout
    const counts = this.brickLayout.getBrickCounts();
    const total = this.brickLayout.getTotalBricks();
    
    const html = `
      <html>
      <head><title>Architectural Model Guide</title></head>
      <body style="font-family: sans-serif; padding: 40px;">
        <h1>Architectural Model Specification</h1>
        <hr>
        <p><strong>Client:</strong> ${clientName}</p>
        <p><strong>Property:</strong> ${address}</p>
        <p><strong>Style:</strong> ${style}</p>
        <p><strong>Total Bricks:</strong> ${total}</p>
        
        <h2>Parts List</h2>
        <ul>
          ${Object.entries(counts).map(([type, qty]) => `<li>${qty}x ${type}</li>`).join('')}
        </ul>
      </body>
      </html>
    `;
    
    const blob = new Blob([html], {type: 'text/html'});
    FileUtils.downloadBlob(blob, 'architectural-model-guide.html');
  }
}