#!/usr/bin/env node

/**
 * Quality Check Script for Modular Architecture
 *
 * Validates module structure, manifests, documentation, tests, and exports
 * Generates comprehensive quality reports with scoring
 *
 * Usage:
 *   npm run quality:check              # Normal mode (warnings only)
 *   npm run quality:check:strict       # Strict mode (fails on errors)
 */

const fs = require("fs");
const path = require("path");

// Configuration
const MODULES_DIR = path.join(process.cwd(), "modules");
const REQUIRED_DIRS = ["src", "docs", "tests"];
const REQUIRED_FILES = ["module.json", "index.ts", "docs/README.md"];
const MIN_README_LINES = 100;
const MIN_COVERAGE = 70;
const SCORE_WEIGHTS = {
  structure: 20,
  manifest: 20,
  documentation: 30,
  tests: 20,
  exports: 10,
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

// Parse command line arguments
const args = process.argv.slice(2);
const strictMode = args.includes("--strict");

/**
 * Main execution
 */
async function main() {
  console.log(
    `${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.bright}${colors.cyan}║          MODULE QUALITY CHECK REPORT                   ║${colors.reset}`,
  );
  console.log(
    `${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`,
  );

  if (strictMode) {
    console.log(
      `${colors.yellow}Running in STRICT mode - will fail on any errors${colors.reset}\n`,
    );
  }

  // Find all modules
  const modules = findAllModules();

  if (modules.length === 0) {
    console.log(
      `${colors.red}✗ No modules found in ${MODULES_DIR}${colors.reset}`,
    );
    process.exit(1);
  }

  console.log(
    `${colors.gray}Found ${modules.length} module(s) to check${colors.reset}\n`,
  );

  // Check each module
  const results = [];
  for (const modulePath of modules) {
    const result = await checkModule(modulePath);
    results.push(result);
  }

  // Generate summary report
  console.log(
    `\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`,
  );
  console.log(`${colors.bright}SUMMARY${colors.reset}\n`);

  const summary = generateSummary(results);
  displaySummary(summary);

  // Exit with appropriate code
  const hasErrors = results.some((r) => r.totalErrors > 0);
  if (strictMode && hasErrors) {
    console.log(
      `\n${colors.red}${colors.bright}Quality check FAILED in strict mode${colors.reset}`,
    );
    process.exit(1);
  } else {
    console.log(
      `\n${colors.green}${colors.bright}Quality check completed${colors.reset}`,
    );
    process.exit(0);
  }
}

/**
 * Find all modules in the modules directory
 */
function findAllModules() {
  const modules = [];

  if (!fs.existsSync(MODULES_DIR)) {
    return modules;
  }

  const categories = fs.readdirSync(MODULES_DIR);

  for (const category of categories) {
    const categoryPath = path.join(MODULES_DIR, category);
    const stat = fs.statSync(categoryPath);

    if (!stat.isDirectory()) continue;

    const moduleNames = fs.readdirSync(categoryPath);

    for (const moduleName of moduleNames) {
      const modulePath = path.join(categoryPath, moduleName);
      const modulestat = fs.statSync(modulePath);

      if (modulestat.isDirectory()) {
        // Check if it has a module.json
        const manifestPath = path.join(modulePath, "module.json");
        if (fs.existsSync(manifestPath)) {
          modules.push(modulePath);
        }
      }
    }
  }

  return modules;
}

/**
 * Check a single module
 */
async function checkModule(modulePath) {
  const moduleName = path.basename(modulePath);
  const category = path.basename(path.dirname(modulePath));

  console.log(
    `${colors.bright}Checking: ${category}/${moduleName}${colors.reset}`,
  );
  console.log(`${colors.gray}${"─".repeat(60)}${colors.reset}`);

  const checks = {
    structure: checkStructure(modulePath),
    manifest: checkManifest(modulePath),
    documentation: checkDocumentation(modulePath),
    tests: checkTests(modulePath, category),
    exports: checkExports(modulePath),
  };

  // Calculate score
  const score = calculateScore(checks);

  // Count errors and warnings
  const totalErrors = Object.values(checks).reduce(
    (sum, check) => sum + check.errors.length,
    0,
  );
  const totalWarnings = Object.values(checks).reduce(
    (sum, check) => sum + check.warnings.length,
    0,
  );

  // Display results
  displayModuleResults(moduleName, checks, score);

  return {
    modulePath,
    moduleName,
    category,
    checks,
    score,
    totalErrors,
    totalWarnings,
  };
}

/**
 * Check 1: Structure Check
 * Validates that required directories and files exist
 */
function checkStructure(modulePath) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    score: 0,
  };

  // Check required directories
  for (const dir of REQUIRED_DIRS) {
    const dirPath = path.join(modulePath, dir);
    if (!fs.existsSync(dirPath)) {
      result.errors.push(`Missing required directory: ${dir}/`);
      result.valid = false;
    }
  }

  // Check required files
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(modulePath, file);
    if (!fs.existsSync(filePath)) {
      result.errors.push(`Missing required file: ${file}`);
      result.valid = false;
    }
  }

  // Check src/ has at least one subdirectory or file
  const srcPath = path.join(modulePath, "src");
  if (fs.existsSync(srcPath)) {
    const srcContents = fs.readdirSync(srcPath);
    if (srcContents.length === 0) {
      result.warnings.push("src/ directory is empty");
    }
  }

  return result;
}

/**
 * Check 2: Manifest Check
 * Validates module.json structure and content
 */
function checkManifest(modulePath) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    score: 0,
  };

  const manifestPath = path.join(modulePath, "module.json");

  if (!fs.existsSync(manifestPath)) {
    result.errors.push("module.json not found");
    result.valid = false;
    return result;
  }

  try {
    const content = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(content);

    // Check required fields
    const requiredFields = ["id", "name", "version", "category", "description"];
    for (const field of requiredFields) {
      if (!manifest[field] || manifest[field].trim() === "") {
        result.errors.push(`Missing or empty required field: ${field}`);
        result.valid = false;
      }
    }

    // Check exports structure
    if (!manifest.exports || Object.keys(manifest.exports).length === 0) {
      result.warnings.push("No exports declared in manifest");
    } else {
      // Validate that declared exports exist
      const exportErrors = validateExports(modulePath, manifest.exports);
      result.errors.push(...exportErrors);
      if (exportErrors.length > 0) {
        result.valid = false;
      }
    }

    // Check dependencies
    if (manifest.dependencies) {
      if (!Array.isArray(manifest.dependencies.modules)) {
        result.warnings.push("dependencies.modules should be an array");
      }
      if (!Array.isArray(manifest.dependencies.packages)) {
        result.warnings.push("dependencies.packages should be an array");
      }
    }

    // Check version format
    if (manifest.version && !manifest.version.match(/^\d+\.\d+\.\d+$/)) {
      result.warnings.push("Version should follow semver format (x.y.z)");
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      result.errors.push(`Invalid JSON in module.json: ${error.message}`);
    } else {
      result.errors.push(`Error reading module.json: ${error.message}`);
    }
    result.valid = false;
  }

  return result;
}

/**
 * Validate that exported items exist in the filesystem
 */
function validateExports(modulePath, exports) {
  const errors = [];

  for (const [exportType, items] of Object.entries(exports)) {
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      if (!item.path) continue;

      // Remove leading ./ from path
      const relativePath = item.path.replace(/^\.\//, "");

      // If path already has extension, check directly
      if (relativePath.match(/\.(ts|tsx|sql)$/)) {
        const directPath = path.join(modulePath, relativePath);
        if (fs.existsSync(directPath)) {
          continue; // File exists, skip to next item
        }
      }

      // Try with .ts, .tsx extensions
      const possiblePaths = [
        path.join(modulePath, relativePath + ".ts"),
        path.join(modulePath, relativePath + ".tsx"),
        path.join(modulePath, relativePath, "index.ts"),
        path.join(modulePath, relativePath, "index.tsx"),
        path.join(modulePath, relativePath + ".sql"), // For SQL schemas
      ];

      const exists = possiblePaths.some((p) => fs.existsSync(p));

      if (!exists) {
        errors.push(
          `Export ${exportType}.${item.name} path not found: ${item.path}`,
        );
      }
    }
  }

  return errors;
}

/**
 * Check 3: Documentation Check
 * Validates README.md completeness and quality
 */
function checkDocumentation(modulePath) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    score: 0,
  };

  const readmePath = path.join(modulePath, "docs", "README.md");

  if (!fs.existsSync(readmePath)) {
    result.errors.push("docs/README.md not found");
    result.valid = false;
    return result;
  }

  try {
    const content = fs.readFileSync(readmePath, "utf8");
    const lines = content.split("\n");

    // Check minimum length
    if (lines.length < MIN_README_LINES) {
      result.warnings.push(
        `README has only ${lines.length} lines (minimum: ${MIN_README_LINES})`,
      );
    }

    // Check for required sections
    const requiredSections = ["Overview", "Usage", "API"];
    const contentLower = content.toLowerCase();

    for (const section of requiredSections) {
      if (!contentLower.includes(section.toLowerCase())) {
        result.warnings.push(`README missing recommended section: ${section}`);
      }
    }

    // Check for code examples
    if (!content.includes("```")) {
      result.warnings.push("README should include code examples");
    }

    // Check for empty or very short README
    if (content.trim().length < 500) {
      result.errors.push("README is too short (less than 500 characters)");
      result.valid = false;
    }
  } catch (error) {
    result.errors.push(`Error reading README: ${error.message}`);
    result.valid = false;
  }

  return result;
}

/**
 * Check 4: Tests Check
 * Validates test files and coverage
 */
function checkTests(modulePath, category) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    score: 0,
    na: false, // Not applicable flag
  };

  // Special case: schema-only modules (data category with only SQL files)
  if (category === "data") {
    const srcPath = path.join(modulePath, "src");
    if (!fs.existsSync(srcPath) || fs.readdirSync(srcPath).length === 0) {
      result.na = true;
      result.warnings.push("Tests N/A for schema-only module");
      return result;
    }
  }

  const testsPath = path.join(modulePath, "tests");

  if (!fs.existsSync(testsPath)) {
    result.errors.push("tests/ directory not found");
    result.valid = false;
    return result;
  }

  // Find test files recursively
  const testFiles = findTestFiles(testsPath);

  if (testFiles.length === 0) {
    result.errors.push("No test files found (*.test.ts, *.test.tsx)");
    result.valid = false;
  } else {
    result.warnings.push(`Found ${testFiles.length} test file(s)`);
  }

  // Check for test configuration or README
  const testReadme = path.join(testsPath, "README.md");
  if (fs.existsSync(testReadme)) {
    result.warnings.push("Test documentation found");
  }

  return result;
}

/**
 * Find all test files recursively
 */
function findTestFiles(dir) {
  const testFiles = [];

  if (!fs.existsSync(dir)) return testFiles;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      testFiles.push(...findTestFiles(fullPath));
    } else if (item.match(/\.test\.(ts|tsx)$/)) {
      testFiles.push(fullPath);
    }
  }

  return testFiles;
}

/**
 * Check 5: Exports Check
 * Validates index.ts exports consistency
 */
function checkExports(modulePath) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    score: 0,
  };

  const indexPath = path.join(modulePath, "index.ts");

  if (!fs.existsSync(indexPath)) {
    result.errors.push("index.ts not found");
    result.valid = false;
    return result;
  }

  try {
    const indexContent = fs.readFileSync(indexPath, "utf8");

    // Check for exports
    if (!indexContent.includes("export")) {
      result.errors.push("index.ts has no exports");
      result.valid = false;
      return result;
    }

    // Load manifest to compare
    const manifestPath = path.join(modulePath, "module.json");
    if (!fs.existsSync(manifestPath)) {
      return result; // Already caught in manifest check
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    if (!manifest.exports) {
      return result;
    }

    // Check that declared exports are actually exported
    for (const [exportType, items] of Object.entries(manifest.exports)) {
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        if (!item.name) continue;

        // Check if this export appears in index.ts
        const exportPattern = new RegExp(`export.*${item.name}`, "i");
        if (!exportPattern.test(indexContent)) {
          result.warnings.push(
            `Manifest declares ${item.name} but not found in index.ts exports`,
          );
        }
      }
    }

    // Check for duplicate exports
    const exportMatches =
      indexContent.match(/export\s+(?:type\s+)?\{[^}]+\}/g) || [];
    const exportedNames = new Set();

    for (const match of exportMatches) {
      const names = match.match(/\w+/g) || [];
      for (const name of names) {
        if (name === "export" || name === "type") continue;
        if (exportedNames.has(name)) {
          result.warnings.push(`Duplicate export: ${name}`);
        }
        exportedNames.add(name);
      }
    }
  } catch (error) {
    result.errors.push(`Error reading index.ts: ${error.message}`);
    result.valid = false;
  }

  return result;
}

/**
 * Calculate overall score for a module
 */
function calculateScore(checks) {
  let totalScore = 0;

  for (const [checkName, check] of Object.entries(checks)) {
    const weight = SCORE_WEIGHTS[checkName];

    // Skip N/A checks (give full points)
    if (check.na) {
      totalScore += weight;
      continue;
    }

    if (check.errors.length === 0 && check.warnings.length === 0) {
      // Perfect check
      totalScore += weight;
    } else if (check.errors.length === 0) {
      // Only warnings - 80% of points
      totalScore += weight * 0.8;
    } else if (check.errors.length <= 2) {
      // Few errors - 40% of points
      totalScore += weight * 0.4;
    }
    // Many errors - 0 points
  }

  return Math.round(totalScore);
}

/**
 * Display results for a single module
 */
function displayModuleResults(moduleName, checks, score) {
  const scoreColor =
    score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;

  console.log(
    `\n${colors.bright}Score: ${scoreColor}${score}/100${colors.reset}`,
  );
  console.log("");

  for (const [checkName, check] of Object.entries(checks)) {
    const icon = check.na ? "○" : check.errors.length === 0 ? "✓" : "✗";
    const iconColor = check.na
      ? colors.gray
      : check.errors.length === 0
        ? colors.green
        : colors.red;
    const label = checkName.charAt(0).toUpperCase() + checkName.slice(1);

    console.log(
      `${iconColor}${icon}${colors.reset} ${label} Check${check.na ? " (N/A)" : ""}`,
    );

    // Show errors
    for (const error of check.errors) {
      console.log(`  ${colors.red}✗${colors.reset} ${error}`);
    }

    // Show warnings
    for (const warning of check.warnings) {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${warning}`);
    }
  }

  console.log("");
}

/**
 * Generate summary statistics
 */
function generateSummary(results) {
  const summary = {
    total: results.length,
    passed: results.filter((r) => r.score >= 80).length,
    warning: results.filter((r) => r.score >= 60 && r.score < 80).length,
    failed: results.filter((r) => r.score < 60).length,
    avgScore: Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / results.length,
    ),
    results: results.sort((a, b) => b.score - a.score),
  };

  return summary;
}

/**
 * Display summary report
 */
function displaySummary(summary) {
  console.log(`Total Modules: ${summary.total}`);
  console.log(
    `${colors.green}✓ Passed (≥80): ${summary.passed}${colors.reset}`,
  );
  console.log(
    `${colors.yellow}⚠ Warning (60-79): ${summary.warning}${colors.reset}`,
  );
  console.log(`${colors.red}✗ Failed (<60): ${summary.failed}${colors.reset}`);
  console.log(`\nAverage Score: ${summary.avgScore}/100`);
  console.log("");

  // Individual module scores
  console.log(`${colors.bright}Module Scores:${colors.reset}`);
  for (const result of summary.results) {
    const scoreColor =
      result.score >= 80
        ? colors.green
        : result.score >= 60
          ? colors.yellow
          : colors.red;
    const status = result.score >= 80 ? "✓" : result.score >= 60 ? "⚠" : "✗";
    const statusColor =
      result.score >= 80
        ? colors.green
        : result.score >= 60
          ? colors.yellow
          : colors.red;

    const checksInfo = Object.entries(result.checks)
      .map(([name, check]) => {
        if (check.na) return `${name}: N/A`;
        return `${name}: ${check.errors.length === 0 ? "✓" : "✗"}`;
      })
      .join(", ");

    console.log(
      `${statusColor}${status}${colors.reset} ${result.moduleName}: ${scoreColor}${result.score}/100${colors.reset}`,
    );
    console.log(`  ${colors.gray}${checksInfo}${colors.reset}`);
  }
}

// Run main function
main().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
});
