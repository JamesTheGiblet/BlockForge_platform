const fs = require('fs');
const path = require('path');

/**
 * Scan /plugins directory and generate plugin registry
 */
function scanPlugins() {
  const pluginsDir = path.join(__dirname, '../plugins');
  const registry = [];

  // Check if plugins directory exists
  if (!fs.existsSync(pluginsDir)) {
    console.log('⚠️  No /plugins directory found. Creating it...');
    fs.mkdirSync(pluginsDir, { recursive: true });
    console.log('✅ Created /plugins directory');
    return registry;
  }

  // Read all directories in /plugins
  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  const pluginDirs = entries.filter(entry => entry.isDirectory());

  console.log(`\n🔍 Scanning ${pluginDirs.length} plugin directories...\n`);

  pluginDirs.forEach(dir => {
    const pluginPath = path.join(pluginsDir, dir.name);
    const manifestPath = path.join(pluginPath, 'manifest.json');

    // Check if manifest.json exists
    if (!fs.existsSync(manifestPath)) {
      console.log(`⚠️  ${dir.name}: No manifest.json found, skipping`);
      return;
    }

    try {
      // Read and parse manifest
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      // Validate required fields
      if (!manifest.id || !manifest.name || !manifest.entry) {
        console.log(`❌ ${dir.name}: Invalid manifest (missing id, name, or entry)`);
        return;
      }

      // Normalize entry path (remove leading ./)
      const entry = manifest.entry.startsWith('./') ? manifest.entry.slice(2) : manifest.entry;

      // Add to registry
    registry.push({
        id: manifest.id,
        name: manifest.name,
        version: manifest.version || '1.0.0',
        description: manifest.description || '',
        entry: entry,
        path: `../../plugins/${dir.name}/${entry}`
      });

      console.log(`✅ ${manifest.name} (${manifest.id}) - v${manifest.version || '1.0.0'}`);

    } catch (error) {
      console.log(`❌ ${dir.name}: Error reading manifest - ${error.message}`);
    }
  });

  return registry;
}

/**
 * Write plugin registry to file
 */
function writeRegistry(registry) {
  const outputPath = path.join(__dirname, '../public/plugin-registry.json');
  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));
  console.log(`\n📝 Plugin registry written to: public/plugin-registry.json`);
  console.log(`📊 Total plugins registered: ${registry.length}\n`);
}

// Run scanner
console.log('🚀 BlockForge Plugin Scanner\n');
const registry = scanPlugins();
writeRegistry(registry);