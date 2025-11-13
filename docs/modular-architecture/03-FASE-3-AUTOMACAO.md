# Fase 3: Automação - Ferramentas de Desenvolvimento

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Objetivos](#objetivos)
- [Pré-requisitos](#pré-requisitos)
- [Tarefas](#tarefas)
- [Entregáveis](#entregáveis)
- [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

A Fase 3 cria **ferramentas de automação** que transformam o processo manual de criação e gerenciamento de módulos em operações simples via CLI. Esta fase é crucial para escalar o sistema de módulos.

**Duração estimada**: 3-4 dias
**Complexidade**: Alta
**Dependências**: Fases 1 e 2 concluídas

---

## 🎯 Objetivos

1. ✅ Evoluir `generate-feature.js` → `generate-module.js`
2. ✅ Criar CLI completo de módulos
3. ✅ Automatizar atualização do registry
4. ✅ Criar scripts de descoberta para IA
5. ✅ Implementar templates por categoria
6. ✅ Adicionar validações automáticas

---

## 📋 Pré-requisitos

### Fases Anteriores

- ✅ Fase 1: Estrutura base criada
- ✅ Fase 2: Módulo piloto "users" funcionando

### Conhecimentos

- Node.js scripting
- CLI development
- Template systems
- File system operations

---

## 📝 Tarefas

### Tarefa 3.1: Evoluir generate-feature → generate-module

#### Objetivo

Transformar o script existente em um gerador robusto de módulos por categoria.

#### Arquivo: `scripts/modules/generate-module.js`

```javascript
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { program } = require("commander");

/**
 * Gerador de módulos para arquitetura modular
 *
 * Uso:
 *   npm run generate:module <name> --category <ui|logic|data|integration>
 *
 * Exemplos:
 *   npm run generate:module product-catalog --category ui
 *   npm run generate:module payment-processing --category logic
 *   npm run generate:module orders --category data
 *   npm run generate:module stripe --category integration
 */

program
  .name("generate-module")
  .description("Generate a new module in the modular architecture")
  .argument("<name>", "Module name (kebab-case)")
  .requiredOption(
    "-c, --category <category>",
    "Module category (ui|logic|data|integration)",
  )
  .option("-t, --template <template>", "Template to use")
  .option("-d, --description <description>", "Module description")
  .option("--no-tests", "Skip test files generation")
  .option("--no-docs", "Skip documentation generation")
  .parse();

const options = program.opts();
const moduleName = program.args[0];

// Validar categoria
const validCategories = ["ui", "logic", "data", "integration"];
if (!validCategories.includes(options.category)) {
  console.error(`❌ Invalid category: ${options.category}`);
  console.error(`   Valid options: ${validCategories.join(", ")}`);
  process.exit(1);
}

// Validar nome
if (!/^[a-z][a-z0-9-]*$/.test(moduleName)) {
  console.error("❌ Module name must be kebab-case (lowercase with hyphens)");
  process.exit(1);
}

// Gerar módulo
async function generateModule() {
  const { category } = options;
  const modulePath = path.join("modules", category, moduleName);

  console.log(`\n🚀 Generating module: ${moduleName}`);
  console.log(`📁 Category: ${category}`);
  console.log(`📂 Path: ${modulePath}\n`);

  // Verificar se já existe
  if (fs.existsSync(modulePath)) {
    console.error(`❌ Module already exists: ${modulePath}`);
    process.exit(1);
  }

  // Criar estrutura baseada na categoria
  createModuleStructure(modulePath, category);

  // Gerar arquivos do template
  generateFromTemplate(modulePath, category, moduleName);

  // Gerar manifest
  generateManifest(modulePath, category, moduleName, options.description);

  // Gerar documentação
  if (options.docs !== false) {
    generateDocs(modulePath, moduleName, category);
  }

  // Gerar testes
  if (options.tests !== false) {
    generateTests(modulePath, category);
  }

  // Registrar no registry
  await registerModule(modulePath);

  console.log("\n✅ Module generated successfully!");
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Implement code in: ${modulePath}/src/`);
  console.log(`   2. Update module.json with accurate metadata`);
  console.log(`   3. Add documentation in: ${modulePath}/docs/`);
  console.log(`   4. Write tests in: ${modulePath}/tests/`);
  console.log(`\n📚 View registry: npm run modules:list`);
}

function createModuleStructure(modulePath, category) {
  const baseDirs = ["src", "docs", "tests"];

  // Diretórios específicos por categoria
  const categoryDirs = {
    ui: ["src/components", "src/hooks", "src/stores", "src/types"],
    logic: ["src/services", "src/types", "src/validations", "src/utils"],
    data: ["schemas", "migrations", "seeds", "queries"],
    integration: [
      "src/providers",
      "src/adapters",
      "src/webhooks",
      "src/config",
    ],
  };

  const dirs = [...baseDirs, ...categoryDirs[category]];

  dirs.forEach((dir) => {
    const dirPath = path.join(modulePath, dir);
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created: ${dirPath}`);
  });
}

function generateFromTemplate(modulePath, category, moduleName) {
  const pascalCase = toPascalCase(moduleName);
  const templatePath = path.join(".modules/templates", category);

  // Carregar templates
  const templates = {
    ui: () => generateUITemplate(modulePath, moduleName, pascalCase),
    logic: () => generateLogicTemplate(modulePath, moduleName, pascalCase),
    data: () => generateDataTemplate(modulePath, moduleName),
    integration: () =>
      generateIntegrationTemplate(modulePath, moduleName, pascalCase),
  };

  templates[category]();
}

function generateUITemplate(modulePath, moduleName, pascalCase) {
  // Component
  const componentContent = `import React from 'react'

export interface ${pascalCase}Props {
  // TODO: Define props
}

export const ${pascalCase}: React.FC<${pascalCase}Props> = (props) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">${pascalCase}</h2>
      {/* TODO: Implement component */}
    </div>
  )
}
`;

  fs.writeFileSync(
    path.join(modulePath, "src/components", `${pascalCase}.tsx`),
    componentContent,
  );

  // Hook
  const hookContent = `import { useState, useCallback } from 'react'

export const use${pascalCase} = () => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      // TODO: Implement fetch logic
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    fetchData,
  }
}
`;

  fs.writeFileSync(
    path.join(modulePath, "src/hooks", `use${pascalCase}.ts`),
    hookContent,
  );

  // Types
  const typesContent = `export interface ${pascalCase}Data {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Create${pascalCase}Input {
  name: string
}

export interface Update${pascalCase}Input {
  name?: string
}
`;

  fs.writeFileSync(
    path.join(modulePath, "src/types", `${moduleName}.types.ts`),
    typesContent,
  );

  // index.ts
  const indexContent = `/**
 * ${pascalCase} UI Module
 */

// Components
export { ${pascalCase} } from './components/${pascalCase}'

// Hooks
export { use${pascalCase} } from './hooks/use${pascalCase}'

// Types
export type * from './types/${moduleName}.types'
`;

  fs.writeFileSync(path.join(modulePath, "index.ts"), indexContent);

  console.log(`📄 Generated UI templates`);
}

function generateLogicTemplate(modulePath, moduleName, pascalCase) {
  // Service
  const serviceContent = `import type {
  ${pascalCase}Data,
  Create${pascalCase}Input,
  Update${pascalCase}Input,
} from '../types/${moduleName}.types'

/**
 * Interface Segregation
 */
export interface I${pascalCase}Repository {
  findById(id: string): Promise<${pascalCase}Data | null>
  findMany(): Promise<${pascalCase}Data[]>
  create(input: Create${pascalCase}Input): Promise<${pascalCase}Data>
  update(id: string, input: Update${pascalCase}Input): Promise<${pascalCase}Data>
  delete(id: string): Promise<void>
}

export interface I${pascalCase}Validation {
  validateCreateInput(input: Create${pascalCase}Input): Promise<void>
  validateUpdateInput(input: Update${pascalCase}Input): Promise<void>
}

/**
 * Single Responsibility: ${pascalCase} business logic
 */
export class ${pascalCase}Service {
  constructor(
    private repository: I${pascalCase}Repository,
    private validation: I${pascalCase}Validation
  ) {}

  async getById(id: string): Promise<${pascalCase}Data | null> {
    if (!id) throw new Error('ID is required')
    return this.repository.findById(id)
  }

  async getAll(): Promise<${pascalCase}Data[]> {
    return this.repository.findMany()
  }

  async create(input: Create${pascalCase}Input): Promise<${pascalCase}Data> {
    await this.validation.validateCreateInput(input)
    return this.repository.create(input)
  }

  async update(id: string, input: Update${pascalCase}Input): Promise<${pascalCase}Data> {
    if (!id) throw new Error('ID is required')

    const existing = await this.repository.findById(id)
    if (!existing) throw new Error('${pascalCase} not found')

    await this.validation.validateUpdateInput(input)
    return this.repository.update(id, input)
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('ID is required')

    const existing = await this.repository.findById(id)
    if (!existing) throw new Error('${pascalCase} not found')

    await this.repository.delete(id)
  }
}
`;

  fs.writeFileSync(
    path.join(modulePath, "src/services", `${moduleName}.service.ts`),
    serviceContent,
  );

  // Types
  const typesContent = `export interface ${pascalCase}Data {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Create${pascalCase}Input {
  name: string
}

export interface Update${pascalCase}Input {
  name?: string
}
`;

  fs.writeFileSync(
    path.join(modulePath, "src/types", `${moduleName}.types.ts`),
    typesContent,
  );

  // Validation (Zod)
  const validationContent = `import { z } from 'zod'

export const Create${pascalCase}Schema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export const Update${pascalCase}Schema = z.object({
  name: z.string().min(1).optional(),
})
`;

  fs.writeFileSync(
    path.join(modulePath, "src/validations", `${moduleName}.validation.ts`),
    validationContent,
  );

  // index.ts
  const indexContent = `/**
 * ${pascalCase} Logic Module
 */

// Services
export { ${pascalCase}Service } from './services/${moduleName}.service'
export type {
  I${pascalCase}Repository,
  I${pascalCase}Validation,
} from './services/${moduleName}.service'

// Types
export type * from './types/${moduleName}.types'

// Validations
export * from './validations/${moduleName}.validation'
`;

  fs.writeFileSync(path.join(modulePath, "index.ts"), indexContent);

  console.log(`📄 Generated Logic templates`);
}

function generateDataTemplate(modulePath, moduleName) {
  const schemaContent = `-- ${moduleName} schema
-- Generated: ${new Date().toISOString()}

CREATE TABLE IF NOT EXISTS public.${moduleName} (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_${moduleName}_created_at ON public.${moduleName}(created_at);

-- RLS Policies
ALTER TABLE public.${moduleName} ENABLE ROW LEVEL SECURITY;

-- TODO: Add RLS policies based on requirements

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.${moduleName}
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
`;

  fs.writeFileSync(
    path.join(modulePath, "schemas", `${moduleName}.sql`),
    schemaContent,
  );

  // README
  const readmeContent = `# ${moduleName} Data Module

Database schema for ${moduleName}.

## Tables

### ${moduleName}
Main ${moduleName} table.

**Columns**:
- \`id\` (UUID): Primary key
- \`name\` (TEXT): Name/title
- \`created_at\` (TIMESTAMPTZ): Creation timestamp
- \`updated_at\` (TIMESTAMPTZ): Last update timestamp

## Setup

\`\`\`bash
# Execute schema
psql -f schemas/${moduleName}.sql
\`\`\`

## Migrations

See \`migrations/\` directory for version history.
`;

  fs.writeFileSync(path.join(modulePath, "README.md"), readmeContent);

  console.log(`📄 Generated Data templates`);
}

function generateIntegrationTemplate(modulePath, moduleName, pascalCase) {
  // Provider
  const providerContent = `export interface ${pascalCase}Config {
  apiKey: string
  endpoint?: string
}

export class ${pascalCase}Provider {
  private config: ${pascalCase}Config

  constructor(config: ${pascalCase}Config) {
    this.config = config
  }

  async initialize(): Promise<void> {
    // TODO: Initialize provider
    console.log('${pascalCase}Provider initialized')
  }

  // TODO: Implement provider methods
}
`;

  fs.writeFileSync(
    path.join(modulePath, "src/providers", `${moduleName}.provider.ts`),
    providerContent,
  );

  // index.ts
  const indexContent = `/**
 * ${pascalCase} Integration Module
 */

// Providers
export { ${pascalCase}Provider } from './providers/${moduleName}.provider'
export type { ${pascalCase}Config } from './providers/${moduleName}.provider'
`;

  fs.writeFileSync(path.join(modulePath, "index.ts"), indexContent);

  console.log(`📄 Generated Integration templates`);
}

function generateManifest(modulePath, category, moduleName, description) {
  const now = new Date().toISOString();
  const pascalCase = toPascalCase(moduleName);

  const manifest = {
    id: moduleName,
    name: `${pascalCase} Module`,
    version: "1.0.0",
    category,
    description: description || `Module for ${moduleName}`,
    author: "Bebarter Team",
    license: "MIT",
    exports: getDefaultExports(category),
    dependencies: {
      modules: [],
      packages: getDefaultPackages(category),
    },
    ai: {
      summary: `Provides functionality for ${moduleName}`,
      keywords: [moduleName, category],
      reusable: {
        components: [],
        hooks: [],
        services: [],
        patterns: [],
      },
      usage_scenarios: [],
    },
    tags: [category, moduleName],
    status: "experimental",
    createdAt: now,
    updatedAt: now,
  };

  fs.writeFileSync(
    path.join(modulePath, "module.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`📄 Generated module.json`);
}

function getDefaultExports(category) {
  const exports = {
    ui: { components: [], hooks: [], stores: [], types: [] },
    logic: { services: [], types: [], utils: [] },
    data: {},
    integration: { providers: [] },
  };

  return exports[category];
}

function getDefaultPackages(category) {
  const packages = {
    ui: ["react"],
    logic: ["zod"],
    data: [],
    integration: [],
  };

  return packages[category];
}

function generateDocs(modulePath, moduleName, category) {
  const content = `# ${toPascalCase(moduleName)} Module

## Overview

Category: \`${category}\`

## Usage

TODO: Add usage examples

## API Reference

TODO: Document exports

## Development

\`\`\`bash
# Run tests
npm test -- ${modulePath}
\`\`\`
`;

  fs.writeFileSync(path.join(modulePath, "docs", "README.md"), content);
  console.log(`📄 Generated documentation`);
}

function generateTests(modulePath, category) {
  const testContent = `describe('${moduleName}', () => {
  it('should work', () => {
    // TODO: Add tests
    expect(true).toBe(true)
  })
})
`;

  fs.writeFileSync(
    path.join(modulePath, "tests", `${moduleName}.test.ts`),
    testContent,
  );

  console.log(`📄 Generated test files`);
}

async function registerModule(modulePath) {
  // Implementar registro automático no registry.json
  console.log(`📝 Registering module in registry...`);

  const manifestPath = path.join(modulePath, "module.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  const registryPath = ".modules/registry.json";
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

  const entry = {
    id: manifest.id,
    name: manifest.name,
    path: modulePath,
    version: manifest.version,
    category: manifest.category,
    exports: {
      components: manifest.exports.components?.length || 0,
      hooks: manifest.exports.hooks?.length || 0,
      services: manifest.exports.services?.length || 0,
    },
    keywords: manifest.ai.keywords,
    status: manifest.status,
  };

  registry.categories[manifest.category].push(entry);
  registry.stats.total_modules++;
  registry.stats[manifest.category]++;
  registry.updated = new Date().toISOString();

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log(`✅ Module registered in registry`);
}

function toPascalCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Execute
generateModule().catch((error) => {
  console.error("❌ Error generating module:", error.message);
  process.exit(1);
});
```

#### Instalar dependência

```bash
npm install --save-dev commander
```

#### Adicionar ao package.json

```json
{
  "scripts": {
    "generate:module": "node scripts/modules/generate-module.js"
  }
}
```

#### Testar

```bash
npm run generate:module product-catalog --category ui --description "Product catalog UI components"
```

---

### Tarefa 3.2: Criar CLI de Módulos

#### Arquivo: `scripts/modules/cli.js`

```javascript
#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs");
const path = require("path");

/**
 * CLI para gerenciamento de módulos
 */

program
  .name("modules")
  .description("CLI for module management")
  .version("1.0.0");

// Lista módulos
program
  .command("list")
  .description("List all modules")
  .option("-c, --category <category>", "Filter by category")
  .option("-s, --status <status>", "Filter by status")
  .action((options) => {
    const registry = JSON.parse(
      fs.readFileSync(".modules/registry.json", "utf8"),
    );

    console.log("\n📚 Registered Modules\n");

    Object.entries(registry.categories).forEach(([category, modules]) => {
      if (options.category && category !== options.category) return;
      if (modules.length === 0) return;

      console.log(`\n📁 ${category.toUpperCase()} (${modules.length})`);
      console.log("─".repeat(50));

      modules.forEach((module) => {
        if (options.status && module.status !== options.status) return;

        const status = {
          stable: "✅",
          experimental: "🧪",
          deprecated: "⚠️",
        }[module.status];

        console.log(`${status} ${module.name} (${module.version})`);
        console.log(`   └─ ${module.path}`);
        console.log(`   └─ Keywords: ${module.keywords.join(", ")}`);
      });
    });

    console.log(`\n📊 Total: ${registry.stats.total_modules} modules\n`);
  });

// Busca módulos
program
  .command("search <keyword>")
  .description("Search modules by keyword")
  .action((keyword) => {
    const registry = JSON.parse(
      fs.readFileSync(".modules/registry.json", "utf8"),
    );

    console.log(`\n🔍 Searching for: "${keyword}"\n`);

    let found = 0;

    Object.entries(registry.categories).forEach(([category, modules]) => {
      modules.forEach((module) => {
        const matchName = module.name
          .toLowerCase()
          .includes(keyword.toLowerCase());
        const matchKeywords = module.keywords.some((k) =>
          k.toLowerCase().includes(keyword.toLowerCase()),
        );

        if (matchName || matchKeywords) {
          console.log(`✅ ${module.name} (${module.category})`);
          console.log(`   └─ ${module.path}`);
          console.log(`   └─ ${module.description || "No description"}`);
          console.log("");
          found++;
        }
      });
    });

    if (found === 0) {
      console.log("❌ No modules found");
    } else {
      console.log(`📊 Found ${found} module(s)`);
    }
  });

// Info de módulo
program
  .command("info <module-id>")
  .description("Show detailed information about a module")
  .action((moduleId) => {
    const manifestPath = findModuleManifest(moduleId);

    if (!manifestPath) {
      console.error(`❌ Module not found: ${moduleId}`);
      process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    console.log(`\n📦 ${manifest.name}\n`);
    console.log(`ID:          ${manifest.id}`);
    console.log(`Version:     ${manifest.version}`);
    console.log(`Category:    ${manifest.category}`);
    console.log(`Status:      ${manifest.status}`);
    console.log(`Description: ${manifest.description}`);
    console.log(`\n📤 Exports:`);

    Object.entries(manifest.exports).forEach(([type, items]) => {
      if (Array.isArray(items) && items.length > 0) {
        console.log(`   ${type}: ${items.length}`);
      }
    });

    console.log(`\n🔗 Dependencies:`);
    console.log(
      `   Modules:  ${manifest.dependencies.modules.join(", ") || "none"}`,
    );
    console.log(
      `   Packages: ${manifest.dependencies.packages.join(", ") || "none"}`,
    );

    console.log(`\n🤖 AI Metadata:`);
    console.log(`   Summary: ${manifest.ai.summary}`);
    console.log(`   Keywords: ${manifest.ai.keywords.join(", ")}`);

    console.log("");
  });

// Valida módulo
program
  .command("validate [module-id]")
  .description("Validate module manifest")
  .action((moduleId) => {
    if (moduleId) {
      validateModule(moduleId);
    } else {
      validateAllModules();
    }
  });

// Remover módulo
program
  .command("remove <module-id>")
  .description("Remove a module")
  .option("--force", "Force removal without confirmation")
  .action((moduleId, options) => {
    const manifestPath = findModuleManifest(moduleId);

    if (!manifestPath) {
      console.error(`❌ Module not found: ${moduleId}`);
      process.exit(1);
    }

    if (!options.force) {
      console.log(`⚠️  This will permanently delete module: ${moduleId}`);
      console.log(`   Use --force to confirm`);
      process.exit(1);
    }

    const modulePath = path.dirname(manifestPath);

    // Remover do registry
    removeFromRegistry(moduleId);

    // Remover diretório
    fs.rmSync(modulePath, { recursive: true, force: true });

    console.log(`✅ Module removed: ${moduleId}`);
  });

// Sincronizar registry
program
  .command("sync")
  .description("Sync registry with actual modules")
  .action(() => {
    console.log("🔄 Syncing registry...\n");

    const registry = {
      version: "1.0.0",
      updated: new Date().toISOString(),
      categories: {
        ui: [],
        logic: [],
        data: [],
        integration: [],
      },
      stats: {
        total_modules: 0,
        ui: 0,
        logic: 0,
        data: 0,
        integration: 0,
      },
    };

    // Scan modules
    const categories = ["ui", "logic", "data", "integration"];

    categories.forEach((category) => {
      const categoryPath = path.join("modules", category);

      if (!fs.existsSync(categoryPath)) return;

      const modules = fs.readdirSync(categoryPath);

      modules.forEach((moduleDir) => {
        const manifestPath = path.join(categoryPath, moduleDir, "module.json");

        if (!fs.existsSync(manifestPath)) return;

        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

          const entry = {
            id: manifest.id,
            name: manifest.name,
            path: path.join("modules", category, moduleDir),
            version: manifest.version,
            category: manifest.category,
            exports: {
              components: manifest.exports.components?.length || 0,
              hooks: manifest.exports.hooks?.length || 0,
              services: manifest.exports.services?.length || 0,
            },
            keywords: manifest.ai.keywords,
            status: manifest.status,
          };

          registry.categories[category].push(entry);
          registry.stats.total_modules++;
          registry.stats[category]++;

          console.log(`✅ ${manifest.id}`);
        } catch (error) {
          console.log(`❌ ${moduleDir}: ${error.message}`);
        }
      });
    });

    fs.writeFileSync(
      ".modules/registry.json",
      JSON.stringify(registry, null, 2),
    );

    console.log(
      `\n✅ Registry synced: ${registry.stats.total_modules} modules`,
    );
  });

// Helper functions
function findModuleManifest(moduleId) {
  const categories = ["ui", "logic", "data", "integration"];

  for (const category of categories) {
    const manifestPath = path.join(
      "modules",
      category,
      moduleId,
      "module.json",
    );
    if (fs.existsSync(manifestPath)) {
      return manifestPath;
    }
  }

  return null;
}

function validateModule(moduleId) {
  const manifestPath = findModuleManifest(moduleId);

  if (!manifestPath) {
    console.error(`❌ Module not found: ${moduleId}`);
    process.exit(1);
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const { validateManifest } = require("../../.modules/schema");

    validateManifest(manifest);

    console.log(`✅ ${moduleId}: valid`);
  } catch (error) {
    console.error(`❌ ${moduleId}: ${error.message}`);
    process.exit(1);
  }
}

function validateAllModules() {
  const registry = JSON.parse(
    fs.readFileSync(".modules/registry.json", "utf8"),
  );
  let errors = 0;

  console.log("🔍 Validating all modules...\n");

  Object.entries(registry.categories).forEach(([category, modules]) => {
    modules.forEach((module) => {
      try {
        validateModule(module.id);
      } catch (error) {
        errors++;
      }
    });
  });

  if (errors === 0) {
    console.log("\n✅ All modules valid");
  } else {
    console.log(`\n❌ ${errors} module(s) with errors`);
    process.exit(1);
  }
}

function removeFromRegistry(moduleId) {
  const registry = JSON.parse(
    fs.readFileSync(".modules/registry.json", "utf8"),
  );

  Object.entries(registry.categories).forEach(([category, modules]) => {
    registry.categories[category] = modules.filter((m) => m.id !== moduleId);
  });

  // Recalcular stats
  registry.stats = {
    total_modules: 0,
    ui: registry.categories.ui.length,
    logic: registry.categories.logic.length,
    data: registry.categories.data.length,
    integration: registry.categories.integration.length,
  };
  registry.stats.total_modules =
    registry.stats.ui +
    registry.stats.logic +
    registry.stats.data +
    registry.stats.integration;

  registry.updated = new Date().toISOString();

  fs.writeFileSync(".modules/registry.json", JSON.stringify(registry, null, 2));
}

program.parse();
```

#### Adicionar ao package.json

```json
{
  "scripts": {
    "modules": "node scripts/modules/cli.js",
    "modules:list": "node scripts/modules/cli.js list",
    "modules:search": "node scripts/modules/cli.js search",
    "modules:sync": "node scripts/modules/cli.js sync"
  }
}
```

#### Testar

```bash
# Listar módulos
npm run modules:list

# Buscar
npm run modules:search user

# Info detalhado
npm run modules info user-profile-ui

# Sincronizar
npm run modules:sync

# Validar
npm run modules validate
```

---

### Tarefa 3.3: Scripts de Descoberta para IA

#### Arquivo: `scripts/modules/discover.js`

```javascript
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Scripts de descoberta para IA
 *
 * Permitem que IA encontre módulos, componentes e funcionalidades
 * rapidamente consultando o registry ao invés de varrer código.
 */

class ModuleDiscovery {
  constructor() {
    this.registry = JSON.parse(
      fs.readFileSync(".modules/registry.json", "utf8"),
    );
    this.cache = this.loadCache();
  }

  loadCache() {
    const cachePath = ".modules/cache/search-index.json";
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, "utf8"));
    }
    return { components: {}, hooks: {}, services: {}, last_updated: null };
  }

  saveCache() {
    const cachePath = ".modules/cache/search-index.json";
    fs.writeFileSync(cachePath, JSON.stringify(this.cache, null, 2));
  }

  /**
   * Encontra módulos por categoria
   */
  findByCategory(category) {
    return this.registry.categories[category] || [];
  }

  /**
   * Encontra módulos por keywords
   */
  findByKeywords(keywords) {
    const results = [];

    Object.values(this.registry.categories).forEach((modules) => {
      modules.forEach((module) => {
        const matches = keywords.some((keyword) =>
          module.keywords.some((k) =>
            k.toLowerCase().includes(keyword.toLowerCase()),
          ),
        );

        if (matches) {
          results.push(module);
        }
      });
    });

    return results;
  }

  /**
   * Encontra componentes reutilizáveis
   */
  findReusableComponents(query) {
    const results = [];

    this.registry.categories.ui.forEach((module) => {
      const manifestPath = path.join(module.path, "module.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

      manifest.exports.components?.forEach((component) => {
        const match =
          component.name.toLowerCase().includes(query.toLowerCase()) ||
          component.description?.toLowerCase().includes(query.toLowerCase());

        if (match) {
          results.push({
            name: component.name,
            module: module.id,
            path: `@/modules/ui/${module.id}`,
            props: component.props,
            example: component.example,
            description: component.description,
          });
        }
      });
    });

    return results;
  }

  /**
   * Encontra hooks reutilizáveis
   */
  findReusableHooks(query) {
    const results = [];

    this.registry.categories.ui.forEach((module) => {
      const manifestPath = path.join(module.path, "module.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

      manifest.exports.hooks?.forEach((hook) => {
        const match =
          hook.name.toLowerCase().includes(query.toLowerCase()) ||
          hook.description?.toLowerCase().includes(query.toLowerCase());

        if (match) {
          results.push({
            name: hook.name,
            module: module.id,
            path: `@/modules/ui/${module.id}`,
            returns: hook.returns,
            example: hook.example,
            description: hook.description,
          });
        }
      });
    });

    return results;
  }

  /**
   * Encontra services por domínio
   */
  findServices(domain) {
    const results = [];

    this.registry.categories.logic.forEach((module) => {
      const manifestPath = path.join(module.path, "module.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

      manifest.exports.services?.forEach((service) => {
        const match =
          service.name.toLowerCase().includes(domain.toLowerCase()) ||
          manifest.ai.keywords.some((k) =>
            k.toLowerCase().includes(domain.toLowerCase()),
          );

        if (match) {
          results.push({
            name: service.name,
            module: module.id,
            path: `@/modules/logic/${module.id}`,
            methods: service.methods,
            dependencies: service.dependencies,
            example: service.example,
            description: service.description,
          });
        }
      });
    });

    return results;
  }

  /**
   * Obter exemplos de uso
   */
  getUsageExamples(componentName) {
    const results = [];

    Object.values(this.registry.categories).forEach((modules) => {
      modules.forEach((module) => {
        const manifestPath = path.join(module.path, "module.json");
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

        ["components", "hooks", "services"].forEach((type) => {
          manifest.exports[type]?.forEach((item) => {
            if (item.name === componentName && item.example) {
              results.push({
                type,
                module: module.id,
                example: item.example,
                description: item.description,
              });
            }
          });
        });
      });
    });

    return results;
  }

  /**
   * Criar índice de busca (cache)
   */
  buildSearchIndex() {
    const index = {
      components: {},
      hooks: {},
      services: {},
      last_updated: new Date().toISOString(),
    };

    this.registry.categories.ui.forEach((module) => {
      const manifestPath = path.join(module.path, "module.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

      manifest.exports.components?.forEach((component) => {
        index.components[component.name] = {
          module: module.id,
          path: `@/modules/ui/${module.id}`,
          props: component.props,
          example: component.example,
          description: component.description,
        };
      });

      manifest.exports.hooks?.forEach((hook) => {
        index.hooks[hook.name] = {
          module: module.id,
          path: `@/modules/ui/${module.id}`,
          returns: hook.returns,
          example: hook.example,
          description: hook.description,
        };
      });
    });

    this.registry.categories.logic.forEach((module) => {
      const manifestPath = path.join(module.path, "module.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

      manifest.exports.services?.forEach((service) => {
        index.services[service.name] = {
          module: module.id,
          path: `@/modules/logic/${module.id}`,
          methods: service.methods,
          dependencies: service.dependencies,
          example: service.example,
          description: service.description,
        };
      });
    });

    this.cache = index;
    this.saveCache();

    return index;
  }
}

// CLI interface
if (require.main === module) {
  const discovery = new ModuleDiscovery();
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case "category":
      console.log(JSON.stringify(discovery.findByCategory(arg), null, 2));
      break;

    case "keywords":
      const keywords = process.argv.slice(3);
      console.log(JSON.stringify(discovery.findByKeywords(keywords), null, 2));
      break;

    case "components":
      console.log(
        JSON.stringify(discovery.findReusableComponents(arg), null, 2),
      );
      break;

    case "hooks":
      console.log(JSON.stringify(discovery.findReusableHooks(arg), null, 2));
      break;

    case "services":
      console.log(JSON.stringify(discovery.findServices(arg), null, 2));
      break;

    case "examples":
      console.log(JSON.stringify(discovery.getUsageExamples(arg), null, 2));
      break;

    case "index":
      console.log("🔨 Building search index...");
      discovery.buildSearchIndex();
      console.log("✅ Search index created");
      break;

    default:
      console.log(`
Usage: node scripts/modules/discover.js <command> [args]

Commands:
  category <ui|logic|data|integration>  Find modules by category
  keywords <keyword1> <keyword2>        Find modules by keywords
  components <query>                    Find reusable components
  hooks <query>                         Find reusable hooks
  services <domain>                     Find services by domain
  examples <componentName>              Get usage examples
  index                                 Build search index
      `);
  }
}

module.exports = ModuleDiscovery;
```

#### Adicionar ao package.json

```json
{
  "scripts": {
    "modules:discover": "node scripts/modules/discover.js",
    "modules:index": "node scripts/modules/discover.js index"
  }
}
```

#### Testar

```bash
# Criar índice de busca
npm run modules:index

# Buscar componentes
node scripts/modules/discover.js components "list"

# Buscar hooks
node scripts/modules/discover.js hooks "user"

# Buscar services
node scripts/modules/discover.js services "user"

# Obter exemplos
node scripts/modules/discover.js examples "UserList"
```

---

## ✅ Entregáveis

Ao final da Fase 3:

### 1. Gerador de Módulos

- ✅ `generate-module.js` completo
- ✅ Templates por categoria
- ✅ Auto-registro no registry

### 2. CLI Completo

- ✅ `list`, `search`, `info`, `validate`, `remove`, `sync`
- ✅ Comandos npm scripts

### 3. Discovery System

- ✅ Scripts de descoberta para IA
- ✅ Search index (cache)
- ✅ Queries otimizadas

### 4. Automação

- ✅ Atualização automática de registry
- ✅ Validação de manifests
- ✅ Templates reutilizáveis

---

## 🧪 Testes de Validação

```bash
# 1. Gerar módulo de teste
npm run generate:module test-module --category ui

# 2. Verificar registro
npm run modules:list

# 3. Buscar módulo
npm run modules:search test

# 4. Ver detalhes
npm run modules info test-module

# 5. Criar índice
npm run modules:index

# 6. Remover teste
npm run modules remove test-module --force

# 7. Sincronizar
npm run modules:sync
```

---

## 📊 Checklist de Conclusão

- [ ] generate-module.js implementado e testado
- [ ] CLI de módulos completo
- [ ] Scripts de descoberta funcionando
- [ ] Search index sendo gerado
- [ ] Templates por categoria criados
- [ ] Validações automáticas funcionando
- [ ] Documentação de comandos criada
- [ ] Testes passando

---

## 🚀 Próximos Passos

**[Fase 4 - Otimização IA](./04-FASE-4-OTIMIZACAO-IA.md)**

Na Fase 4, você irá:

- Criar prompts especializados para agentes
- Implementar sistema de sugestões inteligentes
- Otimizar cache e performance
- Criar dashboards e métricas

---

**Última atualização**: 2025-01-11
**Duração estimada**: 3-4 dias
**Fase anterior**: [Fase 2 - Migração](./02-FASE-2-MIGRACAO.md)
**Próxima fase**: [Fase 4 - Otimização IA](./04-FASE-4-OTIMIZACAO-IA.md)
