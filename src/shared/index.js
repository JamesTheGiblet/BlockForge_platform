/**
 * BlockForge Shared Library
 * Barrel export for all shared modules
 */

// Voxelizer
export { Voxelizer, VoxelGrid } from './voxelizer.js';

// Brick Optimizer
export { BrickOptimizer, BrickLayout, Brick } from './brick-optimizer.js';

// Exporters
export { Exporters } from './exporters.js';

// Utils
export { ColorUtils } from './utils/color.js';
export { FileUtils } from './utils/files.js';
export * as LegoColors from './utils/lego-colors.js';