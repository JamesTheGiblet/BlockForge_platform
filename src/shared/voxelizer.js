/**
 * VoxelGrid - Optimized 3D grid data structure for voxel data
 */
export class VoxelGrid {
  #data;
  #filledCount = 0;
  #boundsCache = null;

  constructor(width, height, depth = 1) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.#data = new Array(width * height * depth).fill(null);
  }

  /**
   * Convert 3D coordinates to 1D array index with bounds checking
   */
  #getIndex(x, y, z = 0) {
    if (
      x < 0 || x >= this.width ||
      y < 0 || y >= this.height ||
      z < 0 || z >= this.depth
    ) {
      return null;
    }
    return x + y * this.width + z * this.width * this.height;
  }

  /**
   * Get voxel at position with type safety
   */
  get(x, y, z = 0) {
    const index = this.#getIndex(x, y, z);
    return index !== null ? this.#data[index] : null;
  }

  /**
   * Set voxel at position with optimized update
   */
  set(x, y, z, value) {
    // Handle 2D mode overload
    if (typeof z !== 'number') {
      value = z;
      z = 0;
    }

    const index = this.#getIndex(x, y, z);
    if (index === null) return false;

    const current = this.#data[index];
    const wasFilled = current?.filled;
    const willBeFilled = value?.filled;

    if (wasFilled && !willBeFilled) this.#filledCount--;
    if (!wasFilled && willBeFilled) this.#filledCount++;

    this.#data[index] = value;
    this.#boundsCache = null; // Invalidate cache
    return true;
  }

  /**
   * Fill a rectangular region
   */
  fillRect(x, y, z, width, height, depth, value) {
    for (let dz = 0; dz < depth; dz++) {
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          this.set(x + dx, y + dy, z + dz, value);
        }
      }
    }
  }

  /**
   * Clear the grid
   */
  clear() {
    this.#data.fill(null);
    this.#filledCount = 0;
    this.#boundsCache = null;
  }

  /**
   * Get number of filled voxels
   */
  get filledCount() {
    return this.#filledCount;
  }

  /**
   * Check if coordinates are within bounds
   */
  inBounds(x, y, z = 0) {
    return this.#getIndex(x, y, z) !== null;
  }

  /**
   * Iterate over all filled voxels with early exit support
   */
  forEach(callback) {
    for (let index = 0; index < this.#data.length; index++) {
      const voxel = this.#data[index];
      if (!voxel?.filled) continue;

      const z = Math.floor(index / (this.width * this.height));
      const remainder = index % (this.width * this.height);
      const y = Math.floor(remainder / this.width);
      const x = remainder % this.width;

      if (callback(voxel, x, y, z) === false) {
        break; // Allow early exit
      }
    }
  }

  /**
   * Map over all filled voxels
   */
  map(callback) {
    const results = [];
    this.forEach((voxel, x, y, z) => {
      results.push(callback(voxel, x, y, z));
    });
    return results;
  }

  /**
   * Filter voxels
   */
  filter(predicate) {
    const results = [];
    this.forEach((voxel, x, y, z) => {
      if (predicate(voxel, x, y, z)) {
        results.push({ voxel, x, y, z });
      }
    });
    return results;
  }

  /**
   * Get bounding box of filled voxels with memoization
   */
  getBounds(forceRecalc = false) {
    if (!forceRecalc && this.#boundsCache) {
      return this.#boundsCache;
    }

    if (this.#filledCount === 0) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    this.forEach((_, x, y, z) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    });

    this.#boundsCache = {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ }
    };
    return this.#boundsCache;
  }

  /**
   * Get a slice of the grid at specific Z level
   */
  slice(z) {
    const slice = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(this.get(x, y, z));
      }
      slice.push(row);
    }
    return slice;
  }

  /**
   * Clone the grid
   */
  clone() {
    const clone = new VoxelGrid(this.width, this.height, this.depth);
    clone.#data = [...this.#data];
    clone.#filledCount = this.#filledCount;
    return clone;
  }

  /**
   * Resize the grid while preserving data
   */
  resize(newWidth, newHeight, newDepth = this.depth) {
    const newGrid = new VoxelGrid(newWidth, newHeight, newDepth);
    
    this.forEach((voxel, x, y, z) => {
      if (x < newWidth && y < newHeight && z < newDepth) {
        newGrid.set(x, y, z, voxel);
      }
    });
    
    return newGrid;
  }

  /**
   * Convert to 2D array for visualization
   */
  toArray2D(z = 0) {
    return this.slice(z);
  }

  /**
   * Convert to JSON for serialization
   */
  toJSON() {
    return {
      width: this.width,
      height: this.height,
      depth: this.depth,
      data: this.#data
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json) {
    const grid = new VoxelGrid(json.width, json.height, json.depth);
    grid.#data = json.data;
    grid.#filledCount = json.data.filter(v => v?.filled).length;
    return grid;
  }
}

/**
 * Voxelizer - Advanced voxel conversion utilities
 */
export class Voxelizer {
  static #colorCache = new Map();

  /**
   * Font character rendering with kerning support
   */
  static fromText(text, fontData, options = {}) {
    const {
      spacing = 1,      // Space between characters
      padding = 0,      // Padding around text
      borderWidth = 0,  // Border thickness
      color = { r: 0, g: 0, b: 0 },  // Default text color
      borderColor = color,
      backgroundColor = { r: 255, g: 255, b: 255 },
      kerning = {}
    } = options;

    const rows = 5; // Font height (5x5 pixel font)
    
    // Calculate total width with kerning
    let totalWidth = 0;
    const characterMaps = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i].toUpperCase();
      const letterMap = fontData[char] || fontData[' '] || Array(rows).fill([]);
      characterMaps.push(letterMap);
      totalWidth += letterMap[0]?.length || 0;
      
      // Add spacing and kerning
      if (i < text.length - 1) {
        const nextChar = text[i + 1].toUpperCase();
        const kerningKey = `${char}${nextChar}`;
        totalWidth += spacing + (kerning[kerningKey] || 0);
      }
    }

    const contentWidth = totalWidth;
    const contentHeight = rows;
    const totalGridWidth = contentWidth + (padding * 2) + (borderWidth * 2);
    const totalGridHeight = contentHeight + (padding * 2) + (borderWidth * 2);

    const grid = new VoxelGrid(totalGridWidth, totalGridHeight, 1);

    // Helper function to set voxel with color
    const setVoxel = (x, y, type, color) => {
      grid.set(x, y, 0, { filled: true, type, color });
    };

    // Fill border
    if (borderWidth > 0) {
      for (let y = 0; y < totalGridHeight; y++) {
        for (let x = 0; x < totalGridWidth; x++) {
          if (
            x < borderWidth ||
            x >= totalGridWidth - borderWidth ||
            y < borderWidth ||
            y >= totalGridHeight - borderWidth
          ) {
            setVoxel(x, y, 'border', borderColor);
          }
        }
      }
    }

    // Fill background
    const bgStart = borderWidth;
    const bgEndX = totalGridWidth - borderWidth;
    const bgEndY = totalGridHeight - borderWidth;
    
    for (let y = bgStart; y < bgEndY; y++) {
      for (let x = bgStart; x < bgEndX; x++) {
        if (!grid.get(x, y)) {
          setVoxel(x, y, 'background', backgroundColor);
        }
      }
    }

    // Render text
    let cursorX = borderWidth + padding;
    const cursorY = borderWidth + padding;

    for (let i = 0; i < characterMaps.length; i++) {
      const letterMap = characterMaps[i];
      const charWidth = letterMap[0]?.length || 0;

      // Render character
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < charWidth; col++) {
          if (letterMap[row]?.[col]) {
            const x = cursorX + col;
            const y = cursorY + row;
            if (grid.get(x, y)?.type === 'background') {
              setVoxel(x, y, 'text', color);
            }
          }
        }
      }

      cursorX += charWidth;

      // Add spacing and kerning
      if (i < characterMaps.length - 1) {
        const nextChar = text[i + 1].toUpperCase();
        const currentChar = text[i].toUpperCase();
        const kerningKey = `${currentChar}${nextChar}`;
        cursorX += spacing + (kerning[kerningKey] || 0);
      }
    }

    return grid;
  }

  /**
   * Enhanced image quantization with multiple dithering algorithms
   */
  static fromImage(image, targetWidth, options = {}) {
    const {
      colorCount = 20,
      palette = [],
      dither = true,
      threshold = 128
    } = options;

    // Get ImageData
    let imageData;
    if (image instanceof ImageData) {
      imageData = image;
    } else {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const ratio = image.height / image.width;
      const targetHeight = Math.round(targetWidth * ratio);
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
      imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    }

    const { width, height } = imageData;
    const pixels = imageData.data;
    const voxelGrid = new VoxelGrid(width, height, 1);

    // If palette is provided, use it; otherwise generate from image
    let activePalette = palette;
    if (palette.length === 0) {
      // Generate palette using median cut
      activePalette = this.#generatePalette(pixels, colorCount);
    }

    // Apply dithering if requested
    if (dither && dither !== 'none') {
      this.#applyDithering(pixels, width, height, activePalette, dither === true ? 'floyd-steinberg' : dither);
    }

    // Fill voxel grid
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const color = {
          r: pixels[idx],
          g: pixels[idx + 1],
          b: pixels[idx + 2],
          a: pixels[idx + 3]
        };

        const closestColor = this.#findClosestColor(color, activePalette);
        
        // Set voxel
        voxelGrid.set(x, y, 0, {
          filled: color.a > 128, // Consider transparent pixels as unfilled
          type: 'mosaic',
          color: closestColor,
          originalColor: color
        });
      }
    }

    return voxelGrid;
  }

  /**
   * Generate color palette using median cut algorithm
   */
  static #generatePalette(pixels, colorCount) {
    // Initial box containing all colors
    const boxes = [{
      pixels: Array.from({ length: pixels.length / 4 }, (_, i) => ({
        r: pixels[i * 4],
        g: pixels[i * 4 + 1],
        b: pixels[i * 4 + 2]
      })),
      min: { r: 0, g: 0, b: 0 },
      max: { r: 255, g: 255, b: 255 }
    }];

    while (boxes.length < colorCount) {
      // Find box with largest range
      let largestBoxIndex = 0;
      let largestRange = -1;

      boxes.forEach((box, i) => {
        const rRange = box.max.r - box.min.r;
        const gRange = box.max.g - box.min.g;
        const bRange = box.max.b - box.min.b;
        const range = Math.max(rRange, gRange, bRange);
        
        if (range > largestRange) {
          largestRange = range;
          largestBoxIndex = i;
        }
      });

      const box = boxes[largestBoxIndex];
      const rRange = box.max.r - box.min.r;
      const gRange = box.max.g - box.min.g;
      const bRange = box.max.b - box.min.b;

      // Sort by component with largest range
      const sortBy = rRange > gRange && rRange > bRange ? 'r' :
                     gRange > bRange ? 'g' : 'b';
      
      box.pixels.sort((a, b) => a[sortBy] - b[sortBy]);
      
      const median = Math.floor(box.pixels.length / 2);
      
      // Split box at median
      const box1 = { ...box, pixels: box.pixels.slice(0, median) };
      const box2 = { ...box, pixels: box.pixels.slice(median) };
      
      boxes[largestBoxIndex] = box1;
      boxes.push(box2);
    }

    // Calculate average color for each box
    return boxes.map(box => {
      const avg = box.pixels.reduce(
        (acc, color) => ({
          r: acc.r + color.r,
          g: acc.g + color.g,
          b: acc.b + color.b
        }),
        { r: 0, g: 0, b: 0 }
      );
      
      const count = box.pixels.length;
      return {
        r: Math.round(avg.r / count),
        g: Math.round(avg.g / count),
        b: Math.round(avg.b / count)
      };
    });
  }

  /**
   * Apply dithering algorithm
   */
  static #applyDithering(pixels, width, height, palette, algorithm) {
    // Convert to Float32 for error diffusion
    const buffer = new Float32Array(pixels.length);
    buffer.set(pixels);

    const getPixel = (x, y) => {
      const idx = (y * width + x) * 4;
      return [buffer[idx], buffer[idx + 1], buffer[idx + 2]];
    };

    const setPixel = (x, y, r, g, b) => {
      const idx = (y * width + x) * 4;
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
    };

    const distributeError = (x, y, errR, errG, errB, weight) => {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = (y * width + x) * 4;
        buffer[idx] += errR * weight;
        buffer[idx + 1] += errG * weight;
        buffer[idx + 2] += errB * weight;
      }
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const [oldR, oldG, oldB] = getPixel(x, y);
        const closest = this.#findClosestColor({ r: oldR, g: oldG, b: oldB }, palette);
        
        setPixel(x, y, closest.r, closest.g, closest.b);
        
        const errR = oldR - closest.r;
        const errG = oldG - closest.g;
        const errB = oldB - closest.b;

        switch (algorithm) {
          case 'floyd-steinberg':
            distributeError(x + 1, y, errR, errG, errB, 7 / 16);
            distributeError(x - 1, y + 1, errR, errG, errB, 3 / 16);
            distributeError(x, y + 1, errR, errG, errB, 5 / 16);
            distributeError(x + 1, y + 1, errR, errG, errB, 1 / 16);
            break;
          case 'jarvis':
            // Jarvis-Judice-Ninke dithering
            for (let dy = 0; dy <= 2; dy++) {
              for (let dx = -2; dx <= 2; dx++) {
                if (dx === 0 && dy === 0) continue;
                const weight = [7, 5, 3, 1][Math.abs(dx)] * [7, 5, 3, 1][dy] / 48;
                distributeError(x + dx, y + dy, errR, errG, errB, weight);
              }
            }
            break;
          case 'atkinson':
            distributeError(x + 1, y, errR, errG, errB, 1 / 8);
            distributeError(x + 2, y, errR, errG, errB, 1 / 8);
            distributeError(x - 1, y + 1, errR, errG, errB, 1 / 8);
            distributeError(x, y + 1, errR, errG, errB, 1 / 8);
            distributeError(x + 1, y + 1, errR, errG, errB, 1 / 8);
            distributeError(x, y + 2, errR, errG, errB, 1 / 8);
            break;
        }
      }
    }

    // Copy back to original array
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = Math.max(0, Math.min(255, buffer[i]));
    }
  }

  /**
   * Optimized closest color search with caching
   */
  static #findClosestColor(color, palette) {
    const cacheKey = `${color.r},${color.g},${color.b}-${palette.length}`;
    if (this.#colorCache.has(cacheKey)) {
      return this.#colorCache.get(cacheKey);
    }

    let bestColor = color;
    let minDist = Infinity;

    for (const paletteColor of palette) {
      const dr = color.r - paletteColor.r;
      const dg = color.g - paletteColor.g;
      const db = color.b - paletteColor.b;
      const dist = dr * dr + dg * dg + db * db;
      
      if (dist < minDist) {
        minDist = dist;
        bestColor = paletteColor;
      }
    }

    this.#colorCache.set(cacheKey, bestColor);
    return bestColor;
  }

  /**
   * Generate checkerboard pattern
   */
  static checkerboard(width, height, options = {}) {
    const {
      squareSize = 1,
      color1 = { r: 0, g: 0, b: 0 },
      color2 = { r: 255, g: 255, b: 255 }
    } = options;

    const grid = new VoxelGrid(width, height, 1);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isEvenSquare = Math.floor(x / squareSize) % 2 === Math.floor(y / squareSize) % 2;
        grid.set(x, y, 0, {
          filled: true,
          type: 'checker',
          color: isEvenSquare ? color1 : color2
        });
      }
    }

    return grid;
  }

  /**
   * Generate gradient
   */
  static gradient(width, height, options = {}) {
    const {
      startColor = { r: 255, g: 0, b: 0 },
      endColor = { r: 0, g: 0, b: 255 },
      direction = 'horizontal'
    } = options;

    const grid = new VoxelGrid(width, height, 1);

    const interpolate = (a, b, t) => Math.round(a + (b - a) * t);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let t;
        
        switch (direction) {
          case 'horizontal':
            t = x / (width - 1);
            break;
          case 'vertical':
            t = y / (height - 1);
            break;
          case 'diagonal':
            t = (x + y) / (width + height - 2);
            break;
          case 'radial':
            const centerX = width / 2;
            const centerY = height / 2;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            t = distance / Math.max(centerX, centerY);
            break;
        }

        const color = {
          r: interpolate(startColor.r, endColor.r, t),
          g: interpolate(startColor.g, endColor.g, t),
          b: interpolate(startColor.b, endColor.b, t)
        };

        grid.set(x, y, 0, {
          filled: true,
          type: 'gradient',
          color
        });
      }
    }

    return grid;
  }

  /**
   * Placeholder for 3D model to voxels (for future studios)
   */
  static fromModel(modelData, options = {}) {
    console.warn('Voxelizer.fromModel not implemented yet');
    return new VoxelGrid(10, 10, 10);
  }

  /**
   * Convert QR code matrix to voxel grid
   * @param {Array<Array<number>>} qrMatrix - 2D array where 1=dark, 0=light
   * @param {object} options - Options
   */
  static fromQRCode(qrMatrix, options = {}) {
    const {
      fgColor = { r: 0, g: 0, b: 0 },        // Dark modules (black)
      bgColor = { r: 255, g: 255, b: 255 }   // Light modules (white)
    } = options;

    const size = qrMatrix.length;
    const voxelGrid = new VoxelGrid(size, size, 1);

    // Convert QR matrix to voxels
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isDark = qrMatrix[y][x] === 1;
        const voxel = {
          filled: true,
          type: isDark ? 'foreground' : 'background',
          color: isDark ? fgColor : bgColor
        };
        voxelGrid.set(x, y, 0, voxel);
      }
    }

    return voxelGrid;
  }
}