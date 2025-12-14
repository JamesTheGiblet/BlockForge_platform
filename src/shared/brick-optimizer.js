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

        // Greedy optimization: Merge adjacent 1x1s into 1xN strips
        for (let y = 0; y < height; y++) {
            let currentStart = -1;
            let currentColor = null;

            for (let x = 0; x < width; x++) {
                const color = grid[y][x];
                
                // Check if we match the current strip
                const isMatch = currentColor && color && (color.hex === currentColor.hex);

                if (currentStart !== -1 && !isMatch) {
                    // End current strip
                    const w = x - currentStart;
                    layout.add(new Brick(currentStart, y, 0, w, 1, currentColor, `plate-1x${w}`));
                    currentStart = -1;
                    currentColor = null;
                }

                if (color && currentStart === -1) {
                    // Start new strip
                    currentStart = x;
                    currentColor = color;
                }
            }
            
            // End of row check
            if (currentStart !== -1) {
                const w = width - currentStart;
                layout.add(new Brick(currentStart, y, 0, w, 1, currentColor, `plate-1x${w}`));
            }
        }
        
        return layout;
    }
}