function createBearModel(storeVoxel, onSphereSurface, onEllipsoidSurface) {
    // We'll use integer grid coordinates for voxels
    // The original numeric ranges are preserved but we'll treat those numbers as grid coordinates.
    // FEET - Rounded and protruding forward
    const footCenters = [{x:-6, y:2, z:0}, {x:6, y:2, z:0}];
    const footRadius = 3.5;
    const footThickness = 1.5;

    footCenters.forEach(center => {
        for (let y = 0; y < 6; y++) {
            for (let x = Math.floor(center.x - footRadius); x <= Math.ceil(center.x + footRadius); x++) {
                for (let z = Math.floor(center.z - footRadius); z <= Math.ceil(center.z + footRadius); z++) {
                    if (onSphereSurface(x, y, z, center.x, center.y, center.z, footRadius, footThickness)) storeVoxel(x, y, z, 'Red');
                }
            }
        }
    });

    // TOES & CLAWS - 3 distinct orbs per foot with claws
    const toeDefs = [
        { cx: -7.5, cy: 1.5, cz: 4.5, clawZ: 6 }, { cx: -6, cy: 1.5, cz: 5, clawZ: 7 }, { cx: -4.5, cy: 1.5, cz: 4.5, clawZ: 6 }, // Left
        { cx: 4.5, cy: 1.5, cz: 4.5, clawZ: 6 },  { cx: 6, cy: 1.5, cz: 5, clawZ: 7 },  { cx: 7.5, cy: 1.5, cz: 4.5, clawZ: 6 }  // Right
    ];
    const toeRadius = 1.5; // This radius means the orb is 3 units tall
    const toeThickness = 1.2;

    toeDefs.forEach(toe => {
        // Create the toe orb
        for (let y = Math.floor(toe.cy - toeRadius); y <= Math.ceil(toe.cy + toeRadius); y++) {
            for (let x = Math.floor(toe.cx - toeRadius); x <= Math.ceil(toe.cx + toeRadius); x++) {
                for (let z = Math.floor(toe.cz - toeRadius); z <= Math.ceil(toe.cz + toeRadius); z++) {
                    if (onSphereSurface(x, y, z, toe.cx, toe.cy, toe.cz, toeRadius, toeThickness)) storeVoxel(x, y, z, 'Red');
                }
            }
        }
        // Add the white claw at the tip
        storeVoxel(Math.round(toe.cx), 1, toe.clawZ, 'White');
    });

    // LEGS - composed of two ovals for a more organic shape
    const legCenters = [
        { thigh: {cx:-6, cy:14, cz:-1, rx:2.5, ry:6, rz:2}, calf: {cx:-6, cy:8, cz:-1, rx:2.2, ry:5, rz:1.8} }, // Left
        { thigh: {cx:6, cy:14, cz:-1, rx:2.5, ry:6, rz:2}, calf: {cx:6, cy:8, cz:-1, rx:2.2, ry:5, rz:1.8} }  // Right
    ];

    legCenters.forEach(leg => {
        // Thigh (upper leg)
        for (let y = 10; y < 20; y++) {
            for (let x = Math.floor(leg.thigh.cx - leg.thigh.rx); x <= Math.ceil(leg.thigh.cx + leg.thigh.rx); x++) {
                for (let z = Math.floor(leg.thigh.cz - leg.thigh.rz); z <= Math.ceil(leg.thigh.cz + leg.thigh.rz); z++) {
                    if (onEllipsoidSurface(x, y, z, leg.thigh.cx, leg.thigh.cy, leg.thigh.cz, leg.thigh.rx, leg.thigh.ry, leg.thigh.rz, 1.0)) storeVoxel(x, y, z, 'Red');
                }
            }
        }
        // Calf (lower leg)
        for (let y = 5; y < 14; y++) {
            for (let x = Math.floor(leg.calf.cx - leg.calf.rx); x <= Math.ceil(leg.calf.cx + leg.calf.rx); x++) {
                for (let z = Math.floor(leg.calf.cz - leg.calf.rz); z <= Math.ceil(leg.calf.cz + leg.calf.rz); z++) {
                    if (onEllipsoidSurface(x, y, z, leg.calf.cx, leg.calf.cy, leg.calf.cz, leg.calf.rx, leg.calf.ry, leg.calf.rz, 1.0)) storeVoxel(x, y, z, 'Red');
                }
            }
        }
    });

    // BODY (17-38)
    for (let y = 17; y < 39; y++){
        for (let x = -8; x <= 8; x++){
            for (let z = -6; z <= 6; z++){
                if (onEllipsoidSurface(x, y, z, 0, 27, 0, 7, 12, 6, 1.5)){
                    storeVoxel(x, y, z, 'Red');
                }
            }
        }
    }

    // TAIL - small and round
    const tailCenter = {x: 0, y: 22, z: -7};
    const tailRadius = 2.5;
    const tailThickness = 1.5;
    for (let y = Math.floor(tailCenter.y - tailRadius); y <= Math.ceil(tailCenter.y + tailRadius); y++) {
        for (let x = Math.floor(tailCenter.x - tailRadius); x <= Math.ceil(tailCenter.x + tailRadius); x++) {
            for (let z = Math.floor(tailCenter.z - tailRadius); z <= Math.ceil(tailCenter.z + tailRadius); z++) {
                if (onSphereSurface(x, y, z, tailCenter.x, tailCenter.y, tailCenter.z, tailRadius, tailThickness)) {
                    storeVoxel(x, y, z, 'Red');
                }
            }
        }
    }

    // BELLY (yellow patch)
    for (let y = 20; y < 35; y++){
        for (let x = -4; x <= 4; x++){
            for (let z = 4; z <= 6; z++){
                if (onEllipsoidSurface(x, y, z, 0, 27, 5, 4.5, 11, 2, 1.2)){
                    storeVoxel(x, y, z, 'Yellow');
                }
            }
        }
    }

    // ARMS - composed of two ovals for a more organic shape
    const armCenters = [
        { shoulder: {cx:-8.5, cy:30, cz:0, rx:3, ry:5, rz:2.5}, forearm: {cx:-9.5, cy:24, cz:0, rx:2.5, ry:6, rz:2} }, // Left
        { shoulder: {cx:8.5, cy:30, cz:0, rx:3, ry:5, rz:2.5}, forearm: {cx:9.5, cy:24, cz:0, rx:2.5, ry:6, rz:2} }  // Right
    ];

    armCenters.forEach(arm => {
        // Shoulder (upper arm)
        for (let y = 25; y < 36; y++) {
            for (let x = Math.floor(arm.shoulder.cx - arm.shoulder.rx); x <= Math.ceil(arm.shoulder.cx + arm.shoulder.rx); x++) {
                for (let z = Math.floor(arm.shoulder.cz - arm.shoulder.rz); z <= Math.ceil(arm.shoulder.cz + arm.shoulder.rz); z++) {
                    if (onEllipsoidSurface(x, y, z, arm.shoulder.cx, arm.shoulder.cy, arm.shoulder.cz, arm.shoulder.rx, arm.shoulder.ry, arm.shoulder.rz, 1.0)) storeVoxel(x, y, z, 'Red');
                }
            }
        }
        // Forearm (lower arm)
        for (let y = 18; y < 31; y++) {
            for (let x = Math.floor(arm.forearm.cx - arm.forearm.rx); x <= Math.ceil(arm.forearm.cx + arm.forearm.rx); x++) {
                for (let z = Math.floor(arm.forearm.cz - arm.forearm.rz); z <= Math.ceil(arm.forearm.cz + arm.forearm.rz); z++) {
                    if (onEllipsoidSurface(x, y, z, arm.forearm.cx, arm.forearm.cy, arm.forearm.cz, arm.forearm.rx, arm.forearm.ry, arm.forearm.rz, 1.0)) storeVoxel(x, y, z, 'Red');
                }
            }
        }
    });

    // FINGERS & CLAWS - 3 distinct orbs per hand with claws
    const fingerDefs = [
        { cx: -11.5, cy: 19, cz: 1.5, clawZ: 3 }, { cx: -10, cy: 19, cz: 2, clawZ: 4 }, { cx: -8.5, cy: 19, cz: 1.5, clawZ: 3 }, // Left
        { cx: 8.5, cy: 19, cz: 1.5, clawZ: 3 },  { cx: 10, cy: 19, cz: 2, clawZ: 4 },  { cx: 11.5, cy: 19, cz: 1.5, clawZ: 3 }  // Right
    ];
    const fingerRadius = 1.5;
    const fingerThickness = 1.2;

    fingerDefs.forEach(finger => {
        // Create the finger orb
        for (let y = Math.floor(finger.cy - fingerRadius); y <= Math.ceil(finger.cy + fingerRadius); y++) {
            for (let x = Math.floor(finger.cx - fingerRadius); x <= Math.ceil(finger.cx + fingerRadius); x++) {
                for (let z = Math.floor(finger.cz - fingerRadius); z <= Math.ceil(finger.cz + fingerRadius); z++) {
                    if (onSphereSurface(x, y, z, finger.cx, finger.cy, finger.cz, fingerRadius, fingerThickness)) storeVoxel(x, y, z, 'Red');
                }
            }
        }
        // Add the white claw at the tip
        storeVoxel(Math.round(finger.cx), Math.round(finger.cy), finger.clawZ, 'White');
    });

    // NECK
    for (let y = 39; y < 43; y++){
        for (let x = -4; x <= 4; x++){
            for (let z = -4; z <= 4; z++){
                if (onSphereSurface(x, y, z, 0, 40, 0, 3.5, 1.0)){
                    storeVoxel(x, y, z, 'Red');
                }
            }
        }
    }

    // HEAD
    for (let y = 43; y < 61; y++){
        for (let x = -9; x <= 9; x++){
            for (let z = -6; z <= 6; z++){
                if (onEllipsoidSurface(x, y, z, 0, 51, 0, 9, 8, 7, 1.5)){
                    storeVoxel(x, y, z, 'Red');
                }
            }
        }
    }

    // SNOUT
    for (let y = 48; y < 55; y++){
        for (let x = -3; x <= 3; x++){
            for (let z = 6; z <= 10; z++){
                if (onEllipsoidSurface(x, y, z, 0, 51, 8, 3, 3, 2.5, 1.2)){
                    storeVoxel(x, y, z, 'Red');
                }
            }
        }
    }

    // EARS
    // EARS - Solid back with indented front
    const earCenters = [{x:-7, y:61, z:0}, {x:7, y:61, z:0}];
    const earRadius = 4.0;
    const earIndentRadius = 3.0;

    earCenters.forEach(center => {
        for (let y = center.y - earRadius; y <= center.y + earRadius; y++) {
            for (let x = center.x - earRadius; x <= center.x + earRadius; x++) {
                for (let z = center.z - earRadius; z <= center.z + earRadius; z++) {
                    const dist = Math.sqrt((x-center.x)**2 + (y-center.y)**2 + (z-center.z)**2);
                    // Is it part of the main ear sphere?
                    if (dist <= earRadius) {
                        // Is it NOT part of the front-facing indent?
                        if (dist > earIndentRadius || z < center.z) {
                            storeVoxel(Math.round(x), Math.round(y), Math.round(z), 'Red');
                        }
                    }
                }
            }
        }
    });

    // EYES (white) - small patches
    for (let y = 52; y < 57; y++){
        for (let x = -5; x <= -2; x++){
            for (let z = 4; z <= 7; z++){
                if (onSphereSurface(x, y, z, -3.5, 54, 5.5, 2.0, 0.8)){
                    storeVoxel(x, y, z, 'White');
                }
            }
        }
        for (let x = 2; x <= 5; x++){
            for (let z = 4; z <= 7; z++){
                if (onSphereSurface(x, y, z, 3.5, 54, 5.5, 2.0, 0.8)){
                    storeVoxel(x, y, z, 'White');
                }
            }
        }
    }

    // Eye pupils
    storeVoxel(-4, 54, 7, 'Blue');
    storeVoxel(4, 54, 7, 'Blue');

    // Nose (blue) - rounded
    const noseCenter = {x: 0, y: 51, z: 11};
    const noseRadius = 1.5;
    const noseThickness = 1.2;
    for (let y = Math.floor(noseCenter.y - noseRadius); y <= Math.ceil(noseCenter.y + noseRadius); y++) {
        for (let x = Math.floor(noseCenter.x - noseRadius); x <= Math.ceil(noseCenter.x + noseRadius); x++) {
            for (let z = Math.floor(noseCenter.z - noseRadius); z <= Math.ceil(noseCenter.z + noseRadius); z++) {
                if (onSphereSurface(x, y, z, noseCenter.x, noseCenter.y, noseCenter.z, noseRadius, noseThickness)) storeVoxel(x, y, z, 'Blue');
            }
        }
    }

    // Smile
    for (let x = -3; x <= 3; x++){
        const z = 9;
        const y = Math.round(48 - Math.abs(x) * 0.5);
        storeVoxel(x, y, z, 'Blue');
    }

    // JAW
    for (let y = 45; y < 48; y++){
        for (let x = -3; x <= 3; x++){
            for (let z = 6; z <= 9; z++){
                if (onEllipsoidSurface(x, y, z, 0, 46, 7.5, 3, 1.5, 1.5, 1.0)){
                    storeVoxel(x, y, z, 'Red');
                }
            }
        }
    }

    // BOW TIE - classic bow shape
    const bowTieY = 40;
    const bowTieZ = 5;
    // Knot
    storeVoxel(0, bowTieY, bowTieZ, 'Blue');
    storeVoxel(0, bowTieY, bowTieZ - 1, 'Blue');
    // Left Wing
    storeVoxel(-1, bowTieY, bowTieZ, 'Blue'); // Pinch
    storeVoxel(-2, bowTieY + 1, bowTieZ, 'Blue'); storeVoxel(-3, bowTieY + 1, bowTieZ, 'Blue'); // Top flare
    storeVoxel(-2, bowTieY - 1, bowTieZ, 'Blue'); storeVoxel(-3, bowTieY - 1, bowTieZ, 'Blue'); // Bottom flare
    // Right Wing
    storeVoxel(1, bowTieY, bowTieZ, 'Blue');  // Pinch
    storeVoxel(2, bowTieY + 1, bowTieZ, 'Blue');  storeVoxel(3, bowTieY + 1, bowTieZ, 'Blue');  // Top flare
    storeVoxel(2, bowTieY - 1, bowTieZ, 'Blue');  storeVoxel(3, bowTieY - 1, bowTieZ, 'Blue');  // Bottom flare
}