# Fase 2: Migração - Transformando Features em Módulos

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Objetivos](#objetivos)
- [Pré-requisitos](#pré-requisitos)
- [Estratégia de Migração](#estratégia-de-migração)
- [Tarefas](#tarefas)
- [Entregáveis](#entregáveis)
- [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

A Fase 2 é o **piloto de migração** onde transformamos a feature existente "users" em módulos organizados por categoria. Esta fase valida o conceito e serve como template para migrações futuras.

**Duração estimada**: 2-3 dias
**Complexidade**: Média
**Dependências**: Fase 1 concluída

---

## 🎯 Objetivos

1. ✅ Analisar feature "users" existente
2. ✅ Separar código em 3 módulos (UI, Logic, Data)
3. ✅ Criar manifests completos (module.json)
4. ✅ Atualizar imports em toda aplicação
5. ✅ Registrar módulos no registry.json
6. ✅ Validar funcionamento
7. ✅ Documentar processo para replicar

---

## 📋 Pré-requisitos

### Fase 1 Concluída

- ✅ Estrutura `modules/` criada
- ✅ Schema TypeScript definido
- ✅ Registry inicializado

### Conhecimentos

- Refactoring de código
- Dependency management
- TypeScript imports/exports

---

## 📐 Estratégia de Migração

### Feature "Users" Atual

```
src/features/users/
├── types/
│   └── user.types.ts
├── services/
│   └── user.service.ts
├── stores/
│   └── user.store.ts
├── hooks/
│   ├── useUser.ts
│   └── useUsers.ts
├── components/
│   └── UserList.tsx
└── index.ts
```

### Após Migração (3 Módulos)

```
modules/
├── ui/user-profile-ui/          # MÓDULO 1: UI
│   ├── module.json
│   ├── components/
│   │   └── UserList.tsx
│   ├── hooks/
│   │   ├── useUser.ts
│   │   └── useUsers.ts
│   └── index.ts
│
├── logic/user-logic/            # MÓDULO 2: Logic
│   ├── module.json
│   ├── services/
│   │   └── user.service.ts
│   ├── types/
│   │   └── user.types.ts
│   └── index.ts
│
└── data/user-data/              # MÓDULO 3: Data
    ├── module.json
    ├── schemas/
    │   └── users.sql
    └── index.ts
```

### Princípio de Separação

| Categoria | Conteúdo                     | Responsabilidade         |
| --------- | ---------------------------- | ------------------------ |
| **UI**    | Components, hooks UI, stores | Apresentação e interação |
| **Logic** | Services, validations, types | Business logic           |
| **Data**  | SQL schemas, migrations      | Persistência             |

---

## 📝 Tarefas

### Tarefa 2.1: Análise da Feature Existente

#### Objetivo

Mapear todo código da feature "users" e planejar separação.

#### Comandos

```bash
# Listar arquivos da feature
tree src/features/users/

# Ver tamanho dos arquivos
find src/features/users/ -type f -exec wc -l {} +

# Verificar dependências
grep -r "from.*users" src/
```

#### Análise Esperada

**Componentes identificados**:

- UserList.tsx (UI)
- useUser, useUsers (hooks UI)
- user.store.ts (state management)

**Services identificados**:

- UserService (business logic)
- IUserRepository, IUserValidation (interfaces)

**Types identificados**:

- User, CreateUserInput, UpdateUserInput
- UserListFilter, UserListResponse

**Database identificado**:

- users table (verificar em database/setup.sql)
- RLS policies para users

---

### Tarefa 2.2: Criar Módulo UI (user-profile-ui)

#### 2.2.1. Criar Estrutura

```bash
mkdir -p modules/ui/user-profile-ui/{components,hooks,stores,docs,tests}
```

#### 2.2.2. Mover Código UI

```bash
# Copiar (não mover ainda, para não quebrar)
cp src/features/users/components/UserList.tsx modules/ui/user-profile-ui/components/
cp src/features/users/hooks/useUser.ts modules/ui/user-profile-ui/hooks/
cp src/features/users/hooks/useUsers.ts modules/ui/user-profile-ui/hooks/
cp src/features/users/stores/user.store.ts modules/ui/user-profile-ui/stores/
```

#### 2.2.3. Ajustar Imports

Em cada arquivo movido, atualizar imports:

```typescript
// ANTES
import type { User } from "../types/user.types";
import { UserService } from "../services/user.service";

// DEPOIS
import type { User } from "@/modules/logic/user-logic";
import { UserService } from "@/modules/logic/user-logic";
```

#### 2.2.4. Criar index.ts

**Arquivo**: `modules/ui/user-profile-ui/index.ts`

```typescript
/**
 * User Profile UI Module
 *
 * Provides UI components and hooks for user profile management.
 */

// Components
export { UserList } from "./components/UserList";

// Hooks
export { useUser } from "./hooks/useUser";
export { useUsers } from "./hooks/useUsers";

// Store
export { useUserStore } from "./stores/user.store";
export type { UserStore } from "./stores/user.store";
```

#### 2.2.5. Criar module.json

**Arquivo**: `modules/ui/user-profile-ui/module.json`

```json
{
  "id": "user-profile-ui",
  "name": "User Profile UI Components",
  "version": "1.0.0",
  "category": "ui",
  "description": "Complete set of UI components and hooks for user profile management, including list views, forms, and state management",
  "author": "Bebarter Team",
  "license": "MIT",

  "exports": {
    "components": [
      {
        "name": "UserList",
        "path": "./components/UserList",
        "props": {
          "filter": "UserListFilter",
          "onUserClick": "(user: User) => void"
        },
        "description": "Displays a list of users with filtering, sorting and pagination",
        "example": "<UserList filter={{ limit: 20 }} onUserClick={(user) => console.log(user)} />"
      }
    ],
    "hooks": [
      {
        "name": "useUser",
        "path": "./hooks/useUser",
        "returns": "{ currentUser: User | null, isLoadingUser: boolean, userError: string | null, fetchUser: (id: string) => Promise<User | null>, clearUser: () => void }",
        "description": "Hook for managing single user state",
        "example": "const { currentUser, fetchUser } = useUser()"
      },
      {
        "name": "useUsers",
        "path": "./hooks/useUsers",
        "returns": "{ users: User[], isLoadingUsers: boolean, usersError: string | null, fetchUsers: (filter?: UserListFilter) => Promise<void>, createUser: (input: CreateUserInput) => Promise<User> }",
        "description": "Hook for managing user list state with CRUD operations",
        "example": "const { users, fetchUsers, createUser } = useUsers()"
      }
    ],
    "stores": [
      {
        "name": "useUserStore",
        "path": "./stores/user.store",
        "state": [
          "currentUser",
          "users",
          "isLoadingUser",
          "isLoadingUsers",
          "userError",
          "usersError"
        ],
        "actions": [
          "setCurrent User",
          "setUsers",
          "addUser",
          "updateUser",
          "removeUser"
        ],
        "description": "Zustand store for user state management",
        "example": "const { currentUser, setCurrentUser } = useUserStore()"
      }
    ],
    "types": []
  },

  "dependencies": {
    "modules": ["user-logic"],
    "packages": ["zustand", "react"]
  },

  "ai": {
    "summary": "Provides ready-to-use UI components and hooks for user profile display, editing and list management with Zustand state management",
    "keywords": [
      "user",
      "profile",
      "list",
      "form",
      "crud",
      "ui",
      "components",
      "hooks"
    ],
    "reusable": {
      "components": ["UserList"],
      "hooks": ["useUser", "useUsers"],
      "patterns": ["list with filters", "CRUD operations", "state management"]
    },
    "usage_scenarios": [
      "Display list of users in admin panel",
      "User profile page",
      "User selection dropdown",
      "Team member management"
    ]
  },

  "tags": ["ui", "user", "profile", "react"],
  "status": "stable",
  "createdAt": "2025-01-11T10:00:00.000Z",
  "updatedAt": "2025-01-11T10:00:00.000Z"
}
```

---

### Tarefa 2.3: Criar Módulo Logic (user-logic)

#### 2.3.1. Criar Estrutura

```bash
mkdir -p modules/logic/user-logic/{services,types,validations,docs,tests}
```

#### 2.3.2. Mover Código Logic

```bash
cp src/features/users/services/user.service.ts modules/logic/user-logic/services/
cp src/features/users/types/user.types.ts modules/logic/user-logic/types/
```

#### 2.3.3. Criar index.ts

**Arquivo**: `modules/logic/user-logic/index.ts`

```typescript
/**
 * User Logic Module
 *
 * Business logic and domain types for user management.
 */

// Types
export type * from "./types/user.types";

// Services
export { UserService } from "./services/user.service";
export type { IUserRepository, IUserValidation } from "./services/user.service";
```

#### 2.3.4. Criar module.json

**Arquivo**: `modules/logic/user-logic/module.json`

```json
{
  "id": "user-logic",
  "name": "User Business Logic",
  "version": "1.0.0",
  "category": "logic",
  "description": "Core business logic for user management including services, validations, and domain types",
  "author": "Bebarter Team",
  "license": "MIT",

  "exports": {
    "services": [
      {
        "name": "UserService",
        "path": "./services/user.service",
        "methods": [
          "getUserById",
          "getUsers",
          "createUser",
          "updateUser",
          "deleteUser"
        ],
        "dependencies": ["IUserRepository", "IUserValidation"],
        "description": "Service for user CRUD operations with validation",
        "example": "const userService = new UserService(repository, validation)\nconst user = await userService.getUserById('123')"
      }
    ],
    "types": [
      "User",
      "CreateUserInput",
      "UpdateUserInput",
      "UserListFilter",
      "UserListResponse",
      "IUserRepository",
      "IUserValidation"
    ]
  },

  "dependencies": {
    "modules": [],
    "packages": ["zod"]
  },

  "ai": {
    "summary": "Provides complete business logic for user management with CRUD operations, validation, and type-safe interfaces following SOLID principles",
    "keywords": [
      "user",
      "service",
      "business-logic",
      "crud",
      "validation",
      "solid"
    ],
    "reusable": {
      "services": ["UserService"],
      "patterns": [
        "Repository pattern",
        "Interface Segregation",
        "Dependency Injection"
      ]
    },
    "usage_scenarios": [
      "User CRUD operations",
      "User validation logic",
      "User data transformation",
      "Integration with database layer"
    ]
  },

  "tags": ["logic", "user", "service", "solid"],
  "status": "stable",
  "createdAt": "2025-01-11T10:00:00.000Z",
  "updatedAt": "2025-01-11T10:00:00.000Z"
}
```

---

### Tarefa 2.4: Criar Módulo Data (user-data)

#### 2.4.1. Criar Estrutura

```bash
mkdir -p modules/data/user-data/{schemas,migrations,docs,tests}
```

#### 2.4.2. Extrair Schema SQL

**Arquivo**: `modules/data/user-data/schemas/users.sql`

```sql
-- Users table schema
-- Extracted from database/setup.sql

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

#### 2.4.3. Criar README

**Arquivo**: `modules/data/user-data/README.md`

````markdown
# User Data Module

Database schemas and migrations for user management.

## Tables

### users

Main user table with profile information.

**Columns**:

- `id` (UUID): Primary key
- `email` (TEXT): Unique email address
- `name` (TEXT): User's display name
- `avatar_url` (TEXT): Profile picture URL
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Indexes**:

- `idx_users_email`: For email lookups
- `idx_users_created_at`: For sorting by creation date

**RLS Policies**:

- Users can view their own profile
- Users can update their own profile

## Setup

```sql
-- Execute schema
psql -f schemas/users.sql
```
````

## Migrations

None yet. Schema is stable at v1.0.0.

````

#### 2.4.4. Criar module.json

**Arquivo**: `modules/data/user-data/module.json`

```json
{
  "id": "user-data",
  "name": "User Database Schema",
  "version": "1.0.0",
  "category": "data",
  "description": "Database schema, indexes and RLS policies for user management",
  "author": "Bebarter Team",
  "license": "MIT",

  "exports": {},

  "dependencies": {
    "modules": [],
    "packages": []
  },

  "database": {
    "schemas": ["users"],
    "migrations": [],
    "rls": true,
    "indexes": ["idx_users_email", "idx_users_created_at"]
  },

  "ai": {
    "summary": "Provides PostgreSQL schema for users table with RLS policies, indexes and triggers for user profile management",
    "keywords": ["database", "schema", "users", "postgresql", "rls", "supabase"],
    "reusable": {
      "patterns": [
        "RLS policies for user data",
        "Updated_at trigger",
        "UUID primary keys",
        "Email indexing"
      ]
    },
    "usage_scenarios": [
      "User authentication system",
      "User profile storage",
      "Multi-tenant user management"
    ]
  },

  "tags": ["data", "database", "users", "postgresql"],
  "status": "stable",
  "createdAt": "2025-01-11T10:00:00.000Z",
  "updatedAt": "2025-01-11T10:00:00.000Z"
}
````

---

### Tarefa 2.5: Atualizar Imports na Aplicação

#### Objetivo

Atualizar todos os imports que referenciam a antiga estrutura.

#### Comando para Encontrar

```bash
# Encontrar todos os imports de users
grep -r "from.*features/users" src/
```

#### Substituir

**Antes**:

```typescript
import { User, UserService } from "@/features/users";
import { useUser, useUsers } from "@/features/users";
```

**Depois**:

```typescript
import { User, UserService } from "@/modules/logic/user-logic";
import { useUser, useUsers } from "@/modules/ui/user-profile-ui";
```

#### Script Automatizado

**Arquivo**: `scripts/modules/update-imports.js`

```javascript
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

/**
 * Atualiza imports da feature users para módulos
 */

async function updateImports() {
  console.log("🔄 Atualizando imports...\n");

  const files = await glob("src/**/*.{ts,tsx}", { ignore: "node_modules/**" });

  const replacements = [
    {
      from: /from ['"]@\/features\/users['"]/g,
      to: "from '@/modules/logic/user-logic'",
      description: "Types e Services",
    },
    {
      from: /from ['"]@\/features\/users\/hooks['"]/g,
      to: "from '@/modules/ui/user-profile-ui'",
      description: "Hooks",
    },
    {
      from: /from ['"]@\/features\/users\/components['"]/g,
      to: "from '@/modules/ui/user-profile-ui'",
      description: "Components",
    },
  ];

  let totalUpdates = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, "utf8");
    let updated = false;

    for (const { from, to, description } of replacements) {
      if (from.test(content)) {
        content = content.replace(from, to);
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(file, content, "utf8");
      console.log(`✅ ${file}`);
      totalUpdates++;
    }
  }

  console.log(`\n🎉 ${totalUpdates} arquivo(s) atualizado(s)`);
}

updateImports().catch(console.error);
```

#### Executar

```bash
node scripts/modules/update-imports.js
```

---

### Tarefa 2.6: Registrar Módulos no Registry

#### Objetivo

Adicionar os 3 novos módulos ao `registry.json`.

#### Script de Registro

**Arquivo**: `scripts/modules/register.js`

```javascript
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Registra módulos no registry.json
 */

function registerModule(manifest) {
  const registryPath = ".modules/registry.json";
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

  const entry = {
    id: manifest.id,
    name: manifest.name,
    path: `modules/${manifest.category}/${manifest.id}`,
    version: manifest.version,
    category: manifest.category,
    exports: {
      components: manifest.exports.components?.length || 0,
      hooks: manifest.exports.hooks?.length || 0,
      services: manifest.exports.services?.length || 0,
      stores: manifest.exports.stores?.length || 0,
    },
    keywords: manifest.ai.keywords,
    status: manifest.status,
  };

  // Adicionar à categoria
  registry.categories[manifest.category].push(entry);

  // Atualizar stats
  registry.stats.total_modules++;
  registry.stats[manifest.category]++;
  registry.updated = new Date().toISOString();

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log(`✅ Módulo ${manifest.id} registrado`);
}

// Registrar os 3 módulos
const modules = [
  "modules/ui/user-profile-ui/module.json",
  "modules/logic/user-logic/module.json",
  "modules/data/user-data/module.json",
];

modules.forEach((modulePath) => {
  const manifest = JSON.parse(fs.readFileSync(modulePath, "utf8"));
  registerModule(manifest);
});

console.log("\n🎉 Todos os módulos registrados!");
```

#### Adicionar ao package.json

```json
{
  "scripts": {
    "modules:register": "node scripts/modules/register.js"
  }
}
```

#### Executar

```bash
npm run modules:register
```

---

### Tarefa 2.7: Atualizar installed.json

#### Arquivo: `.modules/installed.json`

```json
{
  "modules": ["user-profile-ui@1.0.0", "user-logic@1.0.0", "user-data@1.0.0"],
  "last_updated": "2025-01-11T10:00:00.000Z"
}
```

---

### Tarefa 2.8: Validar Migração

#### Checklist

```bash
# 1. Verificar estrutura de módulos
tree modules/

# 2. Validar manifests
npm run modules:validate

# 3. Compilar TypeScript
npm run type-check

# 4. Executar testes
npm test

# 5. Iniciar dev server
npm run dev

# 6. Verificar funcionalidade users
# Abrir http://localhost:3000/users
# Testar CRUD operations
```

---

## ✅ Entregáveis

Ao final da Fase 2:

### 1. Três Módulos Criados

- ✅ `modules/ui/user-profile-ui/`
- ✅ `modules/logic/user-logic/`
- ✅ `modules/data/user-data/`

### 2. Manifests Completos

- ✅ Cada módulo tem `module.json` detalhado
- ✅ Metadata AI completa
- ✅ Exemplos de uso

### 3. Registry Atualizado

- ✅ 3 módulos em `registry.json`
- ✅ Stats atualizados
- ✅ `installed.json` populado

### 4. Código Funcionando

- ✅ Imports atualizados
- ✅ TypeScript compilando
- ✅ Testes passando
- ✅ Aplicação rodando

### 5. Documentação

- ✅ README em cada módulo
- ✅ Processo documentado para replicar

---

## 🧪 Testes de Validação

```bash
# 1. Estrutura
tree modules/ | grep "module.json"
# Deve mostrar 3 module.json

# 2. Registry
cat .modules/registry.json | grep "total_modules"
# Deve mostrar: "total_modules": 3

# 3. TypeScript
npm run type-check
# 0 errors

# 4. Funcionalidade
npm run dev
# Acessar /users e testar CRUD
```

---

## 📊 Checklist de Conclusão

- [ ] 3 módulos criados (UI, Logic, Data)
- [ ] Manifests completos e validados
- [ ] Imports atualizados em toda aplicação
- [ ] Registry.json atualizado (3 módulos)
- [ ] Installed.json atualizado
- [ ] TypeScript compilando sem erros
- [ ] Testes passando
- [ ] Aplicação funcionando normalmente
- [ ] README criado em cada módulo

---

## 🚀 Próximos Passos

**[Fase 3 - Automação](./03-FASE-3-AUTOMACAO.md)**

Na Fase 3, você irá:

- Evoluir `generate-feature.js` → `generate-module.js`
- Criar CLI completo de módulos
- Automatizar registro no registry
- Criar ferramentas de descoberta para IA

---

**Última atualização**: 2025-01-11
**Duração estimada**: 2-3 dias
**Fase anterior**: [Fase 1 - Fundação](./01-FASE-1-FUNDACAO.md)
**Próxima fase**: [Fase 3 - Automação](./03-FASE-3-AUTOMACAO.md)
