#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Module Metrics and Analytics
 * System health monitoring and quality insights
 */

const REGISTRY_PATH = path.join(process.cwd(), ".modules/registry.json");
const MODULES_PATH = path.join(process.cwd(), "modules");

// =====================================================
// METRICS CLASS
// =====================================================

class ModuleMetrics {
  constructor() {
    this.registry = this.loadRegistry();
    this.modules = this.loadAllModules();
  }

  loadRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) {
      throw new Error("Registry not found. Run: npm run modules:sync");
    }
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  }

  loadAllModules() {
    const modules = [];

    Object.entries(this.registry.categories).forEach(
      ([category, categoryModules]) => {
        categoryModules.forEach((module) => {
          const modulePath = path.join(process.cwd(), module.path);
          const manifestPath = path.join(modulePath, "module.json");

          if (fs.existsSync(manifestPath)) {
            try {
              const manifest = JSON.parse(
                fs.readFileSync(manifestPath, "utf8"),
              );
              modules.push({
                ...module,
                manifest,
                fullPath: modulePath,
              });
            } catch (error) {
              console.warn(
                `⚠️  Could not load manifest for ${module.id}: ${error.message}`,
              );
            }
          }
        });
      },
    );

    return modules;
  }

  // =====================================================
  // SYSTEM OVERVIEW
  // =====================================================

  getOverview() {
    const overview = {
      totalModules: this.modules.length,
      categories: {
        ui: 0,
        logic: 0,
        data: 0,
        integration: 0,
      },
      exports: {
        components: 0,
        hooks: 0,
        services: 0,
        stores: 0,
        types: 0,
        schemas: 0,
      },
      health: {
        withDocs: 0,
        withTests: 0,
        withExamples: 0,
        withAIMetadata: 0,
      },
      versions: {
        stable: 0,
        beta: 0,
        alpha: 0,
        deprecated: 0,
      },
      dependencies: {
        internal: 0,
        external: 0,
      },
    };

    this.modules.forEach((module) => {
      // Count by category
      overview.categories[module.category]++;

      // Count exports
      if (module.manifest.exports) {
        Object.entries(module.manifest.exports).forEach(([type, items]) => {
          if (Array.isArray(items)) {
            if (overview.exports[type] !== undefined) {
              overview.exports[type] += items.length;
            }
          }
        });
      }

      // Check health indicators
      const docsPath = path.join(module.fullPath, "docs", "README.md");
      if (fs.existsSync(docsPath)) overview.health.withDocs++;

      const testsPath = path.join(module.fullPath, "tests");
      if (fs.existsSync(testsPath) && fs.readdirSync(testsPath).length > 0) {
        overview.health.withTests++;
      }

      if (
        module.manifest.ai &&
        module.manifest.ai.examples &&
        module.manifest.ai.examples.length > 0
      ) {
        overview.health.withExamples++;
      }

      if (module.manifest.ai && module.manifest.ai.summary) {
        overview.health.withAIMetadata++;
      }

      // Count versions
      const status = module.manifest.status || "stable";
      overview.versions[status]++;

      // Count dependencies
      if (module.manifest.dependencies) {
        if (module.manifest.dependencies.modules) {
          overview.dependencies.internal +=
            module.manifest.dependencies.modules.length;
        }
        if (module.manifest.dependencies.packages) {
          overview.dependencies.external +=
            module.manifest.dependencies.packages.length;
        }
      }
    });

    return overview;
  }

  // =====================================================
  // CATEGORY METRICS
  // =====================================================

  getByCategory(category) {
    const categoryModules = this.modules.filter((m) => m.category === category);

    if (categoryModules.length === 0) {
      return {
        category,
        count: 0,
        modules: [],
        metrics: null,
      };
    }

    const metrics = {
      category,
      count: categoryModules.length,
      exports: {},
      avgExportsPerModule: 0,
      docsPercentage: 0,
      testsPercentage: 0,
      aiMetadataPercentage: 0,
      modules: categoryModules.map((m) => ({
        id: m.id,
        name: m.name,
        version: m.version,
        status: m.manifest.status || "stable",
        exportsCount: this.countExports(m.manifest),
        hasDocs: fs.existsSync(path.join(m.fullPath, "docs", "README.md")),
        hasTests: this.hasTests(m.fullPath),
        hasAIMetadata: !!(m.manifest.ai && m.manifest.ai.summary),
      })),
    };

    // Calculate exports
    let totalExports = 0;
    categoryModules.forEach((module) => {
      if (module.manifest.exports) {
        Object.entries(module.manifest.exports).forEach(([type, items]) => {
          if (Array.isArray(items)) {
            if (!metrics.exports[type]) metrics.exports[type] = 0;
            metrics.exports[type] += items.length;
            totalExports += items.length;
          }
        });
      }
    });

    metrics.avgExportsPerModule =
      categoryModules.length > 0
        ? (totalExports / categoryModules.length).toFixed(1)
        : 0;

    // Calculate percentages
    metrics.docsPercentage = (
      (metrics.modules.filter((m) => m.hasDocs).length / metrics.count) *
      100
    ).toFixed(0);
    metrics.testsPercentage = (
      (metrics.modules.filter((m) => m.hasTests).length / metrics.count) *
      100
    ).toFixed(0);
    metrics.aiMetadataPercentage = (
      (metrics.modules.filter((m) => m.hasAIMetadata).length / metrics.count) *
      100
    ).toFixed(0);

    return metrics;
  }

  // =====================================================
  // REUSABILITY METRICS
  // =====================================================

  getReusabilityMetrics() {
    const metrics = {
      totalExports: 0,
      reusableItems: {
        components: 0,
        hooks: 0,
        services: 0,
        types: 0,
        stores: 0,
        schemas: 0,
      },
      withExamples: 0,
      withoutExamples: 0,
      score: 0,
      recommendations: [],
    };

    this.modules.forEach((module) => {
      if (!module.manifest.exports) return;

      Object.entries(module.manifest.exports).forEach(([type, items]) => {
        if (!Array.isArray(items)) return;

        items.forEach((item) => {
          metrics.totalExports++;

          if (metrics.reusableItems[type] !== undefined) {
            metrics.reusableItems[type]++;
          }

          if (item.example) {
            metrics.withExamples++;
          } else {
            metrics.withoutExamples++;
            metrics.recommendations.push({
              module: module.id,
              item: item.name,
              type,
              issue: "Missing usage example",
            });
          }
        });
      });
    });

    // Calculate reusability score
    const examplesCoverage =
      metrics.totalExports > 0
        ? metrics.withExamples / metrics.totalExports
        : 0;
    const aiMetadataScore = this.calculateAIMetadataScore();
    const docsScore = this.calculateDocsScore();

    metrics.score = Math.round(
      examplesCoverage * 40 + aiMetadataScore * 30 + docsScore * 30,
    );

    return metrics;
  }

  // =====================================================
  // QUALITY METRICS
  // =====================================================

  getQualityMetrics() {
    const metrics = {
      overall: 0,
      documentation: {
        score: 0,
        withDocs: 0,
        withoutDocs: 0,
        missingDocs: [],
      },
      testing: {
        score: 0,
        withTests: 0,
        withoutTests: 0,
        missingTests: [],
      },
      metadata: {
        score: 0,
        complete: 0,
        incomplete: 0,
        missing: [],
      },
      standards: {
        score: 0,
        compliant: 0,
        nonCompliant: 0,
        issues: [],
      },
    };

    this.modules.forEach((module) => {
      // Documentation
      const docsPath = path.join(module.fullPath, "docs", "README.md");
      if (fs.existsSync(docsPath)) {
        metrics.documentation.withDocs++;
      } else {
        metrics.documentation.withoutDocs++;
        metrics.documentation.missingDocs.push(module.id);
      }

      // Testing
      if (this.hasTests(module.fullPath)) {
        metrics.testing.withTests++;
      } else {
        metrics.testing.withoutTests++;
        metrics.testing.missingTests.push(module.id);
      }

      // Metadata
      const aiMetadata = module.manifest.ai || {};
      const hasComplete =
        aiMetadata.summary &&
        aiMetadata.keywords &&
        aiMetadata.keywords.length >= 3 &&
        aiMetadata.use_cases &&
        aiMetadata.use_cases.length >= 2 &&
        aiMetadata.examples &&
        aiMetadata.examples.length >= 1;

      if (hasComplete) {
        metrics.metadata.complete++;
      } else {
        metrics.metadata.incomplete++;
        metrics.metadata.missing.push({
          module: module.id,
          issues: this.getMissingMetadata(aiMetadata),
        });
      }

      // Standards compliance
      const issues = this.checkStandards(module);
      if (issues.length === 0) {
        metrics.standards.compliant++;
      } else {
        metrics.standards.nonCompliant++;
        metrics.standards.issues.push({
          module: module.id,
          issues,
        });
      }
    });

    // Calculate scores
    const total = this.modules.length;
    metrics.documentation.score =
      total > 0
        ? Math.round((metrics.documentation.withDocs / total) * 100)
        : 0;
    metrics.testing.score =
      total > 0 ? Math.round((metrics.testing.withTests / total) * 100) : 0;
    metrics.metadata.score =
      total > 0 ? Math.round((metrics.metadata.complete / total) * 100) : 0;
    metrics.standards.score =
      total > 0 ? Math.round((metrics.standards.compliant / total) * 100) : 0;

    // Overall quality score
    metrics.overall = Math.round(
      metrics.documentation.score * 0.25 +
        metrics.testing.score * 0.25 +
        metrics.metadata.score * 0.25 +
        metrics.standards.score * 0.25,
    );

    return metrics;
  }

  // =====================================================
  // FORMATTED REPORT
  // =====================================================

  printReport(options = {}) {
    const { detailed = false } = options;

    console.log("\n" + "=".repeat(60));
    console.log("📊 MODULE SYSTEM METRICS");
    console.log("=".repeat(60));

    // Overview
    const overview = this.getOverview();
    console.log("\n📈 SYSTEM OVERVIEW");
    console.log("-".repeat(60));
    console.log(`Total Modules: ${overview.totalModules}`);
    console.log("\nBy Category:");
    Object.entries(overview.categories).forEach(([cat, count]) => {
      const icon =
        { ui: "🎨", logic: "⚙️", data: "🗄️", integration: "🔌" }[cat] || "📦";
      console.log(`  ${icon} ${cat.padEnd(12)}: ${count} modules`);
    });

    console.log("\nReusable Exports:");
    Object.entries(overview.exports).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`  • ${type.padEnd(12)}: ${count}`);
      }
    });

    console.log("\nHealth Status:");
    console.log(
      `  📖 With documentation: ${overview.health.withDocs}/${overview.totalModules} (${Math.round((overview.health.withDocs / overview.totalModules) * 100)}%)`,
    );
    console.log(
      `  🧪 With tests:         ${overview.health.withTests}/${overview.totalModules} (${Math.round((overview.health.withTests / overview.totalModules) * 100)}%)`,
    );
    console.log(
      `  📝 With examples:      ${overview.health.withExamples}/${overview.totalModules} (${Math.round((overview.health.withExamples / overview.totalModules) * 100)}%)`,
    );
    console.log(
      `  🤖 With AI metadata:   ${overview.health.withAIMetadata}/${overview.totalModules} (${Math.round((overview.health.withAIMetadata / overview.totalModules) * 100)}%)`,
    );

    // Reusability Metrics
    const reusability = this.getReusabilityMetrics();
    console.log("\n♻️  REUSABILITY METRICS");
    console.log("-".repeat(60));
    console.log(`Total Reusable Exports: ${reusability.totalExports}`);
    console.log(
      `Exports with Examples:  ${reusability.withExamples}/${reusability.totalExports}`,
    );
    console.log(`Reusability Score:      ${reusability.score}/100`);

    if (reusability.score >= 80) {
      console.log(`Status: ✅ Excellent`);
    } else if (reusability.score >= 60) {
      console.log(`Status: ⚠️  Good, can improve`);
    } else {
      console.log(`Status: ❌ Needs improvement`);
    }

    // Quality Metrics
    const quality = this.getQualityMetrics();
    console.log("\n⭐ QUALITY METRICS");
    console.log("-".repeat(60));
    console.log(`Overall Quality Score:  ${quality.overall}/100`);
    console.log(`  Documentation:        ${quality.documentation.score}/100`);
    console.log(`  Testing:              ${quality.testing.score}/100`);
    console.log(`  AI Metadata:          ${quality.metadata.score}/100`);
    console.log(`  Standards Compliance: ${quality.standards.score}/100`);

    if (quality.overall >= 80) {
      console.log(`Status: ✅ Excellent`);
    } else if (quality.overall >= 60) {
      console.log(`Status: ⚠️  Good, can improve`);
    } else {
      console.log(`Status: ❌ Needs improvement`);
    }

    // Detailed recommendations
    if (detailed) {
      console.log("\n🔍 DETAILED RECOMMENDATIONS");
      console.log("-".repeat(60));

      if (quality.documentation.missingDocs.length > 0) {
        console.log("\n📖 Missing Documentation:");
        quality.documentation.missingDocs.forEach((id) => {
          console.log(`   • ${id}`);
        });
      }

      if (quality.testing.missingTests.length > 0) {
        console.log("\n🧪 Missing Tests:");
        quality.testing.missingTests.forEach((id) => {
          console.log(`   • ${id}`);
        });
      }

      if (quality.metadata.missing.length > 0) {
        console.log("\n🤖 Incomplete AI Metadata:");
        quality.metadata.missing.forEach((item) => {
          console.log(`   • ${item.module}:`);
          item.issues.forEach((issue) => {
            console.log(`     - ${issue}`);
          });
        });
      }

      if (
        reusability.recommendations.length > 0 &&
        reusability.recommendations.length <= 10
      ) {
        console.log("\n📝 Missing Usage Examples:");
        reusability.recommendations.forEach((rec) => {
          console.log(`   • ${rec.module} > ${rec.item} (${rec.type})`);
        });
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("💡 Use --detailed flag for full recommendations");
    console.log("=".repeat(60) + "\n");
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  countExports(manifest) {
    let count = 0;
    if (!manifest.exports) return count;

    Object.values(manifest.exports).forEach((items) => {
      if (Array.isArray(items)) {
        count += items.length;
      }
    });

    return count;
  }

  hasTests(modulePath) {
    const testsPath = path.join(modulePath, "tests");
    if (!fs.existsSync(testsPath)) return false;

    const files = fs.readdirSync(testsPath);
    return files.length > 0;
  }

  calculateAIMetadataScore() {
    let complete = 0;
    this.modules.forEach((module) => {
      const ai = module.manifest.ai || {};
      if (
        ai.summary &&
        ai.keywords &&
        ai.keywords.length >= 3 &&
        ai.use_cases &&
        ai.use_cases.length >= 2
      ) {
        complete++;
      }
    });
    return this.modules.length > 0 ? complete / this.modules.length : 0;
  }

  calculateDocsScore() {
    let withDocs = 0;
    this.modules.forEach((module) => {
      const docsPath = path.join(module.fullPath, "docs", "README.md");
      if (fs.existsSync(docsPath)) withDocs++;
    });
    return this.modules.length > 0 ? withDocs / this.modules.length : 0;
  }

  getMissingMetadata(aiMetadata) {
    const issues = [];
    if (!aiMetadata.summary) issues.push("Missing summary");
    if (!aiMetadata.keywords || aiMetadata.keywords.length < 3) {
      issues.push("Need at least 3 keywords");
    }
    if (!aiMetadata.use_cases || aiMetadata.use_cases.length < 2) {
      issues.push("Need at least 2 use cases");
    }
    if (!aiMetadata.examples || aiMetadata.examples.length < 1) {
      issues.push("Need at least 1 example");
    }
    return issues;
  }

  checkStandards(module) {
    const issues = [];

    // Check required files
    const requiredFiles = ["module.json", "index.ts"];
    requiredFiles.forEach((file) => {
      if (!fs.existsSync(path.join(module.fullPath, file))) {
        issues.push(`Missing required file: ${file}`);
      }
    });

    // Check version format
    if (!/^\d+\.\d+\.\d+$/.test(module.manifest.version)) {
      issues.push("Invalid version format (should be X.Y.Z)");
    }

    // Check description length
    if (
      !module.manifest.description ||
      module.manifest.description.length < 10
    ) {
      issues.push("Description too short (min 10 chars)");
    }

    // Check keywords
    if (!module.manifest.keywords || module.manifest.keywords.length < 3) {
      issues.push("Need at least 3 keywords");
    }

    return issues;
  }
}

// =====================================================
// CLI INTERFACE
// =====================================================

function showHelp() {
  console.log(`
📊 Module Metrics - Analytics and Quality Insights

Usage: node metrics.js [command] [options]

Commands:
  report              Show full metrics report
  overview            Show system overview only
  category <name>     Show metrics for specific category
  reusability         Show reusability metrics
  quality             Show quality metrics

Options:
  --detailed          Show detailed recommendations
  --json              Output as JSON

Examples:
  node metrics.js report --detailed
  node metrics.js overview
  node metrics.js category ui
  node metrics.js reusability
  node metrics.js quality --json
  `);
}

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];
const flags = {
  detailed: args.includes("--detailed"),
  json: args.includes("--json"),
};

if (!command || command === "--help" || command === "-h") {
  showHelp();
  process.exit(0);
}

try {
  const metrics = new ModuleMetrics();

  switch (command) {
    case "report":
      metrics.printReport({ detailed: flags.detailed });
      break;

    case "overview":
      const overview = metrics.getOverview();
      if (flags.json) {
        console.log(JSON.stringify(overview, null, 2));
      } else {
        console.log("\n📈 System Overview:");
        console.log(JSON.stringify(overview, null, 2));
      }
      break;

    case "category":
      if (!args[1] || args[1].startsWith("--")) {
        console.error("Category name is required");
        process.exit(1);
      }
      const categoryMetrics = metrics.getByCategory(args[1]);
      if (flags.json) {
        console.log(JSON.stringify(categoryMetrics, null, 2));
      } else {
        console.log(`\n📦 ${args[1].toUpperCase()} Category Metrics:`);
        console.log(JSON.stringify(categoryMetrics, null, 2));
      }
      break;

    case "reusability":
      const reusability = metrics.getReusabilityMetrics();
      if (flags.json) {
        console.log(JSON.stringify(reusability, null, 2));
      } else {
        console.log("\n♻️  Reusability Metrics:");
        console.log(JSON.stringify(reusability, null, 2));
      }
      break;

    case "quality":
      const quality = metrics.getQualityMetrics();
      if (flags.json) {
        console.log(JSON.stringify(quality, null, 2));
      } else {
        console.log("\n⭐ Quality Metrics:");
        console.log(JSON.stringify(quality, null, 2));
      }
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
