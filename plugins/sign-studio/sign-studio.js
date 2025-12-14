import { FONT_DATA } from '../../src/shared/font-data.js';
import { Voxelizer } from '../../src/shared/index.js';
import { COLOR_PALETTE_ARRAY } from '../../src/shared/color-palette.js';

import { StudioHeader } from '../../src/shared/studio-header.js';

export default class SignStudio {
    constructor() {
        // State matches the tools in manifest.json
        this.text = "HELLO";
        this.options = {
            textColor: "#000000",
            bgColor: "#F2F3F4",
            borderStyle: "simple"
        };
        this.palette = COLOR_PALETTE_ARRAY;
        this.canvas = null;
        this.animationFrame = null;
    }

    async init() {
        console.log("🎨 Sign Studio Initialized");
        StudioHeader.inject({
            title: 'Sign Studio',
            description: 'Create custom brick text signs with <span style="font-weight:700;color:#FFE082;">pixel-perfect precision</span>.<br>Choose your colors, border style, and type your message!',
            features: [
                { icon: '', label: 'Real-time Preview', color: '#4CAF50' },
                { icon: '', label: 'Instant Stats', color: '#2196F3' },
                { icon: '', label: 'Color Palette', color: '#FF9800' }
            ],
            id: 'signstudio-main-header'
        });
        this.canvas = document.getElementById('preview');
        this.setupEventListeners();
        this.injectColorDropdowns();
        this.render();
    }


    injectColorDropdowns() {
        // Enhanced Text Color Picker
        const textInput = document.getElementById('text-color');
        if (textInput && !document.getElementById('text-color-dropdown')) {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.gap = '10px';
            wrapper.style.marginBottom = '15px';
            
            const label = document.createElement('span');
            label.innerHTML = '🎨 Text Color:';
            label.style.fontWeight = '600';
            
            const textDropdown = document.createElement('select');
            textDropdown.id = 'text-color-dropdown';
            textDropdown.style.padding = '10px 15px';
            textDropdown.style.borderRadius = '8px';
            textDropdown.style.border = '2px solid #e0e0e0';
            textDropdown.style.backgroundColor = 'white';
            textDropdown.style.fontSize = '14px';
            textDropdown.style.cursor = 'pointer';
            textDropdown.style.transition = 'all 0.3s ease';
            
            textDropdown.innerHTML = `<option value="">Select from Palette…</option>` +
                this.palette.map(c => 
                    `<option value="${c.hex}" style="background-color: ${c.hex}; color: ${this.getContrastColor(c.hex)};">
                        ${c.name}
                    </option>`
                ).join('');
            
            textInput.parentNode.insertBefore(wrapper, textInput);
            wrapper.appendChild(label);
            wrapper.appendChild(textInput);
            wrapper.appendChild(textDropdown);
            
            textDropdown.onchange = (e) => {
                if (e.target.value) {
                    this.options.textColor = e.target.value;
                    textInput.value = e.target.value;
                    textInput.style.borderColor = e.target.value;
                    this.animateUpdate();
                    this.render();
                }
            };
            
            textInput.style.padding = '10px';
            textInput.style.borderRadius = '8px';
            textInput.style.border = `2px solid ${this.options.textColor}`;
            textInput.style.transition = 'border-color 0.3s ease';
        }

        // Enhanced Background Color Picker
        const bgInput = document.getElementById('bg-color');
        if (bgInput && !document.getElementById('bg-color-dropdown')) {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.gap = '10px';
            wrapper.style.marginBottom = '15px';
            
            const label = document.createElement('span');
            label.innerHTML = '🖼️ Background:';
            label.style.fontWeight = '600';
            
            const bgDropdown = document.createElement('select');
            bgDropdown.id = 'bg-color-dropdown';
            bgDropdown.style.padding = '10px 15px';
            bgDropdown.style.borderRadius = '8px';
            bgDropdown.style.border = '2px solid #e0e0e0';
            bgDropdown.style.backgroundColor = 'white';
            bgDropdown.style.fontSize = '14px';
            bgDropdown.style.cursor = 'pointer';
            bgDropdown.style.transition = 'all 0.3s ease';
            
            bgDropdown.innerHTML = `<option value="">Select from Palette…</option>` +
                this.palette.map(c => 
                    `<option value="${c.hex}" style="background-color: ${c.hex}; color: ${this.getContrastColor(c.hex)};">
                        ${c.name}
                    </option>`
                ).join('');
            
            bgInput.parentNode.insertBefore(wrapper, bgInput);
            wrapper.appendChild(label);
            wrapper.appendChild(bgInput);
            wrapper.appendChild(bgDropdown);
            
            bgDropdown.onchange = (e) => {
                if (e.target.value) {
                    this.options.bgColor = e.target.value;
                    bgInput.value = e.target.value;
                    bgInput.style.borderColor = e.target.value;
                    this.animateUpdate();
                    this.render();
                }
            };
            
            bgInput.style.padding = '10px';
            bgInput.style.borderRadius = '8px';
            bgInput.style.border = `2px solid ${this.options.bgColor}`;
            bgInput.style.transition = 'border-color 0.3s ease';
        }
    }

    getContrastColor(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    setupEventListeners() {
        // Enhanced Text Input with typing animation
        const textInput = document.getElementById('sign-text');
        if (textInput) {
            textInput.addEventListener('input', (e) => {
                this.text = e.target.value.toUpperCase();
                this.animateUpdate();
                this.render();
            });
            
            // Add typing indicator
            textInput.style.transition = 'all 0.3s ease';
            textInput.addEventListener('focus', (e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 4px 20px rgba(33, 150, 243, 0.2)';
            });
            textInput.addEventListener('blur', (e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
            });
        }

        // Enhanced Text Color Input
        const textColorInput = document.getElementById('text-color');
        if (textColorInput) {
            textColorInput.addEventListener('input', (e) => {
                this.options.textColor = e.target.value;
                const textDropdown = document.getElementById('text-color-dropdown');
                if (textDropdown && textDropdown.value !== e.target.value) {
                    textDropdown.value = '';
                }
                this.animateUpdate();
                this.render();
            });
        }

        // Enhanced Background Color Input
        const bgColorInput = document.getElementById('bg-color');
        if (bgColorInput) {
            bgColorInput.addEventListener('input', (e) => {
                this.options.bgColor = e.target.value;
                const bgDropdown = document.getElementById('bg-color-dropdown');
                if (bgDropdown && bgDropdown.value !== e.target.value) {
                    bgDropdown.value = '';
                }
                this.animateUpdate();
                this.render();
            });
        }

        // Enhanced Border Style Select
        const borderStyleSelect = document.getElementById('border-style');
        if (borderStyleSelect) {
            borderStyleSelect.addEventListener('change', (e) => {
                this.options.borderStyle = e.target.value;
                this.animateUpdate();
                this.render();
            });
            
            // Style the select
            borderStyleSelect.style.padding = '10px 15px';
            borderStyleSelect.style.borderRadius = '8px';
            borderStyleSelect.style.border = '2px solid #e0e0e0';
            borderStyleSelect.style.backgroundColor = 'white';
            borderStyleSelect.style.fontSize = '14px';
            borderStyleSelect.style.cursor = 'pointer';
            borderStyleSelect.style.transition = 'all 0.3s ease';
            
            borderStyleSelect.addEventListener('focus', () => {
                borderStyleSelect.style.borderColor = '#2196F3';
                borderStyleSelect.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)';
            });
            
            borderStyleSelect.addEventListener('blur', () => {
                borderStyleSelect.style.borderColor = '#e0e0e0';
                borderStyleSelect.style.boxShadow = 'none';
            });
        }
    }

    animateUpdate() {
        // Add visual feedback for updates
        if (this.canvas) {
            this.canvas.style.transform = 'scale(1.02)';
            this.canvas.style.transition = 'transform 0.2s ease';
            
            setTimeout(() => {
                this.canvas.style.transform = 'scale(1)';
            }, 200);
        }
    }

    render() {
        if (!this.canvas) return;

        // Cancel any pending animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        // Use requestAnimationFrame for smooth rendering
        this.animationFrame = requestAnimationFrame(() => {
            this._render();
        });
    }

    _render() {
        // 1. Get Raw Text Grid from Shared Library
        const rawVoxelData = Voxelizer.fromText(this.text, FONT_DATA, { spacing: 1 });
        const textGrid = rawVoxelData.grid;
        
        // 2. Apply Sign Studio Logic (Padding & Borders)
        let padding = 2;
        let borderThickness = this.options.borderStyle === 'simple' ? 2 : 
                              this.options.borderStyle === 'double' ? 3 : 0;
        
        const contentWidth = rawVoxelData.width;
        const contentHeight = rawVoxelData.height;
        const totalWidth = contentWidth + (padding * 2) + (borderThickness * 2);
        const totalHeight = contentHeight + (padding * 2) + (borderThickness * 2);
        
        let finalGrid = [];

        const createRow = (type) => Array(totalWidth).fill(type);

        // A. Top Border
        for(let i = 0; i < borderThickness; i++) finalGrid.push(createRow(2));

        // B. Top Padding
        for(let i = 0; i < padding; i++) {
            let row = [];
            for(let b = 0; b < borderThickness; b++) row.push(2);
            for(let p = 0; p < totalWidth - (borderThickness * 2); p++) row.push(0);
            for(let b = 0; b < borderThickness; b++) row.push(2);
            finalGrid.push(row);
        }

        // C. Content Rows
        for(let r = 0; r < contentHeight; r++) {
            let row = [];
            for(let b = 0; b < borderThickness; b++) row.push(2);
            for(let p = 0; p < padding; p++) row.push(0);
            row = row.concat(textGrid[r]);
            for(let p = 0; p < padding; p++) row.push(0);
            for(let b = 0; b < borderThickness; b++) row.push(2);
            finalGrid.push(row);
        }

        // D. Bottom Padding
        for(let i = 0; i < padding; i++) {
            let row = [];
            for(let b = 0; b < borderThickness; b++) row.push(2);
            for(let p = 0; p < totalWidth - (borderThickness * 2); p++) row.push(0);
            for(let b = 0; b < borderThickness; b++) row.push(2);
            finalGrid.push(row);
        }

        // E. Bottom Border
        for(let i = 0; i < borderThickness; i++) finalGrid.push(createRow(2));

        // 3. Render to Canvas
        this.drawCanvas(finalGrid, totalWidth, totalHeight);
        this.updateStats(finalGrid);
    }

    drawCanvas(grid, width, height) {
        const ctx = this.canvas.getContext('2d');
        const studSize = 20;

        this.canvas.width = width * studSize;
        this.canvas.height = height * studSize;

        // Clear with gradient
        const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#f5f5f5');
        gradient.addColorStop(1, '#e8e8e8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw subtle grid lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * studSize, 0);
            ctx.lineTo(x * studSize, this.canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * studSize);
            ctx.lineTo(this.canvas.width, y * studSize);
            ctx.stroke();
        }

        // Draw Bricks with enhanced visuals
        for(let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                const val = grid[y][x];
                let color = this.options.bgColor;
                
                if (val === 1) color = this.options.textColor;
                if (val === 2) color = this.options.textColor;

                const px = x * studSize;
                const py = y * studSize;

                // Draw base with rounded corners
                ctx.fillStyle = color;
                this.roundRect(ctx, px + 1, py + 1, studSize - 2, studSize - 2, 4);
                ctx.fill();

                // Draw stud with enhanced 3D effect
                const centerX = px + studSize / 2;
                const centerY = py + studSize / 2;
                const radius = studSize * 0.35;

                // Stud shadow
                ctx.beginPath();
                ctx.arc(centerX + 1.5, centerY + 1.5, radius - 0.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.fill();

                // Stud base
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                const studGradient = ctx.createRadialGradient(
                    centerX - radius/3, centerY - radius/3, 1,
                    centerX, centerY, radius
                );
                studGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                studGradient.addColorStop(1, color);
                ctx.fillStyle = studGradient;
                ctx.fill();

                // Stud highlight
                ctx.beginPath();
                ctx.arc(centerX - radius/3, centerY - radius/3, radius/3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fill();

                // Add subtle border to each stud
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = 0.5;
                this.roundRect(ctx, px + 1, py + 1, studSize - 2, studSize - 2, 4);
                ctx.stroke();
            }
        }

        // Add canvas drop shadow
        this.canvas.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1), 0 2px 10px rgba(0,0,0,0.05)';
        this.canvas.style.borderRadius = '12px';
        this.canvas.style.transition = 'all 0.3s ease';
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    updateStats(grid) {
        let textCount = 0, bgCount = 0, borderCount = 0;
        grid.flat().forEach(v => {
            if(v === 1) textCount++;
            else if(v === 2) borderCount++;
            else bgCount++;
        });

        const statsPanel = document.getElementById('stats');
        if (statsPanel) {
            const totalBricks = textCount + bgCount + borderCount;
            
            statsPanel.innerHTML = `
                <div style="font-family: 'Segoe UI', system-ui, sans-serif; background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <h3 style="margin-top: 0; color: #333; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5rem;">📊</span>
                        <span>Design Stats</span>
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 0.9rem; opacity: 0.9;">Dimensions</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${grid[0].length} × ${grid.length}</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 0.9rem; opacity: 0.9;">Total Bricks</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${totalBricks}</div>
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <h4 style="margin: 0 0 10px 0; color: #555;">Brick Breakdown</h4>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <div style="width: 12px; height: 12px; background: ${this.options.textColor}; border-radius: 3px; margin-right: 10px;"></div>
                            <span style="flex: 1;">Text Bricks</span>
                            <span style="font-weight: 600; background: #e3f2fd; padding: 3px 10px; border-radius: 20px;">${textCount}</span>
                        </div>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <div style="width: 12px; height: 12px; background: ${this.options.textColor}; opacity: 0.7; border-radius: 3px; margin-right: 10px;"></div>
                            <span style="flex: 1;">Border Bricks</span>
                            <span style="font-weight: 600; background: #fff3e0; padding: 3px 10px; border-radius: 20px;">${borderCount}</span>
                        </div>
                        
                        <div style="display: flex; align-items: center;">
                            <div style="width: 12px; height: 12px; background: ${this.options.bgColor}; border-radius: 3px; margin-right: 10px;"></div>
                            <span style="flex: 1;">Background</span>
                            <span style="font-weight: 600; background: #e8f5e9; padding: 3px 10px; border-radius: 20px;">${bgCount}</span>
                        </div>
                    </div>
                    
                    <div style="font-size: 0.8rem; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
                        Updates in real-time as you design
                    </div>
                </div>
            `;
            
            // Animate stats update
            statsPanel.style.animation = 'slideIn 0.5s ease-out';
            setTimeout(() => {
                statsPanel.style.animation = '';
            }, 500);
        }
    }
}