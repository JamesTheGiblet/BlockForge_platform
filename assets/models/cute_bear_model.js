function createCuteBearModel(storeVoxel) {
  // Import the cute bear data (assumes cute_bear is loaded globally)
  const model = (typeof cute_bear !== 'undefined') ? cute_bear : window.cute_bear;

  // Map palette keys to color names compatible with 3d.html
  // Remap to supported color names in 3d.html
  const paletteMap = {
    B: 'White',      // Beige -> White
    W: 'White',      // White
    P: 'Red',        // Pink -> Red
    E: 'DarkRed',    // Black -> DarkRed
    M: 'DarkRed',    // Brown -> DarkRed
    N: 'Gray'        // DarkBrown -> Gray
  };

  // For each voxel, call storeVoxel(x, y, z, colorName)
  for (let layer of model.grid) {
    const z = layer.z;
    for (let y = 0; y < layer.rows.length; y++) {
      const row = layer.rows[y];
      for (let x = 0; x < row.length; x++) {
        const key = row[x];
        if (key !== '.' && paletteMap[key]) {
          storeVoxel(x, y, z, paletteMap[key]);
        }
      }
    }
  }
}
