# Guia de Referência Rápida - Arquitetura Modular

## 🚀 Comandos Essenciais

### Criar Novo Módulo

```bash
npm run generate:module <name> --category <ui|logic|data|integration>

# Exemplos:
npm run generate:module product-catalog --category ui
npm run generate:module order-processing --category logic
npm run generate:module inventory --category data
npm run generate:module stripe-payment --category integration
```

### Gerenciar Módulos

```bash
# Listar todos
npm run modules:list

# Listar por categoria
npm run modules:list --category ui

# Buscar por keyword
npm run modules:search "user"

# Ver detalhes
npm run modules info user-profile-ui

# Validar manifests
npm run modules:validate

# Sincronizar registry
npm run modules:sync

# Remover módulo
npm run modules remove <module-id> --force
```

### Descoberta para IA

```bash
# Buscar componentes
node scripts/modules/discover.js components "list"

# Buscar hooks
node scripts/modules/discover.js hooks "form"

# Buscar services
node scripts/modules/discover.js services "user"

# Obter exemplos
node scripts/modules/discover.js examples "UserList"

# Criar índice de busca
npm run modules:index

# Sugestões inteligentes
npm run modules:suggest "create user profile page"
```

### Métricas e Qualidade

```bash
# Ver métricas
npm run modules:metrics

# Quality check
npm run quality:check

# Testes
npm run test:modules
npm run test:modules:watch
npm run test:modules:coverage
```

### Storybook

```bash
npm run storybook
# Abrir http://localhost:6006
```

---

## 📁 Estrutura de Módulos

### UI Module

```
modules/ui/[name]/
├── module.json          # Manifest
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom hooks
│   ├── stores/         # Zustand stores (opcional)
│   └── types/          # TypeScript types
├── docs/
│   └── README.md       # Documentação
├── tests/              # Jest tests
└── index.ts            # Exports
```

### Logic Module

```
modules/logic/[name]/
├── module.json
├── src/
│   ├── services/       # Business logic
│   ├── types/          # Domain types
│   ├── validations/    # Zod schemas
│   └── utils/          # Utilities
├── docs/
├── tests/
└── index.ts
```

### Data Module

```
modules/data/[name]/
├── module.json
├── schemas/            # SQL schemas
├── migrations/         # Migrations
├── seeds/             # Test data
├── queries/           # Reusable queries
├── docs/
└── README.md
```

### Integration Module

```
modules/integration/[name]/
├── module.json
├── src/
│   ├── providers/      # External providers
│   ├── adapters/       # Format conversions
│   ├── webhooks/       # Webhook handlers
│   └── config/         # Configs
├── docs/
├── tests/
└── index.ts
```

---

## 📄 Manifest (module.json)

### Template Mínimo

```json
{
  "id": "module-name",
  "name": "Module Display Name",
  "version": "1.0.0",
  "category": "ui",
  "description": "What this module does",
  "exports": {
    "components": [
      {
        "name": "ComponentName",
        "path": "./components/ComponentName",
        "props": { "prop1": "string" },
        "example": "<ComponentName prop1=\"value\" />"
      }
    ]
  },
  "dependencies": {
    "modules": [],
    "packages": ["react"]
  },
  "ai": {
    "summary": "Brief summary for AI",
    "keywords": ["keyword1", "keyword2"],
    "reusable": {
      "components": ["ComponentName"],
      "hooks": [],
      "services": []
    }
  },
  "status": "stable",
  "createdAt": "2025-01-11T10:00:00.000Z",
  "updatedAt": "2025-01-11T10:00:00.000Z"
}
```

---

## 🎯 Workflow Recomendado

### Para Criar Nova Feature

1. **Descobrir** se já existe algo similar:

   ```bash
   npm run modules:suggest "create user profile page"
   ```

2. **Reutilizar** se encontrar componentes existentes:

   ```typescript
   import { UserProfile } from "@/modules/ui/user-profile-ui";
   ```

3. **Criar novo** se não existir:

   ```bash
   npm run generate:module user-profile --category ui
   ```

4. **Implementar** código em `modules/ui/user-profile/src/`

5. **Atualizar** `module.json` com metadata completa

6. **Documentar** em `docs/README.md`

7. **Testar** com Jest:

   ```bash
   npm test -- modules/ui/user-profile
   ```

8. **Sincronizar** registry:
   ```bash
   npm run modules:sync
   ```

---

## 🔧 Imports

### Importar de Módulos

```typescript
// UI Module
import { UserList, useUsers } from "@/modules/ui/user-profile-ui";

// Logic Module
import { UserService, type User } from "@/modules/logic/user-logic";

// Integration Module
import { StripeProvider } from "@/modules/integration/stripe";
```

### Aliases TypeScript

Configure no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/modules/*": ["./modules/*"],
      "@/modules/ui/*": ["./modules/ui/*"],
      "@/modules/logic/*": ["./modules/logic/*"],
      "@/modules/data/*": ["./modules/data/*"],
      "@/modules/integration/*": ["./modules/integration/*"]
    }
  }
}
```

---

## 📊 Status de Módulos

| Status         | Descrição                                     |
| -------------- | --------------------------------------------- |
| `experimental` | Em desenvolvimento, pode ter breaking changes |
| `stable`       | Pronto para produção, API estável             |
| `deprecated`   | Será removido, não use em novo código         |

---

## 🧪 Testes

### Test Template

```typescript
import { render, screen } from '@testing-library/react'
import { Component } from '../src/components/Component'

describe('Component', () => {
  it('renders', () => {
    render(<Component />)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })
})
```

### Comandos

```bash
# Todos os testes
npm run test:modules

# Watch mode
npm run test:modules:watch

# Coverage
npm run test:modules:coverage

# Teste específico
npm test -- modules/ui/user-profile-ui
```

---

## 📈 Métricas

### Interpretar Scores

**Reusability Score** (0-100):

- 0-30: Baixa reutilização
- 31-60: Média reutilização
- 61-100: Alta reutilização (objetivo)

**Quality Score** (0-100):

- 0-50: Precisa melhorar
- 51-70: Aceitável
- 71-100: Excelente (objetivo)

### Melhorar Scores

Para aumentar **Reusability**:

- Criar mais exports reutilizáveis
- Adicionar exemplos no manifest
- Documentar casos de uso

Para aumentar **Quality**:

- Adicionar README em cada módulo
- Criar testes (coverage > 70%)
- Incluir exemplos no manifest

---

## 🤖 Prompts para IA

### UI Agent

```
Você é o UI Agent. Antes de criar qualquer componente:
1. Consulte: node scripts/modules/discover.js components "<query>"
2. Se existir similar, REUTILIZE
3. Se não existir, crie novo módulo
4. SEMPRE atualize module.json com metadata
5. NUNCA modifique módulos logic/data/integration
```

### Backend Agent

```
Você é o Backend Agent. Antes de criar service:
1. Consulte: node scripts/modules/discover.js services "<domain>"
2. Siga SOLID principles
3. Use Dependency Injection
4. SEMPRE crie interfaces (IRepository, IValidation)
5. NUNCA modifique módulos ui/data/integration
```

### Database Agent

```
Você é o Database Agent. Antes de criar schema:
1. Verifique schemas existentes em modules/data/
2. SEMPRE use RLS policies
3. SEMPRE crie indexes necessários
4. SEMPRE adicione trigger updated_at
5. NUNCA modifique módulos ui/logic/integration
```

### Integration Agent

```
Você é o Integration Agent. Antes de criar integração:
1. Liste integrações: npm run modules:list --category integration
2. NUNCA hardcode secrets
3. SEMPRE valide webhooks
4. SEMPRE trate erros de rede
5. NUNCA modifique módulos ui/logic/data
```

---

## ❓ Troubleshooting

### Erro: Module not found

```bash
# Sincronizar registry
npm run modules:sync

# Validar estrutura
npm run modules:validate

# Verificar imports
grep -r "from '@/modules" src/
```

### Erro: Invalid manifest

```bash
# Validar manifest específico
npm run modules validate <module-id>

# Validar todos
npm run modules:validate
```

### Performance Lenta

```bash
# Rebuild search index
npm run modules:index

# Limpar cache
rm -rf .modules/cache/*
npm run modules:index
```

---

## 📚 Documentos Relacionados

- [Visão Geral](./00-OVERVIEW.md)
- [Fase 1 - Fundação](./01-FASE-1-FUNDACAO.md)
- [Fase 2 - Migração](./02-FASE-2-MIGRACAO.md)
- [Fase 3 - Automação](./03-FASE-3-AUTOMACAO.md)
- [Fase 4 - Otimização IA](./04-FASE-4-OTIMIZACAO-IA.md)
- [Fase 5 - Documentação e Testes](./05-FASE-5-DOCS-TESTES.md)

---

## 🆘 Ajuda

### Comandos Úteis

```bash
# Help do CLI
npm run modules -- --help

# Listar comandos disponíveis
npm run

# Documentação online
open docs/modular-architecture/00-OVERVIEW.md
```

### Contato

- Issues: https://github.com/[repo]/issues
- Docs: `docs/modular-architecture/`

---

**Última atualização**: 2025-01-11
**Versão**: 1.0.0
