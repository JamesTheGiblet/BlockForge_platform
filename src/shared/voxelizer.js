// src/shared/voxelizer.js
import { ColorUtils } from './utils/color.js';

export class Voxelizer {
    /**
     * Converts text into a 2D grid of 1s (filled) and 0s (empty)
     * @param {string} text - The text to convert
     * @param {object} fontData - The font definition object
     * @param {object} options - { spacing: number }
     */
    static fromText(text, fontData, options = {}) {
        console.log('Stub: Voxelizing text:', text);
        return { bricks: [] }; // Placeholder
        const spacing = options.spacing || 1;
        const rows = 5; // Standard height for this 5x5 font
        
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
                // Remove 'spacing' amount of items from the end
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
     * Converts an image into a grid of LEGO colors
     * @param {HTMLImageElement} image - The source image
     * @param {number} targetWidth - Desired width in studs
     * @param {Array} palette - Array of {hex, name} objects
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
                // Alpha ignored for now (assuming opaque)

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

    static findNearestColor(r, g, b, palette) {
        let minDistance = Infinity;
        let nearest = palette[0];

        for (const color of palette) {
            // Helper needed: Hex to RGB (we'll assume ColorUtils handles this, or do it inline)
            // For MVP, let's use a simple distance check
            const target = ColorUtils.hexToRGB(color.hex);
            
            // Euclidean distance
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

    static fromQRCode(data, options = {}) {
        console.log('Stub: Voxelizing QR code');
        return { bricks: [] }; // Placeholder
    }
}