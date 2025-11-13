#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Module Generator
 * Creates new modules with proper structure and templates
 */

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function toPascalCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`  ✓ Created ${filePath}`);
}

// =====================================================
// UI MODULE TEMPLATES
// =====================================================

function generateUITemplate(moduleName, modulePath) {
  const pascalName = toPascalCase(moduleName);
  const camelName = toCamelCase(moduleName);

  // Create directory structure
  const dirs = [
    path.join(modulePath, "src/components"),
    path.join(modulePath, "src/hooks"),
    path.join(modulePath, "src/stores"),
    path.join(modulePath, "src/types"),
    path.join(modulePath, "docs"),
    path.join(modulePath, "tests"),
  ];

  dirs.forEach(ensureDir);

  // Types
  const typesContent = `// ${pascalName} types
export interface ${pascalName}Item {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Create${pascalName}Input {
  name: string
}

export interface Update${pascalName}Input {
  name?: string
}
`;

  writeFile(path.join(modulePath, "src/types/index.ts"), typesContent);

  // Store
  const storeContent = `import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ${pascalName}Item } from '../types'

interface ${pascalName}State {
  items: ${pascalName}Item[]
  isLoading: boolean
  error: string | null
}

interface ${pascalName}Actions {
  setItems: (items: ${pascalName}Item[]) => void
  addItem: (item: ${pascalName}Item) => void
  updateItem: (id: string, updates: Partial<${pascalName}Item>) => void
  removeItem: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export type ${pascalName}Store = ${pascalName}State & ${pascalName}Actions

const initialState: ${pascalName}State = {
  items: [],
  isLoading: false,
  error: null,
}

export const use${pascalName}Store = create<${pascalName}Store>()(
  devtools(
    (set) => ({
      ...initialState,

      setItems: (items) => set({ items, error: null }, false, '${camelName}/setItems'),

      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] }), false, '${camelName}/addItem'),

      updateItem: (id, updates) =>
        set(
          (state) => ({
            items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
          }),
          false,
          '${camelName}/updateItem'
        ),

      removeItem: (id) =>
        set(
          (state) => ({ items: state.items.filter((item) => item.id !== id) }),
          false,
          '${camelName}/removeItem'
        ),

      setLoading: (isLoading) => set({ isLoading }, false, '${camelName}/setLoading'),

      setError: (error) => set({ error }, false, '${camelName}/setError'),

      reset: () => set(initialState, false, '${camelName}/reset'),
    }),
    { name: '${camelName}-store' }
  )
)
`;

  writeFile(
    path.join(modulePath, "src/stores", `${moduleName}.store.ts`),
    storeContent,
  );

  // Hook
  const hookContent = `import { useCallback } from 'react'
import { use${pascalName}Store } from '../stores/${moduleName}.store'
import type { Create${pascalName}Input, Update${pascalName}Input } from '../types'

export const use${pascalName} = () => {
  const { items, isLoading, error, setItems, addItem, updateItem, removeItem, setLoading, setError } =
    use${pascalName}Store()

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Implement service call
      // const service = get${pascalName}Service()
      // const result = await service.getItems()

      const result = [] // Mock

      setItems(result)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }, [setItems, setLoading, setError])

  const createItem = useCallback(
    async (input: Create${pascalName}Input) => {
      try {
        setLoading(true)
        setError(null)

        // TODO: Implement service call
        const newItem = {
          id: crypto.randomUUID(),
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        addItem(newItem)
        return newItem
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create item'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [addItem, setLoading, setError]
  )

  const updateItemById = useCallback(
    async (id: string, input: Update${pascalName}Input) => {
      try {
        setLoading(true)
        setError(null)

        // TODO: Implement service call
        const updates = { ...input, updatedAt: new Date() }

        updateItem(id, updates)
        return updates
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update item'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [updateItem, setLoading, setError]
  )

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        setError(null)

        // TODO: Implement service call
        removeItem(id)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete item'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [removeItem, setLoading, setError]
  )

  return {
    items,
    isLoading,
    error,
    fetchItems,
    createItem,
    updateItem: updateItemById,
    deleteItem,
  }
}
`;

  writeFile(
    path.join(modulePath, "src/hooks", `use${pascalName}.ts`),
    hookContent,
  );

  // Component
  const componentContent = `import { useEffect } from 'react'
import { use${pascalName} } from '../hooks/use${pascalName}'

interface ${pascalName}ListProps {
  className?: string
}

export const ${pascalName}List = ({ className }: ${pascalName}ListProps) => {
  const { items, isLoading, error, fetchItems, deleteItem } = use${pascalName}()

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>
  }

  if (items.length === 0) {
    return <div className="text-center p-4 text-gray-500">No items found</div>
  }

  return (
    <div className={className || 'space-y-4'}>
      <h2 className="text-2xl font-bold">${pascalName} List</h2>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{item.name}</h3>
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
`;

  writeFile(
    path.join(modulePath, "src/components", `${pascalName}List.tsx`),
    componentContent,
  );

  // Index
  const indexContent = `// ${pascalName} UI Module

// Components
export { ${pascalName}List } from './src/components/${pascalName}List'

// Hooks
export { use${pascalName} } from './src/hooks/use${pascalName}'

// Store
export { use${pascalName}Store } from './src/stores/${moduleName}.store'
export type { ${pascalName}Store } from './src/stores/${moduleName}.store'

// Types
export type { ${pascalName}Item, Create${pascalName}Input, Update${pascalName}Input } from './src/types'
`;

  writeFile(path.join(modulePath, "index.ts"), indexContent);

  // README
  const readmeContent = `# ${pascalName} UI Module

> UI components, hooks and stores for ${moduleName}

## Usage

\`\`\`typescript
import { ${pascalName}List, use${pascalName} } from '@/modules/ui/${moduleName}'

// Use component
<${pascalName}List />

// Or use hook
const { items, fetchItems, createItem } = use${pascalName}()
\`\`\`

## Exports

- **Components**: ${pascalName}List
- **Hooks**: use${pascalName}
- **Store**: use${pascalName}Store
- **Types**: ${pascalName}Item, Create${pascalName}Input, Update${pascalName}Input

## Development

\`\`\`bash
npm test -- modules/ui/${moduleName}
\`\`\`
`;

  writeFile(path.join(modulePath, "docs/README.md"), readmeContent);
}

// =====================================================
// LOGIC MODULE TEMPLATES
// =====================================================

function generateLogicTemplate(moduleName, modulePath) {
  const pascalName = toPascalCase(moduleName);

  // Create directory structure
  const dirs = [
    path.join(modulePath, "src/services"),
    path.join(modulePath, "src/repositories"),
    path.join(modulePath, "src/validations"),
    path.join(modulePath, "src/types"),
    path.join(modulePath, "docs"),
    path.join(modulePath, "tests"),
  ];

  dirs.forEach(ensureDir);

  // Types
  const typesContent = `// ${pascalName} domain types
export interface ${pascalName}Item {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Create${pascalName}Input {
  name: string
}

export interface Update${pascalName}Input {
  name?: string
}
`;

  writeFile(path.join(modulePath, "src/types/index.ts"), typesContent);

  // Repository Interface
  const repositoryContent = `import type { ${pascalName}Item, Create${pascalName}Input, Update${pascalName}Input } from '../types'

/**
 * Repository interface for ${pascalName} data access
 */
export interface I${pascalName}Repository {
  findById(id: string): Promise<${pascalName}Item | null>
  findMany(): Promise<${pascalName}Item[]>
  create(input: Create${pascalName}Input): Promise<${pascalName}Item>
  update(id: string, input: Update${pascalName}Input): Promise<${pascalName}Item>
  delete(id: string): Promise<void>
}
`;

  writeFile(
    path.join(
      modulePath,
      "src/repositories",
      `${moduleName}.repository.interface.ts`,
    ),
    repositoryContent,
  );

  // Validation
  const validationContent = `import type { Create${pascalName}Input, Update${pascalName}Input } from '../types'

export interface I${pascalName}Validation {
  validateCreateInput(input: Create${pascalName}Input): Promise<void>
  validateUpdateInput(input: Update${pascalName}Input): Promise<void>
}

export class ${pascalName}Validation implements I${pascalName}Validation {
  async validateCreateInput(input: Create${pascalName}Input): Promise<void> {
    const errors: string[] = []

    if (!input.name) {
      errors.push('Name is required')
    } else if (input.name.length < 2) {
      errors.push('Name must be at least 2 characters')
    } else if (input.name.length > 100) {
      errors.push('Name must be less than 100 characters')
    }

    if (errors.length > 0) {
      throw new Error(\`Validation failed: \${errors.join(', ')}\`)
    }
  }

  async validateUpdateInput(input: Update${pascalName}Input): Promise<void> {
    const errors: string[] = []

    if (input.name !== undefined) {
      if (input.name.length < 2) {
        errors.push('Name must be at least 2 characters')
      } else if (input.name.length > 100) {
        errors.push('Name must be less than 100 characters')
      }
    }

    if (errors.length > 0) {
      throw new Error(\`Validation failed: \${errors.join(', ')}\`)
    }
  }
}
`;

  writeFile(
    path.join(modulePath, "src/validations", `${moduleName}.validation.ts`),
    validationContent,
  );

  // Service
  const serviceContent = `import type { ${pascalName}Item, Create${pascalName}Input, Update${pascalName}Input } from '../types'
import type { I${pascalName}Repository } from '../repositories/${moduleName}.repository.interface'
import type { I${pascalName}Validation } from '../validations/${moduleName}.validation'

/**
 * ${pascalName}Service - Business logic following SOLID principles
 */
export class ${pascalName}Service {
  constructor(
    private repository: I${pascalName}Repository,
    private validation: I${pascalName}Validation
  ) {}

  async getById(id: string): Promise<${pascalName}Item | null> {
    if (!id) throw new Error('ID is required')
    return this.repository.findById(id)
  }

  async getAll(): Promise<${pascalName}Item[]> {
    return this.repository.findMany()
  }

  async create(input: Create${pascalName}Input): Promise<${pascalName}Item> {
    await this.validation.validateCreateInput(input)
    return this.repository.create(input)
  }

  async update(id: string, input: Update${pascalName}Input): Promise<${pascalName}Item> {
    if (!id) throw new Error('ID is required')

    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('Item not found')
    }

    await this.validation.validateUpdateInput(input)
    return this.repository.update(id, input)
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('ID is required')

    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('Item not found')
    }

    await this.repository.delete(id)
  }
}
`;

  writeFile(
    path.join(modulePath, "src/services", `${moduleName}.service.ts`),
    serviceContent,
  );

  // Index
  const indexContent = `// ${pascalName} Logic Module

// Services
export { ${pascalName}Service } from './src/services/${moduleName}.service'

// Repositories
export type { I${pascalName}Repository } from './src/repositories/${moduleName}.repository.interface'

// Validations
export { ${pascalName}Validation } from './src/validations/${moduleName}.validation'
export type { I${pascalName}Validation } from './src/validations/${moduleName}.validation'

// Types
export type { ${pascalName}Item, Create${pascalName}Input, Update${pascalName}Input } from './src/types'
`;

  writeFile(path.join(modulePath, "index.ts"), indexContent);

  // README
  const readmeContent = `# ${pascalName} Logic Module

> Business logic for ${moduleName} following SOLID principles

## Usage

\`\`\`typescript
import { ${pascalName}Service, I${pascalName}Repository, ${pascalName}Validation } from '@/modules/logic/${moduleName}'

// Create service with dependencies
const repository = new My${pascalName}Repository()
const validation = new ${pascalName}Validation()
const service = new ${pascalName}Service(repository, validation)

// Use service
const item = await service.getById('123')
\`\`\`

## Exports

- **Service**: ${pascalName}Service
- **Repository Interface**: I${pascalName}Repository
- **Validation**: ${pascalName}Validation, I${pascalName}Validation
- **Types**: ${pascalName}Item, Create${pascalName}Input, Update${pascalName}Input
`;

  writeFile(path.join(modulePath, "docs/README.md"), readmeContent);
}

// =====================================================
// DATA MODULE TEMPLATES
// =====================================================

function generateDataTemplate(moduleName, modulePath) {
  const pascalName = toPascalCase(moduleName);
  const tableName = moduleName.replace(/-/g, "_");

  // Create directory structure
  const dirs = [
    path.join(modulePath, "schemas"),
    path.join(modulePath, "migrations"),
    path.join(modulePath, "queries"),
    path.join(modulePath, "docs"),
  ];

  dirs.forEach(ensureDir);

  // Schema
  const schemaContent = `-- ${pascalName} Table Schema
-- Version: 1.0.0

CREATE TABLE IF NOT EXISTS public.${tableName} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT ${tableName}_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 100)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_${tableName}_name ON public.${tableName}(name);
CREATE INDEX IF NOT EXISTS idx_${tableName}_created_at ON public.${tableName}(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON public.${tableName};
CREATE TRIGGER update_${tableName}_updated_at
  BEFORE UPDATE ON public.${tableName}
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON public.${tableName}
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grants
GRANT ALL ON public.${tableName} TO authenticated;
`;

  writeFile(
    path.join(modulePath, "schemas", `${tableName}.sql`),
    schemaContent,
  );

  // Migration
  const migrationContent = `-- Migration: 001_create_${tableName}_table
-- Created: ${new Date().toISOString().split("T")[0]}

BEGIN;

-- Execute schema
\\i ../schemas/${tableName}.sql

COMMIT;
`;

  writeFile(
    path.join(modulePath, "migrations", `001_create_${tableName}_table.sql`),
    migrationContent,
  );

  // Queries
  const queriesContent = `-- ${pascalName} Queries

-- Get by ID
SELECT * FROM public.${tableName} WHERE id = $1;

-- Get all
SELECT * FROM public.${tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- Create
INSERT INTO public.${tableName} (name) VALUES ($1) RETURNING *;

-- Update
UPDATE public.${tableName} SET name = $1 WHERE id = $2 RETURNING *;

-- Delete
DELETE FROM public.${tableName} WHERE id = $1;
`;

  writeFile(
    path.join(modulePath, "queries", `${tableName}.sql`),
    queriesContent,
  );

  // README
  const readmeContent = `# ${pascalName} Data Module

> Database schema and queries for ${moduleName}

## Installation

Execute migration in Supabase SQL Editor:

\`\`\`bash
# Run migration
modules/data/${moduleName}/migrations/001_create_${tableName}_table.sql
\`\`\`

## Schema

Table: \`public.${tableName}\`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Item name |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Queries

See \`queries/${tableName}.sql\` for reusable SQL queries.
`;

  writeFile(path.join(modulePath, "README.md"), readmeContent);
}

// =====================================================
// INTEGRATION MODULE TEMPLATES
// =====================================================

function generateIntegrationTemplate(moduleName, modulePath) {
  const pascalName = toPascalCase(moduleName);

  // Create directory structure
  const dirs = [
    path.join(modulePath, "src/providers"),
    path.join(modulePath, "src/adapters"),
    path.join(modulePath, "src/types"),
    path.join(modulePath, "docs"),
    path.join(modulePath, "tests"),
  ];

  dirs.forEach(ensureDir);

  // Types
  const typesContent = `// ${pascalName} integration types
export interface ${pascalName}Config {
  apiKey: string
  baseUrl?: string
}

export interface ${pascalName}Response<T = any> {
  data: T
  status: number
  message?: string
}
`;

  writeFile(path.join(modulePath, "src/types/index.ts"), typesContent);

  // Provider
  const providerContent = `import type { ${pascalName}Config, ${pascalName}Response } from '../types'

export class ${pascalName}Provider {
  private config: ${pascalName}Config

  constructor(config: ${pascalName}Config) {
    this.config = config
  }

  async get<T>(endpoint: string): Promise<${pascalName}Response<T>> {
    // TODO: Implement HTTP GET
    throw new Error('Not implemented')
  }

  async post<T>(endpoint: string, data: any): Promise<${pascalName}Response<T>> {
    // TODO: Implement HTTP POST
    throw new Error('Not implemented')
  }
}
`;

  writeFile(
    path.join(modulePath, "src/providers", `${moduleName}.provider.ts`),
    providerContent,
  );

  // Index
  const indexContent = `// ${pascalName} Integration Module

// Providers
export { ${pascalName}Provider } from './src/providers/${moduleName}.provider'

// Types
export type { ${pascalName}Config, ${pascalName}Response } from './src/types'
`;

  writeFile(path.join(modulePath, "index.ts"), indexContent);

  // README
  const readmeContent = `# ${pascalName} Integration Module

> Integration with ${pascalName} external service

## Usage

\`\`\`typescript
import { ${pascalName}Provider } from '@/modules/integration/${moduleName}'

const provider = new ${pascalName}Provider({
  apiKey: process.env.${moduleName.toUpperCase().replace(/-/g, "_")}_API_KEY || ''
})

const response = await provider.get('/endpoint')
\`\`\`
`;

  writeFile(path.join(modulePath, "docs/README.md"), readmeContent);
}

// =====================================================
// MODULE.JSON GENERATION
// =====================================================

function generateModuleJson(moduleName, category, modulePath) {
  const pascalName = toPascalCase(moduleName);
  const now = new Date().toISOString();

  const manifest = {
    id: moduleName,
    name: pascalName.replace(/([A-Z])/g, " $1").trim(),
    version: "1.0.0",
    category,
    description: `${pascalName} module - Auto-generated`,
    exports: getExportsForCategory(category, moduleName, pascalName),
    dependencies: {
      modules: [],
      packages: getDependenciesForCategory(category),
    },
    ai: {
      summary: `${pascalName} module for ${category} layer`,
      keywords: [moduleName, category],
      use_cases: [`Manage ${moduleName}`],
      reusable: getReusableForCategory(category, pascalName),
      examples: [
        `import { ${pascalName} } from '@/modules/${category}/${moduleName}'`,
      ],
    },
    status: "experimental",
    createdAt: now,
    updatedAt: now,
    author: "Auto-generated",
    license: "MIT",
    tags: [category, moduleName],
    relatedFiles: [],
  };

  writeFile(
    path.join(modulePath, "module.json"),
    JSON.stringify(manifest, null, 2),
  );
}

function getExportsForCategory(category, moduleName, pascalName) {
  switch (category) {
    case "ui":
      return {
        components: [
          { name: `${pascalName}List`, path: `./components/${pascalName}List` },
        ],
        hooks: [{ name: `use${pascalName}`, path: `./hooks/use${pascalName}` }],
        stores: [
          {
            name: `use${pascalName}Store`,
            path: `./stores/${moduleName}.store`,
          },
        ],
        types: [{ name: `${pascalName}Item`, path: "./types" }],
      };
    case "logic":
      return {
        services: [
          {
            name: `${pascalName}Service`,
            path: `./services/${moduleName}.service`,
          },
        ],
        types: [{ name: `I${pascalName}Repository`, path: "./repositories" }],
      };
    case "data":
      return {
        schemas: [{ name: `${moduleName}_table`, path: "./schemas" }],
      };
    case "integration":
      return {
        services: [
          {
            name: `${pascalName}Provider`,
            path: `./providers/${moduleName}.provider`,
          },
        ],
      };
    default:
      return {};
  }
}

function getDependenciesForCategory(category) {
  switch (category) {
    case "ui":
      return ["react", "zustand"];
    case "logic":
      return [];
    case "data":
      return [];
    case "integration":
      return [];
    default:
      return [];
  }
}

function getReusableForCategory(category, pascalName) {
  switch (category) {
    case "ui":
      return {
        components: [`${pascalName}List`],
        hooks: [`use${pascalName}`],
      };
    case "logic":
      return {
        services: [`${pascalName}Service`],
      };
    case "data":
      return {
        schemas: [`${pascalName.toLowerCase()}_table`],
      };
    case "integration":
      return {
        services: [`${pascalName}Provider`],
      };
    default:
      return {};
  }
}

// =====================================================
// REGISTRY FUNCTIONS
// =====================================================

function registerModule(moduleName, category, modulePath) {
  const registryPath = path.join(process.cwd(), ".modules/registry.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

  const manifestPath = path.join(modulePath, "module.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  const entry = {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    category: manifest.category,
    path: path.relative(process.cwd(), modulePath).replace(/\\/g, "/"),
    description: manifest.description,
    keywords: manifest.ai.keywords,
    status: manifest.status,
    updatedAt: manifest.updatedAt,
    reusableCount: Object.values(manifest.ai.reusable || {}).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0,
    ),
  };

  // Add to category
  if (!registry.categories[category].find((m) => m.id === entry.id)) {
    registry.categories[category].push(entry);
  }

  // Update stats
  registry.stats.total_modules = Object.values(registry.categories).reduce(
    (sum, cat) => sum + cat.length,
    0,
  );
  registry.stats[category] = registry.categories[category].length;
  registry.updated = new Date().toISOString();
  registry.stats.last_sync = registry.updated;

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log(`\n  ✓ Registered in registry.json`);
}

// =====================================================
// MAIN FUNCTION
// =====================================================

function generateModule(moduleName, category) {
  console.log(`\n🚀 Generating ${category} module: ${moduleName}\n`);

  // Validate category
  const validCategories = ["ui", "logic", "data", "integration"];
  if (!validCategories.includes(category)) {
    console.error(
      `❌ Invalid category. Must be one of: ${validCategories.join(", ")}`,
    );
    process.exit(1);
  }

  // Create module path
  const modulePath = path.join(process.cwd(), "modules", category, moduleName);

  // Check if module already exists
  if (fs.existsSync(modulePath)) {
    console.error(`❌ Module already exists at ${modulePath}`);
    process.exit(1);
  }

  // Generate templates based on category
  switch (category) {
    case "ui":
      generateUITemplate(moduleName, modulePath);
      break;
    case "logic":
      generateLogicTemplate(moduleName, modulePath);
      break;
    case "data":
      generateDataTemplate(moduleName, modulePath);
      break;
    case "integration":
      generateIntegrationTemplate(moduleName, modulePath);
      break;
  }

  // Generate module.json
  generateModuleJson(moduleName, category, modulePath);

  // Register in registry
  registerModule(moduleName, category, modulePath);

  console.log(`\n✅ Module ${moduleName} created successfully!`);
  console.log(`📁 Location: ${modulePath}`);
  console.log(`\n📖 Next steps:`);
  console.log(`   1. Implement the TODOs in the generated files`);
  console.log(`   2. Update module.json with proper metadata`);
  console.log(`   3. Add documentation in docs/README.md`);
  console.log(`   4. Create tests`);
  console.log(`   5. Run: npm run modules:sync\n`);
}

// =====================================================
// CLI
// =====================================================

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage: node generate-module.js <module-name> --category <category>

Example:
  node generate-module.js product-catalog --category ui
  node generate-module.js order-processing --category logic
  node generate-module.js inventory --category data
  node generate-module.js stripe-payment --category integration

Categories: ui, logic, data, integration
  `);
  process.exit(1);
}

const moduleName = args[0];
const categoryIndex = args.indexOf("--category");

if (categoryIndex === -1 || !args[categoryIndex + 1]) {
  console.error("❌ --category flag is required");
  process.exit(1);
}

const category = args[categoryIndex + 1];

generateModule(moduleName, category);
