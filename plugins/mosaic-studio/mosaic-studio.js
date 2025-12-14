import { COLOR_PALETTE_ARRAY } from '../../src/shared/color-palette.js';
import { Voxelizer, FileUtils } from '../../src/shared/index.js';

export default class MosaicStudio {
    constructor() {
        this.image = null; // Stores the HTMLImageElement
        this.width = 48;
        this.canvas = null;
    }

    async init() {
        console.log("✅ Mosaic Studio Initialized");
        this.canvas = document.getElementById('preview');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Image Upload
        document.getElementById('upload-image')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Use FileUtils (which we stubbed, but need to work now)
                // For MVP, we'll do the loader inline if FileUtils isn't ready, 
                // but let's upgrade FileUtils in the next step if needed.
                // Assuming FileUtils.loadImage returns a Promise<Image>
                this.image = await FileUtils.loadImage(file);
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
        if (!this.image || !this.canvas) return;
        
        console.log(`🎨 Rendering Mosaic: ${this.width} studs wide`);

        // 1. Voxelize (The heavy lifting)
        const result = Voxelizer.fromImage(this.image, this.width, COLOR_PALETTE_ARRAY);
        
        // 2. Draw
        this.drawCanvas(result.grid, result.width, result.height);
        this.updateStats(result.grid);
    }

    drawCanvas(grid, width, height) {
        const ctx = this.canvas.getContext('2d');
        const studSize = 10; // Smaller studs for mosaics so they fit
        
        this.canvas.width = width * studSize;
        this.canvas.height = height * studSize;

        // Clear
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const colorObj = grid[y][x];
                
                const px = x * studSize;
                const py = y * studSize;

                // Simple flat square for mosaic (pixel art style)
                ctx.fillStyle = colorObj.hex;
                ctx.fillRect(px, py, studSize - 1, studSize - 1);
            }
        }
    }

    updateStats(grid) {
        const count = grid.flat().length;
        // Tally colors
        const counts = {};
        grid.flat().forEach(c => {
            counts[c.name] = (counts[c.name] || 0) + 1;
        });

        // Sort by usage
        const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 5);
        const topColors = sorted.map(([name, num]) => `<li>${name}: ${num}</li>`).join('');

        const statsPanel = document.getElementById('stats');
        if (statsPanel) {
            statsPanel.innerHTML = `
                <div style="font-family: monospace;">
                    <p><strong>Dimensions:</strong> ${grid[0].length} x ${grid.length}</p>
                    <p><strong>Total Bricks:</strong> ${count}</p>
                    <hr>
                    <strong>Top Colors:</strong>
                    <ul>${topColors}</ul>
                </div>
            `;
        }
    }
}