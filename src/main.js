import { pluginLoader } from './core/plugin-loader.js';

async function initApp() {
    console.log('🚀 BlockForge Platform Initializing...');
    
    // 1. Load Registry
    const plugins = await pluginLoader.loadRegistry();
    
    // 2. Populate Dropdown
    const selector = document.getElementById('studio-selector');
    plugins.forEach(plugin => {
        const option = document.createElement('option');
        option.value = plugin.id;
        option.textContent = plugin.name;
        selector.appendChild(option);
    });

    // 3. Handle Selection
    selector.addEventListener('change', async (e) => {
        const pluginId = e.target.value;
        if (!pluginId) return;

        const container = document.getElementById('app-container');
        container.innerHTML = '<p>Loading UI...</p>';

        try {
            // A. Find the Manifest
            const pluginData = plugins.find(p => p.id === pluginId);
            if (!pluginData) throw new Error("Plugin data not found");

            // B. Build the UI Shell (The "Forge" Interface)
            renderPluginUI(container, pluginData.manifest);

            // C. Load and Start the Plugin Logic
            await pluginLoader.loadPlugin(pluginId);
            console.log(`✅ Active: ${pluginId}`);
            
        } catch (err) {
            console.error(err);
            container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
        }
    });
}

// 🛠️ The UI Generator
function renderPluginUI(container, manifest) {
    const ui = manifest.ui;
    
    // Generate Toolbar (Left side)
    let toolsHtml = ui.tools.map(tool => {
        // Text Input
        if (tool.type === 'text') {
            return `
                <div class="tool-group">
                    <label>${tool.label}</label>
                    <input type="text" id="${tool.id}" value="${tool.default || ''}" placeholder="${tool.placeholder || ''}">
                </div>`;
        }
        // Color Picker
        if (tool.type === 'color') {
            return `
                <div class="tool-group">
                    <label>${tool.label}</label>
                    <input type="color" id="${tool.id}" value="${tool.default || '#000000'}">
                </div>`;
        }
        // Dropdown
        if (tool.type === 'select') {
            const options = tool.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
            return `
                <div class="tool-group">
                    <label>${tool.label}</label>
                    <select id="${tool.id}">${options}</select>
                </div>`;
        }
        return ''; // Unknown tool
    }).join('');

    // Generate Panels (Right side)
    let panelsHtml = ui.panels.map(panel => {
        if (panel.type === 'canvas') {
            return `
                <div class="panel">
                    <h3>${panel.title}</h3>
                    <canvas id="${panel.id}" width="400" height="300"></canvas>
                </div>`;
        }
        if (panel.type === 'html') {
            return `
                <div class="panel">
                    <h3>${panel.title}</h3>
                    <div id="${panel.id}">Waiting for data...</div>
                </div>`;
        }
    }).join('');

    // Inject HTML
    container.innerHTML = `
        <div style="display: flex; gap: 2rem;">
            <div style="width: 250px; background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                ${toolsHtml}
            </div>
            <div style="flex: 1;">
                ${panelsHtml}
            </div>
        </div>
    `;
}

initApp();