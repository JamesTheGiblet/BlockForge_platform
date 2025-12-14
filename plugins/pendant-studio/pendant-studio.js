import { LETTER_PATTERNS } from './assets/letter-patterns.js';
import { Exporters, FileUtils } from '../../src/shared/index.js';

export default class PendantStudio {
    constructor() {
        this.initials = "AB";
        this.style = "interlock";
        this.baseplate = "border";
        this.color = "#D4AF37"; // Gold
        this.size = "medium";
        this.gridSize = 20;
        this.canvas = null;
        this.grid = []; // Stores the 2D design
    }

    async init() {
        console.log("✅ Pendant Studio Initialized");
        this.canvas = document.getElementById('preview');
        
        // Load jsPDF dynamically if needed for instructions
        this.loadJsPDF();
        
        this.setupEventListeners();
        this.generate();
    }

    async loadJsPDF() {
        if (window.jspdf) return;
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(script);
    }

    setupEventListeners() {
        document.getElementById('initials')?.addEventListener('input', (e) => {
            this.initials = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4);
            this.generate();
        });
        document.getElementById('design-style')?.addEventListener('change', (e) => {
            this.style = e.target.value;
            this.generate();
        });
        document.getElementById('baseplate-style')?.addEventListener('change', (e) => {
            this.baseplate = e.target.value;
            this.generate();
        });
        document.getElementById('pendant-color')?.addEventListener('input', (e) => {
            this.color = e.target.value;
            this.render(); // Re-render only
        });
        document.getElementById('size-preset')?.addEventListener('change', (e) => {
            this.size = e.target.value;
            if(this.size === 'small') this.gridSize = 16;
            else if(this.size === 'large') this.gridSize = 24;
            else this.gridSize = 20;
            this.generate();
        });
    }

    generate() {
        if (!this.initials) return;

        // Initialize empty grid
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));

        // 1. Generate Letter Pattern
        const letters = this.initials.split('').map(l => LETTER_PATTERNS[l] || LETTER_PATTERNS['A']);
        const center = Math.floor(this.gridSize / 2);

        // Simple placement logic based on style (Simplified version of your code)
        if (this.style === 'interlock' && letters.length === 2) {
            this.placeLetter(letters[0], center - 4, center - 3);
            this.placeLetter(letters[1], center + 1, center - 3);
            // Simple bridge
            if(this.grid[center][center-1] === 0) this.grid[center][center-1] = 1;
        } 
        else if (this.style === 'stacked') {
            const startY = center - (letters.length * 6) / 2;
            letters.forEach((l, i) => this.placeLetter(l, center - 2, startY + i * 6));
        }
        else {
            // Default center placement for others
            letters.forEach((l, i) => this.placeLetter(l, center - 2 + (i*5), center - 2));
        }

        // 2. Apply Baseplate
        this.applyBaseplate();

        this.render();
        this.updateStats();
    }

    placeLetter(letter, startX, startY) {
        letter.forEach((row, y) => {
            row.forEach((val, x) => {
                const gy = Math.floor(startY + y);
                const gx = Math.floor(startX + x);
                if (gy >= 0 && gy < this.gridSize && gx >= 0 && gx < this.gridSize) {
                    if (val === 1) this.grid[gy][gx] = 1;
                }
            });
        });
    }

    applyBaseplate() {
        const center = Math.floor(this.gridSize / 2);
        
        if (this.baseplate === 'border') {
            for(let i=0; i<this.gridSize; i++) {
                this.grid[0][i] = 1;
                this.grid[this.gridSize-1][i] = 1;
                this.grid[i][0] = 1;
                this.grid[i][this.gridSize-1] = 1;
            }
        }
        else if (this.baseplate === 'circle') {
            const radius = this.gridSize/2 - 1;
            for(let y=0; y<this.gridSize; y++) {
                for(let x=0; x<this.gridSize; x++) {
                    const dist = Math.sqrt((x-center)**2 + (y-center)**2);
                    if (Math.abs(dist - radius) < 1) this.grid[y][x] = 1;
                }
            }
        }
        else if (this.baseplate === 'heart') {
             for(let y=0; y<this.gridSize; y++) {
                for(let x=0; x<this.gridSize; x++) {
                    const nx = (x-center)/(this.gridSize*0.4);
                    const ny = -(y-center*0.7)/(this.gridSize*0.4);
                    const eq = (nx*nx + ny*ny - 1)**3 - nx*nx*ny*ny*ny;
                    if(Math.abs(eq) < 0.2) this.grid[y][x] = 1;
                }
            }
        }
    }

    render() {
        if (!this.canvas) return;
        const ctx = this.canvas.getContext('2d');
        this.canvas.width = 500;
        this.canvas.height = 500;
        
        // Background
        const grad = ctx.createRadialGradient(250,250,0, 250,250,250);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, '#eee');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 500, 500);

        const studSize = 500 / this.gridSize;

        for(let y=0; y<this.gridSize; y++) {
            for(let x=0; x<this.gridSize; x++) {
                if (this.grid[y][x]) {
                    const px = x * studSize;
                    const py = y * studSize;
                    
                    // Draw Jewel-like stud
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(px + studSize/2, py + studSize/2, studSize/2 - 2, 0, Math.PI*2);
                    ctx.fill();
                    
                    // Shine
                    ctx.fillStyle = 'rgba(255,255,255,0.4)';
                    ctx.beginPath();
                    ctx.arc(px + studSize/2 - 3, py + studSize/2 - 3, studSize/4, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        }
        
        // Hole indicator
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(250, 20, 5, 0, Math.PI*2);
        ctx.fill();
    }

    updateStats() {
        const statsPanel = document.getElementById('stats');
        const count = this.grid.flat().filter(x => x===1).length;
        
        if (statsPanel) {
            statsPanel.innerHTML = `
                <div style="text-align:center">
                    <h3>${count} Gems</h3>
                    <p>Size: ${this.gridSize}x${this.gridSize} studs</p>
                    <div style="display:flex; gap:5px; margin-top:10px;">
                        <button id="btn-stl" style="flex:1; padding:8px; background:#333; color:white; border:none; cursor:pointer;">Export STL</button>
                        <button id="btn-img" style="flex:1; padding:8px; background:#D4AF37; color:white; border:none; cursor:pointer;">Save Image</button>
                    </div>
                </div>
            `;
            
            document.getElementById('btn-img').onclick = () => Exporters.downloadPNG(this.canvas, `pendant-${this.initials}.png`);
            document.getElementById('btn-stl').onclick = () => alert("STL Export logic goes here (Ported from original HTML if needed)");
        }
    }
}