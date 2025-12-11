/**
 * VoxelGrid - 3D grid data structure for voxel data
 */
export class VoxelGrid {
  constructor(width, height, depth = 1) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.data = new Array(width * height * depth).fill(null);
  }

  /**
   * Convert 3D coordinates to 1D array index
   */
  getIndex(x, y, z = 0) {
    return x + y * this.width + z * this.width * this.height;
  }

  /**
   * Get voxel at position
   */
  get(x, y, z = 0) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
      return null;
    }
    return this.data[this.getIndex(x, y, z)];
  }

  /**
   * Set voxel at position
   */
  set(x, y, z, value) {
    if (typeof z !== 'number') {
      // 2D mode: (x, y, value)
      value = z;
      z = 0;
    }
    
    if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
      return false;
    }
    
    this.data[this.getIndex(x, y, z)] = value;
    return true;
  }

  /**
   * Iterate over all filled voxels
   */
  forEach(callback) {
    for (let z = 0; z < this.depth; z++) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const voxel = this.get(x, y, z);
          if (voxel && voxel.filled) {
            callback(voxel, x, y, z);
          }
        }
      }
    }
  }

  /**
   * Get bounding box of filled voxels
   */
  getBounds() {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    let hasVoxels = false;

    this.forEach((voxel, x, y, z) => {
      hasVoxels = true;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    });

    if (!hasVoxels) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }

    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ }
    };
  }

  /**
   * Convert grid to 2D array (for visualization)
   */
  toArray2D(z = 0) {
    const array = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(this.get(x, y, z));
      }
      array.push(row);
    }
    return array;
  }
}

/**
 * Voxelizer - Convert various inputs to VoxelGrid
 */
export class Voxelizer {
  /**
   * Convert text to voxel grid using pixel font
   * @param {string} text - Text to convert
   * @param {object} fontData - Font character map
   * @param {object} options - Options (spacing, padding, etc.)
   */
  static fromText(text, fontData, options = {}) {
    const {
      spacing = 1,      // Space between characters
      padding = 0,      // Padding around text
      borderWidth = 0,  // Border thickness
      color = { r: 0, g: 0, b: 0 }  // Default text color
    } = options;

    const borderColor = options.borderColor || color;

    const rows = 5; // Font height (5x5 pixel font)
    
    // Build letter grid
    let grid = [];
    for (let i = 0; i < rows; i++) {
      grid[i] = [];
    }

    // Add each character with spacing
    for (let char of text.toUpperCase()) {
      const letterMap = fontData[char] || fontData[' '];
      if (!letterMap) continue;

      for (let r = 0; r < rows; r++) {
        grid[r] = grid[r].concat(letterMap[r]);
        
        // Add spacing after character (except last)
        if (char !== text[text.length - 1]) {
          for (let s = 0; s < spacing; s++) {
            grid[r].push(0);
          }
        }
      }
    }

    // Calculate dimensions
    const contentWidth = grid[0] ? grid[0].length : 0;
    const contentHeight = rows;
    const totalWidth = contentWidth + (padding * 2) + (borderWidth * 2);
    const totalHeight = contentHeight + (padding * 2) + (borderWidth * 2);

    // Create voxel grid
    const voxelGrid = new VoxelGrid(totalWidth, totalHeight, 1);

    // Fill voxel grid with border, padding, and content
    for (let y = 0; y < totalHeight; y++) {
      for (let x = 0; x < totalWidth; x++) {
        // Determine cell type
        const isBorder = (
          x < borderWidth || 
          x >= totalWidth - borderWidth || 
          y < borderWidth || 
          y >= totalHeight - borderWidth
        );

        const isPadding = !isBorder && (
          x < borderWidth + padding ||
          x >= totalWidth - borderWidth - padding ||
          y < borderWidth + padding ||
          y >= totalHeight - borderWidth - padding
        );

        const contentX = x - borderWidth - padding;
        const contentY = y - borderWidth - padding;
        const isContent = !isBorder && !isPadding && 
          contentY >= 0 && contentY < contentHeight &&
          contentX >= 0 && contentX < contentWidth &&
          grid[contentY] && grid[contentY][contentX] === 1;

        // Create voxel
        let voxel = null;
        if (isBorder) {
          voxel = { filled: true, type: 'border', color: borderColor };
        } else if (isContent) {
          voxel = { filled: true, type: 'text', color };
        } else {
          voxel = { filled: true, type: 'background', color: { r: 255, g: 255, b: 255 } };
        }

        voxelGrid.set(x, y, 0, voxel);
      }
    }

    return voxelGrid;
  }

  /**
   * Placeholder for image to voxels (for future studios)
   */
  static fromImage(imageData, options = {}) {
    console.warn('Voxelizer.fromImage not implemented yet');
    return new VoxelGrid(10, 10, 1);
  }

  /**
   * Placeholder for 3D model to voxels (for future studios)
   */
  static fromModel(modelData, options = {}) {
    console.warn('Voxelizer.fromModel not implemented yet');
    return new VoxelGrid(10, 10, 10);
  }

  /**
   * Placeholder for QR code to voxels (for future studios)
   */
  static fromQRCode(qrData, options = {}) {
    console.warn('Voxelizer.fromQRCode not implemented yet');
    return new VoxelGrid(32, 32, 1);
  }
}