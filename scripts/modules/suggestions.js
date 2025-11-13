#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Smart Suggestions System
 * AI-powered suggestions for module reusability
 */

const REGISTRY_PATH = path.join(process.cwd(), ".modules/registry.json");
const CACHE_PATH = path.join(process.cwd(), ".modules/cache/search-index.json");

// =====================================================
// NLP PATTERNS AND KEYWORDS
// =====================================================

// Category detection patterns
const CATEGORY_PATTERNS = {
  ui: [
    "component",
    "interface",
    "página",
    "tela",
    "formulário",
    "botão",
    "modal",
    "card",
    "lista",
    "tabela",
    "menu",
    "navegação",
    "layout",
    "design",
    "visual",
    "react",
    "jsx",
    "tsx",
    "hook",
    "store",
    "estado",
    "zustand",
  ],
  logic: [
    "serviço",
    "service",
    "lógica",
    "regra de negócio",
    "validação",
    "repositório",
    "repository",
    "crud",
    "criar",
    "atualizar",
    "deletar",
    "buscar",
    "listar",
    "processar",
    "calcular",
    "transformar",
  ],
  data: [
    "banco",
    "database",
    "tabela",
    "table",
    "schema",
    "migração",
    "migration",
    "sql",
    "query",
    "consulta",
    "rls",
    "policy",
    "índice",
    "index",
    "trigger",
  ],
  integration: [
    "api",
    "integração",
    "webhook",
    "provider",
    "adapter",
    "externo",
    "terceiro",
    "stripe",
    "sendgrid",
    "twilio",
    "http",
    "fetch",
    "request",
  ],
};

// Action patterns for intent detection
const ACTION_PATTERNS = {
  create: ["criar", "create", "adicionar", "add", "novo", "new"],
  read: [
    "buscar",
    "find",
    "get",
    "obter",
    "listar",
    "list",
    "visualizar",
    "view",
  ],
  update: ["atualizar", "update", "modificar", "modify", "editar", "edit"],
  delete: ["deletar", "delete", "remover", "remove", "excluir"],
  search: ["pesquisar", "search", "filtrar", "filter"],
  validate: ["validar", "validate", "verificar", "check"],
};

// Domain keywords (common entities)
const DOMAIN_KEYWORDS = [
  "user",
  "usuário",
  "product",
  "produto",
  "order",
  "pedido",
  "payment",
  "pagamento",
  "customer",
  "cliente",
  "item",
  "cart",
  "carrinho",
  "auth",
  "autenticação",
  "profile",
  "perfil",
  "settings",
  "configurações",
];

// =====================================================
// SMART SUGGESTIONS CLASS
// =====================================================

class SmartSuggestions {
  constructor() {
    this.registry = this.loadRegistry();
    this.searchIndex = this.loadSearchIndex();
  }

  loadRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) {
      throw new Error("Registry not found. Run: npm run modules:sync");
    }
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  }

  loadSearchIndex() {
    if (!fs.existsSync(CACHE_PATH)) {
      console.log("⚠️  Search index not found. Building...");
      // Try to build index
      try {
        const { execSync } = require("child_process");
        execSync("node scripts/modules/discover.js index", {
          stdio: "inherit",
        });
        return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
      } catch (error) {
        console.warn("Could not build search index:", error.message);
        return null;
      }
    }
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  }

  // =====================================================
  // KEYWORD EXTRACTION
  // =====================================================

  extractKeywords(text) {
    const normalized = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove accents

    const keywords = {
      categories: [],
      actions: [],
      domains: [],
      raw: [],
    };

    // Extract category keywords
    Object.entries(CATEGORY_PATTERNS).forEach(([category, patterns]) => {
      const matches = patterns.filter((pattern) =>
        normalized.includes(pattern.toLowerCase()),
      );
      if (matches.length > 0) {
        keywords.categories.push({
          category,
          matches,
          confidence: matches.length / patterns.length,
        });
      }
    });

    // Sort categories by confidence
    keywords.categories.sort((a, b) => b.confidence - a.confidence);

    // Extract action keywords
    Object.entries(ACTION_PATTERNS).forEach(([action, patterns]) => {
      const matches = patterns.filter((pattern) =>
        normalized.includes(pattern.toLowerCase()),
      );
      if (matches.length > 0) {
        keywords.actions.push({
          action,
          matches,
        });
      }
    });

    // Extract domain keywords
    const domainMatches = DOMAIN_KEYWORDS.filter((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    );
    keywords.domains = domainMatches;

    // Extract raw keywords (words with 3+ chars)
    const words = normalized
      .split(/\s+/)
      .filter((word) => word.length >= 3)
      .filter((word) => !/^\d+$/.test(word)); // Remove numbers

    keywords.raw = [...new Set(words)]; // Unique words

    return keywords;
  }

  // =====================================================
  // CATEGORY DETECTION
  // =====================================================

  detectCategory(text, keywords = null) {
    if (!keywords) {
      keywords = this.extractKeywords(text);
    }

    if (keywords.categories.length === 0) {
      return { category: "unknown", confidence: 0 };
    }

    return {
      category: keywords.categories[0].category,
      confidence: keywords.categories[0].confidence,
      allMatches: keywords.categories,
    };
  }

  // =====================================================
  // CONTEXT-BASED SUGGESTIONS
  // =====================================================

  suggest(context) {
    const keywords = this.extractKeywords(context);
    const category = this.detectCategory(context, keywords);

    const suggestions = {
      context: context.substring(0, 100) + (context.length > 100 ? "..." : ""),
      detectedCategory: category.category,
      confidence: category.confidence,
      keywords: keywords,
      recommendations: [],
    };

    // Search for relevant modules
    const moduleResults = this.searchModulesByKeywords(keywords);
    const componentResults = this.searchComponentsByKeywords(keywords);
    const hookResults = this.searchHooksByKeywords(keywords);
    const serviceResults = this.searchServicesByKeywords(keywords);

    // Rank and merge results
    const allResults = [
      ...moduleResults.map((r) => ({ ...r, type: "module" })),
      ...componentResults.map((r) => ({ ...r, type: "component" })),
      ...hookResults.map((r) => ({ ...r, type: "hook" })),
      ...serviceResults.map((r) => ({ ...r, type: "service" })),
    ];

    // Sort by relevance
    allResults.sort((a, b) => b.relevance - a.relevance);

    // Take top 10
    suggestions.recommendations = allResults.slice(0, 10).map((result) => {
      const recommendation = {
        type: result.type,
        name: result.name,
        module: result.module || result.moduleId,
        relevance: Math.round(result.relevance * 100),
        description: result.description,
        example: result.example,
      };

      // Add usage tip
      if (result.type === "component") {
        recommendation.usage = `import { ${result.name} } from '@/modules/${result.category}/${result.module}'`;
      } else if (result.type === "hook") {
        recommendation.usage = `import { ${result.name} } from '@/modules/${result.category}/${result.module}'`;
      } else if (result.type === "service") {
        recommendation.usage = `import { ${result.name} } from '@/modules/${result.category}/${result.module}'`;
      } else if (result.type === "module") {
        recommendation.usage = `Check module: modules/${result.category}/${result.id}`;
      }

      return recommendation;
    });

    return suggestions;
  }

  // =====================================================
  // TASK-BASED SUGGESTIONS (NLP)
  // =====================================================

  suggestFromTask(taskDescription) {
    console.log("\n🧠 Analyzing task...\n");

    const keywords = this.extractKeywords(taskDescription);
    const category = this.detectCategory(taskDescription, keywords);

    console.log("📊 Task Analysis:");
    console.log(
      `   Category: ${category.category} (${Math.round(category.confidence * 100)}% confidence)`,
    );
    console.log(
      `   Actions: ${keywords.actions.map((a) => a.action).join(", ") || "none detected"}`,
    );
    console.log(
      `   Domains: ${keywords.domains.join(", ") || "none detected"}`,
    );
    console.log(`   Keywords: ${keywords.raw.slice(0, 5).join(", ")}...\n`);

    const suggestions = this.suggest(taskDescription);

    if (suggestions.recommendations.length === 0) {
      console.log("❌ No reusable modules found for this task.");
      console.log("💡 Consider creating a new module using:");
      console.log(
        `   npm run generate:module <name> --category ${category.category}\n`,
      );
      return;
    }

    console.log(
      `✅ Found ${suggestions.recommendations.length} reusable modules:\n`,
    );

    suggestions.recommendations.forEach((rec, index) => {
      console.log(
        `${index + 1}. [${rec.relevance}%] ${rec.type.toUpperCase()}: ${rec.name}`,
      );
      console.log(`   Module: ${rec.module}`);
      if (rec.description) {
        console.log(`   ${rec.description}`);
      }
      if (rec.usage) {
        console.log(`   Usage: ${rec.usage}`);
      }
      console.log();
    });

    console.log("💡 Recommendation:");
    if (suggestions.recommendations[0].relevance >= 80) {
      console.log(
        `   REUSE "${suggestions.recommendations[0].name}" - High confidence match!`,
      );
    } else if (suggestions.recommendations[0].relevance >= 60) {
      console.log(
        `   Consider EXTENDING "${suggestions.recommendations[0].name}" or create new module`,
      );
    } else {
      console.log(`   CREATE NEW MODULE - Low confidence in existing matches`);
      console.log(`   Suggested category: ${category.category}`);
    }
    console.log();

    return suggestions;
  }

  // =====================================================
  // CODE ANALYSIS
  // =====================================================

  analyzeCode(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const code = fs.readFileSync(filePath, "utf8");
    const ext = path.extname(filePath);

    const analysis = {
      file: filePath,
      type: this.detectFileType(filePath, code),
      patterns: [],
      suggestions: [],
    };

    // Detect patterns
    if (ext === ".tsx" || ext === ".jsx") {
      analysis.patterns = this.detectReactPatterns(code);
    } else if (ext === ".ts" || ext === ".js") {
      analysis.patterns = this.detectTypeScriptPatterns(code);
    } else if (ext === ".sql") {
      analysis.patterns = this.detectSQLPatterns(code);
    }

    // Find similar patterns in existing modules
    analysis.patterns.forEach((pattern) => {
      const suggestions = this.suggest(pattern.description);
      if (suggestions.recommendations.length > 0) {
        analysis.suggestions.push({
          pattern: pattern.name,
          found: suggestions.recommendations.slice(0, 3),
        });
      }
    });

    return analysis;
  }

  detectFileType(filePath, code) {
    const ext = path.extname(filePath);

    if (ext === ".tsx" || ext === ".jsx") {
      if (code.includes("export default") || code.includes("export function")) {
        return "component";
      }
      if (code.includes("use") && code.includes("export")) {
        return "hook";
      }
    }

    if (ext === ".ts" || ext === ".js") {
      if (code.includes("class") && code.includes("Service")) {
        return "service";
      }
      if (code.includes("interface") && code.includes("Repository")) {
        return "repository";
      }
      if (code.includes("create(") && code.includes("zustand")) {
        return "store";
      }
    }

    if (ext === ".sql") {
      if (code.includes("CREATE TABLE")) {
        return "schema";
      }
      if (code.includes("ALTER TABLE")) {
        return "migration";
      }
    }

    return "unknown";
  }

  detectReactPatterns(code) {
    const patterns = [];

    if (code.includes("useState")) {
      patterns.push({
        name: "useState",
        description: "state management with useState",
      });
    }

    if (code.includes("useEffect")) {
      patterns.push({
        name: "useEffect",
        description: "side effects with useEffect",
      });
    }

    if (code.includes("useCallback")) {
      patterns.push({ name: "useCallback", description: "memoized callbacks" });
    }

    if (code.includes("useMemo")) {
      patterns.push({ name: "useMemo", description: "memoized values" });
    }

    if (code.includes("create(") && code.includes("zustand")) {
      patterns.push({
        name: "Zustand Store",
        description: "global state with Zustand",
      });
    }

    if (code.match(/interface \w+Props/)) {
      patterns.push({
        name: "Component Props",
        description: "typed component props",
      });
    }

    return patterns;
  }

  detectTypeScriptPatterns(code) {
    const patterns = [];

    if (code.includes("class") && code.includes("constructor")) {
      patterns.push({
        name: "Class",
        description: "object-oriented class pattern",
      });
    }

    if (code.includes("interface") && code.includes("extends")) {
      patterns.push({
        name: "Interface Extension",
        description: "interface inheritance",
      });
    }

    if (code.includes("async") && code.includes("await")) {
      patterns.push({
        name: "Async/Await",
        description: "asynchronous operations",
      });
    }

    if (code.match(/private \w+:/)) {
      patterns.push({
        name: "Dependency Injection",
        description: "constructor dependencies",
      });
    }

    return patterns;
  }

  detectSQLPatterns(code) {
    const patterns = [];

    if (code.includes("CREATE TABLE")) {
      patterns.push({
        name: "Table Creation",
        description: "database table schema",
      });
    }

    if (code.includes("CREATE POLICY")) {
      patterns.push({
        name: "RLS Policy",
        description: "row level security policy",
      });
    }

    if (code.includes("CREATE INDEX")) {
      patterns.push({
        name: "Index",
        description: "database index for performance",
      });
    }

    if (code.includes("CREATE TRIGGER")) {
      patterns.push({ name: "Trigger", description: "database trigger" });
    }

    return patterns;
  }

  // =====================================================
  // SEARCH HELPERS
  // =====================================================

  searchModulesByKeywords(keywords) {
    const results = [];

    if (!this.searchIndex) return results;

    // Search in modules
    Object.values(this.searchIndex.modules || {}).forEach((module) => {
      const relevance = this.calculateRelevance(module, keywords);
      if (relevance > 0) {
        results.push({
          ...module,
          relevance,
        });
      }
    });

    return results;
  }

  searchComponentsByKeywords(keywords) {
    const results = [];

    if (!this.searchIndex || !this.searchIndex.components) return results;

    this.searchIndex.components.forEach((component) => {
      const relevance = this.calculateRelevance(component, keywords);
      if (relevance > 0) {
        results.push({
          ...component,
          relevance,
        });
      }
    });

    return results;
  }

  searchHooksByKeywords(keywords) {
    const results = [];

    if (!this.searchIndex || !this.searchIndex.hooks) return results;

    this.searchIndex.hooks.forEach((hook) => {
      const relevance = this.calculateRelevance(hook, keywords);
      if (relevance > 0) {
        results.push({
          ...hook,
          relevance,
        });
      }
    });

    return results;
  }

  searchServicesByKeywords(keywords) {
    const results = [];

    if (!this.searchIndex || !this.searchIndex.services) return results;

    this.searchIndex.services.forEach((service) => {
      const relevance = this.calculateRelevance(service, keywords);
      if (relevance > 0) {
        results.push({
          ...service,
          relevance,
        });
      }
    });

    return results;
  }

  calculateRelevance(item, keywords) {
    let score = 0;
    const searchText =
      `${item.name || ""} ${item.description || ""} ${(item.keywords || []).join(" ")}`.toLowerCase();

    // Check category match
    if (
      keywords.categories.length > 0 &&
      item.category === keywords.categories[0].category
    ) {
      score += 0.3;
    }

    // Check domain keywords
    keywords.domains.forEach((domain) => {
      if (searchText.includes(domain.toLowerCase())) {
        score += 0.2;
      }
    });

    // Check raw keywords
    let matchedKeywords = 0;
    keywords.raw.forEach((keyword) => {
      if (searchText.includes(keyword)) {
        matchedKeywords++;
      }
    });

    if (keywords.raw.length > 0) {
      score += (matchedKeywords / keywords.raw.length) * 0.5;
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }
}

// =====================================================
// CLI INTERFACE
// =====================================================

function showHelp() {
  console.log(`
🧠 Smart Suggestions - AI-powered module discovery

Usage: node suggestions.js <command> [options]

Commands:
  suggest "<context>"         Get suggestions based on context
  task "<task-description>"   Analyze task and suggest modules
  analyze <file-path>         Analyze code file and find patterns

Examples:
  node suggestions.js suggest "criar lista de usuários"
  node suggestions.js task "implementar autenticação com email"
  node suggestions.js analyze src/components/UserList.tsx
  `);
}

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
  showHelp();
  process.exit(0);
}

try {
  const suggestions = new SmartSuggestions();

  switch (command) {
    case "suggest":
      if (!args[1]) {
        console.error("Context is required");
        process.exit(1);
      }
      const result = suggestions.suggest(args[1]);
      console.log(JSON.stringify(result, null, 2));
      break;

    case "task":
      if (!args[1]) {
        console.error("Task description is required");
        process.exit(1);
      }
      suggestions.suggestFromTask(args[1]);
      break;

    case "analyze":
      if (!args[1]) {
        console.error("File path is required");
        process.exit(1);
      }
      const analysis = suggestions.analyzeCode(args[1]);
      console.log(JSON.stringify(analysis, null, 2));
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
