function createPenguinModel(storeVoxel) {
    // Body - Procedurally generated for a fatter base and more rounded shape
    const bodyMinY = 0, bodyMaxY = 20;
    for (let y = bodyMinY; y < bodyMaxY; y++) {
        const progress = (y - bodyMinY) / (bodyMaxY - bodyMinY); // 0 at bottom, 1 at top
        
        // Use a sine curve to create a more natural, egg-like shape
        const curve = Math.sin(progress * Math.PI); // 0 at bottom, 1 in middle, 0 at top
        const rx = 3.0 + curve * 2.5; // Radius X: starts at 3, swells to 5.5, ends at 3
        const rz = 2.5 + curve * 2.5; // Radius Z: starts at 2.5, swells to 5, ends at 2.5

        for (let x = -Math.ceil(rx); x <= Math.ceil(rx); x++) {
            for (let z = -Math.ceil(rz); z <= Math.ceil(rz); z++) {
                if ((x / rx) ** 2 + (z / rz) ** 2 <= 1) {
                    const isBelly = z > rz * 0.4 && Math.abs(x) < rx * 0.6;
                    storeVoxel(x, y, z, isBelly ? 'White' : 'Gray');
                }
            }
        }
    }

    // Head
    const headCenter = { x: 0, y: 23, z: 0 };
    const headRadius = 3.5;
    for (let y = Math.floor(headCenter.y - headRadius); y <= Math.ceil(headCenter.y + headRadius); y++) {
        for (let x = Math.floor(headCenter.x - headRadius); x <= Math.ceil(headCenter.x + headRadius); x++) {
            for (let z = Math.floor(headCenter.z - headRadius); z <= Math.ceil(headCenter.z + headRadius); z++) {
                if ((x - headCenter.x) ** 2 + (y - headCenter.y) ** 2 + (z - headCenter.z) ** 2 <= headRadius ** 2) {
                    storeVoxel(x, y, z, 'Gray');
                }
            }
        }
    }
    // Beak
    storeVoxel(0, 23, 3, 'Orange');
    storeVoxel(0, 22, 3, 'Orange');
    storeVoxel(0, 23, 4, 'Orange');
    // Eyes
    storeVoxel(-1, 24, 3, 'White');
    storeVoxel(1, 24, 3, 'White');
    
    // Feet
    for (let x = -3; x <= -1; x++) { for (let z = 3; z <= 5; z++) { storeVoxel(x, 0, z, 'Orange'); } } // Left foot
    for (let x = 1; x <= 3; x++) { for (let z = 3; z <= 5; z++) { storeVoxel(x, 0, z, 'Orange'); } } // Right foot

    // Wings
    const wingCenterY = 12;
    const wingRy = 6;
    [-1, 1].forEach(side => {
        const wingCx = (4.8) * side;
        const wingMinY = wingCenterY - wingRy;
        const wingMaxY = wingCenterY + wingRy;

        for (let y = wingMinY; y <= wingMaxY; y++) {
            const progress = (y - wingMinY) / (wingMaxY - wingMinY); // 0 at bottom, 1 at top
            const taper = 1 - progress; // Inverted progress
            const currentRx = 0.5 + (1.0 * taper); // Tapers from 1.5 down to 0.5
            const currentRz = 1.0 + (1.5 * taper); // Tapers from 2.5 down to 1.0
            for (let x = Math.floor(wingCx - currentRx); x <= Math.ceil(wingCx + currentRx); x++) {
                for (let z = -Math.ceil(currentRz) - 1; z <= Math.ceil(currentRz) - 1; z++) {
                    if (((x - wingCx) / currentRx) ** 2 + ((z + 1) / currentRz) ** 2 <= 1) {
                        storeVoxel(x, y, z, 'Gray');
                    }
                }
            }
        }
    });
}