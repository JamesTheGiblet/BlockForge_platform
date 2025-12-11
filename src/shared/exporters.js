/**
 * Export functions for various file formats
 */

export const Exporters = {
  /**
   * Export brick layout to CSV parts list
   */
  toCSV(brickLayout, options = {}) {
    const { includeColors = true } = options;
    
    let csv = 'Type,Quantity';
    if (includeColors) {
      csv += ',Color (RGB)\n';
    } else {
      csv += '\n';
    }
    
    // Get brick counts
    const counts = brickLayout.getBrickCounts();
    
    // Group by type and color if needed
    const entries = [];
    if (includeColors) {
      const coloredCounts = {};
      brickLayout.bricks.forEach(brick => {
        const key = `${brick.type}|${brick.color.r},${brick.color.g},${brick.color.b}`;
        coloredCounts[key] = (coloredCounts[key] || 0) + 1;
      });
      
      Object.entries(coloredCounts).forEach(([key, count]) => {
        const [type, color] = key.split('|');
        entries.push({ type, count, color });
      });
    } else {
      Object.entries(counts).forEach(([type, count]) => {
        entries.push({ type, count });
      });
    }
    
    // Sort by count (descending)
    entries.sort((a, b) => b.count - a.count);
    
    // Build CSV
    entries.forEach(entry => {
      csv += `${entry.type},${entry.count}`;
      if (includeColors && entry.color) {
        csv += `,${entry.color}`;
      }
      csv += '\n';
    });
    
    return csv;
  },

  /**
   * Export to HTML instructions (placeholder for now)
   */
  toHTML(brickLayout, options = {}) {
    const {
      title = 'LEGO Build Instructions',
      includePartsList = true,
      stepByStep = false,
      interactive = false
    } = options;
    
    const bounds = brickLayout.getBounds();
    const width = bounds.max.x - bounds.min.x + 1;
    const height = bounds.max.y - bounds.min.y + 1;
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
      background: #f8f9fa;
    }
    h1 { color: #333; margin-bottom: 1rem; }
    .info {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }
    .stat {
      text-align: center;
      padding: 1rem;
      background: #f0f0f0;
      border-radius: 6px;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #FF5722;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #666;
      margin-top: 0.25rem;
    }
    .parts-list {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .parts-list h2 {
      margin-bottom: 1rem;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }
    @media print {
      body { background: white; }
      .info, .parts-list { box-shadow: none; border: 1px solid #ddd; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  
  <div class="info">
    <h2>Build Information</h2>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${brickLayout.getTotalBricks()}</div>
        <div class="stat-label">Total Bricks</div>
      </div>
      <div class="stat">
        <div class="stat-value">${width}×${height}</div>
        <div class="stat-label">Dimensions (studs)</div>
      </div>
      <div class="stat">
        <div class="stat-value">${Object.keys(brickLayout.getBrickCounts()).length}</div>
        <div class="stat-label">Brick Types</div>
      </div>
    </div>
  </div>`;

    if (includePartsList) {
      html += `
  <div class="parts-list">
    <h2>Parts List</h2>
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Quantity</th>
        </tr>
      </thead>
      <tbody>`;
      
      const counts = brickLayout.getBrickCounts();
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
          html += `
        <tr>
          <td>${type}</td>
          <td>${count}</td>
        </tr>`;
        });
      
      html += `
      </tbody>
    </table>
  </div>`;
    }

    html += `
</body>
</html>`;
    
    return html;
  },

  /**
   * Placeholder for PDF export (for future)
   */
  async toPDF(brickLayout, options = {}) {
    console.warn('Exporters.toPDF not implemented yet');
    return null;
  },

  /**
   * Placeholder for STL export (for future)
   */
  toSTL(brickLayout, options = {}) {
    console.warn('Exporters.toSTL not implemented yet');
    return null;
  },

  /**
   * Placeholder for LDraw export (for future)
   */
  toLDraw(brickLayout, options = {}) {
    console.warn('Exporters.toLDraw not implemented yet');
    return null;
  }
};