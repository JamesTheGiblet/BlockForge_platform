import pluginLoader from './core/plugin-loader.js';

/**
 * Initialize BlockForge Platform
 */
async function init() {
  console.log('🏗️  BlockForge Platform Starting...\n');

  // Load plugin registry
  const registry = await pluginLoader.loadRegistry();

  if (registry.length === 0) {
    console.log('⚠️  No plugins found');
    document.getElementById('plugin-list').innerHTML = '<p>No plugins available</p>';
    return;
  }

  // Display available plugins
  displayPlugins(registry);

  // Auto-load first plugin for testing
  if (registry.length > 0) {
    const firstPlugin = registry[0];
    console.log(`\n🎯 Auto-loading first plugin: ${firstPlugin.name}\n`);
    
    try {
      await switchPlugin(firstPlugin.id);
      console.log('\n✅ Platform initialized successfully!');
    } catch (error) {
      console.error('\n❌ Failed to initialize plugin:', error);
    }
  }

  // Setup global export buttons
  setupExportButtons();
}

/**
 * Setup global export button listeners
 */
function setupExportButtons() {
  const handleExport = (format) => {
    const plugin = pluginLoader.getCurrentPlugin();
    if (plugin && plugin.instance && typeof plugin.instance.export === 'function') {
      plugin.instance.export(format);
    }
  };

  document.getElementById('btn-download-png')?.addEventListener('click', () => handleExport('png'));
  document.getElementById('btn-download-csv')?.addEventListener('click', () => handleExport('csv'));
  document.getElementById('btn-download-html')?.addEventListener('click', () => handleExport('html'));
}

/**
 * Switch to a specific plugin
 */
async function switchPlugin(pluginId) {
  // 1. Update UI controls visibility
  document.querySelectorAll('.plugin-controls').forEach(el => {
    el.classList.remove('active');
  });

  const activeControls = document.getElementById(`${pluginId}-controls`);
  if (activeControls) {
    activeControls.classList.add('active');
  }

  // 2. Load and initialize plugin
  await pluginLoader.loadAndInit(pluginId);
}

/**
 * Display available plugins in UI
 */
function displayPlugins(registry) {
  const pluginList = document.getElementById('plugin-list');
  pluginList.innerHTML = '';
  
  registry.forEach(plugin => {
    const button = document.createElement('button');
    button.textContent = plugin.name;
    button.style.marginRight = '10px';
    button.style.padding = '8px 16px';
    button.onclick = () => switchPlugin(plugin.id);
    pluginList.appendChild(button);
  });
}

// Start the app
init();