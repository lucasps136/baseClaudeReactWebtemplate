#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Modules CLI
 * Complete command-line interface for module management
 */

const REGISTRY_PATH = path.join(process.cwd(), ".modules/registry.json");
const SCHEMA_PATH = path.join(process.cwd(), ".modules/schema.ts");

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error("❌ Registry not found. Run setup first.");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

function loadManifest(modulePath) {
  const manifestPath = path.join(modulePath, "module.json");
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

// =====================================================
// COMMAND: LIST
// =====================================================

function listModules(options = {}) {
  const registry = loadRegistry();
  const { category } = options;

  console.log("\n📦 Installed Modules\n");

  const categories = category ? [category] : Object.keys(registry.categories);

  categories.forEach((cat) => {
    const modules = registry.categories[cat];
    if (modules.length === 0) return;

    console.log(
      `\n${getCategoryIcon(cat)} ${cat.toUpperCase()} (${modules.length})`,
    );
    console.log("─".repeat(50));

    modules.forEach((module) => {
      const statusIcon = getStatusIcon(module.status);
      console.log(`  ${statusIcon} ${module.name} (${module.id})`);
      console.log(`     v${module.version} • ${module.description}`);
      console.log(`     📍 ${module.path}`);
      console.log();
    });
  });

  console.log(`\n📊 Total: ${registry.stats.total_modules} modules`);
  console.log(
    `   UI: ${registry.stats.ui} | Logic: ${registry.stats.logic} | Data: ${registry.stats.data} | Integration: ${registry.stats.integration}\n`,
  );
}

// =====================================================
// COMMAND: SEARCH
// =====================================================

function searchModules(keyword) {
  if (!keyword) {
    console.error("❌ Keyword is required");
    process.exit(1);
  }

  const registry = loadRegistry();
  const results = [];

  Object.values(registry.categories).forEach((modules) => {
    modules.forEach((module) => {
      const searchText =
        `${module.name} ${module.id} ${module.description} ${module.keywords.join(" ")}`.toLowerCase();

      if (searchText.includes(keyword.toLowerCase())) {
        results.push(module);
      }
    });
  });

  console.log(`\n🔍 Search results for "${keyword}"\n`);

  if (results.length === 0) {
    console.log("  No modules found.");
  } else {
    results.forEach((module) => {
      const statusIcon = getStatusIcon(module.status);
      console.log(`  ${statusIcon} ${module.name} (${module.id})`);
      console.log(
        `     ${getCategoryIcon(module.category)} ${module.category} • v${module.version}`,
      );
      console.log(`     ${module.description}`);
      console.log(`     Keywords: ${module.keywords.join(", ")}`);
      console.log();
    });
    console.log(`  Found ${results.length} module(s)\n`);
  }
}

// =====================================================
// COMMAND: INFO
// =====================================================

function showModuleInfo(moduleId) {
  if (!moduleId) {
    console.error("❌ Module ID is required");
    process.exit(1);
  }

  const registry = loadRegistry();
  let moduleEntry = null;
  let modulePath = null;

  // Find module in registry
  for (const modules of Object.values(registry.categories)) {
    const found = modules.find((m) => m.id === moduleId);
    if (found) {
      moduleEntry = found;
      modulePath = path.join(process.cwd(), found.path);
      break;
    }
  }

  if (!moduleEntry) {
    console.error(`❌ Module "${moduleId}" not found`);
    process.exit(1);
  }

  // Load full manifest
  const manifest = loadManifest(modulePath);

  console.log(`\n📦 ${moduleEntry.name}\n`);
  console.log("─".repeat(50));
  console.log(`ID:           ${moduleEntry.id}`);
  console.log(`Version:      ${moduleEntry.version}`);
  console.log(
    `Category:     ${getCategoryIcon(moduleEntry.category)} ${moduleEntry.category}`,
  );
  console.log(
    `Status:       ${getStatusIcon(moduleEntry.status)} ${moduleEntry.status}`,
  );
  console.log(`Path:         ${moduleEntry.path}`);
  console.log(`Description:  ${moduleEntry.description}`);
  console.log(`Keywords:     ${moduleEntry.keywords.join(", ")}`);
  console.log(`Reusable:     ${moduleEntry.reusableCount} items`);
  console.log(
    `Updated:      ${new Date(moduleEntry.updatedAt).toLocaleDateString()}`,
  );

  if (manifest) {
    console.log(`\n📤 Exports:`);
    Object.entries(manifest.exports || {}).forEach(([type, items]) => {
      if (Array.isArray(items) && items.length > 0) {
        console.log(`  ${type}:`);
        items.forEach((item) => {
          console.log(`    • ${item.name}`);
        });
      }
    });

    console.log(`\n🔗 Dependencies:`);
    if (manifest.dependencies.modules.length > 0) {
      console.log(`  Modules: ${manifest.dependencies.modules.join(", ")}`);
    }
    if (manifest.dependencies.packages.length > 0) {
      console.log(`  Packages: ${manifest.dependencies.packages.join(", ")}`);
    }

    if (manifest.ai.use_cases && manifest.ai.use_cases.length > 0) {
      console.log(`\n💡 Use Cases:`);
      manifest.ai.use_cases.forEach((useCase) => {
        console.log(`  • ${useCase}`);
      });
    }

    if (manifest.ai.examples && manifest.ai.examples.length > 0) {
      console.log(`\n📝 Examples:`);
      manifest.ai.examples.forEach((example) => {
        console.log(`  ${example}`);
      });
    }
  }

  console.log();
}

// =====================================================
// COMMAND: VALIDATE
// =====================================================

function validateModules() {
  const registry = loadRegistry();
  let totalModules = 0;
  let validModules = 0;
  let errors = [];

  console.log("\n🔍 Validating modules...\n");

  Object.entries(registry.categories).forEach(([category, modules]) => {
    modules.forEach((module) => {
      totalModules++;
      const modulePath = path.join(process.cwd(), module.path);
      const manifestPath = path.join(modulePath, "module.json");

      // Check if module directory exists
      if (!fs.existsSync(modulePath)) {
        errors.push(`${module.id}: Directory not found at ${module.path}`);
        return;
      }

      // Check if manifest exists
      if (!fs.existsSync(manifestPath)) {
        errors.push(`${module.id}: module.json not found`);
        return;
      }

      // Validate manifest JSON
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

        // Basic validations
        if (!manifest.id) errors.push(`${module.id}: Missing id in manifest`);
        if (!manifest.name)
          errors.push(`${module.id}: Missing name in manifest`);
        if (!manifest.version)
          errors.push(`${module.id}: Missing version in manifest`);
        if (!manifest.category)
          errors.push(`${module.id}: Missing category in manifest`);
        if (!manifest.ai || !manifest.ai.summary)
          errors.push(`${module.id}: Missing ai.summary`);
        if (!manifest.ai || !manifest.ai.keywords)
          errors.push(`${module.id}: Missing ai.keywords`);

        if (errors.length === 0) {
          validModules++;
        }
      } catch (error) {
        errors.push(`${module.id}: Invalid JSON in manifest`);
      }
    });
  });

  console.log(`📊 Validation Results:\n`);
  console.log(`  Total modules: ${totalModules}`);
  console.log(`  Valid: ${validModules}`);
  console.log(`  Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log(`\n❌ Errors found:\n`);
    errors.forEach((error) => {
      console.log(`  • ${error}`);
    });
    console.log();
    process.exit(1);
  } else {
    console.log(`\n✅ All modules are valid!\n`);
  }
}

// =====================================================
// COMMAND: REMOVE
// =====================================================

function removeModule(moduleId, options = {}) {
  if (!moduleId) {
    console.error("❌ Module ID is required");
    process.exit(1);
  }

  const registry = loadRegistry();
  let found = false;
  let modulePath = null;

  // Find and remove from registry
  Object.entries(registry.categories).forEach(([category, modules]) => {
    const index = modules.findIndex((m) => m.id === moduleId);
    if (index !== -1) {
      found = true;
      modulePath = path.join(process.cwd(), modules[index].path);
      modules.splice(index, 1);
      registry.stats[category] = modules.length;
      registry.stats.total_modules--;
    }
  });

  if (!found) {
    console.error(`❌ Module "${moduleId}" not found in registry`);
    process.exit(1);
  }

  // Save updated registry
  registry.updated = new Date().toISOString();
  saveRegistry(registry);

  console.log(`\n✅ Module "${moduleId}" removed from registry`);

  // Delete files if --force flag
  if (options.force && fs.existsSync(modulePath)) {
    fs.rmSync(modulePath, { recursive: true, force: true });
    console.log(`🗑️  Files deleted from ${modulePath}`);
  } else if (fs.existsSync(modulePath)) {
    console.log(`\n⚠️  Files still exist at ${modulePath}`);
    console.log(`   Use --force to delete files\n`);
  }
}

// =====================================================
// COMMAND: SYNC
// =====================================================

function syncRegistry() {
  console.log("\n🔄 Synchronizing registry...\n");

  const registry = loadRegistry();
  const modulesDir = path.join(process.cwd(), "modules");
  const categories = ["ui", "logic", "data", "integration"];

  // Clear current registry
  categories.forEach((cat) => {
    registry.categories[cat] = [];
  });

  let synced = 0;

  // Scan all module directories
  categories.forEach((category) => {
    const categoryPath = path.join(modulesDir, category);

    if (!fs.existsSync(categoryPath)) {
      console.log(`  ⚠️  Category directory not found: ${category}`);
      return;
    }

    const moduleDirs = fs.readdirSync(categoryPath).filter((dir) => {
      const fullPath = path.join(categoryPath, dir);
      return fs.statSync(fullPath).isDirectory();
    });

    moduleDirs.forEach((moduleDir) => {
      const modulePath = path.join(categoryPath, moduleDir);
      const manifestPath = path.join(modulePath, "module.json");

      if (!fs.existsSync(manifestPath)) {
        console.log(`  ⚠️  Skipping ${moduleDir}: no module.json`);
        return;
      }

      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

        const entry = {
          id: manifest.id,
          name: manifest.name,
          version: manifest.version,
          category: manifest.category,
          path: path.relative(process.cwd(), modulePath).replace(/\\/g, "/"),
          description: manifest.description,
          keywords: manifest.ai?.keywords || [],
          status: manifest.status,
          updatedAt: manifest.updatedAt,
          reusableCount: Object.values(manifest.ai?.reusable || {}).reduce(
            (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
            0,
          ),
        };

        registry.categories[category].push(entry);
        synced++;
        console.log(`  ✓ Synced: ${entry.name} (${entry.id})`);
      } catch (error) {
        console.log(`  ❌ Error syncing ${moduleDir}: ${error.message}`);
      }
    });
  });

  // Update stats
  registry.stats.total_modules = synced;
  categories.forEach((cat) => {
    registry.stats[cat] = registry.categories[cat].length;
  });
  registry.updated = new Date().toISOString();
  registry.stats.last_sync = registry.updated;

  saveRegistry(registry);

  console.log(`\n✅ Registry synchronized! Total modules: ${synced}\n`);
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getCategoryIcon(category) {
  const icons = {
    ui: "🎨",
    logic: "⚙️",
    data: "💾",
    integration: "🔌",
  };
  return icons[category] || "📦";
}

function getStatusIcon(status) {
  const icons = {
    experimental: "🧪",
    stable: "✅",
    deprecated: "⚠️",
  };
  return icons[status] || "❓";
}

// =====================================================
// MAIN CLI
// =====================================================

function showHelp() {
  console.log(`
📦 Modules CLI - Module Management Tool

Usage: node cli.js <command> [options]

Commands:
  list [--category <cat>]     List all modules
  search <keyword>            Search modules by keyword
  info <module-id>            Show detailed module information
  validate                    Validate all module manifests
  remove <module-id> [--force] Remove module from registry
  sync                        Scan and synchronize registry

Examples:
  node cli.js list
  node cli.js list --category ui
  node cli.js search user
  node cli.js info user-profile-ui
  node cli.js validate
  node cli.js remove test-module --force
  node cli.js sync
  `);
}

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
  showHelp();
  process.exit(0);
}

switch (command) {
  case "list":
    const categoryIndex = args.indexOf("--category");
    const category = categoryIndex !== -1 ? args[categoryIndex + 1] : null;
    listModules({ category });
    break;

  case "search":
    searchModules(args[1]);
    break;

  case "info":
    showModuleInfo(args[1]);
    break;

  case "validate":
    validateModules();
    break;

  case "remove":
    const force = args.includes("--force");
    removeModule(args[1], { force });
    break;

  case "sync":
    syncRegistry();
    break;

  default:
    console.error(`❌ Unknown command: ${command}`);
    console.log('Run "node cli.js --help" for usage information');
    process.exit(1);
}
