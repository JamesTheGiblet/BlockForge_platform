// src/shared/voxelizer.js
export class Voxelizer {
    /**
     * Converts text into a 2D grid of 1s (filled) and 0s (empty)
     * @param {string} text - The text to convert
     * @param {object} fontData - The font definition object
     * @param {object} options - { spacing: number }
     */
    static fromText(text, fontData, options = {}) {
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

    static fromImage(image, width, options = {}) {
        console.log('Stub: Voxelizing image');
        return { bricks: [] }; // Placeholder
    }

    static fromQRCode(data, options = {}) {
        console.log('Stub: Voxelizing QR code');
        return { bricks: [] }; // Placeholder
    }
}