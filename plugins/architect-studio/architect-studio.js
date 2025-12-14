import { ARCH_PALETTE } from './assets/palette.js';
import { FileUtils, Voxelizer, BrickOptimizer, ColorUtils } from '../../src/shared/index.js';

export default class ArchitectStudio {
    constructor() {
        this.image = null;
        this.detailLevel = 7;
        this.style = 'traditional';
        this.hasTrees = true;
        this.hasFence = false;
        this.clientName = "";
        this.canvas = null;
    }

    async init() {
        console.log("✅ Architect Studio Initialized");
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

        document.getElementById('detail-level')?.addEventListener('input', (e) => {
            this.detailLevel = parseInt(e.target.value);
            this.render();
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
            this.render();
        });
    }

    render() {
        if (!this.canvas) return;

        if (this.image) {
            this.generateBlueprint();
        } else {
            this.renderDemo();
        }
    }

    renderDemo() {
        // 1. Calculate Simulation Data
        const baseBricks = 1200; 
        const multiplier = 0.5 + (this.detailLevel * 0.1);
        const totalBricks = Math.round(baseBricks * multiplier);
        
        // 2. Generate BOM
        const bom = [
            { part: "Roof Tiles", color: ARCH_PALETTE.roof, count: Math.round(totalBricks * 0.25) },
            { part: "Siding Bricks", color: ARCH_PALETTE.siding, count: Math.round(totalBricks * 0.35) },
            { part: "Windows", color: ARCH_PALETTE.window, count: Math.round(totalBricks * 0.15) },
            { part: "Foundation", color: ARCH_PALETTE.foundation, count: Math.round(totalBricks * 0.1) }
        ];

        if (this.hasTrees) {
            bom.push({ part: "Landscaping", color: ARCH_PALETTE.landscape, count: 150 });
        }
        if (this.hasFence) {
            bom.push({ part: "Fence Pickets", color: ARCH_PALETTE.siding, count: 45 });
        }

        // 3. Draw
        this.drawSchematic(bom);
        this.updateStats(bom, totalBricks);
    }

    generateBlueprint() {
        // 1. Voxelize
        // Map detail level (1-10) to width (32-92 studs)
        const width = 32 + (this.detailLevel * 6); 
        const palette = Object.values(ARCH_PALETTE);
        
        const voxelGrid = Voxelizer.fromImage(this.image, width, palette);

        // 2. Optimize
        const brickLayout = BrickOptimizer.optimize(voxelGrid);

        // 3. Draw
        this.drawBricks(brickLayout);

        // 4. Stats
        this.updateRealStats(brickLayout);
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
            const palEntry = Object.values(ARCH_PALETTE).find(p => p.hex === hex) || { name: 'Custom', hex };
            return { part: "Brick", color: palEntry, count };
        });

        this.updateStats(bom, layout.bricks ? layout.bricks.length : 0);
    }

    drawSchematic(bom) {
        if (!this.canvas) return;

        // 🛠️ FIX: Force the canvas to be large enough
        this.canvas.width = 500;
        this.canvas.height = 400;

        const ctx = this.canvas.getContext('2d');
        const width = this.canvas.width;
        const height = this.canvas.height;
        const cx = width / 2;
        const cy = height - 50;

        // Clear
        ctx.fillStyle = '#f0f4f8';
        ctx.fillRect(0, 0, width, height);

        // Draw House Diagram
            // Foundation
            ctx.fillStyle = ARCH_PALETTE.foundation.hex;
            ctx.fillRect(cx - 100, cy, 200, 20);

            // Main Body
            ctx.fillStyle = ARCH_PALETTE.siding.hex;
            ctx.fillRect(cx - 90, cy - 120, 180, 120);
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - 90, cy - 120, 180, 120);

            // Roof
            ctx.fillStyle = ARCH_PALETTE.roof.hex;
            ctx.beginPath();
            ctx.moveTo(cx - 110, cy - 120);
            ctx.lineTo(cx, cy - 190);
            ctx.lineTo(cx + 110, cy - 120);
            ctx.fill();

            // Door
            ctx.fillStyle = ARCH_PALETTE.door.hex;
            ctx.fillRect(cx - 20, cy - 60, 40, 60);

            // Trees
            if (this.hasTrees) {
                ctx.fillStyle = ARCH_PALETTE.landscape.hex;
                // Left Tree
                ctx.beginPath();
                ctx.arc(cx - 140, cy - 20, 30, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = "#582A12"; // Trunk
                ctx.fillRect(cx - 145, cy, 10, 20);
                
                // Right Tree
                ctx.fillStyle = ARCH_PALETTE.landscape.hex;
                ctx.beginPath();
                ctx.arc(cx + 140, cy - 20, 30, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = "#582A12"; // Trunk
                ctx.fillRect(cx + 135, cy, 10, 20);
            }

        // Title Overlay
        ctx.fillStyle = '#333';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.clientName || "Blueprint Preview", cx, 40);
        
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(`${this.style.toUpperCase()} STYLE`, cx, 65);
    }

    updateStats(bom, total) {
        const statsPanel = document.getElementById('stats');
        if (!statsPanel) return;

        const rows = bom.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 4px;">${item.part}</td>
                <td style="padding: 4px; color:${item.color.hex}">■ ${item.color.name}</td>
                <td style="padding: 4px; text-align:right"><strong>${item.count}</strong></td>
            </tr>
        `).join('');

        statsPanel.innerHTML = `
            <div style="background: #fff; border-radius: 4px; padding: 0.5rem;">
                <h3 style="margin-top:0; border-bottom: 2px solid #D4AF37; padding-bottom: 0.5rem;">Materials List</h3>
                <table style="width:100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="text-align:left; padding: 4px;">Part</th>
                            <th style="text-align:left; padding: 4px;">Color</th>
                            <th style="text-align:right; padding: 4px;">Qty</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ddd; text-align: center;">
                    <span style="font-size: 1.2rem; font-weight: bold; color: #333;">Total Bricks: ${total}</span>
                </div>
            </div>
        `;
    }
}