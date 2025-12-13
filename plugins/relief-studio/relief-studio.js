import { 
  Voxelizer, 
  FileUtils, 
  Exporters,
  ColorUtils
} from '../../src/shared/index.js';

class ReliefStudio {
  constructor() {
    this.image = null;
    this.width = 32;
    this.colorCount = 16;
    this.use3D = true;
    this.invertDepth = true;
    this.maxHeight = 6;
    
    this.voxelGrid = null;
    this.canvas = null;
    this.ctx = null;
  }

  async init() {
    console.log('✅ Relief Studio initialized');
    
    this.setupCanvas();
    this.setupEventListeners();
    this.syncUI();
    this.updateLabels();
    this.loadDefaultImage();
  }

  async onActivate() {
    this.syncUI();
    this.setupCanvas();
    this.updateLabels();
    if (this.image) {
      this.render();
    }
  }

  syncUI() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        if (el.type === 'checkbox') el.checked = val;
        else el.value = val;
      }
    };
    
    setVal('width', this.width);
    setVal('colors', this.colorCount);
    setVal('use3D', this.use3D);
    setVal('invertDepth', this.invertDepth);
    setVal('maxHeight', this.maxHeight);
  }

  updateLabels() {
    const l1 = document.getElementById('stat-label-1');
    const l2 = document.getElementById('stat-label-2');
    const l3 = document.getElementById('stat-label-3');
    if (l1) l1.textContent = 'Total Parts';
    if (l2) l2.textContent = 'Unique Colors';
    if (l3) l3.textContent = 'Max Height';
  }

  setupCanvas() {
    // Find or create canvas
    this.canvas = document.getElementById('signCanvas');
    if (!this.canvas) {
      console.error('❌ Canvas element not found');
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
  }

  setupEventListeners() {
    // File Upload
    const fileInput = document.getElementById('file');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          this.image = await FileUtils.loadImage(file);
          this.render();
        }
      });
    }

    // Controls
    const attach = (id, prop, parser = v => v) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', (e) => {
          const val = el.type === 'checkbox' ? e.target.checked : e.target.value;
          this[prop] = parser(val);
          if (this.image) this.render();
        });
      }
    };

    attach('width', 'width', parseInt);
    attach('colors', 'colorCount', parseInt);
    attach('use3D', 'use3D');
    attach('invertDepth', 'invertDepth');
    attach('maxHeight', 'maxHeight', parseInt);
  }

  loadDefaultImage() {
    // Create a simple heightmap gradient for initial preview
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    const grad = ctx.createRadialGradient(50, 50, 0, 50, 50, 50);
    grad.addColorStop(0, 'white'); // High
    grad.addColorStop(1, 'black'); // Low
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 100, 100);

    const img = new Image();
    img.onload = () => {
      this.image = img;
      this.render();
    };
    img.src = canvas.toDataURL();
  }

  render() {
    if (!this.image) return;
    console.log('🏔️ Rendering Relief Model');

    this.voxelGrid = Voxelizer.fromImageWithRelief(this.image, this.width, {
      colorCount: this.colorCount,
      use3D: this.use3D,
      invertDepth: this.invertDepth,
      maxHeight: this.maxHeight
    });

    this.renderToCanvas();
    this.updateStats();
  }

  renderToCanvas() {
    // Re-acquire canvas if it's missing or detached from DOM
    if (!this.canvas || !this.canvas.isConnected) {
      this.canvas = document.getElementById('signCanvas');
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
      }
    }

    if (!this.voxelGrid || !this.canvas) return;

    const grid = this.voxelGrid;
    const tileW = 12;
    const tileH = 6;
    const plateH = 3;
    
    // Calculate bounds
    const w = grid.width;
    const h = grid.height;
    
    // Resize canvas
    this.canvas.width = (w + h) * tileW + 100;
    this.canvas.height = (w + h) * tileH + (this.maxHeight * plateH) + 100;
    
    const ctx = this.ctx;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const centerX = this.canvas.width / 2;
    const topY = 50;

    // Render loop
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const voxel = grid.get(x, y, 0);
        if (!voxel || !voxel.filled) continue;

        const screenX = centerX + (x - y) * tileW;
        const screenY = topY + (x + y) * tileH;
        const height = voxel.height || 1;
        const totalH = height * plateH;
        const color = voxel.color;

        this.drawIsoBlock(ctx, screenX, screenY, tileW, tileH, totalH, color);
      }
    }
  }

  drawIsoBlock(ctx, x, y, w, h, th, color) {
    const darken = (c, factor) => {
      return `rgb(${Math.floor(c.r * factor)}, ${Math.floor(c.g * factor)}, ${Math.floor(c.b * factor)})`;
    };
    const baseColor = `rgb(${color.r},${color.g},${color.b})`;

    // Left face
    ctx.fillStyle = darken(color, 0.6);
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + h - th);
    ctx.lineTo(x - w, y - th);
    ctx.closePath();
    ctx.fill();

    // Right face
    ctx.fillStyle = darken(color, 0.8);
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + h - th);
    ctx.lineTo(x + w, y - th);
    ctx.closePath();
    ctx.fill();

    // Top face
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(x, y - th - h);
    ctx.lineTo(x + w, y - th);
    ctx.lineTo(x, y - th + h);
    ctx.lineTo(x - w, y - th);
    ctx.closePath();
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  updateStats() {
    if (!this.voxelGrid) return;

    let totalParts = 0;
    let maxHeight = 0;
    const colors = new Set();

    this.voxelGrid.forEach(voxel => {
      totalParts += voxel.height || 1; // Count plates
      if (voxel.height > maxHeight) maxHeight = voxel.height;
      
      const colorKey = `${voxel.color.r},${voxel.color.g},${voxel.color.b}`;
      colors.add(colorKey);
    });

    // Update Stats Panel
    const textCountEl = document.getElementById('text-count');
    const bgCountEl = document.getElementById('bg-count');
    const borderCountEl = document.getElementById('border-count');

    if (textCountEl) textCountEl.textContent = totalParts.toLocaleString();
    if (bgCountEl) bgCountEl.textContent = colors.size;
    if (borderCountEl) borderCountEl.textContent = maxHeight + ' plates';

    const dimEl = document.getElementById('dimensions');
    if (dimEl) {
      dimEl.textContent = `Size: ${this.voxelGrid.width} x ${this.voxelGrid.height} studs`;
    }
  }

  async export(format) {
    if (!this.voxelGrid) {
      alert('Please generate a model first.');
      return;
    }

    if (format === 'csv') {
      this.exportCSV();
    } else if (format === 'html') {
      this.exportHTML();
    } else if (format === 'png') {
      this.exportPNG();
    }
  }

  exportPNG() {
    this.canvas.toBlob(blob => {
      FileUtils.downloadBlob(blob, 'relief-model.png');
    });
  }

  exportCSV() {
    // Custom CSV for relief (x,y,height,color)
    let csv = 'X,Y,Height,Color(R;G;B)\n';
    this.voxelGrid.forEach((v, x, y) => {
      csv += `${x},${y},${v.height},"${v.color.r};${v.color.g};${v.color.b}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    FileUtils.downloadBlob(blob, 'relief-model.csv');
  }

  exportHTML() {
    if (!this.voxelGrid) return;
    
    const grid = this.voxelGrid;
    const w = grid.width;
    const h = grid.height;
    const scale = 20;
    
    // Find max height
    let maxH = 0;
    grid.forEach(v => { if(v.height > maxH) maxH = v.height; });

    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
<title>BlockForge Relief Instructions</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 20px; max-width: 1000px; margin: 0 auto; background: #f5f5f5; }
  .header { text-align: center; margin-bottom: 30px; }
  .layer-card { background: white; padding: 20px; margin-bottom: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); page-break-inside: avoid; }
  .layer-img { width: 100%; image-rendering: pixelated; border: 1px solid #eee; }
  .stats { font-size: 0.9em; color: #666; margin-top: 10px; }
  @media print { body { background: white; } .layer-card { box-shadow: none; border: 1px solid #ccc; } }
</style>
</head>
<body>
  <div class="header">
    <h1>Relief Build Instructions</h1>
    <p>Size: ${w}x${h} • Max Height: ${maxH} plates</p>
  </div>
`;

    // Generate layers
    for (let layer = 1; layer <= maxH; layer++) {
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d');
      
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      let count = 0;
      
      // Draw grid
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let x=0; x<=w; x++) { ctx.moveTo(x*scale, 0); ctx.lineTo(x*scale, h*scale); }
      for(let y=0; y<=h; y++) { ctx.moveTo(0, y*scale); ctx.lineTo(w*scale, y*scale); }
      ctx.stroke();

      // Draw bricks
      for(let y=0; y<h; y++) {
        for(let x=0; x<w; x++) {
          const v = grid.get(x, y, 0);
          if (!v || !v.filled) continue;
          
          if (v.height >= layer) {
            // Place brick here
            ctx.fillStyle = `rgb(${v.color.r},${v.color.g},${v.color.b})`;
            ctx.fillRect(x*scale + 1, y*scale + 1, scale - 2, scale - 2);
            
            // Stud
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(x*scale + scale/2, y*scale + scale/2, scale/3, 0, Math.PI*2);
            ctx.fill();
            
            count++;
          } else {
            // Previous layer ghost
            ctx.fillStyle = '#eee';
            ctx.fillRect(x*scale + 1, y*scale + 1, scale - 2, scale - 2);
          }
        }
      }
      
      const dataUrl = canvas.toDataURL('image/png');
      htmlContent += `
  <div class="layer-card">
    <h2>Step ${layer} <span style="font-weight:normal; font-size:0.8em; color:#666;">(Layer ${layer})</span></h2>
    <img src="${dataUrl}" class="layer-img">
    <div class="stats">Parts in this step: <strong>${count}</strong></div>
  </div>`;
    }

    htmlContent += '</body></html>';
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    FileUtils.downloadBlob(blob, 'relief-instructions.html');
  }
}

export default ReliefStudio;