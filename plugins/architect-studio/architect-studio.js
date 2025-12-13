import { FileUtils } from '../../src/shared/index.js';

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
    this.lastResult = null;
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
    if (this.lastResult) {
      this.renderArchitecturalPreview(this.lastResult);
    } else {
      this.renderPlaceholder();
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

    const detailLevel = parseInt(document.getElementById('detail').value) || 7;
    const style = document.getElementById('style').value || 'traditional';
    const baseSize = document.getElementById('base-size').value || '12x12';
    const includeTrees = document.getElementById('include-trees').checked;
    const includeFence = document.getElementById('include-fence').checked;
    
    // Generate mock architectural model data
    this.lastResult = this.generateMockArchitecturalModel(detailLevel, style, baseSize, includeTrees, includeFence);
    
    this.renderArchitecturalPreview(this.lastResult);
    this.updateStats(this.lastResult);
  }

  generateMockArchitecturalModel(detailLevel, style, baseSize, includeTrees, includeFence) {
    const baseSizes = {
      '8x8': { bricks: 500, width: 8, weight: 2.5 },
      '12x12': { bricks: 1200, width: 12, weight: 6 },
      '16x16': { bricks: 2200, width: 16, weight: 11 },
      '20x20': { bricks: 3500, width: 20, weight: 17.5 }
    };
    
    const baseStats = baseSizes[baseSize];
    const brickMultiplier = 0.5 + (detailLevel * 0.1);
    const totalBricks = Math.round(baseStats.bricks * brickMultiplier);
    
    // Generate mock BOM
    const bom = [
      { component: 'Roof Tiles', color: '#582A12', quantity: Math.round(totalBricks * 0.25) },
      { component: 'Siding', color: '#FFFFFF', quantity: Math.round(totalBricks * 0.35) },
      { component: 'Windows', color: '#FFFFFF', quantity: Math.round(totalBricks * 0.15) },
      { component: 'Door', color: '#8B0000', quantity: Math.round(totalBricks * 0.05) },
      { component: 'Foundation', color: '#808080', quantity: Math.round(totalBricks * 0.1) }
    ];
    
    if (includeTrees) {
      bom.push({ component: 'Landscaping', color: '#228B22', quantity: 84 });
    }
    
    if (includeFence) {
      bom.push({ component: 'Fence', color: '#FFFFFF', quantity: 40 });
    }
    
    return {
      totalBricks,
      modelWidth: baseStats.width,
      modelWeight: baseStats.weight,
      bom,
      style,
      includeTrees
    };
  }

  renderArchitecturalPreview(modelData) {
    const width = this.canvas.width = 800;
    const height = this.canvas.height = 600;
    const ctx = this.ctx;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, width, height);
    
    // Draw architectural diagram
    const centerX = width / 2;
    const baseY = height - 100;
    
    // House base
    ctx.fillStyle = '#808080'; // Foundation
    ctx.fillRect(centerX - 120, baseY, 240, 20);
    
    // Main house
    ctx.fillStyle = '#FFFFFF'; // Siding
    ctx.fillRect(centerX - 100, baseY - 150, 200, 150);
    ctx.strokeStyle = '#ddd';
    ctx.strokeRect(centerX - 100, baseY - 150, 200, 150);
    
    // Roof
    ctx.fillStyle = '#582A12'; // Roof
    ctx.beginPath();
    ctx.moveTo(centerX - 120, baseY - 150);
    ctx.lineTo(centerX, baseY - 220);
    ctx.lineTo(centerX + 120, baseY - 150);
    ctx.closePath();
    ctx.fill();
    
    // Windows
    ctx.fillStyle = '#87CEEB'; // Glass
    ctx.fillRect(centerX - 80, baseY - 120, 30, 40); // Left window
    ctx.fillRect(centerX + 50, baseY - 120, 30, 40); // Right window
    
    // Door
    ctx.fillStyle = '#8B0000'; // Door
    ctx.fillRect(centerX - 20, baseY - 80, 40, 80);
    
    // Landscaping
    if (modelData.includeTrees) {
      // Trees
      ctx.fillStyle = '#8B4513'; // Trunk
      ctx.fillRect(centerX - 160, baseY - 40, 10, 40);
      ctx.fillRect(centerX + 150, baseY - 40, 10, 40);
      
      ctx.fillStyle = '#006400'; // Leaves
      ctx.beginPath();
      ctx.arc(centerX - 155, baseY - 60, 25, 0, Math.PI * 2);
      ctx.arc(centerX + 155, baseY - 60, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // Grass
      ctx.fillStyle = '#228B22';
      ctx.fillRect(centerX - 200, baseY, 400, 20);
    }

    // Overlay text
    ctx.font = 'bold 18px Segoe UI';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('Architectural Model Preview', width/2, 40);
  }

  updateStats(modelData) {
    const textCountEl = document.getElementById('text-count');
    const bgCountEl = document.getElementById('bg-count');
    const borderCountEl = document.getElementById('border-count');
    const dimEl = document.getElementById('dimensions');

    if (textCountEl) textCountEl.textContent = modelData.totalBricks.toLocaleString();
    if (bgCountEl) bgCountEl.textContent = modelData.modelWidth + '"';
    if (borderCountEl) borderCountEl.textContent = modelData.modelWeight + ' lbs';

    if (dimEl) {
      dimEl.innerHTML = `Style: <strong>${modelData.style}</strong>`;
    }
  }

  export(format) {
    if (!this.lastResult) {
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
    let csv = "Component,Color,Quantity\n";
    this.lastResult.bom.forEach(item => {
      csv += `"${item.component}","${item.color}",${item.quantity}\n`;
    });
    
    const blob = new Blob([csv], {type: 'text/csv'});
    FileUtils.downloadBlob(blob, 'architectural-model-parts.csv');
  }

  downloadHTML() {
    const clientName = document.getElementById('client-name')?.value || 'Client';
    const address = document.getElementById('property-address')?.value || 'Address';
    
    const html = `
      <html>
      <head><title>Architectural Model Guide</title></head>
      <body style="font-family: sans-serif; padding: 40px;">
        <h1>Architectural Model Specification</h1>
        <hr>
        <p><strong>Client:</strong> ${clientName}</p>
        <p><strong>Property:</strong> ${address}</p>
        <p><strong>Style:</strong> ${this.lastResult.style}</p>
        <p><strong>Total Bricks:</strong> ${this.lastResult.totalBricks}</p>
        
        <h2>Parts List</h2>
        <ul>
          ${this.lastResult.bom.map(i => `<li>${i.quantity}x ${i.component} (${i.color})</li>`).join('')}
        </ul>
      </body>
      </html>
    `;
    
    const blob = new Blob([html], {type: 'text/html'});
    FileUtils.downloadBlob(blob, 'architectural-model-guide.html');
  }
}