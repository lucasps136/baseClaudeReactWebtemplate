# Contributing to Modules

Este guia explica como criar, modificar e manter módulos no sistema modular do Bebarter.

## Tabela de Conteúdos

- [Criando um Novo Módulo](#criando-um-novo-módulo)
- [Estrutura Padrão](#estrutura-padrão)
- [Module.json Specification](#modulejson-specification)
- [Como Registrar no Registry](#como-registrar-no-registry)
- [Standards de Documentação](#standards-de-documentação)
- [Testing Requirements](#testing-requirements)
- [PR Checklist](#pr-checklist)
- [Best Practices](#best-practices)

## Criando um Novo Módulo

### Passo 1: Escolha a Categoria Correta

Determine a categoria do seu módulo:

- **`ui/`**: Componentes React, hooks customizados, stores de UI
- **`logic/`**: Services, business logic, validações
- **`data/`**: Schemas de banco, migrations, queries
- **`integration/`**: Integrações com serviços externos

### Passo 2: Use o Generator (Recomendado)

```bash
npm run generate:module <nome-do-modulo> --category <categoria>

# Exemplos:
npm run generate:module user-profile-ui --category ui
npm run generate:module payment-logic --category logic
npm run generate:module order-data --category data
npm run generate:module stripe-integration --category integration
```

Isso criará automaticamente:

- Estrutura de diretórios
- Arquivo `module.json` básico
- Arquivos `index.ts` para exports
- Estrutura de documentação
- Template de testes

### Passo 3: Ou Crie Manualmente

Se preferir criar manualmente, siga a estrutura abaixo.

## Estrutura Padrão

### UI Module

```
modules/ui/nome-do-modulo/
├── src/
│   ├── components/           # Componentes React
│   │   ├── ComponentName.tsx
│   │   └── index.ts
│   ├── hooks/               # Custom hooks
│   │   ├── useHookName.ts
│   │   └── index.ts
│   ├── stores/              # Zustand stores
│   │   ├── store-name.store.ts
│   │   └── index.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── index.ts             # Main exports
├── tests/                   # Test files
│   ├── components/
│   ├── hooks/
│   └── stores/
├── docs/                    # Documentation
│   └── README.md
├── module.json              # Module manifest
└── package.json             # If standalone (optional)
```

### Logic Module

```
modules/logic/nome-do-modulo/
├── src/
│   ├── services/            # Business logic services
│   │   ├── service-name.service.ts
│   │   └── index.ts
│   ├── repositories/        # Repository interfaces
│   │   ├── repository-name.repository.interface.ts
│   │   └── index.ts
│   ├── validations/         # Validation logic
│   │   ├── validation-name.validation.ts
│   │   └── index.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── index.ts             # Main exports
├── tests/
│   ├── services/
│   ├── repositories/
│   └── validations/
├── docs/
│   └── README.md
└── module.json
```

### Data Module

```
modules/data/nome-do-modulo/
├── migrations/              # SQL migrations
│   ├── 001_create_table.sql
│   └── 002_add_indexes.sql
├── queries/                 # Reusable queries
│   ├── read.sql
│   ├── write.sql
│   └── index.ts
├── schemas/                 # Schema definitions
│   └── schema.sql
├── docs/
│   └── README.md
└── module.json
```

### Integration Module

```
modules/integration/nome-do-modulo/
├── src/
│   ├── client/              # API client
│   │   └── client.ts
│   ├── types/               # Types
│   │   └── index.ts
│   ├── utils/               # Utilities
│   │   └── index.ts
│   └── index.ts
├── tests/
├── docs/
│   └── README.md
└── module.json
```

## Module.json Specification

Todo módulo **DEVE** ter um `module.json` com a seguinte estrutura:

```json
{
  "id": "module-name",
  "name": "Module Display Name",
  "version": "1.0.0",
  "category": "ui|logic|data|integration",
  "description": "Clear, concise description of module purpose",
  "exports": {
    "components": [
      {
        "name": "ComponentName",
        "path": "./components/ComponentName",
        "props": {},
        "description": "What the component does",
        "example": "<ComponentName />"
      }
    ],
    "hooks": [
      {
        "name": "useHookName",
        "path": "./hooks/useHookName",
        "description": "What the hook does",
        "example": "const {} = useHookName()"
      }
    ],
    "services": [
      {
        "name": "ServiceName",
        "path": "./services/service-name.service",
        "description": "What the service does",
        "example": "new ServiceName(deps)"
      }
    ],
    "types": [
      {
        "name": "TypeName",
        "path": "./types",
        "description": "What the type represents"
      }
    ]
  },
  "dependencies": {
    "modules": ["@/modules/category/dependency-module"],
    "packages": ["react", "zod"]
  },
  "ai": {
    "summary": "AI-friendly summary for module discovery",
    "keywords": ["keyword1", "keyword2"],
    "use_cases": ["Use case 1", "Use case 2"],
    "reusable": {
      "components": ["ComponentName"],
      "hooks": ["useHookName"],
      "types": ["TypeName"]
    },
    "examples": ["import { Export } from '@/modules/category/module-name'"]
  },
  "status": "stable|beta|experimental|deprecated",
  "createdAt": "2025-01-11T00:00:00.000Z",
  "updatedAt": "2025-01-11T00:00:00.000Z",
  "author": "Your Name",
  "license": "MIT",
  "tags": ["tag1", "tag2"]
}
```

### Campos Obrigatórios

- `id`: Identificador único (kebab-case)
- `name`: Nome para display
- `version`: Versão semântica (SemVer)
- `category`: Uma das categorias válidas
- `description`: Descrição clara e concisa
- `exports`: Pelo menos um export documentado
- `status`: Status do módulo

### Campos Recomendados

- `ai.summary`: Para descoberta via IA
- `ai.keywords`: Para busca
- `ai.use_cases`: Casos de uso práticos
- `dependencies`: Dependências explícitas
- `tags`: Tags para organização

## Como Registrar no Registry

Após criar ou modificar um módulo, sincronize o registry:

```bash
npm run modules:sync
```

Isso irá:

1. Escanear todos os módulos em `modules/`
2. Validar cada `module.json`
3. Atualizar `.modules/registry.json`
4. Criar índice de busca

### Verificar Registro

```bash
# Listar todos os módulos
npm run modules:list

# Buscar seu módulo
npm run modules:search "nome-do-modulo"

# Validar manifests
npm run modules:validate
```

## Standards de Documentação

### README Obrigatório

Todo módulo **DEVE** ter `docs/README.md` com:

1. **Overview**: O que o módulo faz
2. **Installation**: Como instalar/configurar
3. **Usage**: Exemplos básicos de uso
4. **API Reference**: Documentação completa de exports
5. **Examples**: Pelo menos 3 exemplos práticos
6. **Dependencies**: Dependências listadas
7. **Testing**: Como testar

Use o template em `.modules/templates/README-template.md` como base.

### Exemplos de Código

- Todos os exemplos devem ser **executáveis** (copiar/colar funciona)
- Use syntax highlighting apropriado (```typescript)
- Inclua imports necessários
- Mostre tanto uso básico quanto avançado

### API Reference

Documente todos os exports públicos:

**Para Componentes:**

```markdown
#### ComponentName

**Props:**

| Prop     | Type   | Required | Default | Description |
| -------- | ------ | -------- | ------- | ----------- |
| propName | string | Yes      | -       | Description |

**Example:**

\`\`\`typescript
<ComponentName propName="value" />
\`\`\`
```

**Para Hooks:**

```markdown
#### useHookName

**Returns:**

| Property | Type     | Description |
| -------- | -------- | ----------- |
| data     | DataType | Description |
| loading  | boolean  | Description |
```

**Para Services:**

```markdown
#### ServiceName

**Methods:**

##### methodName

\`\`\`typescript
async methodName(param: Type): Promise<ReturnType>
\`\`\`

**Parameters:**

- `param` (Type): Description

**Returns:** Promise<ReturnType>

**Throws:** Error conditions
```

## Testing Requirements

### Coverage Mínima

Todo módulo deve ter:

- **70%** de cobertura mínima (branches, functions, lines, statements)
- Testes para todos os exports públicos
- Testes de integração quando aplicável

### Estrutura de Testes

```
tests/
├── components/
│   └── ComponentName.test.tsx
├── hooks/
│   └── useHookName.test.ts
├── services/
│   └── service-name.service.test.ts
└── integration/
    └── integration.test.ts
```

### Comandos de Teste

```bash
# Rodar testes do módulo
npm test -- modules/category/module-name

# Watch mode
npm test -- --watch modules/category/module-name

# Com coverage
npm test -- --coverage modules/category/module-name
```

### Exemplos de Testes

Use os templates em `.modules/templates/test-template.ts` como referência:

- `componentTestTemplate` para componentes
- `hookTestTemplate` para hooks
- `serviceTestTemplate` para services
- `storeTestTemplate` para stores

## PR Checklist

Antes de submeter um Pull Request, verifique:

### Código

- [ ] Código segue princípios SOLID
- [ ] Responsabilidade única por classe/função
- [ ] Dependências injetadas via construtor/props
- [ ] TypeScript strict mode sem erros
- [ ] Sem código duplicado (DRY)

### Documentação

- [ ] `module.json` completo e válido
- [ ] `docs/README.md` com todas as seções
- [ ] API Reference completa
- [ ] Pelo menos 3 exemplos práticos
- [ ] Exemplos de código executáveis

### Testes

- [ ] Coverage >= 70%
- [ ] Testes para todos os exports públicos
- [ ] Testes passando: `npm test`
- [ ] Sem warnings ou errors

### Registry

- [ ] `npm run modules:sync` executado
- [ ] Módulo aparece em `npm run modules:list`
- [ ] Busca funciona: `npm run modules:search "nome"`

### Qualidade

- [ ] ESLint sem erros: `npm run lint`
- [ ] Prettier aplicado: `npm run format`
- [ ] Type check ok: `npm run type-check`

## Best Practices

### Naming Conventions

- **Módulos**: kebab-case (`user-profile-ui`, `payment-logic`)
- **Componentes**: PascalCase (`UserProfile`, `PaymentForm`)
- **Hooks**: camelCase com `use` prefix (`useUser`, `usePayment`)
- **Services**: PascalCase com `Service` suffix (`UserService`, `PaymentService`)
- **Stores**: camelCase com `use` prefix e `Store` suffix (`useUserStore`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `PaymentData`)

### SOLID Principles

#### Single Responsibility

```typescript
// ✅ BOM - Uma responsabilidade
class UserService {
  async getUser(id: string): Promise<User> {}
}

class UserValidation {
  validate(user: User): boolean {}
}

// ❌ RUIM - Múltiplas responsabilidades
class UserService {
  async getUser(id: string): Promise<User> {}
  validate(user: User): boolean {}
  sendEmail(user: User): void {}
}
```

#### Dependency Inversion

```typescript
// ✅ BOM - Depende de abstração
class UserService {
  constructor(private repository: IUserRepository) {}
}

// ❌ RUIM - Depende de implementação
class UserService {
  constructor(private repository: SupabaseUserRepository) {}
}
```

#### Interface Segregation

```typescript
// ✅ BOM - Interfaces específicas
interface Readable {
  read(): Data;
}
interface Writable {
  write(data: Data): void;
}

// ❌ RUIM - Interface gorda
interface Repository {
  read();
  write();
  delete();
  update();
  backup();
  restore();
}
```

### Exports Organization

Organize exports por tipo no `index.ts`:

```typescript
// src/index.ts

// Components
export { UserProfile } from "./components/UserProfile";
export { UserList } from "./components/UserList";

// Hooks
export { useUser } from "./hooks/useUser";
export { useUsers } from "./hooks/useUsers";

// Stores
export { useUserStore } from "./stores/user.store";

// Types
export type { UserProfile, CreateUserInput, UpdateUserInput } from "./types";
```

### Error Handling

```typescript
// ✅ BOM - Erros específicos
class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User ${id} not found`);
    this.name = "UserNotFoundError";
  }
}

// ❌ RUIM - Erros genéricos
throw new Error("Something went wrong");
```

### Async/Await

```typescript
// ✅ BOM - Tratamento de erros
async function getUser(id: string): Promise<User> {
  try {
    return await userService.getUser(id);
  } catch (error) {
    console.error("Failed to get user:", error);
    throw error;
  }
}

// ❌ RUIM - Sem tratamento
async function getUser(id: string): Promise<User> {
  return await userService.getUser(id);
}
```

### TypeScript

```typescript
// ✅ BOM - Types explícitos
interface UserProps {
  id: string;
  name: string;
  email: string;
}

function UserCard({ id, name, email }: UserProps): JSX.Element {
  // ...
}

// ❌ RUIM - Any ou inferência implícita
function UserCard(props: any) {
  // ...
}
```

## Versionamento

Use [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes
- **MINOR** (1.0.0 -> 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 -> 1.0.1): Bug fixes, backward compatible

### Quando Incrementar

**MAJOR:**

- Mudança de interface pública
- Remoção de exports
- Mudança de comportamento incompatível

**MINOR:**

- Novos exports
- Novas features
- Deprecations

**PATCH:**

- Bug fixes
- Melhorias de performance
- Atualizações de documentação

## Deprecation Policy

Ao deprecar um módulo ou export:

1. Marcar como deprecated no `module.json`:

```json
{
  "status": "deprecated",
  "deprecation": {
    "since": "2.0.0",
    "reason": "Use new-module instead",
    "migration": "See docs/MIGRATION.md"
  }
}
```

2. Adicionar warning no código:

```typescript
/**
 * @deprecated Use NewComponent instead. Will be removed in v3.0.0
 */
export function OldComponent() {
  console.warn("OldComponent is deprecated. Use NewComponent instead.");
  // ...
}
```

3. Criar guia de migração em `docs/MIGRATION.md`

## Suporte e Ajuda

- **Documentação**: [docs/modular-architecture/README.md](../docs/modular-architecture/README.md)
- **Quick Reference**: [docs/modular-architecture/QUICK-REFERENCE.md](../docs/modular-architecture/QUICK-REFERENCE.md)
- **Template README**: [.modules/templates/README-template.md](../.modules/templates/README-template.md)
- **Test Templates**: [.modules/templates/test-template.ts](../.modules/templates/test-template.ts)

## Exemplos de Módulos Bem Documentados

Use como referência:

- `modules/ui/user-profile-ui` - Exemplo de UI module completo
- `modules/logic/user-logic` - Exemplo de Logic module com SOLID
- `modules/data/user-data` - Exemplo de Data module com SQL

---

**Última atualização**: 2025-01-12
**Versão do guia**: 1.0.0

Dúvidas ou sugestões? Abra uma issue ou PR!
