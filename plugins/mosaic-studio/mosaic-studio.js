

import { COLOR_PALETTE_ARRAY } from '../../src/shared/data/color-palette.js';
import { Voxelizer, FileUtils } from '../../src/shared/index.js';
import { StudioHeader } from '../../src/shared/ui/studio-header.js';
import { StudioStats } from '../../src/shared/ui/studio-stats.js';

export default class MosaicStudio {
    constructor() {
        this.image = null; // Stores the HTMLImageElement
        this.width = 48;
        this.canvas = null;
        this.brightness = 100;
        this.contrast = 100;
        this.saturation = 100;
        this.pixelate = 1;
        this.activeTool = null; // 'paint', 'drop'
        this.paintColor = COLOR_PALETTE_ARRAY[0];
        this.isDrawing = false;
        this.history = [];
        this.redoStack = [];
        this.showGrid = false;
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

        // Hide legacy sidebar
        const sidebar = document.getElementById('studio-sidebar');
        if (sidebar) sidebar.style.display = 'none';

        // Setup Layout (Original -> Adjusted -> Mosaic)
        this.canvas = document.getElementById('preview');
        if (this.canvas) {
            // Container for all three views
            const mainContainer = document.createElement('div');
            Object.assign(mainContainer.style, {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                justifyContent: 'center',
                alignItems: 'flex-start',
                marginTop: '10px',
                padding: '20px',
                width: '100%'
            });

            // 1. Original
            const originalWrapper = document.createElement('div');
            originalWrapper.innerHTML = '<h3 style="text-align:center;color:#666;margin-bottom:10px;">Original</h3>';
            this.originalView = document.createElement('img');
            this.originalView.id = 'view-original';
            Object.assign(this.originalView.style, { display: 'block', border: '1px solid #ddd', borderRadius: '8px', background: '#f5f5f5' });
            originalWrapper.appendChild(this.originalView);
            mainContainer.appendChild(originalWrapper);

            // 2. Adjusted
            const adjustedWrapper = document.createElement('div');
            adjustedWrapper.innerHTML = '<h3 style="text-align:center;color:#666;margin-bottom:10px;">Adjusted</h3>';
            this.adjustedView = document.createElement('canvas');
            this.adjustedView.id = 'view-adjusted';
            Object.assign(this.adjustedView.style, { display: 'block', border: '1px solid #ddd', borderRadius: '8px', background: '#f5f5f5' });
            adjustedWrapper.appendChild(this.adjustedView);
            mainContainer.appendChild(adjustedWrapper);

            // 3. Mosaic
            const mosaicWrapper = document.createElement('div');
            mosaicWrapper.innerHTML = '<h3 style="text-align:center;color:#666;margin-bottom:10px;">Mosaic Result</h3>';
            mainContainer.appendChild(mosaicWrapper);

            // Insert main container before canvas
            this.canvas.parentNode.insertBefore(mainContainer, this.canvas);
            
            // Move canvas into wrapper
            mosaicWrapper.appendChild(this.canvas);
        }

        this.injectFancyControls();
        this.setupEventListeners();

        // Load default image
        const img = new Image();
        img.src = '/Maggie_Simpson.png';
        img.onload = () => {
            this.image = img;
            this.render();
        };
    }

    injectFancyControls() {
        let controls = document.getElementById('mosaicstudio-controls');
        if (!controls) {
            controls = document.createElement('div');
            controls.id = 'mosaicstudio-controls';
            
            // Floating Window Styles
            Object.assign(controls.style, {
                position: 'fixed',
                top: '120px',
                left: '20px',
                width: '260px',
                zIndex: '1000',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#333',
                backdropFilter: 'blur(5px)',
                maxHeight: '80vh',
                overflowY: 'auto',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                padding: '15px',
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'inherit',
                transition: 'opacity 0.3s'
            });

            const preview = document.getElementById('preview');
            if (preview && preview.parentNode) {
                preview.parentNode.appendChild(controls);
            } else {
                document.body.insertBefore(controls, document.body.firstChild);
            }
        } else {
            controls.innerHTML = '';
        }

        // Header
        const header = document.createElement('div');
        header.innerHTML = '🎨 <strong>Mosaic Tools</strong>';
        header.style.borderBottom = '1px solid #eee';
        header.style.paddingBottom = '10px';
        header.style.marginBottom = '5px';
        header.style.cursor = 'move';
        controls.appendChild(header);

        // Draggable Logic
        let isDragging = false, startX, startY, initialLeft, initialTop;
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = controls.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            const onMove = (e) => {
                if (!isDragging) return;
                controls.style.left = `${initialLeft + (e.clientX - startX)}px`;
                controls.style.top = `${initialTop + (e.clientY - startY)}px`;
            };
            const onUp = () => {
                isDragging = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // Image Upload
        controls.innerHTML += `
            <div>
                <label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.9em;color:#444;">📁 Source Image</label>
                <input id="upload-image-fancy" type="file" accept="image/*" style="width:100%; box-sizing:border-box; padding:8px; border-radius:6px; border:1px solid #ccc; font-size:0.9em;" />
            </div>
        `;

        // Width Slider
        controls.innerHTML += `
            <div>
                <label style="display:flex;justify-content:space-between;margin-bottom:5px;font-weight:600;font-size:0.9em;color:#444;">
                    <span>📏 Width (Studs)</span>
                    <span id="width-display">${this.width}</span>
                </label>
                <input id="target-width-fancy" type="range" min="16" max="128" value="${this.width}" style="width:100%; cursor:pointer;" />
            </div>
        `;

        // Image Adjustments
        controls.innerHTML += `
            <div style="border-top:1px solid #eee; margin-top:10px; padding-top:10px;">
                <label style="display:block;margin-bottom:8px;font-weight:600;font-size:0.9em;color:#444;">🎨 Adjustments</label>
                
                <div style="margin-bottom:8px;">
                    <label style="display:flex;justify-content:space-between;font-size:0.8em;color:#666;">
                        <span>Brightness</span>
                        <span id="brightness-val">${this.brightness}%</span>
                    </label>
                    <input id="adjust-brightness" type="range" min="0" max="200" value="${this.brightness}" style="width:100%; cursor:pointer;" />
                </div>

                <div style="margin-bottom:8px;">
                    <label style="display:flex;justify-content:space-between;font-size:0.8em;color:#666;">
                        <span>Contrast</span>
                        <span id="contrast-val">${this.contrast}%</span>
                    </label>
                    <input id="adjust-contrast" type="range" min="0" max="200" value="${this.contrast}" style="width:100%; cursor:pointer;" />
                </div>

                <div style="margin-bottom:8px;">
                    <label style="display:flex;justify-content:space-between;font-size:0.8em;color:#666;">
                        <span>Saturation</span>
                        <span id="saturation-val">${this.saturation}%</span>
                    </label>
                    <input id="adjust-saturation" type="range" min="0" max="200" value="${this.saturation}" style="width:100%; cursor:pointer;" />
                </div>

                <div style="margin-bottom:8px;">
                    <label style="display:flex;justify-content:space-between;font-size:0.8em;color:#666;">
                        <span>Pixelate</span>
                        <span id="pixelate-val">${this.pixelate}x</span>
                    </label>
                    <input id="adjust-pixelate" type="range" min="1" max="20" value="${this.pixelate}" style="width:100%; cursor:pointer;" />
                </div>
            </div>
        `;

        // Tools Section
        controls.innerHTML += `
            <div style="border-top:1px solid #eee; margin-top:10px; padding-top:10px;">
                <label style="display:block;margin-bottom:8px;font-weight:600;font-size:0.9em;color:#444;">🛠️ Tools</label>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <button id="tool-paint" style="flex:1; padding:8px; border-radius:6px; border:1px solid #ccc; background:#f9f9f9; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;">
                        🖌️ Paint
                    </button>
                    <button id="tool-fill" style="flex:1; padding:8px; border-radius:6px; border:1px solid #ccc; background:#f9f9f9; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;">
                        🪣 Fill
                    </button>
                    <button id="tool-drop" style="flex:1; padding:8px; border-radius:6px; border:1px solid #ccc; background:#f9f9f9; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;">
                        💧 Drop
                    </button>
                    <button id="tool-undo" style="flex:0.5; padding:8px; border-radius:6px; border:1px solid #ccc; background:#f9f9f9; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="Undo (Ctrl+Z)">
                        ↩️
                    </button>
                    <button id="tool-redo" style="flex:0.5; padding:8px; border-radius:6px; border:1px solid #ccc; background:#f9f9f9; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="Redo (Ctrl+Y)">
                        ↪️
                    </button>
                </div>

                <div style="margin-bottom:8px; display:flex; align-items:center; gap:8px;">
                    <input id="toggle-grid" type="checkbox" ${this.showGrid ? 'checked' : ''} style="cursor:pointer;">
                    <label for="toggle-grid" style="font-size:0.9em; color:#444; cursor:pointer;">Show Grid Overlay</label>
                </div>
                
                <div id="paint-controls" style="display:none; animation: fadeIn 0.3s;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div id="paint-preview" style="width:24px; height:24px; border-radius:4px; border:1px solid rgba(0,0,0,0.2); background:${this.paintColor.hex};"></div>
                        <select id="paint-color-select" style="flex:1; padding:6px; border-radius:4px; border:1px solid #ccc; font-size:0.9em;">
                            ${COLOR_PALETTE_ARRAY.map(c => `<option value="${c.hex}" ${c.hex === this.paintColor.hex ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
        `;

        // Export Buttons
        controls.innerHTML += `
            <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                <button id="btn-png-fancy" style="padding:10px; border-radius:6px; border:none; background:#D4AF37; color:white; font-weight:600; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.1);">💾 Save Image</button>
                <div style="display:flex; gap:8px;">
                    <button id="btn-csv-fancy" style="flex:1; padding:10px; border-radius:6px; border:none; background:#333; color:white; font-weight:600; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.1);">📄 CSV</button>
                    <button id="btn-guide-fancy" style="flex:1; padding:10px; border-radius:6px; border:none; background:#FF9800; color:white; font-weight:600; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.1);">📖 Guide</button>
                </div>
            </div>
        `;

        // Responsive
        if (window.innerWidth < 768) {
            controls.style.top = 'auto'; controls.style.bottom = '20px';
            controls.style.left = '50%'; controls.style.transform = 'translateX(-50%)';
            controls.style.width = '90%';
        }
    }

    setupEventListeners() {
        // Image Upload
        document.getElementById('upload-image-fancy')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                this.image = await FileUtils.loadImage(file);
                console.log('[MosaicStudio] Image loaded:', this.image);
                this.render();
            }
        });

        // Width Slider
        document.getElementById('target-width-fancy')?.addEventListener('input', (e) => {
            this.width = parseInt(e.target.value);
            document.getElementById('width-display').textContent = this.width;
            this.render();
        });

        // Adjustment Sliders
        const setupSlider = (id, prop, displayId, unit = '%') => {
            document.getElementById(id)?.addEventListener('input', (e) => {
                this[prop] = parseInt(e.target.value);
                document.getElementById(displayId).textContent = this[prop] + unit;
                this.render();
            });
        };

        setupSlider('adjust-brightness', 'brightness', 'brightness-val');
        setupSlider('adjust-contrast', 'contrast', 'contrast-val');
        setupSlider('adjust-saturation', 'saturation', 'saturation-val');
        setupSlider('adjust-pixelate', 'pixelate', 'pixelate-val', 'x');

        // Tool Buttons
        const btnPaint = document.getElementById('tool-paint');
        const btnFill = document.getElementById('tool-fill');
        const btnDrop = document.getElementById('tool-drop');
        const btnUndo = document.getElementById('tool-undo');
        const btnRedo = document.getElementById('tool-redo');
        const paintControls = document.getElementById('paint-controls');
        const colorSelect = document.getElementById('paint-color-select');
        const colorPreview = document.getElementById('paint-preview');

        if (btnPaint) {
            if (window.monetization && window.monetization.isLocked('mosaic-studio', 'painter_tool')) {
                btnPaint.innerHTML += ' 🔒';
            }
            btnPaint.addEventListener('click', () => {
                if (window.monetization && window.monetization.isLocked('mosaic-studio', 'painter_tool')) {
                    window.monetization.openUpgradeModal('Mosaic Painter');
                    return;
                }
                this.activeTool = this.activeTool === 'paint' ? null : 'paint';
                this.updateToolUI();
            });
        }

        if (btnFill) {
            if (window.monetization && window.monetization.isLocked('mosaic-studio', 'fill_tool')) {
                btnFill.innerHTML += ' 🔒';
            }
            btnFill.addEventListener('click', () => {
                if (window.monetization && window.monetization.isLocked('mosaic-studio', 'fill_tool')) {
                    window.monetization.openUpgradeModal('Fill Bucket');
                    return;
                }
                this.activeTool = this.activeTool === 'fill' ? null : 'fill';
                this.updateToolUI();
            });
        }

        if (btnDrop) {
            btnDrop.addEventListener('click', () => {
                this.activeTool = this.activeTool === 'drop' ? null : 'drop';
                this.updateToolUI();
            });
        }

        if (btnUndo) {
            btnUndo.addEventListener('click', () => this.undo());
        }

        if (btnRedo) {
            btnRedo.addEventListener('click', () => this.redo());
        }

        document.getElementById('toggle-grid')?.addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
            if (this.lastGrid) {
                this.drawCanvas(this.lastGrid, this.lastGrid[0].length, this.lastGrid.length);
            }
        });

        if (colorSelect) {
            colorSelect.addEventListener('change', (e) => {
                const hex = e.target.value;
                this.paintColor = COLOR_PALETTE_ARRAY.find(c => c.hex === hex) || { hex, name: 'Custom' };
                if (colorPreview) colorPreview.style.backgroundColor = hex;
            });
        }

        // Canvas Interaction
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', (e) => {
                if (this.activeTool === 'paint' || this.activeTool === 'fill') {
                    this.saveState();
                }
                this.isDrawing = true;
                this.handleCanvasTool(e);
            });
            window.addEventListener('mouseup', () => {
                this.isDrawing = false;
            });
            this.canvas.addEventListener('mousemove', (e) => {
                if (this.isDrawing && this.activeTool === 'paint') {
                    this.handleCanvasTool(e);
                }
            });
            // Prevent context menu on right click if painting
            this.canvas.addEventListener('contextmenu', (e) => {
                if (this.activeTool) e.preventDefault();
            });

            // Keyboard Shortcuts
            window.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                    e.preventDefault();
                    this.undo();
                } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                    e.preventDefault();
                    this.redo();
                }
            });
        }

        // Export Buttons
        const btnCsv = document.getElementById('btn-csv-fancy');
        if (btnCsv) {
            if (window.monetization && window.monetization.isLocked('mosaic-studio', 'export_csv')) {
                btnCsv.innerHTML += ' 🔒';
            }
            btnCsv.addEventListener('click', () => {
                if (window.monetization && window.monetization.isLocked('mosaic-studio', 'export_csv')) {
                    window.monetization.openUpgradeModal('CSV Export');
                    return;
                }
                if (!this.lastBreakdown) return;
                const csvData = this.lastBreakdown.map(b => ({
                    color: b.label,
                    hex: b.color,
                    qty: b.count
                }));
                import('../../src/shared/index.js').then(({ Exporters }) => {
                    Exporters.downloadCSV(csvData, 'mosaic.csv');
                });
            });
        }

        const btnGuide = document.getElementById('btn-guide-fancy');
        if (btnGuide) {
            if (window.monetization && window.monetization.isLocked('mosaic-studio', 'export_guide')) {
                btnGuide.innerHTML += ' 🔒';
            }
            btnGuide.addEventListener('click', () => {
                if (window.monetization && window.monetization.isLocked('mosaic-studio', 'export_guide')) {
                    window.monetization.openUpgradeModal('Build Guide');
                    return;
                }
                if (!this.lastGrid) return;
                const partsList = this.generatePartsList();
                const placementGrid = this.generatePlacementGrid();
                const metadata = {
                    title: 'Mosaic Build Guide',
                    client: 'Custom Mosaic',
                    partsList,
                    placementGrid
                };
                import('../../src/shared/index.js').then(({ Exporters }) => {
                    Exporters.downloadHTML(metadata, 'mosaic-guide.html');
                });
            });
        }

        document.getElementById('btn-png-fancy')?.addEventListener('click', () => {
            import('../../src/shared/index.js').then(({ Exporters }) => {
                Exporters.downloadPNG(this.canvas, 'mosaic.png');
            });
        });
    }

    updateToolUI() {
        const btnPaint = document.getElementById('tool-paint');
        const btnFill = document.getElementById('tool-fill');
        const btnDrop = document.getElementById('tool-drop');
        const paintControls = document.getElementById('paint-controls');

        // Reset styles
        if (btnPaint) btnPaint.style.background = '#f9f9f9';
        if (btnPaint) btnPaint.style.borderColor = '#ccc';
        if (btnFill) btnFill.style.background = '#f9f9f9';
        if (btnFill) btnFill.style.borderColor = '#ccc';
        if (btnDrop) btnDrop.style.background = '#f9f9f9';
        if (btnDrop) btnDrop.style.borderColor = '#ccc';
        if (paintControls) paintControls.style.display = 'none';

        if (this.activeTool === 'paint') {
            if (btnPaint) {
                btnPaint.style.background = '#e3f2fd';
                btnPaint.style.borderColor = '#2196F3';
            }
            if (paintControls) paintControls.style.display = 'block';
            this.canvas.style.cursor = 'crosshair';
        } else if (this.activeTool === 'fill') {
            if (btnFill) {
                btnFill.style.background = '#e3f2fd';
                btnFill.style.borderColor = '#2196F3';
            }
            if (paintControls) paintControls.style.display = 'block';
            this.canvas.style.cursor = 'cell'; // Bucket cursor
        } else if (this.activeTool === 'drop') {
            if (btnDrop) {
                btnDrop.style.background = '#e3f2fd';
                btnDrop.style.borderColor = '#2196F3';
            }
            this.canvas.style.cursor = 'copy'; // Dropper cursor
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    handleCanvasTool(e) {
        if (!this.activeTool || !this.lastGrid) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const studSize = 10;
        const gridX = Math.floor(x / studSize);
        const gridY = Math.floor(y / studSize);

        if (gridY >= 0 && gridY < this.lastGrid.length && gridX >= 0 && gridX < this.lastGrid[0].length) {
            if (this.activeTool === 'paint') {
                // Paint
                this.lastGrid[gridY][gridX] = this.paintColor;
                // Redraw just this brick? For now redraw all is safer for shadows etc
                // Optimization: We could just drawBrick over it
                const ctx = this.canvas.getContext('2d');
                import('../../src/shared/bricks/brick-canvas.js').then(({ drawBrick }) => {
                    drawBrick(ctx, gridX * studSize, gridY * studSize, studSize, this.paintColor.hex);
                });
                // Update stats lazily? Or trigger full update?
                // For now, let's not spam stats update on drag
            } else if (this.activeTool === 'fill') {
                this.floodFill(gridX, gridY, this.paintColor);
            } else if (this.activeTool === 'drop') {
                // Drop
                const color = this.lastGrid[gridY][gridX];
                if (color) {
                    this.paintColor = color;
                    const select = document.getElementById('paint-color-select');
                    const preview = document.getElementById('paint-preview');
                    if (select) select.value = color.hex;
                    if (preview) preview.style.backgroundColor = color.hex;
                    
                    // Auto switch to paint?
                    this.activeTool = 'paint';
                    this.updateToolUI();
                }
            }
        }
    }

    floodFill(startX, startY, newColor) {
        const targetColor = this.lastGrid[startY][startX];
        if (!targetColor || targetColor.hex === newColor.hex) return;

        const width = this.lastGrid[0].length;
        const height = this.lastGrid.length;
        const targetHex = targetColor.hex;
        const queue = [[startX, startY]];

        import('../../src/shared/bricks/brick-canvas.js').then(({ drawBrick }) => {
            const ctx = this.canvas.getContext('2d');
            const studSize = 10;

            while (queue.length > 0) {
                const [x, y] = queue.shift();
                
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    const cell = this.lastGrid[y][x];
                    if (cell && cell.hex === targetHex) {
                        this.lastGrid[y][x] = newColor;
                        drawBrick(ctx, x * studSize, y * studSize, studSize, newColor.hex);
                        
                        queue.push([x + 1, y]);
                        queue.push([x - 1, y]);
                        queue.push([x, y + 1]);
                        queue.push([x, y - 1]);
                    }
                }
            }
            this.updateStats();
        });
    }

    saveState() {
        if (!this.lastGrid) return;
        // Deep copy the grid
        const gridCopy = JSON.parse(JSON.stringify(this.lastGrid));
        this.history.push(gridCopy);
        this.redoStack = []; // Clear redo stack on new action
        if (this.history.length > 20) this.history.shift();
    }

    undo() {
        if (this.history.length === 0) return;
        
        // Save current state to redo stack
        const currentGrid = JSON.parse(JSON.stringify(this.lastGrid));
        this.redoStack.push(currentGrid);

        const prevGrid = this.history.pop();
        this.lastGrid = prevGrid;
        this.drawCanvas(this.lastGrid, this.lastGrid[0].length, this.lastGrid.length);
        this.updateStats();
    }

    redo() {
        if (this.redoStack.length === 0) return;

        // Save current state to undo history
        const currentGrid = JSON.parse(JSON.stringify(this.lastGrid));
        this.history.push(currentGrid);

        const nextGrid = this.redoStack.pop();
        this.lastGrid = nextGrid;
        this.drawCanvas(this.lastGrid, this.lastGrid[0].length, this.lastGrid.length);
        this.updateStats();
    }

    render() {
        if (!this.image || !this.canvas) {
            console.warn('[MosaicStudio] No image or canvas found.');
            return;
        }
        console.log(`🎨 Rendering Mosaic: ${this.width} studs wide`);

        // Update Original View
        const viewOriginal = document.getElementById('view-original');
        if (viewOriginal && this.image) {
            viewOriginal.src = this.image.src;
        }

        // Apply filters
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.image.width;
        tempCanvas.height = this.image.height;
        const ctx = tempCanvas.getContext('2d');
        ctx.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%) saturate(${this.saturation}%)`;
        
        if (this.pixelate > 1) {
            // Pixelate effect
            const w = Math.max(1, Math.floor(this.image.width / this.pixelate));
            const h = Math.max(1, Math.floor(this.image.height / this.pixelate));
            
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = w;
            smallCanvas.height = h;
            const sCtx = smallCanvas.getContext('2d');
            sCtx.drawImage(this.image, 0, 0, w, h);
            
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(smallCanvas, 0, 0, w, h, 0, 0, tempCanvas.width, tempCanvas.height);
        } else {
            ctx.drawImage(this.image, 0, 0, tempCanvas.width, tempCanvas.height);
        }

        // Update Adjusted View
        const viewAdjusted = document.getElementById('view-adjusted');
        if (viewAdjusted) {
            viewAdjusted.width = this.image.width;
            viewAdjusted.height = this.image.height;
            const mCtx = viewAdjusted.getContext('2d');
            mCtx.drawImage(tempCanvas, 0, 0);
        }

        // 1. Voxelize (The heavy lifting)
        const result = Voxelizer.fromImage(tempCanvas, this.width, COLOR_PALETTE_ARRAY);
        this.lastGrid = result.grid; // Store for export
        this.history = []; // Clear history on new render
        this.redoStack = []; // Clear redo stack
        console.log('[MosaicStudio] Voxelizer result:', result);

        // Sync preview sizes with mosaic size
        const studSize = 10;
        const displayWidth = result.width * studSize;
        const displayHeight = result.height * studSize;

        // Scale down by 20% to fit side-by-side
        const scale = 0.8;

        if (this.originalView) {
            this.originalView.style.width = `${displayWidth * scale}px`;
            this.originalView.style.height = `${displayHeight * scale}px`;
        }
        if (this.adjustedView) {
            this.adjustedView.style.width = `${displayWidth * scale}px`;
            this.adjustedView.style.height = `${displayHeight * scale}px`;
        }
        if (this.canvas) {
            this.canvas.style.width = `${displayWidth * scale}px`;
            this.canvas.style.height = `${displayHeight * scale}px`;
        }

        if (result.grid && result.grid.length > 0) {
            console.log('[MosaicStudio] First row of grid:', result.grid[0]);
            if (result.grid[0] && result.grid[0].length > 0) {
                console.log('[MosaicStudio] First cell structure:', result.grid[0][0]);
            }
        }
        // 2. Draw
        this.drawCanvas(result.grid, result.width, result.height);
        // 3. Stats
        this.updateStats();
    }

    updateStats() {
        if (!this.lastGrid) return;
        const count = this.lastGrid.flat().length;
        const colorCounts = {};
        this.lastGrid.flat().forEach(c => {
            if (c && c.name) {
                colorCounts[c.name] = (colorCounts[c.name] || 0) + 1;
            }
        });
        const breakdown = Object.entries(colorCounts).map(([name, num]) => {
            const colorObj = COLOR_PALETTE_ARRAY.find(c => c.name === name) || { hex: '#888' };
            return { label: name, color: colorObj.hex, count: num };
        });
        this.lastBreakdown = breakdown; // Store for export
        const statsPanel = document.getElementById('stats');
        StudioStats.render({
            statsPanel,
            stats: {
                dimensions: `${this.lastGrid[0].length} × ${this.lastGrid.length}`,
                totalBricks: count,
                breakdown
            }
        });
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
        import('../../src/shared/bricks/brick-canvas.js').then(({ drawBrick }) => {
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

            if (this.showGrid) {
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                for (let x = 0; x <= width; x++) ctx.moveTo(x * studSize, 0), ctx.lineTo(x * studSize, height * studSize);
                for (let y = 0; y <= height; y++) ctx.moveTo(0, y * studSize), ctx.lineTo(width * studSize, y * studSize);
                ctx.stroke();
            }

            console.log(`[MosaicStudio] drawCanvas: Bricks drawn: ${drawn}`);
        });
    }

    generatePartsList() {
        if (!this.lastBreakdown) return [];
        return this.lastBreakdown.map(b => ({
            part: 'Tile 1x1',
            color: b.label,
            hex: b.color,
            qty: b.count
        }));
    }

    generatePlacementGrid() {
        if (!this.lastGrid) return [];
        const grid = [];
        for (let y = 0; y < this.lastGrid.length; y++) {
            const row = [];
            for (let x = 0; x < this.lastGrid[y].length; x++) {
                const cell = this.lastGrid[y][x];
                row.push({
                    row: y + 1,
                    col: x + 1,
                    part: 'Tile 1x1',
                    color: cell ? cell.name : 'Empty',
                    hex: cell ? cell.hex : '#eee'
                });
            }
            grid.push(row);
        }
        return grid;
    }

    // updateStats now handled by StudioStats
}