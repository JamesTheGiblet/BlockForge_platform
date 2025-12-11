function createCarModel(storeVoxel, onSphereSurface, onEllipsoidSurface) {

    // ============================================================
    // WHEELS — Deep round wheels + hub
    // ============================================================
    const wheels = [
        {cx: -9, cy: 3, cz: 7},   // Front-left
        {cx: 9,  cy: 3, cz: 7},   // Front-right
        {cx: -9, cy: 3, cz: -7},  // Rear-left
        {cx: 9,  cy: 3, cz: -7}   // Rear-right
    ];
    const wheelRadius = 3.5;
    const hubRadius   = 1.5;

    wheels.forEach(w => {
        for (let y = w.cy - 4; y <= w.cy + 4; y++) {
            for (let x = w.cx - 4; x <= w.cx + 4; x++) {
                for (let z = w.cz - 4; z <= w.cz + 4; z++) {
                    // Tire
                    if (onSphereSurface(x, y, z, w.cx, w.cy, w.cz, wheelRadius, 2.0))
                        storeVoxel(x, y, z, 'Black');

                    // Hub
                    if (onSphereSurface(x, y, z, w.cx, w.cy, w.cz, hubRadius, 1.0))
                        storeVoxel(x, y, z, 'Gray');
                }
            }
        }
    });

    // ============================================================
    // LOWER BODY / CHASSIS — long, low ellipsoid
    // ============================================================
    for (let y = 6; y < 16; y++) {
        for (let x = -12; x <= 12; x++) {
            for (let z = -8; z <= 8; z++) {
                if (onEllipsoidSurface(x, y, z, 0, 11, 0, 13, 5, 8, 2.0))
                    storeVoxel(x, y, z, 'Red');
            }
        }
    }

    // ============================================================
    // WHEEL ARCHES — nice realistic openings
    // ============================================================
    const arches = [
        {cx: -9, cy: 10, cz: 7},
        {cx: 9,  cy: 10, cz: 7},
        {cx: -9, cy: 10, cz: -7},
        {cx: 9,  cy: 10, cz: -7}
    ];
    arches.forEach(a => {
        for (let y = a.cy - 4; y <= a.cy + 3; y++) {
            for (let x = a.cx - 4; x <= a.cx + 4; x++) {
                for (let z = a.cz - 4; z <= a.cz + 4; z++) {
                    if (onSphereSurface(x, y, z, a.cx, a.cy, a.cz, 4, 1.5))
                        storeVoxel(x, y, z, 'DarkRed');
                }
            }
        }
    });

    // ============================================================
    // HOOD — smooth forward slope
    // ============================================================
    for (let y = 14; y < 21; y++) {
        for (let x = -12; x <= -3; x++) {
            for (let z = -6; z <= 6; z++) {
                if (onEllipsoidSurface(x, y, z, -8, 19, 0, 7, 4, 6, 1.4))
                    storeVoxel(x, y, z, 'Red');
            }
        }
    }

    // ============================================================
    // ROOF / CABIN — smooth top section
    // ============================================================
    for (let y = 18; y < 28; y++) {
        for (let x = -7; x <= 7; x++) {
            for (let z = -5; z <= 5; z++) {
                if (onEllipsoidSurface(x, y, z, 0, 25, 0, 7, 4, 5, 1.6))
                    storeVoxel(x, y, z, 'Red');
            }
        }
    }

    // ============================================================
    // WINDOWS — Light-blue tinted curved windows
    // ============================================================
    const windowColor = 'LightBlue';

    // Front window
    for (let y = 19; y < 25; y++) {
        for (let x = -5; x <= 5; x++) {
            for (let z = 4; z <= 8; z++) {
                if (onEllipsoidSurface(x, y, z, 0, 22, 7, 5, 4, 2, 1.1))
                    storeVoxel(x, y, z, windowColor);
            }
        }
    }

    // Left side
    for (let y = 20; y < 27; y++) {
        for (let x = -8; x <= -5; x++) {
            for (let z = -2; z <= 2; z++) {
                storeVoxel(x, y, z, windowColor);
            }
        }
    }

    // Right side
    for (let y = 20; y < 27; y++) {
        for (let x = 5; x <= 8; x++) {
            for (let z = -2; z <= 2; z++) {
                storeVoxel(x, y, z, windowColor);
            }
        }
    }

    // Rear window
    for (let y = 20; y < 26; y++) {
        for (let x = -4; x <= 4; x++) {
            for (let z = -7; z <= -4; z++) {
                if (onEllipsoidSurface(x, y, z, 0, 23, -7, 4, 3, 2, 1.2))
                    storeVoxel(x, y, z, windowColor);
            }
        }
    }

    // ============================================================
    // HEADLIGHTS — bright white, slight rounding
    // ============================================================
    const lights = [
        {x: -13, y: 10, z: 3},
        {x: -13, y: 10, z: -3},
        {x: -13, y: 11, z: 3},
        {x: -13, y: 11, z: -3}
    ];
    lights.forEach(l => storeVoxel(l.x, l.y, l.z, 'White'));

    // ============================================================
    // TAILLIGHTS — yellow / red mix
    // ============================================================
    const tails = [
        {x: 13, y: 10, z: 3},
        {x: 13, y: 10, z: -3},
        {x: 13, y: 11, z: 3},
        {x: 13, y: 11, z: -3}
    ];
    tails.forEach(t => storeVoxel(t.x, t.y, t.z, 'Yellow'));

    // ============================================================
    // SPOILER
    // ============================================================
    for (let x = 8; x <= 12; x++) {
        for (let z = -4; z <= 4; z++) {
            storeVoxel(x, 27, z, 'Blue');
            storeVoxel(x, 28, z, 'Blue');
        }
    }

    // ============================================================
    // SIDE MIRRORS
    // ============================================================
    storeVoxel(-9, 23, 2, 'Black');
    storeVoxel( 9, 23, 2, 'Black');

    // ============================================================
    // FRONT GRILL (gray stripes)
    // ============================================================
    for (let z = -4; z <= 4; z++) {
        storeVoxel(-13, 9, z, 'Gray');
        storeVoxel(-13, 10, z, 'DarkGray');
    }
}
