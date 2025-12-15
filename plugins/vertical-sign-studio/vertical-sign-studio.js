import { FONT_DATA } from '../../src/shared/font-data.js';
import { Voxelizer, Exporters } from '../../src/shared/index.js';
import { COLOR_PALETTE_ARRAY } from '../../src/shared/color-palette.js';

import { StudioHeader } from '../../src/shared/studio-header.js';
import { StudioStats } from '../../src/shared/studio-stats.js';

export default class VerticalSignStudio {
        init3D() {
            const THREE = this.THREE;
            const width = this.container.clientWidth || 500;
            const height = 400;

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xf0f4f8);

            this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            this.camera.position.set(0, 15, 30);
            this.camera.lookAt(0, 2, 0);

            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(width, height);
            this.renderer.shadowMap.enabled = true;
            this.container.appendChild(this.renderer.domElement);

            // Lights
            const ambient = new THREE.AmbientLight(0xffffff, 0.6);
            this.scene.add(ambient);
            const dir = new THREE.DirectionalLight(0xffffff, 0.8);
            dir.position.set(10, 20, 10);
            dir.castShadow = true;
            this.scene.add(dir);

            // Simple Orbit Controls (Mouse Drag)
            let isDragging = false;
            let previousMousePosition = { x: 0, y: 0 };
            this.renderer.domElement.addEventListener('mousedown', (e) => {
                isDragging = true;
                previousMousePosition = { x: e.clientX, y: e.clientY };
            });
            this.renderer.domElement.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    const deltaMove = {
                        x: e.clientX - previousMousePosition.x,
                        y: e.clientY - previousMousePosition.y
                    };
                    if (this.textGroup) {
                        this.textGroup.rotation.y += deltaMove.x * 0.01;
                    }
                    previousMousePosition = { x: e.clientX, y: e.clientY };
                }
            });
            document.addEventListener('mouseup', () => isDragging = false);
        }
    constructor() {
        this.text = "BFS";
        this.textColor = "#1B2A34";
        this.bgColor = "#FFFFFF";
        this.height = 3;
        this.palette = COLOR_PALETTE_ARRAY;
        
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.textGroup = null;
        this.THREE = null; // Will hold the library
    }

    async init() {
        console.log("✅ Vertical Sign Studio Initializing...");
        StudioHeader.inject({
            title: 'Vertical Sign Studio',
            description: 'Design 3D standing brick signs with <span style="font-weight:700;color:#FFE082;">vertical orientation</span>.<br>Customize your text, colors, and height, and preview in interactive 3D!',
            features: [
                { icon: '', label: '3D Preview', color: '#4CAF50' },
                { icon: '', label: 'Custom Height', color: '#2196F3' },
                { icon: '', label: 'Color Palette', color: '#FF9800' }
            ],
            id: 'verticalsignstudio-main-header'
        });

        // 1. Load Three.js
        await this.loadThreeJS();

        // 2. Setup Container
        this.container = document.getElementById('preview');
        this.container.style.height = "400px";
        this.container.style.overflow = "hidden";

        // 3. Init 3D Scene
        this.init3D();

        // 4. Setup Listeners
        this.setupEventListeners();
        this.injectColorDropdowns();

        // 5. Render
        this.generate();
        this.animate();
    }

    async loadThreeJS() {
        if (window.THREE) {
            this.THREE = window.THREE;
            return;
        }
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                this.THREE = window.THREE;
                resolve();
            };
            document.head.appendChild(script);
        });
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(10, 20, 10);
        dir.castShadow = true;
        this.scene.add(dir);

        // Simple Orbit Controls (Mouse Drag)
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaMove = {
                    x: e.clientX - previousMousePosition.x,
                    y: e.clientY - previousMousePosition.y
                };
                
                if (this.textGroup) {
                    this.textGroup.rotation.y += deltaMove.x * 0.01;
                }
                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        document.addEventListener('mouseup', () => isDragging = false);
    }

    setupEventListeners() {
        document.getElementById('text-input')?.addEventListener('input', (e) => {
            this.text = e.target.value.toUpperCase().substring(0, 10);
            this.generate();
        });
        document.getElementById('text-color')?.addEventListener('input', (e) => {
            this.textColor = e.target.value;
            // Reset dropdown if custom color
            const textDropdown = document.getElementById('text-color-dropdown');
            if (textDropdown && textDropdown.value !== e.target.value) textDropdown.value = '';
            this.generate();
        });
        document.getElementById('bg-color')?.addEventListener('input', (e) => {
            this.bgColor = e.target.value;
            // Reset dropdown if custom color
            const bgDropdown = document.getElementById('bg-color-dropdown');
            if (bgDropdown && bgDropdown.value !== e.target.value) bgDropdown.value = '';
            this.generate();
        });
        document.getElementById('sign-height')?.addEventListener('input', (e) => {
            this.height = parseInt(e.target.value);
            this.generate();
        });
    }

    generate() {
        if (!this.textGroup) {
            this.textGroup = new this.THREE.Group();
            this.scene.add(this.textGroup);
        } else {
            // Clean up old mesh
            while(this.textGroup.children.length > 0){ 
                this.textGroup.remove(this.textGroup.children[0]); 
            }
        }

        // 1. Get 2D Grid from Voxelizer
        const voxelData = Voxelizer.fromText(this.text, FONT_DATA, { spacing: 1 });
        const grid = voxelData.grid;
        const rows = voxelData.height; // 5
        const cols = voxelData.width;

        // Add padding
        const padding = 2;
        const totalWidth = cols + (padding * 2);

        let brickCount = 0;

        // 2. Build 3D Layers
        // Base Layer
        this.addLayer(0, totalWidth, '#444444', true); 

        // Text Layers (repeated for height)
        // Font is 5 high. We center it vertically in the sign height if needed, 
        // but for now let's just stack the font rows.
        
        for (let r = 0; r < rows; r++) {
            // Flip row index because ThreeJS Y goes up
            const fontRowIndex = (rows - 1) - r; 
            const rowData = grid[fontRowIndex];

            // Left Padding
            for(let p=0; p<padding; p++) this.addBrick(-totalWidth/2 + p, r+1, this.bgColor);
            
            // Text Chars
            for(let c=0; c<cols; c++) {
                const isText = rowData[c] === 1;
                const color = isText ? this.textColor : this.bgColor;
                this.addBrick(-totalWidth/2 + padding + c, r+1, color);
                brickCount++;
            }

            // Right Padding
            for(let p=0; p<padding; p++) this.addBrick(-totalWidth/2 + padding + cols + p, r+1, this.bgColor);
        }

        // Cap Layer
        this.addLayer(rows + 1, totalWidth, this.bgColor, false);

        this.updateStats(brickCount + (totalWidth * 2)); // Rough count
    }

    addLayer(yLevel, width, color, isBase) {
        for(let x = 0; x < width; x++) {
            this.addBrick(x - width/2, yLevel, color);
        }
    }

    addBrick(x, y, color) {
        const THREE = this.THREE;
        const geometry = new THREE.BoxGeometry(1, 1.2, 1);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y * 1.2, 0);
        cube.castShadow = true;
        cube.receiveShadow = true;
        
        // Add Stud
        const studGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const stud = new THREE.Mesh(studGeo, material);
        stud.position.set(0, 0.7, 0);
        cube.add(stud);

        this.textGroup.add(cube);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updateStats(count) {
        const statsPanel = document.getElementById('stats');
        // Count text and background bricks for breakdown
        let textBricks = 0, bgBricks = 0;
        if (this.textGroup) {
            this.textGroup.children.forEach(mesh => {
                if (mesh.material && mesh.material.color) {
                    const hex = '#' + mesh.material.color.getHexString();
                    if (hex.toLowerCase() === this.textColor.toLowerCase()) textBricks++;
                    else if (hex.toLowerCase() === this.bgColor.toLowerCase()) bgBricks++;
                }
            });
        }
        StudioStats.render({
            statsPanel,
            stats: {
                dimensions: `Height: ${this.height} layers (rendering 5 for text)`,
                totalBricks: count,
                breakdown: [
                    { label: 'Text Bricks', color: this.textColor, count: textBricks },
                    { label: 'Background', color: this.bgColor, count: bgBricks }
                ]
            }
        });
        // Restore export button
        if (statsPanel) {
            const btn = document.createElement('button');
            btn.id = 'export-stl';
            btn.style.width = '100%';
            btn.style.padding = '10px';
            btn.style.background = '#FF5722';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.textContent = '💾 Export STL (Baseplate)';
            btn.onclick = () => {
                alert("STL Export requires STLExporter.js (Adding this to shared library is a Task for Phase 3!)");
            };
            statsPanel.appendChild(btn);
        }
    }

    injectColorDropdowns() {
        // Text Color
        const textInput = document.getElementById('text-color');
        if (textInput && !document.getElementById('text-color-dropdown')) {
            const textDropdown = document.createElement('select');
            textDropdown.id = 'text-color-dropdown';
            textDropdown.style.marginLeft = '8px';
            textDropdown.innerHTML = `<option value="">Palette…</option>` +
                this.palette.map(c => `<option value="${c.hex}">${c.name}</option>`).join('');
            textInput.parentNode.insertBefore(textDropdown, textInput.nextSibling);
            textDropdown.onchange = (e) => {
                if (e.target.value) {
                    this.textColor = e.target.value;
                    textInput.value = e.target.value;
                    this.generate();
                }
            };
        }
        // Background Color
        const bgInput = document.getElementById('bg-color');
        if (bgInput && !document.getElementById('bg-color-dropdown')) {
            const bgDropdown = document.createElement('select');
            bgDropdown.id = 'bg-color-dropdown';
            bgDropdown.style.marginLeft = '8px';
            bgDropdown.innerHTML = `<option value="">Palette…</option>` +
                this.palette.map(c => `<option value="${c.hex}">${c.name}</option>`).join('');
            bgInput.parentNode.insertBefore(bgDropdown, bgInput.nextSibling);
            bgDropdown.onchange = (e) => {
                if (e.target.value) {
                    this.bgColor = e.target.value;
                    bgInput.value = e.target.value;
                    this.generate();
                }
            };
        }
    }
}