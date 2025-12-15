// plugin-system.js - Clean Plugin Architecture
class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.currentPlugin = null;
    this.container = document.getElementById('app-container');
    this.studioSelector = document.getElementById('studio-selector');
    this.placeholder = document.getElementById('placeholder');
    this.init();
  }

  async init() {
    // Register available plugins
    await this.registerPlugins();
    
    // Setup studio selector
    this.setupStudioSelector();
    
    // Load initial state from URL or localStorage
    this.loadInitialState();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  async registerPlugins() {
    // Plugin definitions
    const pluginDefinitions = [
      {
        id: 'sign-studio',
        name: 'Sign Studio',
        icon: '🔤',
        description: 'Create custom brick text signs',
        load: () => import('../plugins/sign-studio/sign-studio.js')
      },
      {
        id: 'mosaic-studio',
        name: 'Mosaic Studio',
        icon: '🖼️',
        description: 'Turn photos into pixel art',
        load: () => import('../plugins/mosaic-studio/mosaic-studio.js')
      },
      {
        id: 'qr-studio',
        name: 'QR Studio',
        icon: '📱',
        description: 'Generate scannable codes',
        load: () => import('../plugins/qr-studio/qr-studio.js')
      },
      {
        id: 'relief-studio',
        name: 'Relief Studio',
        icon: '🏔️',
        description: '3D topographical maps',
        load: () => import('../plugins/relief-studio/relief-studio.js')
      }
    ];

    for (const def of pluginDefinitions) {
      this.plugins.set(def.id, {
        ...def,
        instance: null,
        isLoaded: false
      });
    }
  }

  setupStudioSelector() {
    // Populate selector
    this.plugins.forEach((plugin, id) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = `${plugin.icon} ${plugin.name}`;
      this.studioSelector.appendChild(option);
    });

    // Handle selection
    this.studioSelector.addEventListener('change', async (e) => {
      const pluginId = e.target.value;
      if (pluginId) {
        await this.loadPlugin(pluginId);
        this.updateURL(pluginId);
      } else {
        this.unloadCurrentPlugin();
      }
    });
  }

  async loadPlugin(pluginId) {
    // Unload current plugin
    if (this.currentPlugin) {
      await this.unloadCurrentPlugin();
    }

    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    try {
      // Show loading state
      this.showLoadingState(plugin);

      // Load plugin module
      const module = await plugin.load();
      
      // Initialize plugin
      plugin.instance = new module.default(this.container, {
        onExport: this.handleExport.bind(this),
        onSave: this.handleSave.bind(this),
        onError: this.handleError.bind(this)
      });

      plugin.isLoaded = true;
      this.currentPlugin = plugin;

      // Hide placeholder
      this.placeholder.style.display = 'none';
      
      // Update UI state
      this.updateStudioHeader(plugin);
      
      // Analytics (optional)
      this.trackPluginLoad(pluginId);

    } catch (error) {
      console.error(`Failed to load plugin ${pluginId}:`, error);
      this.handleError(error);
      this.studioSelector.value = '';
    }
  }

  async unloadCurrentPlugin() {
    if (this.currentPlugin?.instance?.cleanup) {
      await this.currentPlugin.instance.cleanup();
    }
    
    this.currentPlugin = null;
    this.placeholder.style.display = 'block';
    
    // Clear container
    this.container.innerHTML = '';
    this.container.appendChild(this.placeholder);
    
    // Remove studio header if exists
    const header = document.querySelector('.studio-header');
    if (header) header.remove();
  }

  showLoadingState(plugin) {
    this.container.innerHTML = `
      <div class="loading-state animate-fadeIn" style="text-align: center; padding: 4rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">${plugin.icon}</div>
        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Loading ${plugin.name}...</h2>
        <p>${plugin.description}</p>
        <div style="margin-top: 2rem; width: 100px; height: 4px; background: var(--color-border); border-radius: 2px; overflow: hidden;">
          <div style="width: 60%; height: 100%; background: var(--color-primary); animation: pulse 1s infinite;"></div>
        </div>
      </div>
    `;
  }

  updateStudioHeader(plugin) {
    // Remove existing header
    const oldHeader = document.querySelector('.studio-header');
    if (oldHeader) oldHeader.remove();

    // Create new header
    const header = document.createElement('header');
    header.className = 'studio-header animate-slideIn';
    header.innerHTML = `
      <div style="max-width: var(--container-max-width); margin: 0 auto; padding: 0 2rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
          <span style="font-size: 2rem;">${plugin.icon}</span>
          <h1 style="font-size: 2.5rem; font-weight: 800; margin: 0;">${plugin.name}</h1>
        </div>
        <p style="font-size: 1.2rem; opacity: 0.9; margin: 0;">${plugin.description}</p>
      </div>
    `;

    // Insert after main header
    document.querySelector('header').after(header);
  }

  handleExport(data, type) {
    // Unified export handler
    console.log('Exporting:', type, data);
    // Implement export logic (download, clipboard, etc.)
  }

  handleSave(data) {
    // Save to localStorage with plugin ID
    const saveKey = `blockforge_${this.currentPlugin.id}_save`;
    localStorage.setItem(saveKey, JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));
  }

  handleError(error) {
    // Error handling with user feedback
    this.container.innerHTML = `
      <div class="error-state animate-fadeIn" style="text-align: center; padding: 4rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
        <h2 style="font-size: 2rem; margin-bottom: 1rem;">Something went wrong</h2>
        <p style="margin-bottom: 2rem; color: #666;">${error.message}</p>
        <button class="btn btn-primary" id="retry-load">Retry</button>
        <button class="btn btn-outline" id="go-home">Go Home</button>
      </div>
    `;

    document.getElementById('retry-load').addEventListener('click', () => {
      if (this.currentPlugin) {
        this.loadPlugin(this.currentPlugin.id);
      }
    });

    document.getElementById('go-home').addEventListener('click', () => {
      this.studioSelector.value = '';
      this.unloadCurrentPlugin();
    });
  }

  loadInitialState() {
    // Load from URL hash
    const hash = window.location.hash.slice(1);
    if (hash && this.plugins.has(hash)) {
      this.studioSelector.value = hash;
      this.loadPlugin(hash);
    }

    // Or load from localStorage
    const lastUsed = localStorage.getItem('blockforge_last_used');
    if (lastUsed && this.plugins.has(lastUsed) && !hash) {
      this.studioSelector.value = lastUsed;
      // Optional: Auto-load last used
      // this.loadPlugin(lastUsed);
    }
  }

  updateURL(pluginId) {
    window.location.hash = pluginId;
    localStorage.setItem('blockforge_last_used', pluginId);
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Escape to go home
      if (e.key === 'Escape' && this.currentPlugin) {
        this.studioSelector.value = '';
        this.unloadCurrentPlugin();
      }
      
      // Cmd/Ctrl + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (this.currentPlugin?.instance?.save) {
          this.currentPlugin.instance.save();
        }
      }
    });
  }

  trackPluginLoad(pluginId) {
    // Analytics integration
    if (typeof gtag !== 'undefined') {
      gtag('event', 'plugin_load', {
        plugin_id: pluginId,
        platform: 'web'
      });
    }
  }
}

// Initialize plugin system
window.pluginSystem = new PluginSystem();