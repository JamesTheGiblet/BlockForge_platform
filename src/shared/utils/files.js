/**
 * File utility functions
 */

export const FileUtils = {
  /**
   * Trigger download of a blob
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  },

  /**
   * Load image from file
   */
  async loadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();
      
      reader.onload = (e) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Load text file
   */
  async loadText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  /**
   * Load JSON file
   */
  async loadJSON(file) {
    const text = await this.loadText(file);
    return JSON.parse(text);
  },

  /**
   * Placeholder for 3D model loading (for future studios)
   */
  async load3DModel(file) {
    console.warn('FileUtils.load3DModel not implemented yet');
    return null;
  }
};