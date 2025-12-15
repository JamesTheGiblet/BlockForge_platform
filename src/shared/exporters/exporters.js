import { FileUtils } from '../utils/files.js';
import { ColorUtils } from './color-palette.js';

export class Exporters {
    /**
     * Generates and downloads a CSV parts list
     * @param {Array} partsList - Array of { part, color, hex, qty }
     * @param {string} filename 
     */
    static downloadCSV(partsList, filename) {
        let csvContent = "Part Name,Color Name,Hex Code,Quantity\n";
        
        partsList.forEach(item => {
            // Escape quotes in names
            const part = item.part.replace(/"/g, '""');
            const color = item.color.replace(/"/g, '""');
            
            csvContent += `"${part}","${color}","${item.hex}",${item.qty}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        FileUtils.downloadBlob(blob, filename || FileUtils.generateFilename('parts', 'csv'));
    }

    /**
     * Downloads the current canvas as a PNG
     * @param {HTMLCanvasElement} canvas 
     * @param {string} filename 
     */
    static downloadPNG(canvas, filename) {
        if (!canvas) {
            console.error("Exporters: No canvas provided");
            return;
        }
        
        // Convert canvas to blob for better large-file handling
        canvas.toBlob((blob) => {
            FileUtils.downloadBlob(blob, filename || FileUtils.generateFilename('render', 'png'));
        });
    }

    /**
     * Generates a basic HTML build guide
     * @param {object} metadata - { title, client, partsList }
     */
    static downloadHTML(metadata, filename) {
        // Helper to create unique keys for linking parts to grid cells
        const makeKey = (part, hex) => `k${(part + hex).replace(/[^a-zA-Z0-9]/g, '')}`;

        // Calculate totals with dynamic pricing
        let totalCost = 0;
        const totalParts = metadata.partsList.reduce((acc, p) => acc + p.qty, 0);

        // Track stats by color for summary
        const colorStats = {};

        const rows = metadata.partsList.map(p => {
            const key = makeKey(p.part, p.hex);
            const unitPrice = ColorUtils.getPrice(p.hex);
            const subtotal = p.qty * unitPrice;
            totalCost += subtotal;

            // Aggregate for summary
            if (!colorStats[p.hex]) {
                colorStats[p.hex] = {
                    name: p.color,
                    hex: p.hex,
                    unitPrice: unitPrice,
                    qty: 0,
                    total: 0
                };
            }
            colorStats[p.hex].qty += p.qty;
            colorStats[p.hex].total += subtotal;

            return `<tr class="part-row" data-key="${key}">
                <td>${p.part}</td>
                <td><span class="color-swatch" style="background-color:${p.hex}"></span> ${p.color}</td>
                <td>${p.qty}</td>
                <td>$${unitPrice.toFixed(2)}</td>
                <td>$${subtotal.toFixed(2)}</td>
            </tr>`;
        }).join('');

        // Generate Summary Rows
        const summaryRows = Object.values(colorStats)
            .sort((a, b) => b.total - a.total)
            .map(c => `
                <tr>
                    <td><span class="color-swatch" style="background-color:${c.hex}"></span> ${c.name}</td>
                    <td>$${c.unitPrice.toFixed(2)}</td>
                    <td>${c.qty}</td>
                    <td>$${c.total.toFixed(2)}</td>
                </tr>`
            ).join('');

        let buildMapHtml = '';
        if (metadata.placementGrid) {
            // Generate table rows for the grid
            const gridRows = metadata.placementGrid.map((row, y) => {
                const cells = row.map((cell, x) => {
                    if (!cell) return '<td></td>';
                    const key = makeKey(cell.part, cell.hex);
                    return `<td class="grid-cell" data-key="${key}" style="background-color:${cell.hex};" title="Row ${y+1}, Col ${x+1}: ${cell.color} (${cell.part})"></td>`;
                }).join('');
                return `<tr><td class="row-header">${y+1}</td>${cells}</tr>`;
            }).join('');

            // Header row for columns
            let headerRow = '<tr><td class="corner-header"></td>';
            if (metadata.placementGrid.length > 0) {
                for(let i=1; i<=metadata.placementGrid[0].length; i++) {
                    headerRow += `<td class="col-header">${i}</td>`;
                }
            }
            headerRow += '</tr>';

            buildMapHtml = `
                <div class="page-break"></div>
                <h2>Build Map</h2>
                <p>Follow the grid below to assemble your design. Each cell represents one unit (stud).</p>
                <div class="grid-container">
                    <table class="build-grid">
                        <thead>${headerRow}</thead>
                        <tbody>${gridRows}</tbody>
                    </table>
                </div>
            `;
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${metadata.title} - Build Guide</title>
                <style>
                    body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 2rem; max-width: 1000px; margin: 0 auto; color: #333; line-height: 1.5; }
                    h1 { border-bottom: 3px solid #333; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
                    h2 { margin-top: 2rem; color: #444; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
                    
                    /* Parts List Styles */
                    table.parts-list { width: 100%; border-collapse: collapse; margin-top: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                    table.parts-list th { text-align: left; background: #f4f4f4; padding: 0.75rem; border-bottom: 2px solid #ddd; font-weight: 600; }
                    table.parts-list td { padding: 0.75rem; border-bottom: 1px solid #eee; background: #fff; }
                    .color-swatch { display: inline-block; width: 16px; height: 16px; border: 1px solid rgba(0,0,0,0.1); vertical-align: middle; margin-right: 8px; border-radius: 3px; }
                    
                    /* Interactive Highlight Styles */
                    .part-row { cursor: pointer; transition: background 0.15s; }
                    .part-row:hover { background-color: #f0f7ff; }
                    .part-row.active { background-color: #e3f2fd; border-left: 4px solid #2196F3; }
                    .grid-cell { transition: all 0.2s ease; }
                    .grid-cell.highlight { transform: scale(1.4); box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 10; position: relative; border: 1px solid rgba(255,255,255,0.8); }
                    .grid-cell.dimmed { opacity: 0.2; filter: grayscale(100%); }
                    
                    /* Build Grid Styles */
                    .grid-container { overflow-x: auto; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd; }
                    table.build-grid { border-collapse: separate; border-spacing: 1px; margin: 0 auto; }
                    table.build-grid td { width: 20px; height: 20px; border: 1px solid rgba(0,0,0,0.05); padding: 0; min-width: 20px; }
                    .col-header { text-align: center; font-size: 0.7em; color: #666; padding-bottom: 4px; border: none !important; background: transparent !important; }
                    .row-header { text-align: right; padding-right: 6px; font-size: 0.7em; color: #666; border: none !important; background: transparent !important; width: auto !important; }
                    .corner-header { border: none !important; background: transparent !important; }
                    
                    /* Floating Control Window */
                    .control-window {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        width: 200px;
                        background: white;
                        padding: 15px;
                        border-radius: 8px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                        border: 1px solid #ddd;
                        z-index: 1000;
                    }
                    .control-btn { display: block; width: 100%; padding: 8px 12px; margin-bottom: 8px; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; text-align: left; font-family: inherit; }
                    .btn-primary { background: #2196F3; color: white; }
                    .btn-primary:hover { background: #1976D2; }
                    
                    .meta-box { background: #f0f7ff; padding: 1rem; border-radius: 6px; border-left: 4px solid #2196F3; margin-bottom: 2rem; }
                    
                    @media print {
                        body { padding: 0; }
                        .page-break { page-break-before: always; }
                        .grid-container { border: none; padding: 0; }
                        .control-window { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="control-window">
                    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem; border-bottom:1px solid #eee; padding-bottom:5px;">Actions</h3>
                    <button class="control-btn btn-primary" onclick="window.print()">🖨️ Print Guide</button>
                    <div style="font-size:0.8em; color:#666; line-height:1.4;">
                        <strong>Tip:</strong> Click any part row to highlight it in the grid.
                    </div>
                </div>

                <h1>${metadata.title}</h1>
                <div class="meta-box">
                    <p style="margin:0.25rem 0;"><strong>Project:</strong> ${metadata.client || 'Untitled'}</p>
                    <p style="margin:0.25rem 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p style="margin:0.25rem 0;"><strong>Total Parts:</strong> ${totalParts}</p>
                    <p style="margin:0.25rem 0;"><strong>Est. Cost:</strong> $${totalCost.toFixed(2)}</p>
                </div>

                <h2>Parts List</h2>
                <table class="parts-list">
                    <thead><tr><th>Part Type</th><th>Color</th><th>Quantity</th><th>Unit Cost</th><th>Subtotal</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>

                <h2>Cost Breakdown</h2>
                <table class="parts-list" style="max-width:600px;">
                    <thead><tr><th>Color Palette</th><th>Price / Brick</th><th>Quantity</th><th>Subtotal</th></tr></thead>
                    <tbody>${summaryRows}</tbody>
                </table>

                ${buildMapHtml}

                <p style="margin-top: 3rem; font-size: 0.9em; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 1rem;">
                    Generated by BlockForge Platform
                </p>
                <script>
                    document.addEventListener('DOMContentLoaded', () => {
                        const rows = document.querySelectorAll('.part-row');
                        const cells = document.querySelectorAll('.grid-cell');
                        
                        rows.forEach(row => {
                            row.addEventListener('click', () => {
                                const key = row.dataset.key;
                                const isActive = row.classList.contains('active');
                                
                                // Reset all
                                rows.forEach(r => r.classList.remove('active'));
                                cells.forEach(c => {
                                    c.classList.remove('highlight', 'dimmed');
                                });
                                
                                // If it wasn't active before, activate it now
                                if (!isActive) {
                                    row.classList.add('active');
                                    cells.forEach(cell => {
                                        if (cell.dataset.key === key) cell.classList.add('highlight');
                                        else cell.classList.add('dimmed');
                                    });
                                }
                            });
                        });
                    });
                </script>
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'text/html' });
        FileUtils.downloadBlob(blob, filename || FileUtils.generateFilename('guide', 'html'));
    }
}