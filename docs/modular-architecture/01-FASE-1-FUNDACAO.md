# Fase 1: Fundação - Estrutura Base de Módulos

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Objetivos](#objetivos)
- [Pré-requisitos](#pré-requisitos)
- [Tarefas](#tarefas)
- [Entregáveis](#entregáveis)
- [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

A Fase 1 estabelece a **infraestrutura fundamental** para o sistema de módulos. Nesta fase, criamos a estrutura de diretórios, definimos schemas TypeScript para manifests e inicializamos o registry centralizado.

**Duração estimada**: 1-2 dias
**Complexidade**: Baixa
**Dependências**: Nenhuma

---

## 🎯 Objetivos

1. ✅ Criar estrutura de diretórios para módulos
2. ✅ Definir schema TypeScript para manifests (module.json)
3. ✅ Criar registry.json centralizado
4. ✅ Criar installed.json para tracking
5. ✅ Configurar aliases TypeScript
6. ✅ Validar estrutura com ferramentas

---

## 📋 Pré-requisitos

### Conhecimentos Necessários

- TypeScript básico
- Estrutura de projetos Next.js
- JSON e schemas de validação

### Ferramentas

- Node.js >= 18
- TypeScript >= 5.4
- Zod (já instalado no projeto)

---

## 📝 Tarefas

### Tarefa 1.1: Criar Estrutura de Diretórios

#### Objetivo

Criar a estrutura de pastas que organizará os módulos por categoria.

#### Comandos

```bash
# Criar diretórios principais
mkdir -p modules/ui
mkdir -p modules/logic
mkdir -p modules/data
mkdir -p modules/integration

# Criar diretório do registry system
mkdir -p .modules/cache

# Criar diretório para templates
mkdir -p .modules/templates/ui
mkdir -p .modules/templates/logic
mkdir -p .modules/templates/data
mkdir -p .modules/templates/integration

# Criar diretório para scripts
mkdir -p scripts/modules
```

#### Estrutura Final

```
modules/
├── ui/                    # UI Modules (componentes visuais)
├── logic/                 # Logic Modules (business logic)
├── data/                  # Data Modules (database schemas)
└── integration/           # Integration Modules (APIs/providers)

.modules/
├── cache/                 # Cache de descoberta
├── templates/             # Templates por categoria
│   ├── ui/
│   ├── logic/
│   ├── data/
│   └── integration/
└── prompts/               # Prompts para agentes especializados

scripts/
└── modules/               # Scripts de gerenciamento de módulos
```

#### Verificação

```bash
# Listar estrutura criada
tree -L 2 modules .modules scripts/modules
```

---

### Tarefa 1.2: Definir Schema do Manifest

#### Objetivo

Criar definição TypeScript completa para `module.json` com validação Zod.

#### Arquivo: `.modules/schema.ts`

```typescript
import { z } from "zod";

/**
 * Schema Zod para validação de manifests de módulos
 */

// Tipos base
const ModuleCategorySchema = z.enum(["ui", "logic", "data", "integration"]);

const ComponentExportSchema = z.object({
  name: z.string().min(1, "Component name is required"),
  path: z.string().min(1, "Component path is required"),
  props: z.record(z.string()).optional(),
  description: z.string().optional(),
  example: z.string().optional(),
});

const HookExportSchema = z.object({
  name: z.string().min(1, "Hook name is required"),
  path: z.string().min(1, "Hook path is required"),
  returns: z.string().optional(),
  params: z.record(z.string()).optional(),
  description: z.string().optional(),
  example: z.string().optional(),
});

const ServiceExportSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  path: z.string().min(1, "Service path is required"),
  methods: z.array(z.string()),
  dependencies: z.array(z.string()).optional(),
  description: z.string().optional(),
  example: z.string().optional(),
});

const StoreExportSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  path: z.string().min(1, "Store path is required"),
  state: z.array(z.string()),
  actions: z.array(z.string()).optional(),
  description: z.string().optional(),
  example: z.string().optional(),
});

const ExportsSchema = z.object({
  components: z.array(ComponentExportSchema).optional(),
  hooks: z.array(HookExportSchema).optional(),
  services: z.array(ServiceExportSchema).optional(),
  stores: z.array(StoreExportSchema).optional(),
  types: z.array(z.string()).optional(),
  utils: z.array(z.string()).optional(),
});

const DependenciesSchema = z.object({
  modules: z.array(z.string()).default([]),
  packages: z.array(z.string()).default([]),
});

const DatabaseSchema = z.object({
  schemas: z.array(z.string()).optional(),
  migrations: z.array(z.string()).optional(),
  rls: z.boolean().default(false),
  indexes: z.array(z.string()).optional(),
});

const ApiSchema = z.object({
  consumes: z.array(z.string()).optional(),
  provides: z.array(z.string()).optional(),
});

const AIMetadataSchema = z.object({
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  keywords: z.array(z.string()).min(1, "At least one keyword required"),
  reusable: z.object({
    components: z.array(z.string()).optional(),
    hooks: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    patterns: z.array(z.string()).optional(),
  }),
  usage_scenarios: z.array(z.string()).optional(),
});

// Schema principal do manifest
export const ModuleManifestSchema = z.object({
  id: z.string().min(1, "Module ID is required"),
  name: z.string().min(1, "Module name is required"),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must be semver (x.y.z)"),
  category: ModuleCategorySchema,
  description: z.string().min(10, "Description must be at least 10 characters"),
  author: z.string().optional(),
  license: z.string().default("MIT"),
  repository: z.string().url().optional(),

  exports: ExportsSchema,
  dependencies: DependenciesSchema,

  database: DatabaseSchema.optional(),
  apis: ApiSchema.optional(),

  ai: AIMetadataSchema,

  // Metadata adicional
  tags: z.array(z.string()).optional(),
  status: z.enum(["experimental", "stable", "deprecated"]).default("stable"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema do Registry
export const RegistryModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  version: z.string(),
  category: ModuleCategorySchema,
  exports: z.object({
    components: z.number().optional(),
    hooks: z.number().optional(),
    services: z.number().optional(),
    stores: z.number().optional(),
  }),
  keywords: z.array(z.string()),
  status: z.enum(["experimental", "stable", "deprecated"]),
});

export const RegistrySchema = z.object({
  version: z.string(),
  updated: z.string().datetime(),
  categories: z.object({
    ui: z.array(RegistryModuleSchema),
    logic: z.array(RegistryModuleSchema),
    data: z.array(RegistryModuleSchema),
    integration: z.array(RegistryModuleSchema),
  }),
  stats: z.object({
    total_modules: z.number(),
    ui: z.number(),
    logic: z.number(),
    data: z.number(),
    integration: z.number(),
  }),
});

// Schema de módulos instalados
export const InstalledModulesSchema = z.object({
  modules: z.array(z.string()),
  last_updated: z.string().datetime(),
});

// Tipos TypeScript exportados
export type ModuleCategory = z.infer<typeof ModuleCategorySchema>;
export type ComponentExport = z.infer<typeof ComponentExportSchema>;
export type HookExport = z.infer<typeof HookExportSchema>;
export type ServiceExport = z.infer<typeof ServiceExportSchema>;
export type StoreExport = z.infer<typeof StoreExportSchema>;
export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;
export type RegistryModule = z.infer<typeof RegistryModuleSchema>;
export type Registry = z.infer<typeof RegistrySchema>;
export type InstalledModules = z.infer<typeof InstalledModulesSchema>;

// Utility functions
export function validateManifest(data: unknown): ModuleManifest {
  return ModuleManifestSchema.parse(data);
}

export function validateRegistry(data: unknown): Registry {
  return RegistrySchema.parse(data);
}

export function validateInstalledModules(data: unknown): InstalledModules {
  return InstalledModulesSchema.parse(data);
}
```

#### Verificação

```bash
# Compilar TypeScript para verificar sintaxe
npx tsc .modules/schema.ts --noEmit
```

---

### Tarefa 1.3: Criar Registry Centralizado

#### Objetivo

Inicializar o arquivo `registry.json` que catalogará todos os módulos.

#### Arquivo: `.modules/registry.json`

```json
{
  "version": "1.0.0",
  "updated": "2025-01-11T10:00:00.000Z",
  "categories": {
    "ui": [],
    "logic": [],
    "data": [],
    "integration": []
  },
  "stats": {
    "total_modules": 0,
    "ui": 0,
    "logic": 0,
    "data": 0,
    "integration": 0
  }
}
```

#### Comando

```bash
cat > .modules/registry.json << 'EOF'
{
  "version": "1.0.0",
  "updated": "2025-01-11T10:00:00.000Z",
  "categories": {
    "ui": [],
    "logic": [],
    "data": [],
    "integration": []
  },
  "stats": {
    "total_modules": 0,
    "ui": 0,
    "logic": 0,
    "data": 0,
    "integration": 0
  }
}
EOF
```

---

### Tarefa 1.4: Criar Tracking de Módulos Instalados

#### Objetivo

Criar arquivo para rastrear quais módulos estão atualmente instalados.

#### Arquivo: `.modules/installed.json`

```json
{
  "modules": [],
  "last_updated": "2025-01-11T10:00:00.000Z"
}
```

#### Comando

```bash
cat > .modules/installed.json << 'EOF'
{
  "modules": [],
  "last_updated": "2025-01-11T10:00:00.000Z"
}
EOF
```

---

### Tarefa 1.5: Configurar Aliases TypeScript

#### Objetivo

Adicionar aliases no `tsconfig.json` para facilitar imports de módulos.

#### Arquivo: `tsconfig.json` (adicionar)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/modules/*": ["./modules/*"],
      "@/modules/ui/*": ["./modules/ui/*"],
      "@/modules/logic/*": ["./modules/logic/*"],
      "@/modules/data/*": ["./modules/data/*"],
      "@/modules/integration/*": ["./modules/integration/*"]
    }
  }
}
```

#### Implementação

Ler o tsconfig.json atual, adicionar os paths e salvar.

---

### Tarefa 1.6: Criar .gitignore para Módulos

#### Objetivo

Configurar Git para ignorar cache mas trackear estrutura.

#### Arquivo: `.modules/.gitignore`

```
# Cache de descoberta (gerado automaticamente)
cache/

# Logs
*.log

# Temporários
*.tmp
.DS_Store
```

#### Comando

```bash
cat > .modules/.gitignore << 'EOF'
# Cache de descoberta (gerado automaticamente)
cache/

# Logs
*.log

# Temporários
*.tmp
.DS_Store
EOF
```

---

### Tarefa 1.7: Criar Script de Validação

#### Objetivo

Script para validar estrutura de módulos e manifests.

#### Arquivo: `scripts/modules/validate.js`

```javascript
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Script para validar estrutura de módulos e manifests
 */

function validateStructure() {
  console.log("🔍 Validando estrutura de módulos...\n");

  const requiredDirs = [
    "modules/ui",
    "modules/logic",
    "modules/data",
    "modules/integration",
    ".modules",
    ".modules/cache",
    ".modules/templates",
  ];

  const requiredFiles = [
    ".modules/registry.json",
    ".modules/installed.json",
    ".modules/schema.ts",
  ];

  let errors = 0;

  // Verificar diretórios
  console.log("📁 Verificando diretórios...");
  requiredDirs.forEach((dir) => {
    const exists = fs.existsSync(dir);
    const status = exists ? "✅" : "❌";
    console.log(`${status} ${dir}`);
    if (!exists) errors++;
  });

  console.log("");

  // Verificar arquivos
  console.log("📄 Verificando arquivos...");
  requiredFiles.forEach((file) => {
    const exists = fs.existsSync(file);
    const status = exists ? "✅" : "❌";
    console.log(`${status} ${file}`);
    if (!exists) errors++;
  });

  console.log("");

  // Validar JSONs
  console.log("🔧 Validando JSONs...");

  try {
    const registry = JSON.parse(
      fs.readFileSync(".modules/registry.json", "utf8"),
    );
    console.log("✅ registry.json: válido");
    console.log(`   └─ ${registry.stats.total_modules} módulos registrados`);
  } catch (error) {
    console.log("❌ registry.json: inválido");
    console.log(`   └─ ${error.message}`);
    errors++;
  }

  try {
    const installed = JSON.parse(
      fs.readFileSync(".modules/installed.json", "utf8"),
    );
    console.log("✅ installed.json: válido");
    console.log(`   └─ ${installed.modules.length} módulos instalados`);
  } catch (error) {
    console.log("❌ installed.json: inválido");
    console.log(`   └─ ${error.message}`);
    errors++;
  }

  console.log("");

  // Resultado final
  if (errors === 0) {
    console.log("✅ Validação concluída com sucesso!");
    console.log("🎉 Estrutura de módulos está correta.");
  } else {
    console.log(`❌ Validação falhou com ${errors} erro(s).`);
    console.log("💡 Execute as tarefas da Fase 1 para corrigir.");
    process.exit(1);
  }
}

// Executar validação
validateStructure();
```

#### Adicionar ao package.json

```json
{
  "scripts": {
    "modules:validate": "node scripts/modules/validate.js"
  }
}
```

#### Executar

```bash
npm run modules:validate
```

---

### Tarefa 1.8: Criar README da Estrutura

#### Objetivo

Documentar a estrutura de módulos para desenvolvedores.

#### Arquivo: `modules/README.md`

```markdown
# Módulos - Estrutura de Código Modular

Este diretório contém a arquitetura modular da aplicação Bebarter.

## Estrutura
```

modules/
├── ui/ # UI Modules - Componentes visuais
├── logic/ # Logic Modules - Business logic
├── data/ # Data Modules - Database schemas
└── integration/ # Integration Modules - APIs externas

````

## Categorias de Módulos

### UI Modules (`modules/ui/`)
Componentes React, hooks de UI e estilos visuais.

**Exemplos**: auth-ui, profile-ui, payment-ui

### Logic Modules (`modules/logic/`)
Services com business logic, validações e transformações.

**Exemplos**: user-logic, order-logic, notification-logic

### Data Modules (`modules/data/`)
Schemas SQL, migrations e queries reutilizáveis.

**Exemplos**: user-data, order-data, auth-data

### Integration Modules (`modules/integration/`)
Integrações com APIs externas e providers.

**Exemplos**: stripe-integration, sendgrid-integration

## Como Criar um Módulo

```bash
# Gerar novo módulo
npm run generate:module <nome> --category <ui|logic|data|integration>

# Exemplo
npm run generate:module user-profile --category ui
````

## Estrutura de um Módulo

Cada módulo deve ter:

```
modules/[category]/[module-name]/
├── module.json          # Manifest obrigatório
├── src/                 # Código fonte
├── docs/                # Documentação
└── tests/               # Testes
```

## Registry System

Todos os módulos são catalogados em `.modules/registry.json`.

Para listar módulos disponíveis:

```bash
npm run modules:list
```

## Mais Informações

Consulte a [documentação completa](../docs/modular-architecture/).

````

---

## ✅ Entregáveis

Ao final da Fase 1, você terá:

### 1. Estrutura de Diretórios
- ✅ `modules/ui/`, `modules/logic/`, `modules/data/`, `modules/integration/`
- ✅ `.modules/` com cache e templates
- ✅ `scripts/modules/` com ferramentas

### 2. Schemas e Validação
- ✅ `.modules/schema.ts` com tipos TypeScript completos
- ✅ Validação Zod para manifests

### 3. Registry System
- ✅ `.modules/registry.json` inicializado
- ✅ `.modules/installed.json` para tracking

### 4. Configuração
- ✅ Aliases TypeScript configurados
- ✅ `.gitignore` apropriado

### 5. Ferramentas
- ✅ Script de validação (`npm run modules:validate`)
- ✅ Documentação básica

---

## 🧪 Testes de Validação

Execute os seguintes comandos para validar a Fase 1:

```bash
# 1. Validar estrutura
npm run modules:validate

# 2. Verificar TypeScript
npx tsc .modules/schema.ts --noEmit

# 3. Validar JSONs
node -e "JSON.parse(require('fs').readFileSync('.modules/registry.json'))"
node -e "JSON.parse(require('fs').readFileSync('.modules/installed.json'))"

# 4. Verificar aliases
grep "@/modules" tsconfig.json
````

**Resultado esperado**: Todos os comandos executam sem erros.

---

## 📊 Checklist de Conclusão

Antes de prosseguir para Fase 2, confirme:

- [ ] Todas as pastas criadas (`modules/`, `.modules/`, `scripts/modules/`)
- [ ] Schema TypeScript criado e validado
- [ ] `registry.json` e `installed.json` inicializados
- [ ] Aliases TypeScript configurados
- [ ] Script de validação funcionando
- [ ] `npm run modules:validate` passa sem erros
- [ ] Documentação básica criada

---

## 🚀 Próximos Passos

Após concluir a Fase 1, prossiga para:

**[Fase 2 - Migração](./02-FASE-2-MIGRACAO.md)**

Na Fase 2, você irá:

- Migrar a feature "users" para a estrutura modular
- Criar os primeiros manifests (module.json)
- Validar o conceito com um exemplo real
- Atualizar o registry com módulos reais

---

**Última atualização**: 2025-01-11
**Duração estimada**: 1-2 dias
**Próxima fase**: [Fase 2 - Migração](./02-FASE-2-MIGRACAO.md)
