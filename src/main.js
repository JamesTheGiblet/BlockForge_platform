import { pluginLoader } from './core/plugin-loader.js';

async function initApp() {
    console.log('🚀 BlockForge Platform Initializing...');
    
    const container = document.getElementById('app-container');
    // Save the landing page HTML so we can restore it later
    const landingPageHTML = container.innerHTML;

    // 1. Load Registry
    const plugins = await pluginLoader.loadRegistry();
    
    // 2. Populate Dropdown
    const selector = document.getElementById('studio-selector');

    // Clear existing options (except placeholder) to prevent duplicates
    while (selector.options.length > 1) {
        selector.remove(1);
    }

    plugins.forEach(plugin => {
        const option = document.createElement('option');
        option.value = plugin.id;
        option.textContent = plugin.name;
        selector.appendChild(option);
    });

    // 3. Handle Selection
    selector.addEventListener('change', async (e) => {
        const pluginId = e.target.value;
        
        // If "Select a Studio..." is chosen (value=""), go back home
        if (!pluginId) {
            container.innerHTML = landingPageHTML;
            // Re-initialize landing page scripts (global functions from index.html)
            if (window.setupStudioCards) window.setupStudioCards();
            if (window.setupCTAButton) window.setupCTAButton();
            return;
        }

        container.innerHTML = '<p>Loading UI...</p>';

        try {
            const pluginData = plugins.find(p => p.id === pluginId);
            if (!pluginData) throw new Error("Plugin data not found");

            // Build UI
            renderPluginUI(container, pluginData.manifest);

            // Wire up the "Back to Home" button
            const backBtn = document.getElementById('back-to-home');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    selector.value = ""; // Reset dropdown
                    selector.dispatchEvent(new Event('change')); // Trigger change handler
                });
            }

            // Load Logic
            await pluginLoader.loadPlugin(pluginId);
            console.log(`✅ Active: ${pluginId}`);
            
        } catch (err) {
            console.error(err);
            container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
        }
    });
}

// 🛠️ The UI Generator (UPGRADED V2)
function renderPluginUI(container, manifest) {
    const ui = manifest.ui;
    
    // Generate Toolbar (Left side)
    let toolsHtml = ui.tools.map(tool => {
        // Text Input
        if (tool.type === 'text') {
            return `
                <div class="tool-group" style="margin-bottom: 1rem;">
                    <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">${tool.label}</label>
                    <input type="text" id="${tool.id}" value="${tool.default || ''}" placeholder="${tool.placeholder || ''}" style="width:100%; padding:0.5rem;">
                </div>`;
        }
        // Color Picker
        if (tool.type === 'color') {
            return `
                <div class="tool-group" style="margin-bottom: 1rem;">
                    <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">${tool.label}</label>
                    <input type="color" id="${tool.id}" value="${tool.default || '#000000'}" style="width:100%; height:40px;">
                </div>`;
        }
        // Dropdown
        if (tool.type === 'select') {
            const options = tool.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
            return `
                <div class="tool-group" style="margin-bottom: 1rem;">
                    <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">${tool.label}</label>
                    <select id="${tool.id}" style="width:100%; padding:0.5rem;">${options}</select>
                </div>`;
        }
        
        // 🆕 NEW: File Upload (This was missing!)
        if (tool.type === 'file') {
            return `
                <div class="tool-group" style="margin-bottom: 1rem; padding: 1rem; border: 2px dashed #ccc; border-radius: 4px; text-align: center;">
                    <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">${tool.label}</label>
                    <input type="file" id="${tool.id}" accept="${tool.accept || '*/*'}" style="width:100%;">
                </div>`;
        }

        // 🆕 NEW: Range Slider (This was missing!)
        if (tool.type === 'range') {
            return `
                <div class="tool-group" style="margin-bottom: 1rem;">
                    <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">
                        ${tool.label}: <span id="${tool.id}-val">${tool.default}</span>
                    </label>
                    <input type="range" id="${tool.id}" 
                           min="${tool.min || 0}" max="${tool.max || 100}" value="${tool.default || 50}" 
                           oninput="document.getElementById('${tool.id}-val').textContent = this.value"
                           style="width:100%;">
                </div>`;
        }

        // 🆕 NEW: Checkbox
        if (tool.type === 'checkbox') {
            return `
                <div class="tool-group" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; padding: 0.5rem; background: #fff; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="checkbox" id="${tool.id}" ${tool.default ? 'checked' : ''} style="width: 20px; height: 20px;">
                    <label style="margin:0; font-weight:bold;">${tool.label}</label>
                </div>`;
        }

        // 🆕 NEW: Date Picker
        if (tool.type === 'date') {
            return `
                <div class="tool-group" style="margin-bottom: 1rem;">
                    <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">${tool.label}</label>
                    <input type="date" id="${tool.id}" value="${tool.default || ''}" style="width:100%; padding:0.5rem;">
                </div>`;
        }
        
        return ''; 
    }).join('');

    // Generate Panels (Right side)
    let panelsHtml = ui.panels.map(panel => {
        if (panel.type === 'canvas') {
            return `
                <div class="panel" style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem;">
                    <h3 style="margin-top:0;">${panel.title}</h3>
                    <div style="overflow: auto; max-height: 600px;">
                        <canvas id="${panel.id}"></canvas>
                    </div>
                </div>`;
        }
        if (panel.type === 'html') {
            return `
                <div class="panel" style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="margin-top:0;">${panel.title}</h3>
                    <div id="${panel.id}">Waiting for data...</div>
                </div>`;
        }
    }).join('');

    // Inject HTML
    container.innerHTML = `
        <div style="display: flex; gap: 2rem; align-items: flex-start;">
            <div id="studio-sidebar" style="width: 300px; background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border: 1px solid #ddd;">
                <button id="back-to-home" style="width:100%; margin-bottom:1.5rem; padding:0.8rem; cursor:pointer; background:#fff; border:1px solid #ddd; border-radius:4px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:0.5rem; transition:background 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <span style="font-size:1.2em;">←</span> Back to Home
                </button>
                <hr style="border:0; border-top:1px solid #eee; margin-bottom:1.5rem;">
                ${toolsHtml}
            </div>
            <div style="flex: 1;">
                ${panelsHtml}
            </div>
        </div>
    `;
}

initApp();