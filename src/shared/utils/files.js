// src/shared/utils/files.js
export const FileUtils = {
    loadImage(file) {
        return new Promise((resolve) => {
            console.log('Stub: Loading image');
            resolve(new Image());
        });
    },

    downloadBlob(blob, filename) {
        console.log(`Stub: Downloading ${filename}`);
    }
};