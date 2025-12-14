import { ColorUtils } from './utils/color.js';

export class Voxelizer {
    /**
     * ENGINE 1: Text to Grid
     * Converts string input into a 2D grid of 1s and 0s
     */
    static fromText(text, fontData, options = {}) {
        const spacing = options.spacing || 1;
        const rows = 5; // Standard height for the 5x5 font
        
        // 1. Initialize empty rows
        let grid = [];
        for(let i = 0; i < rows; i++) grid[i] = [];

        // 2. Build the grid letter by letter
        for (let char of text) {
            // Find letter or fallback to space
            let letterMap = fontData[char] || fontData[' '];
            if (!letterMap) letterMap = fontData[' '];

            // Append letter columns to grid rows
            for(let r = 0; r < rows; r++) {
                // Add the letter's pixels for this row
                grid[r] = grid[r].concat(letterMap[r] || []);
                // Add spacing pixels
                for(let s = 0; s < spacing; s++) grid[r].push(0);
            }
        }

        // 3. Remove trailing spacing
        for(let r = 0; r < rows; r++) {
            if (grid[r].length > 0) {
                grid[r].splice(-spacing);
            }
        }

        return {
            grid: grid,
            width: grid[0] ? grid[0].length : 0,
            height: rows
        };
    }

    /**
     * ENGINE 2: Image to Grid
     * Converts an image into a grid of LEGO palette colors
     */
    static fromImage(image, targetWidth, palette) {
        // 1. Calculate Aspect Ratio
        const aspectRatio = image.height / image.width;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        // 2. Draw to tiny canvas to downsample
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw image resized
        ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
        
        // 3. Read Pixel Data
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
        let grid = [];

        for (let y = 0; y < targetHeight; y++) {
            let row = [];
            for (let x = 0; x < targetWidth; x++) {
                const i = (y * targetWidth + x) * 4;
                const r = imgData[i];
                const g = imgData[i+1];
                const b = imgData[i+2];
                // Alpha ignored for now

                // 4. Find Nearest Color in Palette
                const nearest = this.findNearestColor(r, g, b, palette);
                row.push(nearest);
            }
            grid.push(row);
        }

        return {
            grid: grid,
            width: targetWidth,
            height: targetHeight
        };
    }

    /**
     * Helper: Find nearest color using Euclidean distance
     */
    static findNearestColor(r, g, b, palette) {
        let minDistance = Infinity;
        let nearest = palette[0];

        for (const color of palette) {
            const target = ColorUtils.hexToRGB(color.hex);
            
            const dist = Math.sqrt(
                Math.pow(r - target.r, 2) +
                Math.pow(g - target.g, 2) +
                Math.pow(b - target.b, 2)
            );

            if (dist < minDistance) {
                minDistance = dist;
                nearest = color;
            }
        }
        return nearest;
    }
}