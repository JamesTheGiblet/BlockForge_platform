// src/shared/brick-optimizer.js
export class Brick {
    constructor(x, y, z, width, depth, color, type) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = width;
        this.depth = depth;
        this.color = color;
        this.type = type;
    }
}

export class BrickLayout {
    constructor() {
        this.bricks = [];
    }

    add(brick) {
        this.bricks.push(brick);
    }
}

export class BrickOptimizer {
    static optimize(voxelGrid, options = {}) {
        const layout = new BrickLayout();
        
        if (!voxelGrid || !voxelGrid.grid) return layout;

        const grid = voxelGrid.grid;
        const height = voxelGrid.height;
        const width = voxelGrid.width;

        // Basic 1x1 optimization
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const color = grid[y][x];
                if (color) {
                    layout.add(new Brick(x, y, 0, 1, 1, color, 'plate-1x1'));
                }
            }
        }
        
        return layout;
    }
}