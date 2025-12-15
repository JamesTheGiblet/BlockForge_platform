import { COLOR_PALETTE_ARRAY } from '../../src/shared/data/color-palette.js';
import { TILE_BRICKS } from '../../src/shared/bricks/tile_bricks.js';
import { Exporters } from '../../src/shared/exporters/exporters.js';

import { StudioHeader } from '../../src/shared/ui/studio-header.js';
import { StudioStats } from '../../src/shared/ui/studio-stats.js';

export default class QRStudio {
    constructor() {
        // Use plain URL as default data (not markdown link)
        this.data = "https://blockforgestudio.com";
        this.size = 32;
        this.fgColor = "#1B2A34";
        this.bgColor = "#FFFFFF";
        this.palette = COLOR_PALETTE_ARRAY;
        this.canvas = null;
        this.libLoaded = false;
        this.scanSafetyMode = true; // default ON, forced ON for exports
        this.history = [];
        this.historyIndex = -1;
        this.MAX_HISTORY = 20;
        this.timeout = null;
        this._panZoom = null;
        this._brickLayout = null;
        this._lastGrid = null;
        this.exportQuality = 1; // Default high quality

        // Only allow tile bricks for QR builds
        this.allowedBricks = TILE_BRICKS;
    }

    injectColorDropdowns() {
        // Foreground
        const fgInput = document.getElementById('fg-color');
        if (fgInput && !document.getElementById('fg-color-dropdown')) {
            const fgDropdown = document.createElement('select');
            fgDropdown.id = 'fg-color-dropdown';
            fgDropdown.style.marginLeft = '0';
            fgDropdown.style.marginTop = '4px';
            fgDropdown.style.width = '100%';
            fgDropdown.style.padding = '4px';
            fgDropdown.style.borderRadius = '4px';
            fgDropdown.style.border = '1px solid #ccc';
            fgDropdown.innerHTML = `<option value="">Palette…</option>` +
                this.palette.map(c => `<option value="${c.hex}">${c.name}</option>`).join('');
            // Insert after the parent div of the input to stack it
            fgInput.parentNode.parentNode.appendChild(fgDropdown);
            fgDropdown.onchange = (e) => {
                if (e.target.value) {
                    this.fgColor = e.target.value;
                    fgInput.value = e.target.value;
                    this.render();
                }
            };
        }
        // Background
        const bgInput = document.getElementById('bg-color');
        if (bgInput && !document.getElementById('bg-color-dropdown')) {
            const bgDropdown = document.createElement('select');
            bgDropdown.id = 'bg-color-dropdown';
            bgDropdown.style.marginLeft = '0';
            bgDropdown.style.marginTop = '4px';
            bgDropdown.style.width = '100%';
            bgDropdown.style.padding = '4px';
            bgDropdown.style.borderRadius = '4px';
            bgDropdown.style.border = '1px solid #ccc';
            bgDropdown.innerHTML = `<option value="">Palette…</option>` +
                this.palette.map(c => `<option value="${c.hex}">${c.name}</option>`).join('');
            // Insert after the parent div of the input to stack it
            bgInput.parentNode.parentNode.appendChild(bgDropdown);
            bgDropdown.onchange = (e) => {
                if (e.target.value) {
                    this.bgColor = e.target.value;
                    bgInput.value = e.target.value;
                    this.render();
                }
            };
        }
    }

    async init() {
        console.log("✅ QR Studio Initializing...");
        try {
            StudioHeader.inject({
                title: 'QR Studio',
                description: 'Generate <span style="font-weight:700;color:#FFE082;">scannable QR codes</span> built from 1x1 bricks.<br>Enter your data, pick your colors, and export your custom QR masterpiece!',
                features: [
                    { icon: '', label: 'QR Code', color: '#4CAF50' },
                    { icon: '', label: 'Custom Colors', color: '#2196F3' },
                    { icon: '', label: 'Export Options', color: '#FF9800' }
                ],
                id: 'qrstudio-main-header'
            });

            // 1. Load External Library
            await this.loadQRLibrary();

            // 2. Setup UI
            // Hide any static/legacy controls container (if present)
            const possibleLegacyIds = ['qrstudio-legacy-controls', 'qr-controls', 'controls', 'sidebar', 'left-panel', 'studio-sidebar'];
            possibleLegacyIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            // Remove any legacy/static controls for QR Content, Baseplate Size, Code Color, and Background from the left window
            const idsToRemove = ['qr-data', 'plate-size', 'fg-color', 'bg-color'];
            let sidebarHidden = false;
            idsToRemove.forEach(id => {
                const el = document.getElementById(id);
                if (el && !el.closest('#qrstudio-controls')) {
                    const group = el.closest('.tool-group');
                    if (group && group.parentElement && !sidebarHidden) {
                        group.parentElement.style.display = 'none';
                        sidebarHidden = true;
                    }
                    if (group) group.remove();
                    else el.remove();
                }
            });
            this.injectFancyControls();
            this.canvas = document.getElementById('preview');
            this.setupEventListeners();
            this.injectColorDropdowns();
            this.setupExportButton();
            
            // Save initial state
            this.saveState();
            
            // 3. Initial Render
            this.render();
        } catch (error) {
            console.error('Failed to initialize QR Studio:', error);
            this.showFallbackMessage();
        }
    }

    showFallbackMessage() {
        const canvas = document.getElementById('preview');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#333';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('QR Studio initialization failed', canvas.width/2, canvas.height/2);
            ctx.font = '14px Arial';
            ctx.fillText('Please check console for errors', canvas.width/2, canvas.height/2 + 30);
        }
    }

    /**
     * Dynamically loads QRCode.js from CDN with fallbacks
     */
    async loadQRLibrary() {
        if (window.QRCode) {
            this.libLoaded = true;
            return;
        }

        console.log("⏳ Loading QRCode.js...");
        
        // Try multiple CDNs or local fallback
        const cdnUrls = [
            'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
            'https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js',
            '/lib/qrcode.min.js' // Local fallback
        ];
        
        for (const url of cdnUrls) {
            try {
                await this.loadScript(url);
                this.libLoaded = true;
                console.log(`📦 QRCode.js loaded from ${url}`);
                return;
            } catch (err) {
                console.warn(`Failed to load from ${url}:`, err);
            }
        }
        throw new Error("Could not load QRCode library");
    }

    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${url}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Injects a modern, visually enhanced control panel for QR Content, Baseplate Size, Code Color, and Background
     */
    injectFancyControls() {
        // Find or create the controls container
        let controls = document.getElementById('qrstudio-controls');
        if (!controls) {
            controls = document.createElement('div');
            controls.id = 'qrstudio-controls';
            
            // Floating Window Styles
            Object.assign(controls.style, {
                position: 'fixed',
                top: '140px',
                top: '120px',
                left: '20px',
                width: '260px',
                zIndex: '1000',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(5px)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                padding: '15px',
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'inherit',
                transition: 'opacity 0.3s'
            });

            // Insert into the app container so it gets cleaned up automatically
            const preview = document.getElementById('preview');
            if (preview && preview.parentNode) {
                preview.parentNode.appendChild(controls);
            } else {
                document.body.insertBefore(controls, document.body.firstChild);
            }
        } else {
            controls.innerHTML = '';
        }

        // Title / Header
        const header = document.createElement('div');
        header.setAttribute('role', 'heading');
        header.setAttribute('aria-level', '2');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-label', 'QR Tools - drag to move');
        header.innerHTML = '🛠️ <strong>QR Tools</strong>';
        header.style.borderBottom = '1px solid #eee';
        header.style.paddingBottom = '10px';
        header.style.marginBottom = '5px';
        header.style.cursor = 'move';
        controls.appendChild(header);

        // Make Draggable
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            controls.style.left = `${initialLeft + dx}px`;
            controls.style.top = `${initialTop + dy}px`;
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = controls.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        });

        // Make controls keyboard accessible
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                this.toggleControls();
            }
        });

        // Helper for label+icon
        const makeLabel = (icon, text) => {
            return `<span style="display:flex;align-items:center;font-weight:600;font-size:0.9em;gap:6px;color:#444;">${icon ? `<span style='font-size:1.1em;'>${icon}</span>` : ''}${text}</span>`;
        };

        // Preset Templates
        const templates = {
            'Website': 'https://blockforgestudio.com',
            'Contact': 'MECARD:N:John Doe;TEL:+1234567890;EMAIL:john@example.com;;',
            'WiFi': 'WIFI:S:MyNetwork;T:WPA;P:password;;',
            'Bitcoin': 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.01'
        };

        // QR Content (URL/Text)
        controls.innerHTML += `
            <div>
                <label for="qr-data" style="display:block;margin-bottom:5px;">${makeLabel('🔗','Content')}</label>
                <input id="qr-data" type="text" value="${this.data}" placeholder="URL or text..." style="width:100%; box-sizing:border-box; padding:8px; border-radius:6px; border:1px solid #ccc; font-size:0.9em;" />
            </div>
        `;

        // Template Selector
        controls.innerHTML += `
            <div>
                <label for="qr-template" style="display:block;margin-bottom:5px;">📋 Templates</label>
                <select id="qr-template" style="width:100%; box-sizing:border-box; padding:8px; border-radius:6px; border:1px solid #ccc; font-size:0.9em;">
                    <option value="">Custom</option>
                    ${Object.entries(templates).map(([name, value]) => 
                        `<option value="${value}">${name}</option>`
                    ).join('')}
                </select>
            </div>
        `;

        // Generate Button
        controls.innerHTML += `
            <button id="qrstudio-generate-btn" style="width:100%; margin-top:5px; padding:8px; border-radius:6px; border:none; background:#2196F3; color:white; font-weight:600; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.1);">⚡ Generate</button>
        `;

        // Baseplate Size
        controls.innerHTML += `
            <div>
                <label for="plate-size" style="display:block;margin-bottom:5px;">${makeLabel('🟦','Size')}</label>
                <select id="plate-size" style="width:100%; box-sizing:border-box; padding:8px; border-radius:6px; border:1px solid #ccc; font-size:0.9em;">
                    <option value="16" ${this.size==16?'selected':''}>16 x 16</option>
                    <option value="24" ${this.size==24?'selected':''}>24 x 24</option>
                    <option value="32" ${this.size==32?'selected':''}>32 x 32</option>
                    <option value="48" ${this.size==48?'selected':''}>48 x 48</option>
                    <option value="64" ${this.size==64?'selected':''}>64 x 64</option>
                </select>
            </div>
        `;

        // Colors Container
        controls.innerHTML += `
            <div style="display:flex; gap:10px;">
                <div style="flex:1;">
                    <label for="fg-color" style="display:block;margin-bottom:5px;">${makeLabel('🎨','Code')}</label>
                    <div style="display:flex;align-items:center;">
                        <input id="fg-color" type="color" value="${this.fgColor}" style="width:100%; height:32px; border:none; padding:0; cursor:pointer; border-radius:4px;" />
                    </div>
                </div>
                <div style="flex:1;">
                    <label for="bg-color" style="display:block;margin-bottom:5px;">${makeLabel('⬜','Back')}</label>
                    <div style="display:flex;align-items:center;">
                        <input id="bg-color" type="color" value="${this.bgColor}" style="width:100%; height:32px; border:none; padding:0; cursor:pointer; border-radius:4px;" />
                    </div>
                </div>
            </div>
        `;

        // Safety Mode Toggle
        controls.innerHTML += `
            <div style="display:flex;align-items:center;gap:8px;">
                <input id="scan-safety-toggle" type="checkbox" ${this.scanSafetyMode ? 'checked' : ''}/>
                <label for="scan-safety-toggle" style="font-size:0.9em;font-weight:600;">
                    📷 Scan Safety Mode (1x1 Only)
                </label>
            </div>
        `;

        // Export Quality
        controls.innerHTML += `
            <div>
                <label for="export-quality" style="display:block;margin-bottom:5px;">🖼️ Export Quality</label>
                <select id="export-quality" style="width:100%; box-sizing:border-box; padding:8px; border-radius:6px; border:1px solid #ccc; font-size:0.9em;">
                    <option value="1">High Quality</option>
                    <option value="0.8">Medium</option>
                    <option value="0.5">Low</option>
                </select>
            </div>
        `;

        // Undo/Redo buttons
        controls.innerHTML += `
            <div style="display:flex; gap:8px; margin-top:5px;">
                <button id="undo-btn" style="flex:1; padding:6px; border-radius:6px; border:1px solid #ddd; background:#f5f5f5; cursor:pointer;">↶ Undo</button>
                <button id="redo-btn" style="flex:1; padding:6px; border-radius:6px; border:1px solid #ddd; background:#f5f5f5; cursor:pointer;">↷ Redo</button>
            </div>
        `;

        // Validation
        controls.innerHTML += `
            <div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(0,0,0,0.1);">
                <button id="qrstudio-validate-btn" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ddd; background:#f5f5f5; color:#333; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:background 0.2s;">
                    📱 Simulate Scan
                </button>
                <div id="scan-result" style="margin-top:5px; font-size:0.8em; text-align:center; min-height:1.2em; color:#666;"></div>
            </div>
        `;

        // Export Buttons
        controls.innerHTML += `
            <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                <button id="qrstudio-export-btn" style="padding:10px; border-radius:6px; border:none; background:#2196F3; color:white; font-weight:600; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.1);">💾 Save PNG</button>
                <div style="display:flex; gap:8px;">
                    <button id="qrstudio-csv-btn" style="flex:1; padding:8px; border-radius:6px; border:none; background:#4CAF50; color:white; font-weight:600; cursor:pointer; font-size:0.9em; box-shadow:0 2px 5px rgba(0,0,0,0.1);">CSV</button>
                    <button id="qrstudio-guide-btn" style="flex:1; padding:8px; border-radius:6px; border:none; background:#FF9800; color:white; font-weight:600; cursor:pointer; font-size:0.9em; box-shadow:0 2px 5px rgba(0,0,0,0.1);">Guide</button>
                </div>
                <button id="qrstudio-instructions-btn" style="padding:8px; border-radius:6px; border:none; background:#673AB7; color:white; font-weight:600; cursor:pointer; font-size:0.95em; box-shadow:0 2px 5px rgba(0,0,0,0.1);">📖 Instruction Booklet</button>
            </div>
        `;

        // Make controls responsive
        const updateControlsPosition = () => {
            if (window.innerWidth < 768) {
                controls.style.top = 'auto';
                controls.style.bottom = '20px';
                controls.style.left = '50%';
                controls.style.transform = 'translateX(-50%)';
                controls.style.width = '90%';
                controls.style.maxWidth = '320px';
            } else {
                controls.style.top = '140px';
                controls.style.top = '120px';
                controls.style.left = '20px';
                controls.style.transform = 'none';
                controls.style.width = '260px';
            }
        };
        
        window.addEventListener('resize', updateControlsPosition);
        updateControlsPosition();
    }

    toggleControls() {
        const controls = document.getElementById('qrstudio-controls');
        if (controls) {
            controls.style.opacity = controls.style.opacity === '0.2' ? '1' : '0.2';
        }
    }

    saveState() {
        const state = {
            data: this.data,
            size: this.size,
            fgColor: this.fgColor,
            bgColor: this.bgColor,
            scanSafetyMode: this.scanSafetyMode
        };
        
        // Trim history if needed
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(JSON.parse(JSON.stringify(state)));
        
        if (this.history.length > this.MAX_HISTORY) {
            this.history.shift();
        }
        
        this.historyIndex = this.history.length - 1;
        this.updateUndoRedoButtons();
    }

    loadState(state) {
        this.data = state.data;
        this.size = state.size;
        this.fgColor = state.fgColor;
        this.bgColor = state.bgColor;
        this.scanSafetyMode = state.scanSafetyMode;
        
        // Update UI elements
        const dataInput = document.getElementById('qr-data');
        if (dataInput) dataInput.value = this.data;
        
        const sizeSelect = document.getElementById('plate-size');
        if (sizeSelect) sizeSelect.value = this.size;
        
        const fgInput = document.getElementById('fg-color');
        if (fgInput) fgInput.value = this.fgColor;
        
        const bgInput = document.getElementById('bg-color');
        if (bgInput) bgInput.value = this.bgColor;
        
        const safetyToggle = document.getElementById('scan-safety-toggle');
        if (safetyToggle) safetyToggle.checked = this.scanSafetyMode;
        
        this.render();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadState(this.history[this.historyIndex]);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadState(this.history[this.historyIndex]);
        }
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.disabled = this.historyIndex <= 0;
            undoBtn.style.opacity = undoBtn.disabled ? '0.5' : '1';
        }
        
        if (redoBtn) {
            redoBtn.disabled = this.historyIndex >= this.history.length - 1;
            redoBtn.style.opacity = redoBtn.disabled ? '0.5' : '1';
        }
    }

    setupExportButton() {
        // Force scanSafetyMode ON for all exports (PNG, CSV, Guide)
        const forceSafeExport = async (fn) => {
            if (!this.scanSafetyMode) {
                this.scanSafetyMode = true;
                const toggle = document.getElementById('scan-safety-toggle');
                if (toggle) toggle.checked = true;
                await this.render();
            }
            fn();
        };

        // Instruction Booklet Export
        const instructionsBtn = document.getElementById('qrstudio-instructions-btn');
        if (instructionsBtn) {
            if (window.monetization && window.monetization.isLocked('qr-studio', 'export_instructions')) {
                // Visual lock indicator could go here
                instructionsBtn.innerHTML += ' 🔒';
            }
            instructionsBtn.onclick = () => forceSafeExport(() => {
                if (window.monetization && window.monetization.isLocked('qr-studio', 'export_instructions')) {
                    window.monetization.openUpgradeModal('Instruction Booklets');
                    return;
                }
                const html = this.generateInstructionBooklet();
                const blob = new Blob([html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'qr-instructions.html';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            });
        }

        const pngBtn = document.getElementById('qrstudio-export-btn');
        if (pngBtn) {
            pngBtn.onclick = () => forceSafeExport(() => {
                // Create a temporary canvas for a clean, fitted export (no huge margins)
                const studSize = 20;
                const margin = 20;
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = (this.size * studSize) + (margin * 2);
                tempCanvas.height = (this.size * studSize) + (margin * 2);
                const ctx = tempCanvas.getContext('2d');

                // Draw background and bricks
                ctx.fillStyle = '#eee';
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                this.renderBricksToContext(ctx, margin, margin, studSize);

                const qualitySelect = document.getElementById('export-quality');
                if (qualitySelect) {
                    this.exportQuality = parseFloat(qualitySelect.value);
                }
                Exporters.downloadPNG(tempCanvas, 'qr-code.png', this.exportQuality);
            });
        }

        const csvBtn = document.getElementById('qrstudio-csv-btn');
        if (csvBtn) {
            if (window.monetization && window.monetization.isLocked('qr-studio', 'export_csv')) {
                csvBtn.innerHTML += ' 🔒';
            }
            csvBtn.onclick = () => forceSafeExport(() => {
                if (window.monetization && window.monetization.isLocked('qr-studio', 'export_csv')) {
                    window.monetization.openUpgradeModal('CSV Export');
                    return;
                }
                const partsList = this.generatePartsList();
                Exporters.downloadCSV(partsList, 'qr-parts.csv');
            });
        }

        const guideBtn = document.getElementById('qrstudio-guide-btn');
        if (guideBtn) {
            guideBtn.onclick = () => forceSafeExport(() => {
                const partsList = this.generatePartsList();
                const placementGrid = this.generatePlacementGrid();
                const metadata = {
                    title: 'QR Code Build Guide',
                    client: this.data,
                    partsList,
                    placementGrid,
                    gridSize: this.size
                };
                Exporters.downloadHTML(metadata, 'qr-build-guide.html');
            });
        }
    }

    generateInstructionBooklet() {
        if (!this._brickLayout || !this.size) return '<html><body><h2>No build data available.</h2></body></html>';
        const steps = this._brickLayout;
        const studSize = 18;
        const margin = 10;
        // Helper to render a grid up to a given step
        function renderGridSVG(size, bricks, stepIdx, fgColor, bgColor) {
            let svg = `<svg width="${size*studSize+margin*2}" height="${size*studSize+margin*2}" xmlns='http://www.w3.org/2000/svg'>`;
            svg += `<rect x="0" y="0" width="${size*studSize+margin*2}" height="${size*studSize+margin*2}" fill="#eee"/>`;
            svg += `<rect x="${margin}" y="${margin}" width="${size*studSize}" height="${size*studSize}" fill="${bgColor}"/>`;
            for (let i = 0; i <= stepIdx; i++) {
                const b = bricks[i];
                const color = b.isDark ? fgColor : bgColor;
                const x = margin + b.x * studSize;
                const y = margin + b.y * studSize;
                const w = (b.brick.width || 1) * studSize;
                const h = (b.brick.depth || 1) * studSize;
                svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${color}" stroke="#444" stroke-width="0.5"/>`;
            }
            svg += '</svg>';
            return svg;
        }
        // HTML booklet
        let html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>QR Build Instructions</title><style>
            body { font-family: Arial, sans-serif; background: #f9f9f9; color: #222; }
            .step { page-break-after: always; margin-bottom: 40px; }
            .step h2 { margin-top: 0; }
            .grid { margin: 16px 0; }
            .info { font-size: 1em; margin-bottom: 8px; }
            .summary { background: #eee; padding: 10px; border-radius: 8px; margin-bottom: 20px; }
        </style></head><body>`;
        html += `<h1>QR Build Instructions</h1>`;
        html += `<div class='summary'><b>Data:</b> ${this.data}<br><b>Size:</b> ${this.size} x ${this.size}<br><b>Total Bricks:</b> ${steps.length}</div>`;
        for (let i = 0; i < steps.length; i++) {
            const b = steps[i];
            html += `<div class='step'>`;
            html += `<h2>Step ${i+1} of ${steps.length}</h2>`;
            html += `<div class='info'><b>Place:</b> ${b.brick.name} at (<b>${b.x+1}</b>, <b>${b.y+1}</b>)<br><b>Color:</b> <span style='color:${b.isDark ? this.fgColor : this.bgColor};'>${this.getColorName(b.isDark ? this.fgColor : this.bgColor)}</span></div>`;
            html += `<div class='grid'>${renderGridSVG(this.size, steps, i, this.fgColor, this.bgColor)}</div>`;
            html += `</div>`;
        }
        html += `<div class='summary'><b>Done!</b> You have completed the QR build.</div>`;
        html += '</body></html>';
        return html;
    }

    // Generate a grid with placement info for the build guide
    generatePlacementGrid() {
        if (!this._lastGrid) return [];
        const grid = [];
        for (let y = 0; y < this._lastGrid.length; y++) {
            const row = [];
            for (let x = 0; x < this._lastGrid[y].length; x++) {
                const cell = this._lastGrid[y][x];
                if (!cell) {
                    // Empty cell (Baseplate background)
                    row.push({
                        row: y + 1,
                        col: x + 1,
                        part: 'Baseplate',
                        color: this.getColorName(this.bgColor),
                        hex: this.bgColor
                    });
                    continue;
                }
                row.push({
                    row: y + 1,
                    col: x + 1,
                    part: cell.brick.name,
                    color: this.getColorName(cell.isDark ? this.fgColor : this.bgColor),
                    hex: cell.isDark ? this.fgColor : this.bgColor
                });
            }
            grid.push(row);
        }
        return grid;
    }

    // Generate a parts list from the last grid (counts by brick type and color)
    generatePartsList() {
        if (this._brickLayout) {
            const colorMap = {};
            this._brickLayout.forEach(item => {
                const color = item.isDark ? this.fgColor : this.bgColor;
                const brick = item.brick;
                const key = `${brick.name}|${color}`;
                if (!colorMap[key]) {
                    colorMap[key] = {
                        part: brick.name,
                        color: this.getColorName(color),
                        hex: color,
                        qty: 0
                    };
                }
                colorMap[key].qty++;
            });
            return Object.values(colorMap);
        }
        if (!this._lastGrid) return [];
        const colorMap = {};
        for (let y = 0; y < this._lastGrid.length; y++) {
            for (let x = 0; x < this._lastGrid[y].length; x++) {
                const cell = this._lastGrid[y][x];
                if (!cell) continue;
                const color = cell.isDark ? this.fgColor : this.bgColor;
                const brick = cell.brick;
                const key = `${brick.name}|${color}`;
                if (!colorMap[key]) {
                    colorMap[key] = {
                        part: brick.name,
                        color: this.getColorName(color),
                        hex: color,
                        qty: 0
                    };
                }
                colorMap[key].qty++;
            }
        }
        return Object.values(colorMap);
    }

    // Try to get a color name from the palette, fallback to hex
    getColorName(hex) {
        const found = this.palette.find(c => c.hex.toLowerCase() === hex.toLowerCase());
        return found ? found.name : hex;
    }

    setupEventListeners() {
        document.getElementById('qr-data')?.addEventListener('input', (e) => {
            this.data = e.target.value;
            // Save state before render
            this.saveState();
            // Debounce slightly for better performance
            if (this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(() => this.render(), 500);
        });

        document.getElementById('qr-template')?.addEventListener('change', (e) => {
            if (e.target.value) {
                this.data = e.target.value;
                document.getElementById('qr-data').value = e.target.value;
                this.saveState();
                this.render();
            }
        });

        document.getElementById('qrstudio-generate-btn')?.addEventListener('click', () => {
            this.saveState();
            this.render();
        });

        document.getElementById('plate-size')?.addEventListener('change', (e) => {
            this.size = parseInt(e.target.value);
            this.saveState();
            this.render();
        });

        document.getElementById('fg-color')?.addEventListener('input', (e) => {
            this.fgColor = e.target.value;
            // Reset dropdown if custom color
            const fgDropdown = document.getElementById('fg-color-dropdown');
            if (fgDropdown && fgDropdown.value !== e.target.value) fgDropdown.value = '';
            this.saveState();
            this.render();
        });

        document.getElementById('bg-color')?.addEventListener('input', (e) => {
            this.bgColor = e.target.value;
            // Reset dropdown if custom color
            const bgDropdown = document.getElementById('bg-color-dropdown');
            if (bgDropdown && bgDropdown.value !== e.target.value) bgDropdown.value = '';
            this.saveState();
            this.render();
        });

        document.getElementById('scan-safety-toggle')?.addEventListener('change', (e) => {
            if (window.monetization && window.monetization.isLocked('qr-studio', 'safety_override') && !e.target.checked) {
                e.target.checked = true; // Keep it checked (safe mode on)
                window.monetization.openUpgradeModal('Safety Override');
                return;
            }
            this.scanSafetyMode = e.target.checked;
            this.saveState();
            this.render();
        });

        document.getElementById('export-quality')?.addEventListener('change', (e) => {
            this.exportQuality = parseFloat(e.target.value);
        });

        document.getElementById('undo-btn')?.addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('redo-btn')?.addEventListener('click', () => {
            this.redo();
        });

        const validateBtn = document.getElementById('qrstudio-validate-btn');
        if (validateBtn) {
            if (window.monetization && window.monetization.isLocked('qr-studio', 'simulate_scan')) {
                validateBtn.innerHTML += ' 🔒';
            }
            validateBtn.addEventListener('click', () => {
                if (window.monetization && window.monetization.isLocked('qr-studio', 'simulate_scan')) {
                    window.monetization.openUpgradeModal('Simulate Scan');
                    return;
                }
                this.validateQR();
            });
        }
    }

    render() {
        if (!this.libLoaded || !this.canvas) return Promise.resolve();
        if (!this.data) return Promise.resolve();

        // Validate QR content
        const error = this.validateQRContent(this.data);
        if (error) {
            this.showError(error);
            return Promise.resolve();
        }

        console.log(`🎨 Generating QR for: ${this.data}`);

        return new Promise((resolve) => {
            // 1. Create a hidden container for the library to draw into
            const hiddenDiv = document.createElement('div');
            hiddenDiv.className = 'qrstudio-hidden-div';
            hiddenDiv.style.display = 'none';
            document.body.appendChild(hiddenDiv);

            // 2. Generate QR (High Error Correction for bricks)
            try {
                const genSize = this.size * 8; // Generate high-res to avoid aliasing
                new QRCode(hiddenDiv, {
                    text: this.data,
                    width: genSize,
                    height: genSize,
                    correctLevel: QRCode.CorrectLevel.H
                });

                // 3. Wait a moment for the canvas/img to be generated
                setTimeout(() => {
                    const qrImage = hiddenDiv.querySelector('img');
                    if (qrImage) {
                        this.processQRImage(qrImage);
                    }
                    // Ensure cleanup even on errors
                    this.cleanupHiddenDivs(hiddenDiv);
                    resolve();
                }, 50);

            } catch (err) {
                console.error("QR Generation Error:", err);
                this.cleanupHiddenDivs(hiddenDiv);
                resolve();
            }
        });
    }

    cleanupHiddenDivs(divToKeep = null) {
        // Remove all hidden divs except the one we're currently using
        document.querySelectorAll('.qrstudio-hidden-div').forEach(el => {
            if (el !== divToKeep && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        // Remove the current div if provided
        if (divToKeep && divToKeep.parentNode) {
            divToKeep.parentNode.removeChild(divToKeep);
        }
    }

    validateQRContent(data) {
        // Check URL format
        if (data.startsWith('http')) {
            try {
                new URL(data);
            } catch {
                return 'Invalid URL format';
            }
        }
        
        // Check length limits based on QR version
        const maxLength = this.getMaxLengthForSize(this.size);
        if (data.length > maxLength) {
            return `Data too long for ${this.size}x${this.size} QR. Max: ${maxLength} chars`;
        }
        
        return null;
    }

    getMaxLengthForSize(size) {
        // Approximate capacity for QR codes at different sizes
        const capacities = {
            16: 25,   // Version 1
            24: 47,   // Version 2
            32: 77,   // Version 3
            48: 154,  // Version 5
            64: 272   // Version 8
        };
        return capacities[size] || 77;
    }

    showError(message) {
        // Clear existing errors
        const existingError = document.getElementById('qrstudio-error');
        if (existingError) existingError.remove();
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.id = 'qrstudio-error';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffebee;
            color: #c62828;
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid #ef9a9a;
            z-index: 9999;
            font-size: 0.9em;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease;
        `;
        errorDiv.innerHTML = `<strong>⚠️ Error:</strong> ${message}`;
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) errorDiv.parentNode.removeChild(errorDiv);
        }, 5000);
    }

    /**
     * Dynamically loads jsQR for validation
     */
    async loadReaderLibrary() {
        if (window.jsQR) return;
        
        console.log("⏳ Loading jsQR...");
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
            script.onload = () => {
                if (typeof jsQR === 'undefined') {
                    reject(new Error("jsQR script loaded but global object not found"));
                    return;
                }
                console.log("📦 jsQR loaded");
                resolve();
            };
            script.onerror = () => reject(new Error("Failed to load jsQR"));
            document.head.appendChild(script);
        });
    }

    async validateQR() {
        const btn = document.getElementById('qrstudio-validate-btn');
        const resultDiv = document.getElementById('scan-result');
        
        if (btn) btn.disabled = true;
        if (resultDiv) {
            resultDiv.innerHTML = 'Simulating Scan...';
            resultDiv.style.color = '#666';
        }

        try {
            await this.loadReaderLibrary();

            // 1. Create simulation canvas with PROPER quiet zone
            const studSize = 20;
            const quietZone = 4; // QR spec requires 4 modules minimum
            const margin = studSize * quietZone; // ✅ 80px for 32x32
            
            const simCanvas = document.createElement('canvas');
            simCanvas.width = (this.size * studSize) + (margin * 2);
            simCanvas.height = (this.size * studSize) + (margin * 2);
            const ctx = simCanvas.getContext('2d');

            // Fill background (quiet zone must be same as bgColor)
            ctx.fillStyle = this.bgColor;
            ctx.fillRect(0, 0, simCanvas.width, simCanvas.height);

            // Draw bricks (now properly aligned with quiet zone)
            this.renderBricksToContext(ctx, margin, margin, studSize);

            // 2. Get Data
            const imageData = ctx.getImageData(0, 0, simCanvas.width, simCanvas.height);
            const data = imageData.data;

            // 3. Decode
            if (typeof jsQR === 'undefined') throw new Error("Scanner library not loaded");
            
            let code;
            try {
                code = jsQR(data, imageData.width, imageData.height);
            } catch (e) {
                throw new Error(`Decoding failed: ${e.message}`);
            }

            if (resultDiv) {
                if (code && code.data === this.data) {
                    resultDiv.innerHTML = `✅ <strong>Readable!</strong>`;
                    resultDiv.style.color = '#2E7D32';
                } else if (code) {
                    resultDiv.innerHTML = `⚠️ <strong>Mismatch:</strong> ${code.data.substring(0, 10)}...`;
                    resultDiv.style.color = '#F57C00';
                } else {
                    resultDiv.innerHTML = `❌ <strong>Unreadable</strong> in simulation`;
                    resultDiv.style.color = '#C62828';
                }
            }
        } catch (err) {
            console.error("Scan Simulation Error:", err);
            if (resultDiv) {
                resultDiv.innerHTML = `❌ <strong>Error:</strong> ${err.message}`;
                resultDiv.style.color = '#C62828';
            }
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    /**
     * Helper to generate brick layout from raw grid
     */
    optimizeBricks(rawGrid, enforceSafety) {
        const size = rawGrid.length;
        const bricks = [];
        const covered = Array(size).fill().map(() => Array(size).fill(false));
        
        const findBrick = (w, d) => this.allowedBricks.find(b => b.width === w && b.depth === d && b.isTile);
        const tile2x2 = findBrick(2, 2);
        const tile1x1 = findBrick(1, 1) || this.allowedBricks[0];

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (covered[y][x]) continue;
                const isDark = rawGrid[y][x];

                // OPTIMIZATION: Skip background tiles
                // We rely on the baseplate color for the background
                if (!isDark) {
                    covered[y][x] = true;
                    continue;
                }

                // Try 2x2 (only if safety mode is OFF)
                if (!enforceSafety && tile2x2 && x + 1 < size && y + 1 < size &&
                    !covered[y][x+1] && !covered[y+1][x] && !covered[y+1][x+1] &&
                    rawGrid[y][x+1] === isDark && rawGrid[y+1][x] === isDark && rawGrid[y+1][x+1] === isDark) {
                    
                    bricks.push({ x, y, brick: tile2x2, isDark }); // ✅ No isFinder flag
                    covered[y][x] = covered[y][x+1] = covered[y+1][x] = covered[y+1][x+1] = true;
                } else {
                    bricks.push({ x, y, brick: tile1x1, isDark }); // ✅ No isFinder flag
                    covered[y][x] = true;
                }
            }
        }
        return bricks;
    }

    /**
     * Convert the generated QR image into a brick grid
     */
    processQRImage(img) {
        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => {
            // Create an offscreen canvas to read pixel data
            const sampleScale = 8;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.size * sampleScale;
            tempCanvas.height = this.size * sampleScale;
            const ctx = tempCanvas.getContext('2d');
            
            // Draw the image scaled to our sampling grid
            ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

            // 1. Parse raw grid (dark/light)
            const rawGrid = [];
            let minX = this.size, minY = this.size, maxX = 0, maxY = 0;

            for (let y = 0; y < this.size; y++) {
                const row = [];
                for (let x = 0; x < this.size; x++) {
                    // Sample center of the block
                    const sx = Math.floor((x + 0.5) * sampleScale);
                    const sy = Math.floor((y + 0.5) * sampleScale);
                    const i = (sy * tempCanvas.width + sx) * 4;
                    
                    const avg = (imgData[i] + imgData[i+1] + imgData[i+2]) / 3;
                    const isDark = avg < 128;
                    row.push(isDark);
                    if (isDark) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
                rawGrid.push(row);
            }

            // 2. Optimize Bricks (Greedy 2x2 -> 1x1)
            this._rawGrid = rawGrid;
            
            // For large grids, could use Web Workers here for optimization
            // For now, use synchronous optimization
            if (this.size >= 48) {
                // For very large grids, warn about performance
                console.log(`Processing large grid ${this.size}x${this.size}...`);
            }
            
            this._brickLayout = this.optimizeBricks(rawGrid, this.scanSafetyMode);
            const bricks = this._brickLayout;

            // 3. Reconstruct Grid for Placement Guide & Legacy Support
            const grid = Array(this.size).fill().map(() => Array(this.size));
            bricks.forEach(item => {
                for(let dy=0; dy<(item.brick.depth||1); dy++) {
                    for(let dx=0; dx<(item.brick.width||1); dx++) {
                        if (grid[item.y + dy]) {
                            grid[item.y + dy][item.x + dx] = {
                                isDark: item.isDark,
                                brick: item.brick
                            };
                        }
                    }
                }
            });
            this._lastGrid = grid;

            this.drawCanvas();
            this.updateStats();
        });
    }

    drawCanvas() {
        const ctx = this.canvas.getContext('2d');
        const studSize = 20;
        const margin = 20;
        const maxSize = 64; // Fixed max size for static preview window

        // Camera state
        if (!this._panZoom) {
            this._panZoom = { x: 0, y: 0, zoom: 1 };
            // Mouse drag to pan
            let isDragging = false, prevX = 0, prevY = 0;
            this.canvas.addEventListener('mousedown', e => {
                isDragging = true; prevX = e.clientX; prevY = e.clientY;
            });
            window.addEventListener('mouseup', () => { isDragging = false; });
            window.addEventListener('mousemove', e => {
                if (isDragging) {
                    this._panZoom.x += (e.clientX - prevX);
                    this._panZoom.y += (e.clientY - prevY);
                    prevX = e.clientX; prevY = e.clientY;
                    this.drawCanvas();
                }
            });
            // Wheel to zoom
            this.canvas.addEventListener('wheel', e => {
                e.preventDefault();
                const zoomFactor = 1.1;
                const oldZoom = this._panZoom.zoom;
                if (e.deltaY < 0) this._panZoom.zoom *= zoomFactor;
                else this._panZoom.zoom /= zoomFactor;
                // Clamp zoom
                this._panZoom.zoom = Math.max(0.2, Math.min(5, this._panZoom.zoom));
                // Adjust pan so zoom centers on mouse
                const rect = this.canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                this._panZoom.x = mx - (mx - this._panZoom.x) * (this._panZoom.zoom / oldZoom);
                this._panZoom.y = my - (my - this._panZoom.y) * (this._panZoom.zoom / oldZoom);
                this.drawCanvas();
            }, { passive: false });
        }

        // Set canvas size (static based on max size 64x64)
        this.canvas.width = (maxSize * studSize) + (margin * 2);
        this.canvas.height = (maxSize * studSize) + (margin * 2);

        // Fill Background
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();

        // Apply pan/zoom
        ctx.save();
        ctx.translate(this._panZoom.x, this._panZoom.y);
        ctx.scale(this._panZoom.zoom, this._panZoom.zoom);

        // Calculate offset to center the grid if smaller than maxSize
        const offsetX = ((maxSize - this.size) * studSize) / 2;
        const offsetY = ((maxSize - this.size) * studSize) / 2;

        // Draw Baseplate (Background Color)
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(margin + offsetX, margin + offsetY, this.size * studSize, this.size * studSize);

        this.renderBricksToContext(ctx, margin + offsetX, margin + offsetY, studSize);
        
        ctx.restore();
    }

    renderBricksToContext(ctx, startX, startY, studSize) {
        const bricks = this._brickLayout || [];
        
        bricks.forEach(item => {
            const { x, y, brick, isDark } = item;
            const color = isDark ? this.fgColor : this.bgColor;
            const px = startX + (x * studSize);
            const py = startY + (y * studSize);
            const w = (brick.width || 1) * studSize;
            const h = (brick.depth || 1) * studSize;

            // CRITICAL: Draw solid rectangles for QR validation
            // No rounded corners, no gaps, no fancy effects
            ctx.fillStyle = color;
            ctx.fillRect(px, py, w, h); // ✅ Solid fill, edge-to-edge

            // Optional: Add subtle visual border INSIDE the brick
            // This won't affect scanning since it's same color with slight opacity
            if (brick.isTile) {
                ctx.strokeStyle = 'rgba(0,0,0,0.05)';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(px + 0.5, py + 0.5, w - 1, h - 1);
            }
        });
    }

    updateStats() {
        let statsPanel = document.getElementById('stats');
        if (!statsPanel) {
            statsPanel = document.createElement('div');
            statsPanel.id = 'stats';
            statsPanel.style.marginTop = '1rem';
            
            const preview = document.getElementById('preview');
            if (preview) {
                const container = preview.closest('.panel') || preview.parentElement;
                if (container) container.appendChild(statsPanel);
            }
        }
        if (!statsPanel) return;
        
        let totalBricks = 0;
        const brickUsage = {};
        
        // Aggregate by Name AND Color for better breakdown
        (this._brickLayout || []).forEach(item => {
            totalBricks++;
            const name = item.brick.name;
            const color = item.isDark ? this.fgColor : this.bgColor;
            const key = `${name}|${color}`;
            
            if (!brickUsage[key]) {
                brickUsage[key] = { label: `${name} (${color})`, color: color, count: 0 };
            }
            brickUsage[key].count++;
        });

        // Show a breakdown of brick types used
        const breakdown = Object.values(brickUsage).sort((a,b) => b.count - a.count);
        
        StudioStats.render({
            statsPanel,
            stats: {
                dimensions: `Size: ${this.size}x${this.size}`,
                totalBricks,
                breakdown
            }
        });

        // Comparison Report
    if (this._rawGrid) {
        const safeLayout = this.optimizeBricks(this._rawGrid, true);
        const optLayout = this.optimizeBricks(this._rawGrid, false);
        const safeCount = safeLayout.length;
        const optCount = optLayout.length;

        const report = document.createElement('div');
        report.className = 'optimization-report';
        report.style.marginTop = '15px';
        report.style.padding = '10px';
        report.style.background = this.scanSafetyMode ? '#f1f8e9' : '#e3f2fd';
        report.style.borderRadius = '6px';
        report.style.fontSize = '0.9em';
        report.style.border = this.scanSafetyMode ? '1px solid #c5e1a5' : '1px solid #90caf9';

        if (this.scanSafetyMode) {
            const savings = safeCount - optCount;
            const percent = Math.round((savings / safeCount) * 100);
            report.innerHTML = `<strong>💡 Optimization Available</strong><br>Disable Safety Mode to use larger tiles.<br>Potential savings: <strong>${savings} bricks</strong> (${percent}%)`;
        } else {
            report.innerHTML = `<strong>⚡ Optimized Mode Active</strong><br>Using ${optCount} bricks instead of ${safeCount}.<br>(Safety Mode would use 1x1s only)`;
        }
        statsPanel.appendChild(report);
    }

    // Update undo/redo buttons
    this.updateUndoRedoButtons();
    }
}
    
