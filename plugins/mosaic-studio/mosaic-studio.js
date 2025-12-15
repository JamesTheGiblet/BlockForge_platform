

import { COLOR_PALETTE_ARRAY } from '../../src/shared/color-palette.js';
import { Voxelizer, FileUtils } from '../../src/shared/index.js';
import { StudioHeader } from '../../src/shared/studio-header.js';
import { StudioStats } from '../../src/shared/studio-stats.js';

export default class MosaicStudio {
    constructor() {
        this.image = null; // Stores the HTMLImageElement
        this.width = 48;
        this.canvas = null;
    }

    async init() {
        console.log("✅ Mosaic Studio Initialized");
        StudioHeader.inject({
            title: 'Mosaic Studio',
            description: 'Transform your images into <span style="font-weight:700;color:#FFD500;">brick mosaics</span>!<br>Upload a photo, set your target width, and generate a pixel-perfect LEGO-style mosaic with optimized color matching.',
            features: [
                { icon: '', label: 'Image Upload', color: '#2196F3' },
                { icon: '', label: 'Color Palette', color: '#FFD500' },
                { icon: '', label: 'Pixel Art Output', color: '#4CAF50' }
            ],
            id: 'mosaicstudio-main-header'
        });
        this.canvas = document.getElementById('preview');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Image Upload
        document.getElementById('upload-image')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                this.image = await FileUtils.loadImage(file);
                console.log('[MosaicStudio] Image loaded:', this.image);
                this.render();
            }
        });

        // Width Slider
        document.getElementById('target-width')?.addEventListener('input', (e) => {
            this.width = parseInt(e.target.value);
            this.render();
        });
    }

    render() {
        if (!this.image || !this.canvas) {
            console.warn('[MosaicStudio] No image or canvas found.');
            return;
        }
        console.log(`🎨 Rendering Mosaic: ${this.width} studs wide`);
        // 1. Voxelize (The heavy lifting)
        const result = Voxelizer.fromImage(this.image, this.width, COLOR_PALETTE_ARRAY);
        console.log('[MosaicStudio] Voxelizer result:', result);
        if (result.grid && result.grid.length > 0) {
            console.log('[MosaicStudio] First row of grid:', result.grid[0]);
            if (result.grid[0] && result.grid[0].length > 0) {
                console.log('[MosaicStudio] First cell structure:', result.grid[0][0]);
            }
        }
        // 2. Draw
        this.drawCanvas(result.grid, result.width, result.height);
        // 3. Shared StudioStats
        const count = result.grid.flat().length;
        const colorCounts = {};
        result.grid.flat().forEach(c => {
            if (c && c.name) {
                colorCounts[c.name] = (colorCounts[c.name] || 0) + 1;
            }
        });
        const breakdown = Object.entries(colorCounts).map(([name, num]) => {
            const colorObj = COLOR_PALETTE_ARRAY.find(c => c.name === name) || { hex: '#888' };
            return { label: name, color: colorObj.hex, count: num };
        });
        const statsPanel = document.getElementById('stats');
        StudioStats.render({
            statsPanel,
            stats: {
                dimensions: `${result.width} × ${result.height}`,
                totalBricks: count,
                breakdown
            }
        });
        // Add export buttons (CSV, PNG)
        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '0.5rem';
        btnRow.style.marginTop = '1rem';
        btnRow.innerHTML = `
            <button id="btn-csv" style="flex:1; padding:8px; background:#333; color:white; border:none; border-radius:4px; cursor:pointer;">CSV</button>
            <button id="btn-png" style="flex:1; padding:8px; background:#D4AF37; color:white; border:none; border-radius:4px; cursor:pointer;">Image</button>
        `;
        statsPanel.appendChild(btnRow);
        setTimeout(() => {
            document.getElementById('btn-csv')?.addEventListener('click', () => {
                // Export color breakdown as CSV
                const csvData = breakdown.map(b => ({
                    color: b.label,
                    hex: b.color,
                    qty: b.count
                }));
                import('../../src/shared/index.js').then(({ Exporters }) => {
                    Exporters.downloadCSV(csvData, 'mosaic.csv');
                });
            });
            document.getElementById('btn-png')?.addEventListener('click', () => {
                import('../../src/shared/index.js').then(({ Exporters }) => {
                    Exporters.downloadPNG(this.canvas, 'mosaic.png');
                });
            });
        }, 0);
    }

    drawCanvas(grid, width, height) {
        const ctx = this.canvas.getContext('2d');
        const studSize = 10; // Smaller studs for mosaics so they fit
        this.canvas.width = width * studSize;
        this.canvas.height = height * studSize;

        // Clear
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!grid || !Array.isArray(grid) || !grid.length) {
            console.warn('[MosaicStudio] drawCanvas: grid is empty or invalid:', grid);
            return;
        }

        // Use shared drawBrick utility
        import('../../src/shared/brick-canvas.js').then(({ drawBrick }) => {
            let drawn = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const colorObj = grid[y][x];
                    if (colorObj) {
                        const px = x * studSize;
                        const py = y * studSize;
                        drawBrick(ctx, px, py, studSize, colorObj.hex);
                        drawn++;
                    }
                }
            }
            console.log(`[MosaicStudio] drawCanvas: Bricks drawn: ${drawn}`);
        });
    }

    // updateStats now handled by StudioStats
}