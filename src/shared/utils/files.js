export const FileUtils = {
    /**
     * Loads an image file and returns an HTMLImageElement
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Triggers a browser download for a Blob
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Generates a filename with a timestamp
     * e.g., "blockforge-mosaic-20231025.png"
     */
    generateFilename(prefix, extension) {
        const date = new Date().toISOString().slice(0, 10);
        return `blockforge-${prefix}-${date}.${extension}`;
    }
};