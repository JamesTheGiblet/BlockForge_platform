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
      await pluginLoader.loadAndInit(firstPlugin.id);
      console.log('\n✅ Platform initialized successfully!');
    } catch (error) {
      console.error('\n❌ Failed to initialize plugin:', error);
    }
  }
}

/**
 * Display available plugins in UI
 */
function displayPlugins(registry) {
  const pluginList = document.getElementById('plugin-list');
  
  const html = `
    <h2>Available Plugins (${registry.length})</h2>
    <ul>
      ${registry.map(plugin => `
        <li>
          <strong>${plugin.name}</strong> 
          <em>(${plugin.id})</em> 
          - v${plugin.version}
          <br>
          <small>${plugin.description}</small>
        </li>
      `).join('')}
    </ul>
  `;
  
  pluginList.innerHTML = html;
}

// Start the app
init();