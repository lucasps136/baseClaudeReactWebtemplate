#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  askQuestion,
  generateAppRoute,
  injectRouteConfig,
  requireValidName,
} = require("./utils/route-cli-utils");

// Script para gerar uma nova feature seguindo o padrão Vertical Slice
async function generateFeature(featureName) {
  if (!featureName) {
    console.error("❌ Por favor, forneça um nome para a feature:");
    console.log("npm run generate:feature <nome-da-feature>");
    process.exit(1);
  }

  requireValidName(featureName, "feature");

  const kebabCase = featureName.toLowerCase().replace(/\s+/g, "-");
  const pascalCase = kebabCase
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const featurePath = path.join("src", "features", kebabCase);

  // Verificar se a feature já existe
  if (fs.existsSync(featurePath)) {
    console.error(`❌ Feature '${kebabCase}' já existe!`);
    process.exit(1);
  }

  console.log(`🚀 Gerando feature: ${kebabCase}`);

  // Criar estrutura de diretórios
  const dirs = ["components", "stores", "hooks", "services", "types"];

  dirs.forEach((dir) => {
    const dirPath = path.join(featurePath, dir);
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 ${dirPath}`);
  });

  // Gerar arquivos base
  generateTypes(featurePath, kebabCase, pascalCase);
  generateService(featurePath, kebabCase, pascalCase);
  generateStore(featurePath, kebabCase, pascalCase);
  generateHooks(featurePath, kebabCase, pascalCase);
  generateComponent(featurePath, kebabCase, pascalCase);
  generateIndex(featurePath, kebabCase, pascalCase);

  console.log("");
  console.log("✅ Feature criada com sucesso!");
  console.log(`📂 Localização: ${featurePath}`);

  // T010-T013: Route creation flow (Plugin-and-Play)
  let routeCreated = false;

  // T016: Only prompt when stdin is interactive (skip in CI)
  if (process.stdin.isTTY) {
    const createRoute = await askQuestion(
      `\n🌐 Deseja criar uma rota para esta feature? (s/n): `,
    );

    if (createRoute) {
      // T011: Ask about auth protection
      const isProtected = await askQuestion(
        `🔒 A rota deve ser protegida por autenticação? (s/n): `,
      );

      const appRoutePath = kebabCase;
      const importPath = `@/features/${kebabCase}`;
      const componentName = `${pascalCase}List`;
      const pageName = `${pascalCase}Page`;

      // T012: Generate the App Router page
      const result = generateAppRoute(
        appRoutePath,
        importPath,
        componentName,
        pageName,
      );

      // T015: Handle conflict
      if (result.conflict) {
        const overwrite = await askQuestion(
          `⚠️  src/app/${kebabCase}/page.tsx já existe. Sobrescrever? (s/n): `,
        );
        if (overwrite) {
          fs.unlinkSync(path.join("src", "app", kebabCase, "page.tsx"));
          generateAppRoute(appRoutePath, importPath, componentName, pageName);
          injectRouteConfig(kebabCase, `/${kebabCase}`, isProtected);
          routeCreated = true;
          console.log(`✅ Rota /${kebabCase} recriada!`);
        } else {
          console.log("ℹ️  Rota não criada (conflito mantido).");
        }
      } else {
        // T013: Inject route config
        injectRouteConfig(kebabCase, `/${kebabCase}`, isProtected);
        routeCreated = true;
        console.log(`✅ Rota /${kebabCase} criada!`);
        console.log(`📄 src/app/${kebabCase}/page.tsx`);
      }
    } else {
      // T017: Informative message when user says "n"
      console.log(
        "ℹ️  Rota não criada. Para criar depois, adicione manualmente:",
      );
      console.log(`   src/app/${kebabCase}/page.tsx`);
    }
  } else {
    // T017: CI mode message
    console.log(
      "ℹ️  Modo não-interativo detectado. Rota não criada automaticamente.",
    );
    console.log(`   Para criar manualmente: src/app/${kebabCase}/page.tsx`);
  }

  // T014: Updated "Próximos passos" message
  console.log("");
  console.log("📝 Próximos passos:");
  console.log(`1. Implementar as interfaces em ${kebabCase}.service.ts`);
  console.log(`2. Adicionar validações específicas`);
  console.log(`3. Customizar componentes conforme necessário`);
  console.log(`4. Adicionar testes`);
  if (!routeCreated) {
    console.log(`5. Criar rota manualmente em src/app/${kebabCase}/page.tsx`);
  }
}

function generateTypes(featurePath, kebabCase, pascalCase) {
  const content = `// ${pascalCase} domain types
export interface ${pascalCase} {
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

export interface ${pascalCase}ListFilter {
  search?: string
  sortBy?: 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ${pascalCase}ListResponse {
  ${kebabCase}s: ${pascalCase}[]
  total: number
  hasMore: boolean
}`;

  fs.writeFileSync(
    path.join(featurePath, "types", `${kebabCase}.types.ts`),
    content,
  );
  console.log(`📄 types/${kebabCase}.types.ts`);
}

function generateService(featurePath, kebabCase, pascalCase) {
  const content = `import type { 
  ${pascalCase}, 
  Create${pascalCase}Input, 
  Update${pascalCase}Input,
  ${pascalCase}ListFilter,
  ${pascalCase}ListResponse 
} from '../types/${kebabCase}.types'

// Interface Segregation - specific interfaces
export interface I${pascalCase}Repository {
  findById(id: string): Promise<${pascalCase} | null>
  findMany(filter: ${pascalCase}ListFilter): Promise<${pascalCase}ListResponse>
  create(input: Create${pascalCase}Input): Promise<${pascalCase}>
  update(id: string, input: Update${pascalCase}Input): Promise<${pascalCase}>
  delete(id: string): Promise<void>
}

export interface I${pascalCase}Validation {
  validateCreateInput(input: Create${pascalCase}Input): Promise<void>
  validateUpdateInput(input: Update${pascalCase}Input): Promise<void>
}

// Single Responsibility - ${pascalCase} service
export class ${pascalCase}Service {
  constructor(
    private ${kebabCase}Repository: I${pascalCase}Repository,
    private ${kebabCase}Validation: I${pascalCase}Validation
  ) {}

  async get${pascalCase}ById(id: string): Promise<${pascalCase} | null> {
    if (!id) throw new Error('${pascalCase} ID is required')
    return this.${kebabCase}Repository.findById(id)
  }

  async get${pascalCase}s(filter: ${pascalCase}ListFilter = {}): Promise<${pascalCase}ListResponse> {
    const normalizedFilter: ${pascalCase}ListFilter = {
      limit: 20,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...filter,
    }

    return this.${kebabCase}Repository.findMany(normalizedFilter)
  }

  async create${pascalCase}(input: Create${pascalCase}Input): Promise<${pascalCase}> {
    await this.${kebabCase}Validation.validateCreateInput(input)
    return this.${kebabCase}Repository.create(input)
  }

  async update${pascalCase}(id: string, input: Update${pascalCase}Input): Promise<${pascalCase}> {
    if (!id) throw new Error('${pascalCase} ID is required')
    
    const existing = await this.${kebabCase}Repository.findById(id)
    if (!existing) {
      throw new Error('${pascalCase} not found')
    }

    await this.${kebabCase}Validation.validateUpdateInput(input)
    return this.${kebabCase}Repository.update(id, input)
  }

  async delete${pascalCase}(id: string): Promise<void> {
    if (!id) throw new Error('${pascalCase} ID is required')
    
    const existing = await this.${kebabCase}Repository.findById(id)
    if (!existing) {
      throw new Error('${pascalCase} not found')
    }

    await this.${kebabCase}Repository.delete(id)
  }
}`;

  fs.writeFileSync(
    path.join(featurePath, "services", `${kebabCase}.service.ts`),
    content,
  );
  console.log(`📄 services/${kebabCase}.service.ts`);
}

function generateStore(featurePath, kebabCase, pascalCase) {
  const content = `import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ${pascalCase}, ${pascalCase}ListFilter } from '../types/${kebabCase}.types'

interface ${pascalCase}State {
  // Single ${kebabCase} state
  current${pascalCase}: ${pascalCase} | null
  isLoading${pascalCase}: boolean
  ${kebabCase}Error: string | null
  
  // List state
  ${kebabCase}s: ${pascalCase}[]
  isLoading${pascalCase}s: boolean
  ${kebabCase}sError: string | null
  filter: ${pascalCase}ListFilter
  hasMore: boolean
  total: number
}

interface ${pascalCase}Actions {
  // Single actions
  setCurrent${pascalCase}: (${kebabCase}: ${pascalCase} | null) => void
  set${pascalCase}Loading: (loading: boolean) => void
  set${pascalCase}Error: (error: string | null) => void
  
  // List actions
  set${pascalCase}s: (${kebabCase}s: ${pascalCase}[]) => void
  add${pascalCase}: (${kebabCase}: ${pascalCase}) => void
  update${pascalCase}: (id: string, updates: Partial<${pascalCase}>) => void
  remove${pascalCase}: (id: string) => void
  set${pascalCase}sLoading: (loading: boolean) => void
  set${pascalCase}sError: (error: string | null) => void
  setFilter: (filter: Partial<${pascalCase}ListFilter>) => void
  setHasMore: (hasMore: boolean) => void
  setTotal: (total: number) => void
  
  // Utility actions
  reset: () => void
}

export type ${pascalCase}Store = ${pascalCase}State & ${pascalCase}Actions

const initialState: ${pascalCase}State = {
  current${pascalCase}: null,
  isLoading${pascalCase}: false,
  ${kebabCase}Error: null,
  ${kebabCase}s: [],
  isLoading${pascalCase}s: false,
  ${kebabCase}sError: null,
  filter: {
    limit: 20,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  hasMore: false,
  total: 0,
}

export const use${pascalCase}Store = create<${pascalCase}Store>()(
  devtools(
    (set) => ({
      ...initialState,

      setCurrent${pascalCase}: (current${pascalCase}) =>
        set({ current${pascalCase}, ${kebabCase}Error: null }, false, '${kebabCase}/setCurrent'),

      set${pascalCase}Loading: (isLoading${pascalCase}) =>
        set({ isLoading${pascalCase} }, false, '${kebabCase}/setLoading'),

      set${pascalCase}Error: (${kebabCase}Error) =>
        set({ ${kebabCase}Error }, false, '${kebabCase}/setError'),

      set${pascalCase}s: (${kebabCase}s) =>
        set({ ${kebabCase}s, ${kebabCase}sError: null }, false, '${kebabCase}/setList'),

      add${pascalCase}: (${kebabCase}) =>
        set(
          (state) => ({ ${kebabCase}s: [...state.${kebabCase}s, ${kebabCase}] }),
          false,
          '${kebabCase}/add'
        ),

      update${pascalCase}: (id, updates) =>
        set(
          (state) => ({
            ${kebabCase}s: state.${kebabCase}s.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
            current${pascalCase}:
              state.current${pascalCase}?.id === id
                ? { ...state.current${pascalCase}, ...updates }
                : state.current${pascalCase},
          }),
          false,
          '${kebabCase}/update'
        ),

      remove${pascalCase}: (id) =>
        set(
          (state) => ({
            ${kebabCase}s: state.${kebabCase}s.filter((item) => item.id !== id),
            current${pascalCase}: state.current${pascalCase}?.id === id ? null : state.current${pascalCase},
          }),
          false,
          '${kebabCase}/remove'
        ),

      set${pascalCase}sLoading: (isLoading${pascalCase}s) =>
        set({ isLoading${pascalCase}s }, false, '${kebabCase}/setListLoading'),

      set${pascalCase}sError: (${kebabCase}sError) =>
        set({ ${kebabCase}sError }, false, '${kebabCase}/setListError'),

      setFilter: (filterUpdates) =>
        set(
          (state) => ({ filter: { ...state.filter, ...filterUpdates } }),
          false,
          '${kebabCase}/setFilter'
        ),

      setHasMore: (hasMore) =>
        set({ hasMore }, false, '${kebabCase}/setHasMore'),

      setTotal: (total) =>
        set({ total }, false, '${kebabCase}/setTotal'),

      reset: () =>
        set(initialState, false, '${kebabCase}/reset'),
    }),
    {
      name: '${kebabCase}-store',
    }
  )
)`;

  fs.writeFileSync(
    path.join(featurePath, "stores", `${kebabCase}.store.ts`),
    content,
  );
  console.log(`📄 stores/${kebabCase}.store.ts`);
}

function generateHooks(featurePath, kebabCase, pascalCase) {
  // Hook para lista
  const listHookContent = `import { useCallback } from 'react'
import { use${pascalCase}Store } from '../stores/${kebabCase}.store'
import type { ${pascalCase}ListFilter, Create${pascalCase}Input, Update${pascalCase}Input } from '../types/${kebabCase}.types'

export const use${pascalCase}s = () => {
  const {
    ${kebabCase}s,
    isLoading${pascalCase}s,
    ${kebabCase}sError,
    filter,
    hasMore,
    total,
    set${pascalCase}s,
    add${pascalCase},
    update${pascalCase},
    remove${pascalCase},
    set${pascalCase}sLoading,
    set${pascalCase}sError,
    setFilter,
    setHasMore,
    setTotal,
  } = use${pascalCase}Store()

  const fetch${pascalCase}s = useCallback(async (newFilter?: Partial<${pascalCase}ListFilter>) => {
    try {
      set${pascalCase}sLoading(true)
      set${pascalCase}sError(null)

      if (newFilter) {
        setFilter(newFilter)
      }

      // TODO: Replace with actual service call
      const result = {
        ${kebabCase}s: [],
        total: 0,
        hasMore: false,
      }

      set${pascalCase}s(result.${kebabCase}s)
      setTotal(result.total)
      setHasMore(result.hasMore)
    } catch (error) {
      set${pascalCase}sError(error instanceof Error ? error.message : 'Failed to fetch ${kebabCase}s')
    } finally {
      set${pascalCase}sLoading(false)
    }
  }, [filter, set${pascalCase}s, set${pascalCase}sLoading, set${pascalCase}sError, setFilter, setTotal, setHasMore])

  const create${pascalCase} = useCallback(async (input: Create${pascalCase}Input) => {
    try {
      set${pascalCase}sLoading(true)
      set${pascalCase}sError(null)

      // TODO: Replace with actual service call
      const new${pascalCase} = {
        id: crypto.randomUUID(),
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      add${pascalCase}(new${pascalCase})
      return new${pascalCase}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create ${kebabCase}'
      set${pascalCase}sError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      set${pascalCase}sLoading(false)
    }
  }, [add${pascalCase}, set${pascalCase}sLoading, set${pascalCase}sError])

  return {
    ${kebabCase}s,
    isLoading${pascalCase}s,
    ${kebabCase}sError,
    filter,
    hasMore,
    total,
    fetch${pascalCase}s,
    create${pascalCase},
    setFilter,
  }
}`;

  // Hook para item único
  const singleHookContent = `import { useCallback } from 'react'
import { use${pascalCase}Store } from '../stores/${kebabCase}.store'

export const use${pascalCase} = () => {
  const {
    current${pascalCase},
    isLoading${pascalCase},
    ${kebabCase}Error,
    setCurrent${pascalCase},
    set${pascalCase}Loading,
    set${pascalCase}Error,
  } = use${pascalCase}Store()

  const fetch${pascalCase} = useCallback(async (id: string) => {
    if (!id) {
      set${pascalCase}Error('${pascalCase} ID is required')
      return null
    }

    try {
      set${pascalCase}Loading(true)
      set${pascalCase}Error(null)

      // TODO: Replace with actual service call
      const ${kebabCase} = null

      setCurrent${pascalCase}(${kebabCase})
      return ${kebabCase}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ${kebabCase}'
      set${pascalCase}Error(errorMessage)
      return null
    } finally {
      set${pascalCase}Loading(false)
    }
  }, [setCurrent${pascalCase}, set${pascalCase}Loading, set${pascalCase}Error])

  const clear${pascalCase} = useCallback(() => {
    setCurrent${pascalCase}(null)
    set${pascalCase}Error(null)
  }, [setCurrent${pascalCase}, set${pascalCase}Error])

  return {
    current${pascalCase},
    isLoading${pascalCase},
    ${kebabCase}Error,
    fetch${pascalCase},
    clear${pascalCase},
  }
}`;

  // Index
  const indexContent = `export { use${pascalCase} } from './use${pascalCase}'
export { use${pascalCase}s } from './use${pascalCase}s'`;

  fs.writeFileSync(
    path.join(featurePath, "hooks", `use${pascalCase}.ts`),
    singleHookContent,
  );
  fs.writeFileSync(
    path.join(featurePath, "hooks", `use${pascalCase}s.ts`),
    listHookContent,
  );
  fs.writeFileSync(path.join(featurePath, "hooks", "index.ts"), indexContent);

  console.log(`📄 hooks/use${pascalCase}.ts`);
  console.log(`📄 hooks/use${pascalCase}s.ts`);
  console.log(`📄 hooks/index.ts`);
}

function generateComponent(featurePath, kebabCase, pascalCase) {
  const content = `'use client'

import { useEffect } from 'react'
import { use${pascalCase}s } from '../hooks'

export const ${pascalCase}List = () => {
  const { 
    ${kebabCase}s, 
    isLoading${pascalCase}s, 
    ${kebabCase}sError, 
    fetch${pascalCase}s,
  } = use${pascalCase}s()

  useEffect(() => {
    fetch${pascalCase}s()
  }, [fetch${pascalCase}s])

  if (isLoading${pascalCase}s) {
    return <div className="text-center p-4">Loading ${kebabCase}s...</div>
  }

  if (${kebabCase}sError) {
    return (
      <div className="text-center p-4 text-red-600">
        Error: {${kebabCase}sError}
      </div>
    )
  }

  if (${kebabCase}s.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No ${kebabCase}s found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">${pascalCase}s</h2>
      <div className="grid gap-4">
        {${kebabCase}s.map((${kebabCase}) => (
          <div 
            key={${kebabCase}.id}
            className="p-4 border rounded-lg"
          >
            <h3 className="font-semibold">{${kebabCase}.name}</h3>
            <p className="text-sm text-gray-500">
              Created: {new Date(${kebabCase}.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}`;

  const indexContent = `export { ${pascalCase}List } from './${pascalCase}List'`;

  fs.writeFileSync(
    path.join(featurePath, "components", `${pascalCase}List.tsx`),
    content,
  );
  fs.writeFileSync(
    path.join(featurePath, "components", "index.ts"),
    indexContent,
  );

  console.log(`📄 components/${pascalCase}List.tsx`);
  console.log(`📄 components/index.ts`);
}

function generateIndex(featurePath, kebabCase, pascalCase) {
  const content = `// Main export file for ${kebabCase} feature
// Vertical Slice pattern - everything ${kebabCase}-related exported from here

// Types
export type * from './types/${kebabCase}.types'

// Services
export { ${pascalCase}Service } from './services/${kebabCase}.service'
export type { I${pascalCase}Repository, I${pascalCase}Validation } from './services/${kebabCase}.service'

// Stores
export { use${pascalCase}Store } from './stores/${kebabCase}.store'
export type { ${pascalCase}Store } from './stores/${kebabCase}.store'

// Hooks
export { use${pascalCase}, use${pascalCase}s } from './hooks'

// Components
export { ${pascalCase}List } from './components'`;

  fs.writeFileSync(path.join(featurePath, "index.ts"), content);
  console.log(`📄 index.ts`);
}

// Executar o script
const featureName = process.argv[2];
generateFeature(featureName).catch(console.error);
