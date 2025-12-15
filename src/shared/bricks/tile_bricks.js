// Utility to filter only tile bricks from LEGO_BRICK_TYPES
import { LEGO_BRICK_TYPES } from './lego_bricks.js';

// Allow both tile and plate bricks for QR mosaics
export const TILE_BRICKS = LEGO_BRICK_TYPES.filter(b => b.isTile === true || b.isPlate === true);
