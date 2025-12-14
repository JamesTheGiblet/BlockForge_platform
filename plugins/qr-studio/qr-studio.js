import { ColorUtils } from '../../src/shared/index.js';

export default class QRStudio {
    constructor() {
        this.data = "https://blockforgestudio.com";
        this.size = 32;
        this.fgColor = "#1B2A34";
        this.bgColor = "#FFFFFF";
        this.canvas = null;
        this.libLoaded = false;
    }

    async init() {
        console.log("✅ QR Studio Initializing...");
        
        // 1. Load External Library
        await this.loadQRLibrary();
        
        // 2. Setup UI
        this.canvas = document.getElementById('preview');
        this.setupEventListeners();
        
        // 3. Initial Render
        this.render();
    }

    /**
     * Dynamically loads QRCode.js from CDN
     */
    async loadQRLibrary() {
        if (window.QRCode) {
            this.libLoaded = true;
            return;
        }

        console.log("⏳ Loading QRCode.js...");
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            script.onload = () => {
                console.log("📦 QRCode.js loaded");
                this.libLoaded = true;
                resolve();
            };
            script.onerror = () => reject(new Error("Failed to load QRCode.js"));
            document.head.appendChild(script);
        });
    }

    setupEventListeners() {
        document.getElementById('qr-data')?.addEventListener('input', (e) => {
            this.data = e.target.value;
            // Debounce slightly for better performance
            if (this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(() => this.render(), 500);
        });

        document.getElementById('plate-size')?.addEventListener('change', (e) => {
            this.size = parseInt(e.target.value);
            this.render();
        });

        document.getElementById('fg-color')?.addEventListener('input', (e) => {
            this.fgColor = e.target.value;
            this.render();
        });

        document.getElementById('bg-color')?.addEventListener('input', (e) => {
            this.bgColor = e.target.value;
            this.render();
        });
    }

    render() {
        if (!this.libLoaded || !this.canvas) return;
        if (!this.data) return;

        console.log(`🎨 Generating QR for: ${this.data}`);

        // 1. Create a hidden container for the library to draw into
        const hiddenDiv = document.createElement('div');
        hiddenDiv.style.display = 'none';
        document.body.appendChild(hiddenDiv);

        // 2. Generate QR (High Error Correction for bricks)
        // We multiply size by 10 to get clean pixels to read
        try {
            new QRCode(hiddenDiv, {
                text: this.data,
                width: this.size,
                height: this.size,
                correctLevel: QRCode.CorrectLevel.H
            });

            // 3. Wait a moment for the canvas/img to be generated
            setTimeout(() => {
                const qrImage = hiddenDiv.querySelector('img');
                if (qrImage) {
                    this.processQRImage(qrImage);
                }
                document.body.removeChild(hiddenDiv); // Cleanup
            }, 50);

        } catch (err) {
            console.error("QR Generation Error:", err);
            document.body.removeChild(hiddenDiv);
        }
    }

    /**
     * Convert the generated QR image into a brick grid
     */
    processQRImage(img) {
        // Create an offscreen canvas to read pixel data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.size;
        tempCanvas.height = this.size;
        const ctx = tempCanvas.getContext('2d');
        
        // Draw the image scaled exactly to our grid size (e.g., 32x32)
        ctx.drawImage(img, 0, 0, this.size, this.size);
        const imgData = ctx.getImageData(0, 0, this.size, this.size).data;

        // Build the Grid (1 = Dark/FG, 0 = Light/BG)
        let grid = [];
        let fgCount = 0;
        let bgCount = 0;

        for (let y = 0; y < this.size; y++) {
            let row = [];
            for (let x = 0; x < this.size; x++) {
                // Read pixel index (R, G, B, A)
                const i = (y * this.size + x) * 4;
                const avg = (imgData[i] + imgData[i+1] + imgData[i+2]) / 3;
                
                // If dark, it's a brick
                const isDark = avg < 128; 
                row.push(isDark ? 1 : 0);
                
                if (isDark) fgCount++; else bgCount++;
            }
            grid.push(row);
        }

        this.drawCanvas(grid);
        this.updateStats(fgCount, bgCount);
    }

    drawCanvas(grid) {
        const ctx = this.canvas.getContext('2d');
        const studSize = 20; // Matches Sign Studio
        const margin = 20;   // Add some breathing room

        this.canvas.width = (this.size * studSize) + (margin * 2);
        this.canvas.height = (this.size * studSize) + (margin * 2);

        // Fill Background (Studio Background, not QR background)
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Bricks
        for(let y = 0; y < this.size; y++) {
            for(let x = 0; x < this.size; x++) {
                const val = grid[y][x];
                const color = val === 1 ? this.fgColor : this.bgColor;

                const px = margin + (x * studSize);
                const py = margin + (y * studSize);

                // Circular Stud Style (from audit)
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(px + studSize/2, py + studSize/2, (studSize/2) - 1, 0, Math.PI * 2);
                ctx.fill();

                // Highlight
                ctx.beginPath();
                ctx.arc(px + studSize/2 - 2, py + studSize/2 - 2, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();

                // Shadow
                ctx.beginPath();
                ctx.arc(px + studSize/2 + 1, py + studSize/2 + 1, (studSize/2) - 1, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fill();
            }
        }
    }

    updateStats(fg, bg) {
        const statsPanel = document.getElementById('stats');
        if (statsPanel) {
            statsPanel.innerHTML = `
                <div style="font-family: monospace;">
                    <p><strong>Size:</strong> ${this.size}x${this.size}</p>
                    <p><strong>Total Bricks:</strong> ${fg + bg}</p>
                    <hr>
                    <p>Code Bricks (Dark): ${fg}</p>
                    <p>Background (Light): ${bg}</p>
                </div>
            `;
        }
    }
}