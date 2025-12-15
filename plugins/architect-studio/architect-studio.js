

import { COLOR_PALETTE_ARRAY } from '../../src/shared/color-palette.js';
import { FileUtils, Exporters, Voxelizer, BrickOptimizer } from '../../src/shared/index.js';
import { StudioHeader } from '../../src/shared/studio-header.js';
import { StudioStats } from '../../src/shared/studio-stats.js';

export default class ArchitectStudio {
    constructor() {
        this.image = null;
        this.detailLevel = 7;
        this.style = 'traditional';
        this.hasTrees = true;
        this.hasFence = false;
        this.clientName = "";
        this.canvas = null;
        this.brickLayout = null;
    }

    async init() {
        console.log("✅ Architect Studio Initialized");
        StudioHeader.inject({
            title: 'Architect Studio',
            description: 'Turn house photos into <span style="font-weight:700;color:#4CAF50;">LEGO blueprints</span>!<br>Upload a home image, select architectural style, and generate a brick-by-brick plan with a detailed materials list.',
            features: [
                { icon: '', label: 'Photo to Blueprint', color: '#2196F3' },
                { icon: '', label: 'Architectural Styles', color: '#4CAF50' },
                { icon: '', label: 'Materials List', color: '#D4AF37' }
            ],
            id: 'architectstudio-main-header'
        });
        this.canvas = document.getElementById('preview');
        this.setupEventListeners();
        // Set default date
        const dateInput = document.getElementById('closing-date');
        if (dateInput) dateInput.valueAsDate = new Date();
        this.render();
    }

    setupEventListeners() {
        document.getElementById('house-photo')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                this.image = await FileUtils.loadImage(file);
                this.render();
            }
        });

        // Debounce helper for performance
        let debounceTimer;
        const debounceRender = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => this.render(), 300);
        };

        document.getElementById('detail-level')?.addEventListener('input', (e) => {
            this.detailLevel = parseInt(e.target.value);
            debounceRender();
        });

        document.getElementById('arch-style')?.addEventListener('change', (e) => {
            this.style = e.target.value;
            this.render();
        });

        document.getElementById('include-trees')?.addEventListener('change', (e) => {
            this.hasTrees = e.target.checked;
            this.render();
        });

        document.getElementById('include-fence')?.addEventListener('change', (e) => {
            this.hasFence = e.target.checked;
            this.render();
        });
        
        document.getElementById('client-name')?.addEventListener('input', (e) => {
            this.clientName = e.target.value;
            debounceRender();
        });
    }

    render() {
        if (!this.canvas) return;

        if (this.image) {
            this.generateBlueprint();
        } else {
            this.drawPlaceholder();
        }
    }

    drawPlaceholder() {
        this.canvas.width = 500;
        this.canvas.height = 400;
        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#f0f4f8';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = '#999';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Upload a photo to generate blueprint", this.canvas.width/2, this.canvas.height/2);
    }

    generateBlueprint() {
        // 1. Voxelize
        // Map detail level (1-10) to width (32-92 studs)
        const width = 32 + (this.detailLevel * 6); 
        const palette = Object.values(COLOR_PALETTE);
        
        const voxelGrid = Voxelizer.fromImage(this.image, width, palette);

        // 2. Optimize
        this.brickLayout = BrickOptimizer.optimize(voxelGrid);

        // 3. Draw
        this.drawBricks(this.brickLayout);

        // 4. Stats
        this.updateRealStats(this.brickLayout);
    }

    drawBricks(layout) {
        const ctx = this.canvas.getContext('2d');
        const studSize = 8; // Compact view for architecture
        
        // Calculate dimensions
        let maxX = 0, maxY = 0;
        if (layout.bricks) {
            layout.bricks.forEach(b => {
                if (b.x + b.width > maxX) maxX = b.x + b.width;
                if (b.y + b.depth > maxY) maxY = b.y + b.depth;
            });
        }
        
        this.canvas.width = Math.max(maxX * studSize + 40, 500);
        this.canvas.height = Math.max(maxY * studSize + 40, 400);
        
        // Clear
        ctx.fillStyle = '#f0f4f8';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.translate(20, 20);

        if (layout.bricks) {
            layout.bricks.forEach(brick => {
                const x = brick.x * studSize;
                const y = brick.y * studSize;
                const w = brick.width * studSize;
                const h = brick.depth * studSize;
                
                ctx.fillStyle = brick.color.hex || '#999';
                ctx.fillRect(x, y, w, h);
                
                // Bevel/Stroke
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.strokeRect(x, y, w, h);
                
                // Simple Stud
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.beginPath();
                ctx.arc(x + w/2, y + h/2, studSize/4, 0, Math.PI*2);
                ctx.fill();
            });
        }
    }

    updateRealStats(layout) {
        const colorCounts = {};
        if (layout.bricks) {
            layout.bricks.forEach(b => {
                const hex = b.color.hex;
                colorCounts[hex] = (colorCounts[hex] || 0) + 1;
            });
        }

        const bom = Object.entries(colorCounts).map(([hex, count]) => {
            const palEntry = Object.values(COLOR_PALETTE).find(p => p.hex === hex) || { name: 'Custom', hex };
            return { part: "Brick", color: palEntry.name, hex: hex, qty: count };
        });

        this.updateStats(bom, layout.bricks ? layout.bricks.length : 0);
    }

    updateStats(bom, total) {
        const statsPanel = document.getElementById('stats');
        if (!statsPanel) return;
        StudioStats.render({
            statsPanel,
            stats: {
                dimensions: this.brickLayout && this.brickLayout.width && this.brickLayout.height ? `${this.brickLayout.width} × ${this.brickLayout.height}` : '',
                totalBricks: total,
                breakdown: bom.map(item => ({
                    label: `${item.color} (${item.part})`,
                    color: item.hex,
                    count: item.qty
                }))
            }
        });
        // Restore export buttons
        const btns = document.createElement('div');
        btns.style.display = 'flex';
        btns.style.gap = '0.5rem';
        btns.innerHTML = `
            <button id="btn-csv" style="flex:1; padding:8px; background:#333; color:white; border:none; border-radius:4px; cursor:pointer;">📄 CSV</button>
            <button id="btn-png" style="flex:1; padding:8px; background:#D4AF37; color:white; border:none; border-radius:4px; cursor:pointer;">📸 Image</button>
        `;
        statsPanel.appendChild(btns);
        setTimeout(() => {
            document.getElementById('btn-csv')?.addEventListener('click', () => {
                // Prepare clean data for CSV
                const csvData = bom.map(i => ({
                    part: i.part,
                    color: i.color,
                    hex: i.hex,
                    qty: i.qty
                }));
                Exporters.downloadCSV(csvData, `architect-${this.style}.csv`);
            });
            document.getElementById('btn-png')?.addEventListener('click', () => {
                Exporters.downloadPNG(this.canvas, `architect-${this.style}.png`);
            });
        }, 0);
    }
}
