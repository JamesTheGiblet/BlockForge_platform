import { 
  Voxelizer, 
  FileUtils, 
  Exporters 
} from '@shared/index.js';

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
    
    this.canvas = document.getElementById('renderIso');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.setupEventListeners();
    this.syncUI();
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

    // Generate Button
    const genBtn = document.getElementById('generate');
    if (genBtn) {
      genBtn.addEventListener('click', () => {
        if (this.image) this.render();
      });
    }

    // Exports
    const printBtn = document.getElementById('printInstructions');
    if (printBtn) printBtn.addEventListener('click', () => this.export('html'));
    
    const csvBtn = document.getElementById('downloadCSV');
    if (csvBtn) csvBtn.addEventListener('click', () => this.export('csv'));
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
    ctx.fillStyle = darken(color, 0.8);
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + h - th);
    ctx.lineTo(x - w, y - th);
    ctx.closePath();
    ctx.fill();

    // Right face
    ctx.fillStyle = darken(color, 0.9);
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
    const colorCounts = {};

    this.voxelGrid.forEach(voxel => {
      totalParts += voxel.height || 1; // Count plates
      if (voxel.height > maxHeight) maxHeight = voxel.height;
      
      const colorKey = `${voxel.color.r},${voxel.color.g},${voxel.color.b}`;
      colors.add(colorKey);
      
      // Track for table
      if (!colorCounts[colorKey]) {
        colorCounts[colorKey] = {
            color: voxel.color,
            count: 0,
            heights: new Set()
        };
      }
      colorCounts[colorKey].count += (voxel.height || 1);
      colorCounts[colorKey].heights.add(voxel.height);
    });

    // Update Stats Panel
    const updateText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    updateText('total-parts', totalParts.toLocaleString());
    updateText('unique-colors', colors.size);
    updateText('max-height', maxHeight + ' plates');

    // Update Table
    const table = document.getElementById('bom-table');
    if (table) {
        // Simple table rebuild
        let html = `<thead><tr><th>Color</th><th>Height</th><th>Quantity</th></tr></thead><tbody>`;
        Object.values(colorCounts).sort((a,b) => b.count - a.count).forEach(c => {
            const rgb = `rgb(${c.color.r},${c.color.g},${c.color.b})`;
            html += `<tr>
                <td><span style="display:inline-block;width:12px;height:12px;background:${rgb};margin-right:8px;border:1px solid #ccc;"></span></td>
                <td>${Array.from(c.heights).join(', ')}</td>
                <td>${c.count}</td>
            </tr>`;
        });
        html += '</tbody>';
        table.innerHTML = html;
    }
  }

  export(format) {
    if (!this.voxelGrid) {
        alert('Please generate a model first.');
        return;
    }

    if (format === 'csv') {
        // Custom CSV for relief (x,y,z)
        let csv = 'X,Y,Height,Color(R,G,B)\n';
        this.voxelGrid.forEach((v, x, y) => {
            csv += `${x},${y},${v.height},"${v.color.r},${v.color.g},${v.color.b}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        FileUtils.downloadBlob(blob, 'relief-model.csv');
    } else if (format === 'html') {
        // Use Exporters or custom HTML
        // For now, simple alert or reuse Exporters if adaptable
        alert('HTML export coming soon for Relief Studio');
    }
  }
}

export default ReliefStudio;
