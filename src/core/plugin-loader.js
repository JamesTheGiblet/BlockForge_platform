/**
 * BlockForge Plugin Loader
 * Loads plugins dynamically based on registry
 */

// Import all available plugins using Vite's glob import
// This ensures Vite knows about these files and can serve/bundle them correctly
const pluginModules = import.meta.glob('../../plugins/**/*.js');

class PluginLoader {
  constructor() {
    this.plugins = new Map();
    this.registry = [];
    this.currentPlugin = null;
  }

  /**
   * Load plugin registry
   */
  async loadRegistry() {
    try {
      const response = await fetch('/plugin-registry.json');
      if (!response.ok) {
        throw new Error('Failed to load plugin registry');
      }
      this.registry = await response.json();
      console.log(`📋 Loaded ${this.registry.length} plugins from registry`);
      return this.registry;
    } catch (error) {
      console.error('❌ Error loading plugin registry:', error);
      return [];
    }
  }

  /**
   * Load a specific plugin by ID
   */
  async loadPlugin(pluginId) {
    // Check if already loaded
    if (this.plugins.has(pluginId)) {
      console.log(`♻️  Plugin ${pluginId} already loaded`);
      return this.plugins.get(pluginId);
    }

    // Find plugin in registry
    const pluginInfo = this.registry.find(p => p.id === pluginId);
    if (!pluginInfo) {
      throw new Error(`Plugin ${pluginId} not found in registry`);
    }

    try {
      console.log(`⏳ Loading plugin: ${pluginInfo.name}...`);

      // Dynamically import the plugin module
      const importer = pluginModules[pluginInfo.path];
      if (!importer) {
        throw new Error(`Plugin module not found: ${pluginInfo.path}`);
      }

      const module = await importer();
      const PluginClass = module.default;

      // Instantiate the plugin
      const pluginInstance = new PluginClass();

      // Store in plugins map
      this.plugins.set(pluginId, {
        info: pluginInfo,
        instance: pluginInstance
      });

      console.log(`✅ Loaded: ${pluginInfo.name}`);
      return this.plugins.get(pluginId);

    } catch (error) {
      console.error(`❌ Error loading plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Initialize a loaded plugin
   */
  async initializePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not loaded`);
    }

    try {
      console.log(`🚀 Initializing: ${plugin.info.name}`);
      
      if (typeof plugin.instance.init === 'function') {
        await plugin.instance.init();
        this.currentPlugin = pluginId;
        console.log(`✅ Initialized: ${plugin.info.name}`);
      } else {
        console.warn(`⚠️  Plugin ${pluginId} has no init() method`);
      }

      return plugin;
    } catch (error) {
      console.error(`❌ Error initializing plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Load and initialize a plugin (convenience method)
   */
  async loadAndInit(pluginId) {
    await this.loadPlugin(pluginId);
    return await this.initializePlugin(pluginId);
  }

  /**
   * Get current active plugin
   */
  getCurrentPlugin() {
    if (!this.currentPlugin) return null;
    return this.plugins.get(this.currentPlugin);
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin registry
   */
  getRegistry() {
    return this.registry;
  }
}

// Create singleton instance
const pluginLoader = new PluginLoader();

export default pluginLoader;