// scripts/scan-plugins.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLUGINS_DIR = path.join(__dirname, '../plugins');
const OUTPUT_FILE = path.join(__dirname, '../public/plugin-registry.json');

console.log('🔍 Scanning for plugins...');

// Ensure public directory exists
const publicDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Get all directories in plugins/
let plugins = [];

if (fs.existsSync(PLUGINS_DIR)) {
    const items = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
    
    for (const item of items) {
        if (item.isDirectory()) {
            const manifestPath = path.join(PLUGINS_DIR, item.name, 'manifest.json');
            
            if (fs.existsSync(manifestPath)) {
                try {
                    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
                    const manifest = JSON.parse(manifestContent);
                    
                    // Validate required fields
                    if (!manifest.id || !manifest.entry || !manifest.name) {
                        console.warn(`⚠️  Skipping ${item.name}: Missing required fields in manifest.json`);
                        continue;
                    }

                    // Add to registry
                    plugins.push({
                        id: manifest.id,
                        name: manifest.name,
                        path: `/plugins/${item.name}/${manifest.entry}`, // Web-accessible path
                        manifest: manifest
                    });
                    
                    console.log(`✅ Found plugin: ${manifest.name} (${manifest.id})`);
                } catch (err) {
                    console.error(`❌ Error parsing manifest for ${item.name}:`, err.message);
                }
            }
        }
    }
}

// Write the registry file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(plugins, null, 2));
console.log(`\n🎉 Scan complete. ${plugins.length} plugins registered.`);
console.log(`📄 Registry written to: ${OUTPUT_FILE}`);