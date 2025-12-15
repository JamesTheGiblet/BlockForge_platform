
import { COLOR_PALETTE_ARRAY } from '../../src/shared/color-palette.js';

import { Exporters } from '../../src/shared/index.js';
import { StudioHeader } from '../../src/shared/studio-header.js';
import { StudioStats } from '../../src/shared/studio-stats.js';

export default class ThreeDStudio {
    constructor() {
        this.modelType = "bear";
        this.paintColor = "#E53935";
        this.container = null;
        this.THREE = null;
        this.scene = null;
        this.bearGroup = null; // The main model group
        this.voxelGrid = {}; // Stores x,y,z -> color data
        this.brickCounts = {};
    }

    async init() {
        console.log("✅ 3D Studio Initialized");
        StudioHeader.inject({
            title: '3D Studio',
            description: 'Build and explore <span style="font-weight:700;color:#E53935;">3D brick models</span> in real time!<br>Choose a model, paint with color, import STL or JSON, and export your creation as an image or 3D file.',
            features: [
                { icon: '', label: '3D Preview', color: '#2196F3' },
                { icon: '', label: 'Model Import/Export', color: '#E53935' },
                { icon: '', label: 'Voxel Painting', color: '#FFD500' }
            ],
            id: 'threedstudio-main-header'
        });
        // 1. Load Three.js
        await this.loadThreeJS();
        // 2. Setup Container
        this.container = document.getElementById('preview');
        this.container.style.height = "500px";
        this.container.style.overflow = "hidden";
        // 3. Init Scene
        this.init3D();
        // 4. Setup Listeners
        this.setupEventListeners();
        // 5. Initial Render
        this.generate(this.modelType);
        this.animate();
    }

    async loadThreeJS() {
        if (window.THREE && window.THREE.STLLoader) {
            this.THREE = window.THREE;
            return;
        }
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                this.THREE = window.THREE;
                // Load STL Loader separately
                const loaderScript = document.createElement('script');
                loaderScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js';
                loaderScript.onload = () => resolve();
                document.head.appendChild(loaderScript);
            };
            document.head.appendChild(script);
        });
    }

    init3D() {
        const THREE = this.THREE;
        const width = this.container.clientWidth || 500;
        const height = 500;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f4f8);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(30, 30, 40);
        this.camera.lookAt(0, 10, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(20, 40, 20);
        dir.castShadow = true;
        this.scene.add(dir);

        // Ground Plane
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Orbit Controls (Simple implementation)
        this.setupControls();
    }

    setupEventListeners() {
        document.getElementById('model-select')?.addEventListener('change', (e) => {
            this.modelType = e.target.value;
            this.generate(this.modelType);
        });

        document.getElementById('brick-color')?.addEventListener('input', (e) => {
            this.paintColor = e.target.value;
        });

        document.getElementById('layer-view')?.addEventListener('input', (e) => {
            const layer = parseInt(e.target.value);
            this.filterLayers(layer);
        });
        
        // JSON Import Logic
        document.getElementById('json-upload')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    try {
                        const json = JSON.parse(evt.target.result);
                        this.loadCustomModel(json);
                    } catch(err) { console.error("Invalid JSON", err); }
                };
                reader.readAsText(file);
            }
        });

        // STL Import Logic
        document.getElementById('stl-upload')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    this.processSTL(evt.target.result);
                };
                reader.readAsArrayBuffer(file);
            }
        });
    }

    generate(type) {
        this.voxelGrid = {};
        if (this.bearGroup) this.scene.remove(this.bearGroup);
        this.bearGroup = new this.THREE.Group();
        this.scene.add(this.bearGroup);

        // Procedural Generation Logic
        if (type === 'bear') this.createBearVoxels();
        else if (type === 'penguin') this.createPenguinVoxels();
        else this.createCubeVoxels();

        this.buildBricks();
    }

    // --- Procedural Algorithms (Ported & Simplified) ---
    storeVoxel(x, y, z, color) {
        this.voxelGrid[`${x},${y},${z}`] = { x, y, z, color };
    }

    createBearVoxels() {
        // Simple procedural bear shape
        // Legs
        for(let y=0; y<10; y++) {
            for(let x=-4; x<=-1; x++) for(let z=-2; z<=2; z++) this.storeVoxel(x,y,z, '#8B4513'); // Left Leg
            for(let x=1; x<=4; x++) for(let z=-2; z<=2; z++) this.storeVoxel(x,y,z, '#8B4513'); // Right Leg
        }
        // Body
        for(let y=10; y<22; y++) {
            for(let x=-5; x<=5; x++) for(let z=-3; z<=3; z++) this.storeVoxel(x,y,z, '#A0522D');
        }
        // Head
        for(let y=22; y<30; y++) {
            for(let x=-4; x<=4; x++) for(let z=-3; z<=3; z++) this.storeVoxel(x,y,z, '#8B4513');
        }
    }

    createPenguinVoxels() {
        // Simple penguin body
        for(let y=0; y<20; y++) {
            for(let x=-3; x<=3; x++) for(let z=-3; z<=3; z++) {
                let color = (z > 1) ? '#FFFFFF' : '#000000'; // White belly
                this.storeVoxel(x,y,z, color);
            }
        }
        // Beak
        this.storeVoxel(0, 18, 4, '#FFD700');
    }

    createCubeVoxels() {
        for(let x=0; x<5; x++) for(let y=0; y<5; y++) for(let z=0; z<5; z++) {
            this.storeVoxel(x,y,z, this.paintColor);
        }
    }
    
    loadCustomModel(json) {
        this.voxelGrid = {};
        if (this.bearGroup) this.scene.remove(this.bearGroup);
        this.bearGroup = new this.THREE.Group();
        this.scene.add(this.bearGroup);
        
        if (json.voxels) {
            json.voxels.forEach(v => {
                this.storeVoxel(v.x, v.y, v.z, v.color || v.colorName || '#E53935');
            });
            this.buildBricks();
        }
    }

    // --- STL Processing ---
    processSTL(buffer) {
        const loader = new this.THREE.STLLoader();
        const geometry = loader.parse(buffer);
        const mesh = new this.THREE.Mesh(geometry);
        
        this.voxelizeMesh(mesh);
    }

    voxelizeMesh(mesh, resolution = 32) {
        this.voxelGrid = {};
        if (this.bearGroup) this.scene.remove(this.bearGroup);
        this.bearGroup = new this.THREE.Group();
        this.scene.add(this.bearGroup);

        // 1. Scale mesh to fit resolution
        mesh.geometry.computeBoundingBox();
        const bounds = mesh.geometry.boundingBox;
        const size = new this.THREE.Vector3();
        bounds.getSize(size);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = resolution / maxDim;
        mesh.scale.set(scale, scale, scale);
        mesh.updateMatrixWorld(true); // Ensure transforms are applied

        // 2. Raycast Grid Scan
        // We scan from top-down to find solid parts
        const raycaster = new this.THREE.Raycaster();
        const dir = new this.THREE.Vector3(0, -1, 0); // Down
        
        // Re-measure scaled bounds
        const box = new this.THREE.Box3().setFromObject(mesh);
        const min = box.min.floor();
        const max = box.max.ceil();

        for (let x = min.x; x < max.x; x++) {
            for (let z = min.z; z < max.z; z++) {
                // Cast ray from above the object
                const origin = new this.THREE.Vector3(x + 0.5, max.y + 5, z + 0.5);
                raycaster.set(origin, dir);
                
                const intersects = raycaster.intersectObject(mesh);
                
                // If we hit the mesh an odd number of times, or pairs of times
                // Simple logic: Fill between Entry (even index) and Exit (odd index)
                if (intersects.length > 0) {
                    // Sort by distance (closest first)
                    intersects.sort((a, b) => a.distance - b.distance);

                    for (let i = 0; i < intersects.length; i += 2) {
                        if (i + 1 >= intersects.length) break;
                        
                        const yTop = Math.ceil(intersects[i].point.y);
                        const yBot = Math.floor(intersects[i+1].point.y);
                        
                        for (let y = yBot; y < yTop; y++) {
                            this.storeVoxel(x, y, z, this.paintColor);
                        }
                    }
                }
            }
        }
        this.buildBricks();
    }

    // --- Brick Builder (The "Merger" Logic) ---
    buildBricks() {
        // Reset counts
        this.brickCounts = { '1x1': 0, '1x2': 0, '1x3': 0 };
        
        // Group by Layer (Y) and Row (Z)
        const layers = {};
        Object.values(this.voxelGrid).forEach(v => {
            if (!layers[v.y]) layers[v.y] = {};
            if (!layers[v.y][v.z]) layers[v.y][v.z] = [];
            layers[v.y][v.z].push(v);
        });

        // Optimization Loop (Greedy Merge X-axis)
        Object.keys(layers).forEach(y => {
            Object.keys(layers[y]).forEach(z => {
                const row = layers[y][z].sort((a,b) => a.x - b.x);
                let currentRun = [];
                
                for(let i=0; i<row.length; i++) {
                    const voxel = row[i];
                    const prev = currentRun[currentRun.length-1];
                    
                    // Check continuity: adjacent X and same color
                    if (!prev || (voxel.x === prev.x + 1 && voxel.color === prev.color)) {
                        currentRun.push(voxel);
                    } else {
                        this.flushRun(currentRun);
                        currentRun = [voxel];
                    }
                }
                this.flushRun(currentRun);
            });
        });
        
        this.updateStats();
    }

    flushRun(run) {
        if (!run.length) return;
        
        // Break run into 1x3, 1x2, 1x1
        let remaining = run.length;
        let index = 0;
        
        while(remaining > 0) {
            let size = 1;
            if (remaining >= 3) size = 3;
            else if (remaining === 2) size = 2;
            
            const segment = run.slice(index, index + size);
            this.createBrickMesh(segment, size);
            
            this.brickCounts[`1x${size}`]++;
            
            remaining -= size;
            index += size;
        }
    }

    createBrickMesh(voxels, size) {
        const THREE = this.THREE;
        const color = voxels[0].color;
        
        // Calculate center position
        let avgX = 0, avgY = 0, avgZ = 0;
        voxels.forEach(v => { avgX+=v.x; avgY+=v.y; avgZ+=v.z; });
        avgX /= size; avgY /= size; avgZ /= size;

        // Brick Geometry
        const width = size * 1.0; // 1 unit per stud
        const height = 1.2;
        const depth = 1.0;
        
        const geometry = new THREE.BoxGeometry(width - 0.05, height, depth - 0.05);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(avgX, avgY * 1.2, avgZ);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Add Studs
        const studGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        for(let i=0; i<size; i++) {
            const stud = new THREE.Mesh(studGeo, material);
            // Calculate relative stud position
            const studX = (i - (size-1)/2); 
            stud.position.set(studX, 0.7, 0);
            mesh.add(stud);
        }
        
        // Store layer info for filtering
        mesh.userData = { y: voxels[0].y };
        this.bearGroup.add(mesh);
    }

    filterLayers(maxLayer) {
        if (!this.bearGroup) return;
        this.bearGroup.children.forEach(brick => {
            brick.visible = (brick.userData.y <= maxLayer);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    setupControls() {
        // Simple mouse drag to rotate
        let isDragging = false;
        let prevX = 0;
        
        this.renderer.domElement.addEventListener('mousedown', e => { isDragging=true; prevX=e.clientX; });
        document.addEventListener('mouseup', () => isDragging=false);
        document.addEventListener('mousemove', e => {
            if(isDragging) {
                const delta = e.clientX - prevX;
                this.bearGroup.rotation.y += delta * 0.01;
                prevX = e.clientX;
            }
        });
    }

    updateStats() {
        const statsPanel = document.getElementById('stats');
        if (!statsPanel) return;
        const breakdown = [
            { label: '1x1 Bricks', color: '#B71C1C', count: this.brickCounts['1x1'] },
            { label: '1x2 Bricks', color: '#1976D2', count: this.brickCounts['1x2'] },
            { label: '1x3 Bricks', color: '#388E3C', count: this.brickCounts['1x3'] }
        ];
        StudioStats.render({
            statsPanel,
            stats: {
                dimensions: '',
                totalBricks: this.brickCounts['1x1'] + this.brickCounts['1x2'] + this.brickCounts['1x3'],
                breakdown
            }
        });
        // Add export buttons (CSV, PNG)
        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '0.5rem';
        btnRow.style.marginTop = '1rem';
        btnRow.innerHTML = `
            <button id="btn-csv" style="flex:1; padding:8px; background:#333; color:white; border:none; border-radius:4px; cursor:pointer;">CSV</button>
            <button id="btn-png" style="flex:1; padding:8px; background:#D4AF37; color:white; border:none; border-radius:4px; cursor:pointer;">Image</button>
        `;
        statsPanel.appendChild(btnRow);
        setTimeout(() => {
            document.getElementById('btn-csv')?.addEventListener('click', () => {
                // Export brick breakdown as CSV
                const csvData = breakdown.map(b => ({
                    part: b.label,
                    qty: b.count
                }));
                Exporters.downloadCSV(csvData, '3d-studio.csv');
            });
            document.getElementById('btn-png')?.addEventListener('click', () => {
                Exporters.downloadPNG(this.renderer.domElement, '3d-studio.png');
            });
        }, 0);
    }
}