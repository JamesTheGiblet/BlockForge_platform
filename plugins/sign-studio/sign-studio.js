import { FONT_DATA } from './assets/font-data.js';
import { Voxelizer } from '../../src/shared/index.js';

export default class SignStudio {
    constructor() {
        // State matches the tools in manifest.json
        this.text = "HELLO";
        this.options = {
            textColor: "#000000",
            bgColor: "#F2F3F4",
            borderStyle: "simple"
        };
        this.canvas = null;
    }

    async init() {
        console.log("✅ Sign Studio Initialized");
        this.canvas = document.getElementById('preview');
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Wire up inputs using IDs from manifest.json
        
        // Text Input
        document.getElementById('sign-text')?.addEventListener('input', (e) => {
            this.text = e.target.value.toUpperCase();
            this.render();
        });

        // Text Color
        document.getElementById('text-color')?.addEventListener('input', (e) => {
            this.options.textColor = e.target.value;
            this.render();
        });

        // Background Color
        document.getElementById('bg-color')?.addEventListener('input', (e) => {
            this.options.bgColor = e.target.value;
            this.render();
        });

        // Border Style
        document.getElementById('border-style')?.addEventListener('change', (e) => {
            this.options.borderStyle = e.target.value;
            this.render();
        });
    }

    render() {
        if (!this.canvas) return;

        // 1. Get Raw Text Grid from Shared Library
        const rawVoxelData = Voxelizer.fromText(this.text, FONT_DATA, { spacing: 1 });
        const textGrid = rawVoxelData.grid;
        
        // 2. Apply Sign Studio Logic (Padding & Borders)
        // Adapted from sign.html
        
        // Calculate padding/border based on style
        let padding = 2; // Default "bold" padding
        let borderThickness = this.options.borderStyle === 'simple' ? 2 : 
                              this.options.borderStyle === 'double' ? 3 : 0;
        
        // Construct Final Grid (0=bg, 1=text, 2=border)
        // We build a new 2D array that wraps the textGrid
        
        const contentWidth = rawVoxelData.width;
        const contentHeight = rawVoxelData.height;
        const totalWidth = contentWidth + (padding * 2) + (borderThickness * 2);
        const totalHeight = contentHeight + (padding * 2) + (borderThickness * 2);
        
        let finalGrid = [];

        // Helper to create a row
        const createRow = (type) => Array(totalWidth).fill(type);

        // A. Top Border
        for(let i=0; i<borderThickness; i++) finalGrid.push(createRow(2));

        // B. Top Padding
        for(let i=0; i<padding; i++) {
            let row = [];
            for(let b=0; b<borderThickness; b++) row.push(2); // Left Border
            for(let p=0; p<totalWidth - (borderThickness*2); p++) row.push(0); // Padding (BG)
            for(let b=0; b<borderThickness; b++) row.push(2); // Right Border
            finalGrid.push(row);
        }

        // C. Content Rows
        for(let r=0; r<contentHeight; r++) {
            let row = [];
            for(let b=0; b<borderThickness; b++) row.push(2); // Left Border
            for(let p=0; p<padding; p++) row.push(0); // Left Padding
            
            // Text Content
            row = row.concat(textGrid[r]);
            
            for(let p=0; p<padding; p++) row.push(0); // Right Padding
            for(let b=0; b<borderThickness; b++) row.push(2); // Right Border
            finalGrid.push(row);
        }

        // D. Bottom Padding
        for(let i=0; i<padding; i++) {
            let row = [];
            for(let b=0; b<borderThickness; b++) row.push(2); 
            for(let p=0; p<totalWidth - (borderThickness*2); p++) row.push(0); 
            for(let b=0; b<borderThickness; b++) row.push(2); 
            finalGrid.push(row);
        }

        // E. Bottom Border
        for(let i=0; i<borderThickness; i++) finalGrid.push(createRow(2));

        // 3. Render to Canvas
        this.drawCanvas(finalGrid, totalWidth, totalHeight);
        this.updateStats(finalGrid);
    }

    drawCanvas(grid, width, height) {
        const ctx = this.canvas.getContext('2d');
        const studSize = 20;

        this.canvas.width = width * studSize;
        this.canvas.height = height * studSize;

        // Clear
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Bricks
        for(let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                const val = grid[y][x];
                let color = this.options.bgColor;
                
                if (val === 1) color = this.options.textColor;
                if (val === 2) color = this.options.textColor; // Border matches text color usually

                // Draw Stud (Adapted from sign.html render function)
                const px = x * studSize;
                const py = y * studSize;

                // Base
                ctx.fillStyle = color;
                ctx.fillRect(px, py, studSize, studSize);

                // Highlight
                ctx.beginPath();
                ctx.arc(px + studSize/2, py + studSize/2, studSize * 0.35, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();

                // Shadow
                ctx.beginPath();
                ctx.arc(px + studSize/2 + 1, py + studSize/2 + 1, studSize * 0.35, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fill();
            }
        }
    }

    updateStats(grid) {
        // Count bricks
        let textCount = 0, bgCount = 0, borderCount = 0;
        grid.flat().forEach(v => {
            if(v === 1) textCount++;
            else if(v === 2) borderCount++;
            else bgCount++;
        });

        // Update HTML panel (if it exists)
        const statsPanel = document.getElementById('stats');
        if (statsPanel) {
            statsPanel.innerHTML = `
                <div style="font-family: monospace;">
                    <p><strong>Dimensions:</strong> ${grid[0].length} x ${grid.length} studs</p>
                    <p><strong>Total Bricks:</strong> ${textCount + bgCount + borderCount}</p>
                    <hr>
                    <p>Text Bricks: ${textCount}</p>
                    <p>Border Bricks: ${borderCount}</p>
                    <p>Background: ${bgCount}</p>
                </div>
            `;
        }
    }
}