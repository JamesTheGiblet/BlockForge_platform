/**
 * Color utility functions
 */

export const ColorUtils = {
  /**
   * Convert hex color to RGB object
   */
  hexToRGB(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex values
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /**
   * Convert RGB object to hex string
   */
  rgbToHex(r, g, b) {
    // Handle object input: rgbToHex({r, g, b})
    if (typeof r === 'object') {
      b = r.b;
      g = r.g;
      r = r.r;
    }
    
    const toHex = (n) => {
      const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return '#' + toHex(r) + toHex(g) + toHex(b);
  },

  /**
   * Calculate color distance (Euclidean in RGB space)
   */
  colorDistance(color1, color2) {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  },

  /**
   * Interpolate between two colors
   */
  interpolate(color1, color2, t) {
    t = Math.max(0, Math.min(1, t));
    return {
      r: Math.round(color1.r + (color2.r - color1.r) * t),
      g: Math.round(color1.g + (color2.g - color1.g) * t),
      b: Math.round(color1.b + (color2.b - color1.b) * t)
    };
  },

  /**
   * Check if two colors are equal
   */
  equals(color1, color2) {
    return color1.r === color2.r && 
           color1.g === color2.g && 
           color1.b === color2.b;
  },

  /**
   * Convert RGB to HSL
   */
  rgbToHSL(r, g, b) {
    // Handle object input
    if (typeof r === 'object') {
      b = r.b;
      g = r.g;
      r = r.r;
    }
    
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }
};