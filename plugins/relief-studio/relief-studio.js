import { COLOR_PALETTE_ARRAY } from '../../src/shared/color-palette.js';
import { Voxelizer, BrickOptimizer, FileUtils, Exporters, ColorUtils } from '../../src/shared/index.js';

import { StudioHeader } from '../../src/shared/studio-header.js';

export default class ReliefStudio {
    constructor() {
        // State
        this.image = null;
        this.width = 32;
        this.maxHeight = 6;
        this.invertDepth = true;

        // Data
        this.voxelGrid = null;
        this.brickLayout = null;

        // UI
        this.canvas = null;
    }

    async init() {
        console.log("✅ Relief Studio Initialized");
        StudioHeader.inject({
            title: 'Relief Studio',
            description: 'Transform images into <span style="font-weight:700;color:#FFE082;">3D topographical brick maps</span>.<br>Upload a photo, adjust height and depth, and preview your relief in real time!',
            features: [
                { icon: '', label: 'Image Upload', color: '#4CAF50' },
                { icon: '', label: 'Height Control', color: '#2196F3' },
                { icon: '', label: '3D Preview', color: '#FF9800' }
            ],
            id: 'reliefstudio-main-header'
        });
        this.canvas = document.getElementById('preview');
        this.setupEventListeners();
        this.drawPlaceholder();
    }

    setupEventListeners() {
        // Image Upload
        document.getElementById('upload-image')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                this.image = await FileUtils.loadImage(file);
                this.render();
            }
        });

        // Width Slider
        document.getElementById('width')?.addEventListener('input', (e) => {
            this.width = parseInt(e.target.value);
            if (this.image) this.render();
        });

        // Max Height Slider
        document.getElementById('max-height')?.addEventListener('input', (e) => {
            this.maxHeight = parseInt(e.target.value);
            if (this.image) this.render();
        });

        // Invert Checkbox
        document.getElementById('invert-depth')?.addEventListener('change', (e) => {
            this.invertDepth = e.target.checked;
            if (this.image) this.render();
        });
    }

    drawPlaceholder() {
        if (!this.canvas) return;
        this.canvas.width = 500;
        this.canvas.height = 400;
        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#f0f4f8';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = '#999';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Upload an image to generate 3D relief", this.canvas.width/2, this.canvas.height/2);
    }

    render() {
        if (!this.image || !this.canvas) return;

        // 1. Voxelize (Height Map)
        this.voxelGrid = Voxelizer.fromHeightMap(
            this.image, 
            this.width, 
            this.maxHeight, 
            this.invertDepth, 
            COLOR_PALETTE_ARRAY
        );

        // 2. Optimize
        this.brickLayout = BrickOptimizer.optimize(this.voxelGrid);

        // 3. Render Isometric
        this.renderIsometric();

        // 4. Stats
        this.updateStats();
    }

    renderIsometric() {
        const ctx = this.canvas.getContext('2d');
        const bricks = this.brickLayout.bricks;
        
        // Isometric constants
        const tileW = 16;
        const tileH = 8; // Flattened for iso perspective
        const layerH = 6; // Height of one plate in pixels

        // Calculate bounds to center the view
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        
        // We need to project points to find canvas size
        // Iso projection: 
        // screenX = (x - y) * tileW
        // screenY = (x + y) * tileH - (z * layerH)
        
        const project = (x, y, z) => ({
            x: (x - y) * tileW,
            y: (x + y) * tileH - (z * layerH)
        });

        // Sort bricks by depth (painter's algorithm)
        // Draw bottom-up, back-to-front
        // Sort by Z (height) first, then Y+X (iso depth)
        bricks.sort((a, b) => {
            if (a.z !== b.z) return a.z - b.z;
            return (a.x + a.y) - (b.x + b.y);
        });

        // Auto-size canvas
        // (Simplified: fixed size for now, centering logic is complex for quick implementation)
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        ctx.fillStyle = '#f0f4f8';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2; // Start lower to allow height growth

        bricks.forEach(brick => {
            const x = brick.x;
            const y = brick.y;
            const z = brick.height || 1; // Stored in voxel data, but optimizer might flatten. 
            // Wait, BrickOptimizer flattens to z=0 usually unless we handle 3D.
            // Voxelizer.fromHeightMap returns a grid where each cell has { height }.
            // BrickOptimizer.optimize currently handles 2D grids (z=0).
            // For Relief, we actually want to draw stacks.
            // The current BrickOptimizer might strip height info if not careful.
            // However, Voxelizer.fromHeightMap returns objects in the grid: { color, height }.
            // BrickOptimizer preserves the 'color' object. So brick.color will be { color:..., height:... }
            
            // Let's extract height from the color object payload if it exists, or default to 1
            const stackHeight = brick.color.height || 1;
            const colorHex = brick.color.color ? brick.color.color.hex : brick.color.hex;

            // Draw the stack
            const pos = project(x, y, 0);
            const screenX = centerX + pos.x;
            const screenY = centerY + pos.y;

            // Draw a block representing the stack height
            const totalH = stackHeight * layerH;
            
            ctx.fillStyle = colorHex;
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;

            // Top Face
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - totalH);
            ctx.lineTo(screenX + tileW, screenY - tileH - totalH);
            ctx.lineTo(screenX + 2*tileW, screenY - totalH);
            ctx.lineTo(screenX + tileW, screenY + tileH - totalH);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Right Face
            ctx.beginPath();
            ctx.moveTo(screenX + 2*tileW, screenY - totalH);
            ctx.lineTo(screenX + 2*tileW, screenY);
            ctx.lineTo(screenX + tileW, screenY + tileH);
            ctx.lineTo(screenX + tileW, screenY + tileH - totalH);
            ctx.closePath();
            ctx.fillStyle = ColorUtils.shadeColor(colorHex, -20); // Darker
            ctx.fill();
            ctx.stroke();

            // Left Face
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - totalH);
            ctx.lineTo(screenX, screenY);
            ctx.lineTo(screenX + tileW, screenY + tileH);
            ctx.lineTo(screenX + tileW, screenY + tileH - totalH);
            ctx.closePath();
            ctx.fillStyle = ColorUtils.shadeColor(colorHex, -10); // Slightly darker
            ctx.fill();
            ctx.stroke();
        });
    }

    updateStats() {
        const statsPanel = document.getElementById('stats');
        if (!statsPanel || !this.brickLayout) return;

        const count = this.brickLayout.getTotalBricks();
        
        statsPanel.innerHTML = `
            <div style="padding: 1rem; text-align: center;">
                <h3>Total Parts: ${count}</h3>
                <p>Max Height: ${this.maxHeight} plates</p>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button id="btn-csv" style="flex:1; padding:8px; background:#333; color:white; border:none; border-radius:4px; cursor:pointer;">CSV</button>
                    <button id="btn-png" style="flex:1; padding:8px; background:#D4AF37; color:white; border:none; border-radius:4px; cursor:pointer;">Image</button>
                </div>
            </div>
        `;

        setTimeout(() => {
            document.getElementById('btn-csv')?.addEventListener('click', () => {
                Exporters.downloadCSV(this.brickLayout.bricks.map(b => ({
                    part: `Stack ${b.color.height || 1}`,
                    color: b.color.color?.name || 'Unknown',
                    hex: b.color.color?.hex || '#000',
                    qty: 1
                })), 'relief-map.csv');
            });
            document.getElementById('btn-png')?.addEventListener('click', () => {
                Exporters.downloadPNG(this.canvas, 'relief-map.png');
            });
        }, 0);
    }
}

// Helper to shade colors for 3D effect
ColorUtils.shadeColor = function(color, percent) {
    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}