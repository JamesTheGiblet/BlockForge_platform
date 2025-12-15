export class Exporters {
    /**
     * Download a Canvas as PNG
     * @param {HTMLCanvasElement} canvas 
     * @param {string} filename 
     * @param {number} quality (0.0 to 1.0)
     */
    static downloadPNG(canvas, filename = 'image.png', quality = 1.0) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png', quality);
        link.click();
    }

    /**
     * Download data as CSV
     * @param {Array<Object>} data Array of objects
     * @param {string} filename 
     */
    static downloadCSV(data, filename = 'data.csv') {
        if (!data || !data.length) {
            console.warn('Exporters.downloadCSV: No data to export');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => {
                let val = row[fieldName];
                if (val === null || val === undefined) return '';
                val = String(val);
                // Escape quotes and wrap in quotes if contains comma or quote
                if (val.includes(',') || val.includes('"')) {
                    val = `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this._triggerDownload(blob, filename);
    }

    /**
     * Download data as JSON
     * @param {Object|Array} data 
     * @param {string} filename 
     */
    static downloadJSON(data, filename = 'data.json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        this._triggerDownload(blob, filename);
    }

    /**
     * Download string content (HTML, XML, SVG, TXT)
     * @param {string} content 
     * @param {string} filename 
     * @param {string} mimeType 
     */
    static downloadString(content, filename = 'text.txt', mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        this._triggerDownload(blob, filename);
    }

    /**
     * Download SVG content
     * @param {string} svgContent 
     * @param {string} filename 
     */
    static downloadSVG(svgContent, filename = 'image.svg') {
        this.downloadString(svgContent, filename, 'image/svg+xml');
    }

    /**
     * Specialized HTML Build Guide Exporter
     * @param {Object} metadata { title, client, partsList, placementGrid }
     * @param {string} filename 
     */
    static downloadHTML(metadata, filename = 'guide.html') {
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${metadata.title || 'Build Guide'}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 2rem; color: #333; }
        h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: 600; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .color-swatch { display: inline-block; width: 16px; height: 16px; border: 1px solid rgba(0,0,0,0.1); vertical-align: middle; margin-right: 8px; border-radius: 3px; }
        .grid-container { overflow-x: auto; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center; }
        .grid-row { display: flex; justify-content: center; }
        .grid-cell { width: 20px; height: 20px; border: 1px solid rgba(0,0,0,0.05); box-sizing: border-box; }
        .footer { margin-top: 40px; font-size: 0.8em; color: #888; text-align: center; }
    </style>
</head>
<body>
    <h1>${metadata.title || 'Build Guide'}</h1>
    <p><strong>Project:</strong> ${metadata.client || 'Custom Build'}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    
    <h2>📦 Parts List</h2>
    <table>
        <thead><tr><th>Part</th><th>Color</th><th>Hex</th><th>Quantity</th></tr></thead>
        <tbody>
            ${metadata.partsList.map(p => `
                <tr>
                    <td>${p.part}</td>
                    <td><span class="color-swatch" style="background-color:${p.hex}"></span>${p.color}</td>
                    <td><code>${p.hex}</code></td>
                    <td><strong>${p.qty}</strong></td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <h2>🧩 Placement Guide</h2>
    <div class="grid-container">
        ${metadata.placementGrid.map(row => `
            <div class="grid-row">
                ${row.map(cell => `
                    <div class="grid-cell" style="background-color:${cell.hex}" title="${cell.part} (${cell.color})"></div>
                `).join('')}
            </div>
        `).join('')}
    </div>

    <div class="footer">
        Generated by BlockForge Studio
    </div>
</body>
</html>`;
        
        this.downloadString(html, filename, 'text/html');
    }

    /**
     * Internal helper to trigger download
     */
    static _triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    }
}