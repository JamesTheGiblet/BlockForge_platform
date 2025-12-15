// src/shared/studio-stats.js
// Shared StudioStats component for BlockForge studios
// Usage: StudioStats.render({ statsPanel, stats })

export class StudioStats {
    /**
     * Renders a visually rich stats panel into the given element.
     * @param {Object} opts
     * @param {HTMLElement} opts.statsPanel - The DOM element to render stats into
     * @param {Object} opts.stats - Stats object: { dimensions, totalBricks, breakdown: [{ label, color, count }] }
     */
    static render({ statsPanel, stats }) {
        if (!statsPanel || !stats) return;
        const { dimensions, totalBricks, breakdown } = stats;
        statsPanel.innerHTML = `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; background: white; color: #333; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <h3 style="margin-top: 0; color: #333; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">📊</span>
                    <span>Design Stats</span>
                </h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 0.9rem; opacity: 0.9;">Dimensions</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${dimensions}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 0.9rem; opacity: 0.9;">Total Bricks</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${totalBricks}</div>
                    </div>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h4 style="margin: 0 0 10px 0; color: #555;">Brick Breakdown</h4>
                    ${breakdown.map(b => `
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <div style="width: 12px; height: 12px; background: ${b.color}; border-radius: 3px; margin-right: 10px;"></div>
                            <span style="flex: 1; color: #333;">${b.label}</span>
                            <span style="font-weight: 600; background: #e3f2fd; color: #1565C0; padding: 3px 10px; border-radius: 20px;">${b.count}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="font-size: 0.8rem; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
                    Updates in real-time as you design
                </div>
            </div>
        `;
        // Animate stats update
        statsPanel.style.animation = 'slideIn 0.5s ease-out';
        setTimeout(() => {
            statsPanel.style.animation = '';
        }, 500);
    }
}
