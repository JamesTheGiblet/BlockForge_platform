/**
 * Brick - Represents a single LEGO brick
 */
export class Brick {
  constructor(type, position, color, rotation = 0, sourceType = null) {
    this.type = type;           // brick-1x2, tile-1x1, etc
    this.position = position;   // {x, y, z}
    this.color = color;         // {r, g, b}
    this.rotation = rotation;   // 0, 90, 180, 270
    this.sourceType = sourceType; // 'text', 'border', 'background', etc
  }

  /**
   * Get brick dimensions from type
   */
  getDimensions() {
    const match = this.type.match(/(\d+)x(\d+)/);
    if (match) {
      return {
        width: parseInt(match[1]),
        height: parseInt(match[2])
      };
    }
    return { width: 1, height: 1 };
  }
}

/**
 * BrickLayout - Collection of bricks with metadata
 */
export class BrickLayout {
    /**
     * Get counts by source type
     */
    getSourceTypeCounts() {
      const counts = {};
      this.bricks.forEach(brick => {
        if (brick.sourceType) {
          counts[brick.sourceType] = (counts[brick.sourceType] || 0) + 1;
        }
      });
      return counts;
    }
  constructor() {
    this.bricks = [];
  }

  /**
   * Add a brick to the layout
   */
  addBrick(brick) {
    this.bricks.push(brick);
  }

  /**
   * Get brick counts by type
   */
  getBrickCounts() {
    const counts = {};
    this.bricks.forEach(brick => {
      counts[brick.type] = (counts[brick.type] || 0) + 1;
    });
    return counts;
  }

  /**
   * Get counts by color
   */
  getColorCounts() {
    const counts = {};
    this.bricks.forEach(brick => {
      const colorKey = `rgb(${brick.color.r},${brick.color.g},${brick.color.b})`;
      counts[colorKey] = (counts[colorKey] || 0) + 1;
    });
    return counts;
  }

  /**
   * Get bounding box of all bricks
   */
  getBounds() {
    if (this.bricks.length === 0) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    this.bricks.forEach(brick => {
      const pos = brick.position;
      const dims = brick.getDimensions();
      
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      minZ = Math.min(minZ, pos.z);
      
      maxX = Math.max(maxX, pos.x + dims.width - 1);
      maxY = Math.max(maxY, pos.y + dims.height - 1);
      maxZ = Math.max(maxZ, pos.z);
    });

    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ }
    };
  }

  /**
   * Get total brick count
   */
  getTotalBricks() {
    return this.bricks.length;
  }
}

/**
 * BrickOptimizer - Convert voxel grids to optimized brick layouts
 */
export class BrickOptimizer {
  /**
   * Optimize voxel grid into brick layout using greedy algorithm
   * @param {VoxelGrid} voxelGrid - Input voxel grid
   * @param {object} options - Optimization options
   */
  static optimize(voxelGrid, options = {}) {
    const {
      allowTiles = true,
      allowDots = false,
      colorMatch = true
    } = options;

    const layout = new BrickLayout();
    const bounds = voxelGrid.getBounds();
    const width = bounds.max.x - bounds.min.x + 1;
    const height = bounds.max.y - bounds.min.y + 1;

    // Create occupancy grid
    const occupied = Array(height).fill(null).map(() => Array(width).fill(false));

    // Greedy optimization: largest bricks first
    // For 2D signs: try 1x3, 1x2, then 1x1
    const brickSizes = [
      { w: 1, h: 3, type: 'tile-1x3' },
      { w: 1, h: 2, type: 'tile-1x2' },
      { w: 1, h: 1, type: 'tile-1x1' }
    ];

    // Process each row
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (occupied[y][x]) continue;

        const worldX = bounds.min.x + x;
        const worldY = bounds.min.y + y;
        const voxel = voxelGrid.get(worldX, worldY, 0);

        if (!voxel || !voxel.filled) continue;

        // Try to place largest brick possible
        let placed = false;
        
        for (const size of brickSizes) {
          // Check if brick fits
          if (x + size.w > width || y + size.h > height) continue;

          // Check if all cells are same color and not occupied
          let canPlace = true;
          for (let dy = 0; dy < size.h; dy++) {
            for (let dx = 0; dx < size.w; dx++) {
              if (occupied[y + dy][x + dx]) {
                canPlace = false;
                break;
              }
              
              const checkVoxel = voxelGrid.get(worldX + dx, worldY + dy, 0);
              if (!checkVoxel || !checkVoxel.filled) {
                canPlace = false;
                break;
              }

              // Check color match if required
              if (colorMatch) {
                if (checkVoxel.color.r !== voxel.color.r ||
                    checkVoxel.color.g !== voxel.color.g ||
                    checkVoxel.color.b !== voxel.color.b) {
                  canPlace = false;
                  break;
                }
              }
            }
            if (!canPlace) break;
          }

          if (canPlace) {
            // Place brick
            const brick = new Brick(
              size.type,
              { x: worldX, y: worldY, z: 0 },
              voxel.color,
              0,
              voxel.type // Pass through the source type
            );
            layout.addBrick(brick);

            // Mark cells as occupied
            for (let dy = 0; dy < size.h; dy++) {
              for (let dx = 0; dx < size.w; dx++) {
                occupied[y + dy][x + dx] = true;
              }
            }

            placed = true;
            break;
          }
        }

        // If nothing placed, use 1x1
        if (!placed) {
          const brick = new Brick(
            'tile-1x1',
            { x: worldX, y: worldY, z: 0 },
            voxel.color,
            0,
            voxel.type // Pass through the source type
          );
          layout.addBrick(brick);
          occupied[y][x] = true;
        }
      }
    }

    return layout;
  }
}