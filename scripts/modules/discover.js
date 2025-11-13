#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Module Discovery System
 * Fast discovery for AI agents to find reusable components
 */

const REGISTRY_PATH = path.join(process.cwd(), ".modules/registry.json");
const CACHE_PATH = path.join(process.cwd(), ".modules/cache/search-index.json");

// =====================================================
// MODULE DISCOVERY CLASS
// =====================================================

class ModuleDiscovery {
  constructor() {
    this.registry = this.loadRegistry();
    this.searchIndex = this.loadSearchIndex();
  }

  loadRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) {
      throw new Error("Registry not found");
    }
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  }

  loadSearchIndex() {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
    }
    return null;
  }

  saveSearchIndex(index) {
    const cacheDir = path.dirname(CACHE_PATH);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(index, null, 2));
  }

  // =====================================================
  // FIND BY CATEGORY
  // =====================================================

  findByCategory(category) {
    if (!["ui", "logic", "data", "integration"].includes(category)) {
      return { error: "Invalid category", modules: [] };
    }

    const modules = this.registry.categories[category] || [];

    return {
      category,
      count: modules.length,
      modules: modules.map((m) => ({
        id: m.id,
        name: m.name,
        version: m.version,
        description: m.description,
        keywords: m.keywords,
        path: m.path,
        reusableCount: m.reusableCount,
      })),
    };
  }

  // =====================================================
  // FIND BY KEYWORDS
  // =====================================================

  findByKeywords(keywords) {
    if (!Array.isArray(keywords)) {
      keywords = [keywords];
    }

    const results = [];
    const seen = new Set();

    Object.values(this.registry.categories).forEach((modules) => {
      modules.forEach((module) => {
        if (seen.has(module.id)) return;

        const moduleKeywords = module.keywords.map((k) => k.toLowerCase());
        const matches = keywords.filter((k) =>
          moduleKeywords.includes(k.toLowerCase()),
        );

        if (matches.length > 0) {
          seen.add(module.id);
          results.push({
            ...module,
            matchedKeywords: matches,
            relevance: matches.length / keywords.length,
          });
        }
      });
    });

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return {
      query: keywords,
      count: results.length,
      modules: results,
    };
  }

  // =====================================================
  // FIND REUSABLE COMPONENTS
  // =====================================================

  findReusableComponents() {
    const components = [];

    Object.values(this.registry.categories).forEach((modules) => {
      modules.forEach((module) => {
        const modulePath = path.join(process.cwd(), module.path);
        const manifestPath = path.join(modulePath, "module.json");

        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

          if (manifest.exports?.components) {
            manifest.exports.components.forEach((comp) => {
              components.push({
                name: comp.name,
                module: module.id,
                moduleName: module.name,
                category: module.category,
                path: comp.path,
                props: comp.props,
                description: comp.description,
                example: comp.example,
              });
            });
          }
        }
      });
    });

    return {
      count: components.length,
      components,
    };
  }

  // =====================================================
  // FIND REUSABLE HOOKS
  // =====================================================

  findReusableHooks() {
    const hooks = [];

    Object.values(this.registry.categories).forEach((modules) => {
      modules.forEach((module) => {
        const modulePath = path.join(process.cwd(), module.path);
        const manifestPath = path.join(modulePath, "module.json");

        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

          if (manifest.exports?.hooks) {
            manifest.exports.hooks.forEach((hook) => {
              hooks.push({
                name: hook.name,
                module: module.id,
                moduleName: module.name,
                category: module.category,
                path: hook.path,
                description: hook.description,
                example: hook.example,
              });
            });
          }
        }
      });
    });

    return {
      count: hooks.length,
      hooks,
    };
  }

  // =====================================================
  // FIND SERVICES
  // =====================================================

  findServices() {
    const services = [];

    Object.values(this.registry.categories).forEach((modules) => {
      modules.forEach((module) => {
        const modulePath = path.join(process.cwd(), module.path);
        const manifestPath = path.join(modulePath, "module.json");

        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

          if (manifest.exports?.services) {
            manifest.exports.services.forEach((service) => {
              services.push({
                name: service.name,
                module: module.id,
                moduleName: module.name,
                category: module.category,
                path: service.path,
                description: service.description,
                example: service.example,
              });
            });
          }
        }
      });
    });

    return {
      count: services.length,
      services,
    };
  }

  // =====================================================
  // GET USAGE EXAMPLES
  // =====================================================

  getUsageExamples(moduleId) {
    let module = null;

    for (const modules of Object.values(this.registry.categories)) {
      const found = modules.find((m) => m.id === moduleId);
      if (found) {
        module = found;
        break;
      }
    }

    if (!module) {
      return { error: "Module not found", examples: [] };
    }

    const modulePath = path.join(process.cwd(), module.path);
    const manifestPath = path.join(modulePath, "module.json");

    if (!fs.existsSync(manifestPath)) {
      return { error: "Manifest not found", examples: [] };
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    const examples = {
      module: module.id,
      moduleName: module.name,
      category: module.category,
      imports: manifest.ai?.examples || [],
      useCases: manifest.ai?.use_cases || [],
      exports: {},
    };

    // Collect examples from exports
    Object.entries(manifest.exports || {}).forEach(([type, items]) => {
      if (Array.isArray(items)) {
        examples.exports[type] = items.map((item) => ({
          name: item.name,
          example: item.example || `// No example available for ${item.name}`,
        }));
      }
    });

    return examples;
  }

  // =====================================================
  // BUILD SEARCH INDEX
  // =====================================================

  buildSearchIndex() {
    console.log("\n🔨 Building search index...\n");

    const index = {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      modules: {},
      components: [],
      hooks: [],
      services: [],
      keywords: {},
    };

    let totalItems = 0;

    // Index all modules
    Object.values(this.registry.categories).forEach((modules) => {
      modules.forEach((module) => {
        const modulePath = path.join(process.cwd(), module.path);
        const manifestPath = path.join(modulePath, "module.json");

        if (!fs.existsSync(manifestPath)) {
          console.log(`  ⚠️  Skipping ${module.id}: manifest not found`);
          return;
        }

        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

          // Index module
          index.modules[module.id] = {
            ...module,
            ai: manifest.ai,
            exports: manifest.exports,
          };

          // Index components
          if (manifest.exports?.components) {
            manifest.exports.components.forEach((comp) => {
              index.components.push({
                name: comp.name,
                moduleId: module.id,
                category: module.category,
                description: comp.description,
              });
              totalItems++;
            });
          }

          // Index hooks
          if (manifest.exports?.hooks) {
            manifest.exports.hooks.forEach((hook) => {
              index.hooks.push({
                name: hook.name,
                moduleId: module.id,
                category: module.category,
                description: hook.description,
              });
              totalItems++;
            });
          }

          // Index services
          if (manifest.exports?.services) {
            manifest.exports.services.forEach((service) => {
              index.services.push({
                name: service.name,
                moduleId: module.id,
                category: module.category,
                description: service.description,
              });
              totalItems++;
            });
          }

          // Index keywords
          module.keywords.forEach((keyword) => {
            if (!index.keywords[keyword]) {
              index.keywords[keyword] = [];
            }
            index.keywords[keyword].push(module.id);
          });

          console.log(`  ✓ Indexed: ${module.name}`);
        } catch (error) {
          console.log(`  ❌ Error indexing ${module.id}: ${error.message}`);
        }
      });
    });

    this.saveSearchIndex(index);

    console.log(`\n✅ Search index built!`);
    console.log(`   Modules: ${Object.keys(index.modules).length}`);
    console.log(`   Components: ${index.components.length}`);
    console.log(`   Hooks: ${index.hooks.length}`);
    console.log(`   Services: ${index.services.length}`);
    console.log(`   Keywords: ${Object.keys(index.keywords).length}`);
    console.log(`   Total items: ${totalItems}`);
    console.log(`\n   Saved to: ${CACHE_PATH}\n`);

    return index;
  }

  // =====================================================
  // SEARCH IN INDEX (FAST)
  // =====================================================

  searchFast(query) {
    if (!this.searchIndex) {
      console.log("⚠️  Search index not built. Building now...");
      this.searchIndex = this.buildSearchIndex();
    }

    const queryLower = query.toLowerCase();
    const results = {
      modules: [],
      components: [],
      hooks: [],
      services: [],
    };

    // Search components
    this.searchIndex.components.forEach((comp) => {
      const searchText = `${comp.name} ${comp.description || ""}`.toLowerCase();
      if (searchText.includes(queryLower)) {
        results.components.push(comp);
      }
    });

    // Search hooks
    this.searchIndex.hooks.forEach((hook) => {
      const searchText = `${hook.name} ${hook.description || ""}`.toLowerCase();
      if (searchText.includes(queryLower)) {
        results.hooks.push(hook);
      }
    });

    // Search services
    this.searchIndex.services.forEach((service) => {
      const searchText =
        `${service.name} ${service.description || ""}`.toLowerCase();
      if (searchText.includes(queryLower)) {
        results.services.push(service);
      }
    });

    // Search modules by keyword
    Object.entries(this.searchIndex.keywords).forEach(
      ([keyword, moduleIds]) => {
        if (keyword.toLowerCase().includes(queryLower)) {
          moduleIds.forEach((id) => {
            if (
              this.searchIndex.modules[id] &&
              !results.modules.find((m) => m.id === id)
            ) {
              results.modules.push(this.searchIndex.modules[id]);
            }
          });
        }
      },
    );

    return results;
  }
}

// =====================================================
// CLI INTERFACE
// =====================================================

function showHelp() {
  console.log(`
🔍 Module Discovery - AI-friendly module search

Usage: node discover.js <command> [options]

Commands:
  components [query]          Find all reusable components
  hooks [query]               Find all reusable hooks
  services [query]            Find all services
  category <category>         Find modules by category
  keywords <keyword...>       Find modules by keywords
  examples <module-id>        Get usage examples for module
  search <query>              Fast search across all items
  index                       Build search index (cache)

Examples:
  node discover.js components
  node discover.js components list
  node discover.js hooks form
  node discover.js services user
  node discover.js category ui
  node discover.js keywords user crud
  node discover.js examples user-profile-ui
  node discover.js search authentication
  node discover.js index
  `);
}

function formatResults(data, type = "json") {
  if (type === "compact") {
    // Compact format for AI consumption
    return JSON.stringify(data);
  } else {
    // Pretty format for humans
    return JSON.stringify(data, null, 2);
  }
}

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
  showHelp();
  process.exit(0);
}

try {
  const discovery = new ModuleDiscovery();
  let result;

  switch (command) {
    case "components":
      result = discovery.findReusableComponents();
      if (args[1]) {
        // Filter by query
        const query = args[1].toLowerCase();
        result.components = result.components.filter((c) =>
          `${c.name} ${c.description || ""}`.toLowerCase().includes(query),
        );
        result.count = result.components.length;
      }
      console.log(formatResults(result));
      break;

    case "hooks":
      result = discovery.findReusableHooks();
      if (args[1]) {
        const query = args[1].toLowerCase();
        result.hooks = result.hooks.filter((h) =>
          `${h.name} ${h.description || ""}`.toLowerCase().includes(query),
        );
        result.count = result.hooks.length;
      }
      console.log(formatResults(result));
      break;

    case "services":
      result = discovery.findServices();
      if (args[1]) {
        const query = args[1].toLowerCase();
        result.services = result.services.filter((s) =>
          `${s.name} ${s.description || ""}`.toLowerCase().includes(query),
        );
        result.count = result.services.length;
      }
      console.log(formatResults(result));
      break;

    case "category":
      if (!args[1]) {
        console.error("Category is required");
        process.exit(1);
      }
      result = discovery.findByCategory(args[1]);
      console.log(formatResults(result));
      break;

    case "keywords":
      if (args.length < 2) {
        console.error("At least one keyword is required");
        process.exit(1);
      }
      result = discovery.findByKeywords(args.slice(1));
      console.log(formatResults(result));
      break;

    case "examples":
      if (!args[1]) {
        console.error("Module ID is required");
        process.exit(1);
      }
      result = discovery.getUsageExamples(args[1]);
      console.log(formatResults(result));
      break;

    case "search":
      if (!args[1]) {
        console.error("Search query is required");
        process.exit(1);
      }
      result = discovery.searchFast(args[1]);
      console.log(formatResults(result));
      break;

    case "index":
      discovery.buildSearchIndex();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
} catch (error) {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);
}
