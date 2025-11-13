#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * Cache Manager
 * Intelligent cache management with invalidation and performance tracking
 */

const CACHE_DIR = path.join(process.cwd(), ".modules/cache");
const REGISTRY_PATH = path.join(process.cwd(), ".modules/registry.json");
const SEARCH_INDEX_PATH = path.join(CACHE_DIR, "search-index.json");
const CACHE_META_PATH = path.join(CACHE_DIR, "cache-meta.json");

// Performance thresholds (milliseconds)
const PERF_THRESHOLDS = {
  indexBuild: 10000, // 10 seconds
  search: 100, // 100ms
  discovery: 10000, // 10 seconds
};

// =====================================================
// CACHE MANAGER CLASS
// =====================================================

class CacheManager {
  constructor() {
    this.ensureCacheDir();
    this.meta = this.loadMeta();
  }

  ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      console.log("✓ Created cache directory");
    }
  }

  // =====================================================
  // CACHE METADATA
  // =====================================================

  loadMeta() {
    if (!fs.existsSync(CACHE_META_PATH)) {
      return this.createDefaultMeta();
    }

    try {
      return JSON.parse(fs.readFileSync(CACHE_META_PATH, "utf8"));
    } catch (error) {
      console.warn("⚠️  Could not load cache metadata, creating new");
      return this.createDefaultMeta();
    }
  }

  saveMeta() {
    fs.writeFileSync(CACHE_META_PATH, JSON.stringify(this.meta, null, 2));
  }

  createDefaultMeta() {
    return {
      version: "1.0.0",
      lastUpdate: null,
      registryHash: null,
      performance: {
        lastIndexBuild: null,
        lastSearch: null,
        avgSearchTime: null,
      },
      stats: {
        totalIndexBuilds: 0,
        totalSearches: 0,
        cacheHits: 0,
        cacheMisses: 0,
      },
    };
  }

  // =====================================================
  // CACHE VALIDATION
  // =====================================================

  isValid() {
    // Check if search index exists
    if (!fs.existsSync(SEARCH_INDEX_PATH)) {
      console.log("❌ Cache invalid: search index not found");
      return false;
    }

    // Check if registry has changed
    if (!fs.existsSync(REGISTRY_PATH)) {
      console.log("❌ Cache invalid: registry not found");
      return false;
    }

    const currentHash = this.getRegistryHash();
    if (currentHash !== this.meta.registryHash) {
      console.log("❌ Cache invalid: registry has been modified");
      return false;
    }

    console.log("✓ Cache is valid");
    return true;
  }

  needsRebuild() {
    if (!this.isValid()) return true;

    // Check if cache is older than 24 hours
    if (this.meta.lastUpdate) {
      const ageInHours =
        (Date.now() - new Date(this.meta.lastUpdate)) / (1000 * 60 * 60);
      if (ageInHours > 24) {
        console.log("⚠️  Cache is older than 24 hours, consider rebuilding");
        return true;
      }
    }

    return false;
  }

  getRegistryHash() {
    if (!fs.existsSync(REGISTRY_PATH)) return null;

    const content = fs.readFileSync(REGISTRY_PATH, "utf8");
    return crypto.createHash("md5").update(content).digest("hex");
  }

  // =====================================================
  // CACHE OPERATIONS
  // =====================================================

  async rebuild() {
    console.log("\n🔄 Rebuilding cache...\n");

    const startTime = Date.now();

    try {
      // Run discover.js to rebuild index
      const { execSync } = require("child_process");
      execSync("node scripts/modules/discover.js index", {
        stdio: "inherit",
        cwd: process.cwd(),
      });

      const buildTime = Date.now() - startTime;

      // Update metadata
      this.meta.lastUpdate = new Date().toISOString();
      this.meta.registryHash = this.getRegistryHash();
      this.meta.performance.lastIndexBuild = buildTime;
      this.meta.stats.totalIndexBuilds++;

      // Check performance
      if (buildTime > PERF_THRESHOLDS.indexBuild) {
        console.log(
          `\n⚠️  WARNING: Index build took ${buildTime}ms (threshold: ${PERF_THRESHOLDS.indexBuild}ms)`,
        );
        console.log(
          "   Consider optimizing or breaking into smaller modules\n",
        );
      } else {
        console.log(`\n✓ Index built in ${buildTime}ms\n`);
      }

      this.saveMeta();

      return {
        success: true,
        buildTime,
        withinThreshold: buildTime <= PERF_THRESHOLDS.indexBuild,
      };
    } catch (error) {
      console.error("❌ Cache rebuild failed:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  invalidate() {
    console.log("\n🗑️  Invalidating cache...\n");

    // Remove search index
    if (fs.existsSync(SEARCH_INDEX_PATH)) {
      fs.unlinkSync(SEARCH_INDEX_PATH);
      console.log("✓ Removed search index");
    }

    // Reset metadata
    this.meta.lastUpdate = null;
    this.meta.registryHash = null;
    this.saveMeta();

    console.log("✓ Cache invalidated\n");
  }

  // =====================================================
  // PERFORMANCE TRACKING
  // =====================================================

  trackSearch(duration) {
    this.meta.stats.totalSearches++;

    // Update average search time
    if (this.meta.performance.avgSearchTime === null) {
      this.meta.performance.avgSearchTime = duration;
    } else {
      // Rolling average
      this.meta.performance.avgSearchTime = (
        this.meta.performance.avgSearchTime * 0.9 +
        duration * 0.1
      ).toFixed(2);
    }

    this.meta.performance.lastSearch = duration;

    // Check if within threshold
    if (duration > PERF_THRESHOLDS.search) {
      console.warn(
        `⚠️  Slow search: ${duration}ms (threshold: ${PERF_THRESHOLDS.search}ms)`,
      );
    }

    this.saveMeta();
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  getStats() {
    const cacheSize = this.getCacheSize();

    return {
      valid: this.isValid(),
      size: cacheSize,
      age: this.getCacheAge(),
      performance: {
        ...this.meta.performance,
        thresholds: PERF_THRESHOLDS,
        indexWithinThreshold:
          this.meta.performance.lastIndexBuild <= PERF_THRESHOLDS.indexBuild,
        searchWithinThreshold:
          this.meta.performance.avgSearchTime <= PERF_THRESHOLDS.search,
      },
      stats: this.meta.stats,
    };
  }

  getCacheSize() {
    let size = 0;

    if (fs.existsSync(SEARCH_INDEX_PATH)) {
      size += fs.statSync(SEARCH_INDEX_PATH).size;
    }

    if (fs.existsSync(CACHE_META_PATH)) {
      size += fs.statSync(CACHE_META_PATH).size;
    }

    // Convert to KB
    return `${(size / 1024).toFixed(2)} KB`;
  }

  getCacheAge() {
    if (!this.meta.lastUpdate) return "Never built";

    const ageMs = Date.now() - new Date(this.meta.lastUpdate);
    const ageMinutes = Math.floor(ageMs / (1000 * 60));
    const ageHours = Math.floor(ageMinutes / 60);
    const ageDays = Math.floor(ageHours / 24);

    if (ageDays > 0) return `${ageDays} day(s)`;
    if (ageHours > 0) return `${ageHours} hour(s)`;
    if (ageMinutes > 0) return `${ageMinutes} minute(s)`;
    return "Just now";
  }

  printReport() {
    const stats = this.getStats();

    console.log("\n" + "=".repeat(60));
    console.log("📊 CACHE PERFORMANCE REPORT");
    console.log("=".repeat(60));

    console.log("\n📈 Status:");
    console.log(`   Valid: ${stats.valid ? "✅ Yes" : "❌ No"}`);
    console.log(`   Size:  ${stats.size}`);
    console.log(`   Age:   ${stats.age}`);

    console.log("\n⚡ Performance:");
    console.log(
      `   Last index build: ${stats.performance.lastIndexBuild || "N/A"}ms`,
    );
    console.log(
      `   Threshold:        ${stats.performance.thresholds.indexBuild}ms ${stats.performance.indexWithinThreshold ? "✅" : "❌"}`,
    );
    console.log(
      `   Avg search time:  ${stats.performance.avgSearchTime || "N/A"}ms`,
    );
    console.log(
      `   Search threshold: ${stats.performance.thresholds.search}ms ${stats.performance.searchWithinThreshold ? "✅" : "❌"}`,
    );

    console.log("\n📊 Statistics:");
    console.log(`   Total index builds: ${stats.stats.totalIndexBuilds}`);
    console.log(`   Total searches:     ${stats.stats.totalSearches}`);
    console.log(`   Cache hits:         ${stats.stats.cacheHits}`);
    console.log(`   Cache misses:       ${stats.stats.cacheMisses}`);

    console.log("\n💡 Recommendations:");

    if (!stats.valid) {
      console.log("   • Rebuild cache: npm run modules:index");
    }

    if (
      !stats.performance.indexWithinThreshold &&
      stats.performance.lastIndexBuild
    ) {
      console.log(
        "   • Index build is slow, consider optimizing module structure",
      );
    }

    if (
      !stats.performance.searchWithinThreshold &&
      stats.performance.avgSearchTime
    ) {
      console.log("   • Search performance degraded, rebuild cache");
    }

    if (stats.age.includes("day")) {
      console.log("   • Cache is old, consider rebuilding");
    }

    console.log("\n" + "=".repeat(60) + "\n");
  }

  // =====================================================
  // AUTO-MAINTENANCE
  // =====================================================

  autoMaintain() {
    console.log("\n🔧 Running auto-maintenance...\n");

    // Check if cache needs rebuild
    if (this.needsRebuild()) {
      console.log("✓ Cache needs rebuild, triggering...");
      return this.rebuild();
    }

    console.log("✓ Cache is healthy, no action needed\n");
    return { success: true, action: "none" };
  }

  // =====================================================
  // WARMUP (Pre-build for fast startup)
  // =====================================================

  async warmup() {
    console.log("\n🔥 Warming up cache...\n");

    if (!this.isValid()) {
      console.log("Cache invalid, rebuilding...");
      await this.rebuild();
    }

    // Load search index into memory
    if (fs.existsSync(SEARCH_INDEX_PATH)) {
      const index = JSON.parse(fs.readFileSync(SEARCH_INDEX_PATH, "utf8"));
      console.log(
        `✓ Loaded ${Object.keys(index.modules || {}).length} modules into memory`,
      );
      console.log(`✓ Loaded ${(index.components || []).length} components`);
      console.log(`✓ Loaded ${(index.hooks || []).length} hooks`);
      console.log(`✓ Loaded ${(index.services || []).length} services`);
    }

    console.log("\n✓ Cache warmed up and ready!\n");
  }
}

// =====================================================
// CLI INTERFACE
// =====================================================

function showHelp() {
  console.log(`
🗄️  Cache Manager - Intelligent cache management

Usage: node cache-manager.js <command>

Commands:
  status       Show cache status and statistics
  validate     Check if cache is valid
  rebuild      Force rebuild cache
  invalidate   Clear cache
  maintain     Run auto-maintenance
  warmup       Warmup cache for fast startup
  report       Show detailed performance report

Examples:
  node cache-manager.js status
  node cache-manager.js rebuild
  node cache-manager.js report
  `);
}

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
  showHelp();
  process.exit(0);
}

async function main() {
  const manager = new CacheManager();

  switch (command) {
    case "status":
      const stats = manager.getStats();
      console.log("\n📊 Cache Status:");
      console.log(JSON.stringify(stats, null, 2));
      console.log();
      break;

    case "validate":
      const valid = manager.isValid();
      console.log(`\nCache is ${valid ? "VALID ✅" : "INVALID ❌"}\n`);
      process.exit(valid ? 0 : 1);
      break;

    case "rebuild":
      const result = await manager.rebuild();
      process.exit(result.success ? 0 : 1);
      break;

    case "invalidate":
      manager.invalidate();
      break;

    case "maintain":
      await manager.autoMaintain();
      break;

    case "warmup":
      await manager.warmup();
      break;

    case "report":
      manager.printReport();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);
});
