/**
 * Color utility functions
 */
export const ColorUtils = {
  /**
   * Convert RGB object to hex string
   * @param {object} rgb - {r, g, b}
   * @returns {string} Hex string (e.g. "#ff0000")
   */
  rgbToHex(rgb) {
    const { r, g, b } = rgb;
    const toHex = (n) => {
      const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },

  equals(c1, c2) {
    if (!c1 || !c2) return false;
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b;
  }
};