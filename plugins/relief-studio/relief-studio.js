import { COLOR_PALETTE_ARRAY } from '../../src/shared/color-palette.js';
import { Voxelizer, FileUtils, Exporters, ColorUtils } from '../../src/shared/index.js';
import { StudioHeader } from '../../src/shared/studio-header.js';
import { StudioStats } from '../../src/shared/studio-stats.js';

export default class ReliefStudio {
    constructor() {
        // State
        this.image = null;
        this.width = 32;
        this.maxHeight = 6;
        this.invertDepth = true;
        this.pixelateFactor = 1;
        this.showStuds = false;

        // Data
        this.voxelGrid = null;
        this.brickLayout = null;

        // UI
        this.canvas = null;

        // 3D State
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.meshGroup = null;
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
        
        // Initialize 3D Environment
        await this.loadThreeJS();
        this.init3D();
        
        this.setupEventListeners();
        // Try to load default preview image
        this.loadDefaultImage();
    }

    async loadThreeJS() {
        if (window.THREE) return;
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                const controls = document.createElement('script');
                controls.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
                controls.onload = resolve;
                controls.onerror = reject;
                document.head.appendChild(controls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    init3D() {
        const THREE = window.THREE;
        if (!THREE || !this.canvas) return;

        const width = this.canvas.clientWidth || 800;
        const height = 600;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f4f8);

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(40, 40, 40);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        // Ground Plane
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200),
            new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.1;
        plane.receiveShadow = true;
        this.scene.add(plane);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            if (!this.camera || !this.renderer) return;
            const w = this.canvas.clientWidth;
            const h = 600;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });
    }

    async loadDefaultImage() {
        try {
            const defaultImg = new Image();
            defaultImg.crossOrigin = 'anonymous';
            defaultImg.src = '/house.jpeg';
            
            // Create a fallback timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Image load timeout')), 3000);
            });
            
            await Promise.race([new Promise(resolve => defaultImg.onload = resolve), timeoutPromise]);
            
            this.image = defaultImg;
            this.render();
        } catch (error) {
            console.log("Default image not found, using placeholder");
            this.showPlaceholderMessage();
        }
    }

    showPlaceholderMessage() {
        // Add a message to the container
        const message = document.createElement('div');
        message.style.textAlign = 'center';
        message.style.padding = '2rem';
        message.style.color = '#666';
        message.innerHTML = `
            <div style="margin-bottom: 1rem;">📷</div>
            <div>Upload an image to generate 3D relief</div>
            <div style="font-size: 0.9rem; margin-top: 0.5rem;">Or try the default image by placing house.jpeg in the root folder</div>
        `;
    }

    setupEventListeners() {
        // Image Upload
        document.getElementById('file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    this.image = await FileUtils.loadImage(file);
                    // Clear any placeholder messages
                    this.render();
                } catch (error) {
                    console.error('Failed to load image:', error);
                }
            }
        });

        // Pixelate Slider
        document.getElementById('pixelate')?.addEventListener('input', (e) => {
            this.pixelateFactor = parseInt(e.target.value);
            if (this.image) this.render();
        });

        // Width Slider
        document.getElementById('width')?.addEventListener('input', (e) => {
            this.width = parseInt(e.target.value);
            if (this.image) this.render();
        });

        // Max Height Slider
        document.getElementById('maxHeight')?.addEventListener('input', (e) => {
            this.maxHeight = parseInt(e.target.value);
            if (this.image) this.render();
        });

        // Invert Checkbox
        document.getElementById('invertDepth')?.addEventListener('change', (e) => {
            this.invertDepth = e.target.checked;
            if (this.image) this.render();
        });

        // Show Studs Checkbox
        document.getElementById('showStuds')?.addEventListener('change', (e) => {
            this.showStuds = e.target.checked;
            if (this.image) this.render();
        });

        // Reset View Button
        document.getElementById('reset-view')?.addEventListener('click', () => {
            this.controls?.reset();
        });
    }

    render() {
        if (!this.image || !this.canvas) return;
        
        // Apply pixelation effect if needed
        let sourceImage = this.image;
        if (this.pixelateFactor > 1) {
            sourceImage = this.applyPixelation(this.image, this.pixelateFactor);
        }

        // 1. Voxelize
        try {
            this.voxelGrid = Voxelizer.fromHeightMap(
                sourceImage, 
                this.width, 
                this.maxHeight, 
                this.invertDepth, 
                COLOR_PALETTE_ARRAY
            );
        } catch (error) {
            console.error('Failed to voxelize:', error);
            return;
        }
        
        // 2. Build Layout & 3D Scene
        this.brickLayout = { bricks: [] };
        const grid = this.voxelGrid.grid;
        const w = this.voxelGrid.width;
        const h = this.voxelGrid.height;
        
        // Clear previous 3D meshes
        if (this.meshGroup) {
            this.scene.remove(this.meshGroup);
            // Dispose geometries/materials if needed
        }
        this.meshGroup = new window.THREE.Group();
        
        // Material Cache
        const materialCache = {};

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const cell = grid[y][x];
                if (!cell || cell.height <= 0) continue;

                // Get Material
                const colorHex = cell.color?.hex || '#cccccc';
                if (!materialCache[colorHex]) {
                    materialCache[colorHex] = new window.THREE.MeshStandardMaterial({
                        color: colorHex,
                        roughness: 0.6,
                        metalness: 0.1
                    });
                }

                // Populate Brick Layout for Stats
                for (let stack = 0; stack < cell.height; stack++) {
                    this.brickLayout.bricks.push({
                        x, 
                        y: stack, 
                        z: y, 
                        color: cell.color, height: 1
                    });
                    
                    // Create 3D Brick (Plate)
                    // 1 Plate height approx 0.4 units relative to 1x1 stud width
                    const plateHeight = 0.4;
                    const geometry = new window.THREE.BoxGeometry(0.95, plateHeight, 0.95);
                    const mesh = new window.THREE.Mesh(geometry, materialCache[colorHex]);
                    
                    // Position centered
                    mesh.position.set(
                        x - w / 2,
                        stack * plateHeight + (plateHeight / 2),
                        y - h / 2
                    );
                    
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                    // Add Studs
                    if (this.showStuds) {
                        const studGeo = new window.THREE.CylinderGeometry(0.3, 0.3, 0.15, 16);
                        const stud = new window.THREE.Mesh(studGeo, materialCache[colorHex]);
                        stud.position.set(0, 0.275, 0);
                        mesh.add(stud);
                    }

                    this.meshGroup.add(mesh);
                }
            }
        }
        
        this.scene.add(this.meshGroup);

        // 3. Update stats
        this.updateStats();
    }

    applyPixelation(image, factor) {
        const w = image.width;
        const h = image.height;
        
        // Calculate scaled down dimensions
        const sw = Math.max(1, Math.floor(w / factor));
        const sh = Math.max(1, Math.floor(h / factor));
        
        // 1. Draw small to temp canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = sw;
        tempCanvas.height = sh;
        const tCtx = tempCanvas.getContext('2d');
        tCtx.drawImage(image, 0, 0, sw, sh);
        
        // 2. Draw back large to output canvas (Nearest Neighbor)
        const outCanvas = document.createElement('canvas');
        outCanvas.width = w;
        outCanvas.height = h;
        const ctx = outCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, 0, 0, sw, sh, 0, 0, w, h);
        
        return outCanvas;
    }

    updateStats() {
        const statsPanel = document.getElementById('stats');
        if (!statsPanel || !this.brickLayout) return;
        
        const count = this.brickLayout.bricks.length;
        
        // Breakdown by color
        const colorCounts = {};
        this.brickLayout.bricks.forEach(b => {
            const colorName = b.color?.color?.name || b.color?.name || 'Unknown';
            const colorHex = b.color?.color?.hex || b.color?.hex || '#cccccc';
            const key = `${colorName}|${colorHex}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;
        });
        
        const breakdown = Object.entries(colorCounts).map(([key, qty]) => {
            const [name, hex] = key.split('|');
            return { label: name, color: hex, count: qty };
        });
        
        // Clear existing content and render stats
        statsPanel.innerHTML = '';
        StudioStats.render({
            statsPanel,
            stats: {
                dimensions: `${this.voxelGrid?.width || 0} × ${this.voxelGrid?.height || 0} studs`,
                maxHeight: `${this.maxHeight} plates`,
                totalBricks: count,
                breakdown
            }
        });
        
        // Add export buttons
        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '0.5rem';
        btnRow.style.marginTop = '1rem';
        btnRow.innerHTML = `
            <button id="btn-csv" style="flex:1; padding:10px; background:#333; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Export CSV</button>
            <button id="btn-screenshot" style="flex:1; padding:10px; background:#D4AF37; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Screenshot</button>
        `;
        statsPanel.appendChild(btnRow);
        
        // Add event listeners for export buttons
        document.getElementById('btn-csv')?.addEventListener('click', () => {
            if (!this.brickLayout) return;
            
            const csvData = this.brickLayout.bricks.map(b => ({
                part: 'Plate 1x1',
                color: b.color?.color?.name || b.color?.name || 'Unknown',
                hex: b.color?.color?.hex || b.color?.hex || '#000',
                qty: 1
            }));
            
            Exporters.downloadCSV(csvData, 'relief-map.csv');
        });
        
        document.getElementById('btn-screenshot')?.addEventListener('click', () => {
            if (!this.canvas) return;
            
            // Download as PNG
            const link = document.createElement('a');
            link.download = 'relief-3d-view.png';
            link.href = this.canvas.toDataURL('image/png');
            link.click();
        });
    }
}