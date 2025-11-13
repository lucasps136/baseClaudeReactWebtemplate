# Guia de Comandos - Sistema Modular

Referência completa de todos os comandos disponíveis no sistema de arquitetura modular.

---

## 📋 Índice Rápido

- [Gerenciamento de Módulos](#-gerenciamento-de-módulos)
- [Testes](#-testes)
- [Qualidade e Métricas](#-qualidade-e-métricas)
- [Descoberta (para IA)](#-descoberta-para-ia)
- [Desenvolvimento](#-desenvolvimento)
- [Manutenção](#-manutenção)

---

## 📦 Gerenciamento de Módulos

### Listar Módulos

```bash
# Listar todos os módulos
npm run modules:list

# Listar por categoria
npm run modules:list --category ui
npm run modules:list --category logic
npm run modules:list --category data
npm run modules:list --category integration

# Ver estatísticas resumidas
npm run modules:list --stats
```

**Saída esperada**:

- Lista formatada de módulos por categoria
- Nome, versão e descrição de cada módulo
- Localização (path) do módulo
- Total de módulos por categoria

### Buscar Módulos

```bash
# Buscar por keyword
npm run modules:search "user"

# Buscar por múltiplas keywords
npm run modules:search "user profile"

# Buscar componentes específicos
npm run modules:search "UserList"

# Buscar hooks
npm run modules:search "useUsers"
```

**Busca em**:

- Nome do módulo
- Descrição
- Keywords
- Exports (components, hooks, services)

### Validar Módulos

```bash
# Validar todos os manifests
npm run modules:validate

# Validar módulo específico
npm run modules validate user-profile-ui

# Validar com modo strict
npm run modules:validate --strict
```

**Verifica**:

- Estrutura do manifest (module.json)
- Campos obrigatórios
- Formato de versão
- Exports declarados vs reais
- Dependências válidas

### Sincronizar Registry

```bash
# Sincronizar registry com módulos instalados
npm run modules:sync

# Forçar reconstrução completa
npm run modules:sync --force

# Sincronizar e validar
npm run modules:sync && npm run modules:validate
```

**Ações realizadas**:

- Varre diretório `modules/`
- Atualiza `.modules/registry.json`
- Atualiza `.modules/installed.json`
- Recalcula estatísticas

---

## 🧪 Testes

### Executar Testes

```bash
# Rodar todos os testes de módulos
npm run test:modules

# Modo watch (reexecuta ao salvar)
npm run test:modules:watch

# Com coverage report
npm run test:modules:coverage

# Teste de módulo específico
npm test -- modules/ui/user-profile-ui

# Teste de arquivo específico
npm test -- modules/ui/user-profile-ui/tests/UserList.test.tsx
```

**Opções do Jest**:

```bash
# Verbose (mais detalhes)
npm test -- --verbose

# Atualizar snapshots
npm test -- --updateSnapshot

# Rodar testes que falharam
npm test -- --onlyFailures

# Cobertura para módulo específico
npm test -- --coverage --collectCoverageFrom="modules/ui/user-profile-ui/**"
```

### Interpretar Coverage

**Coverage Report**:

```
-----------------------------------|---------|----------|---------|---------|
File                               | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------------|---------|----------|---------|---------|
All files                          |   98.24 |    89.28 |     100 |   98.14 |
```

**Níveis**:

- ✅ **> 90%**: Excelente
- ⚠️ **70-89%**: Bom
- ❌ **< 70%**: Precisa melhorar

---

## 📊 Qualidade e Métricas

### Quality Check

```bash
# Verificar qualidade de todos os módulos
npm run quality:check

# Modo strict (mais rigoroso)
npm run quality:check:strict

# Quality check de módulo específico
node scripts/modules/quality-check.js modules/ui/user-profile-ui
```

**Avalia**:

- Estrutura de diretórios
- Manifest válido
- Documentação presente
- Testes implementados
- Exports corretos

**Score**:

- ✅ **80-100**: Passou
- ⚠️ **60-79**: Warning
- ❌ **< 60**: Falhou

### Métricas do Sistema

```bash
# Relatório completo de métricas
node scripts/modules/metrics.js report

# Overview resumido
node scripts/modules/metrics.js overview

# Métricas de reutilização
node scripts/modules/metrics.js reusability

# Métricas de qualidade
node scripts/modules/metrics.js quality

# Relatório detalhado com recomendações
node scripts/modules/metrics.js report --detailed
```

**Métricas incluídas**:

- Total de módulos por categoria
- Exports reutilizáveis (components, hooks, services)
- Health status (docs, testes, exemplos)
- Reusability score (0-100)
- Quality score (0-100)
- Recomendações de melhoria

### Exemplo de Output

```
📊 MODULE SYSTEM METRICS
============================================================

📈 SYSTEM OVERVIEW
Total Modules: 3
By Category:
  🎨 ui          : 1 modules
  ⚙️ logic       : 1 modules
  🗄️ data        : 1 modules

Reusable Exports: 15 total
  • components  : 1
  • hooks       : 2
  • services    : 1
  • stores      : 1
  • types       : 7
  • schemas     : 1

Health Status:
  📖 With documentation: 3/3 (100%)
  🧪 With tests:         3/3 (100%)
  📝 With examples:      3/3 (100%)

♻️  REUSABILITY METRICS
Reusability Score: 73/100
Status: ⚠️  Good, can improve

⭐ QUALITY METRICS
Overall Quality Score: 92/100
Status: ✅ Excellent
```

---

## 🔍 Descoberta (para IA)

### Buscar Exports

```bash
# Buscar componentes
node scripts/modules/discover.js components "list"

# Buscar hooks
node scripts/modules/discover.js hooks "user"

# Buscar services
node scripts/modules/discover.js services "user"

# Buscar stores
node scripts/modules/discover.js stores "profile"

# Buscar types
node scripts/modules/discover.js types "User"

# Buscar schemas
node scripts/modules/discover.js schemas "validation"
```

**Retorna**:

- Nome do export
- Módulo de origem
- Path completo
- Exemplo de uso
- Props/Parâmetros (se disponível)

### Obter Exemplos

```bash
# Exemplos de componente específico
node scripts/modules/discover.js examples "UserList"

# Todos os exemplos de um módulo
node scripts/modules/discover.js examples --module user-profile-ui
```

### Sistema de Sugestões

```bash
# Obter sugestões para uma tarefa
npm run modules:suggest "create user profile page"

# Sugestões para implementação de feature
npm run modules:suggest "implement authentication"

# Sugestões de componentes reutilizáveis
npm run modules:suggest "show list of items"
```

**Sugestões incluem**:

- Módulos relevantes
- Componentes reutilizáveis
- Hooks aplicáveis
- Services relacionados
- Exemplos de código

### Criar Índice de Busca

```bash
# Criar/atualizar índice de busca
npm run modules:index

# Forçar reconstrução do índice
npm run modules:index --rebuild

# Verificar índice
node scripts/modules/discover.js index --check
```

**Índice contém**:

- Mapa invertido de keywords
- Referências a exports
- Cache de metadata
- Estatísticas de uso

---

## 🛠️ Desenvolvimento

### Criar Novo Módulo

```bash
# Gerar módulo UI
npm run generate:module product-list --category ui

# Gerar módulo Logic
npm run generate:module order-processing --category logic

# Gerar módulo Data
npm run generate:module inventory --category data

# Gerar módulo Integration
npm run generate:module stripe-payment --category integration
```

**Estrutura gerada**:

```
modules/<category>/<module-name>/
├── module.json          # Manifest com metadata
├── src/                 # Código-fonte
│   ├── components/      # (UI) ou services/ (Logic)
│   ├── types/          # TypeScript types
│   └── index.ts        # Exports
├── docs/
│   └── README.md       # Documentação
├── tests/              # Jest tests
│   └── README.md       # Test documentation
└── index.ts            # Main entry point
```

### Info de Módulo

```bash
# Ver detalhes completos de um módulo
npm run modules info user-profile-ui

# JSON output (para parsing)
npm run modules info user-profile-ui --json
```

**Informações exibidas**:

- Metadata completa (nome, versão, descrição)
- Exports (components, hooks, services)
- Dependências (modules, packages)
- Status e health
- Localização
- Keywords para IA

### Workflow Completo de Criação

```bash
# 1. Gerar módulo
npm run generate:module my-feature --category ui

# 2. Implementar código
# (editar arquivos em modules/ui/my-feature/src/)

# 3. Atualizar manifest
# (editar modules/ui/my-feature/module.json)

# 4. Criar testes
# (adicionar em modules/ui/my-feature/tests/)

# 5. Rodar testes
npm test -- modules/ui/my-feature

# 6. Validar
npm run modules:validate

# 7. Sincronizar
npm run modules:sync

# 8. Quality check
npm run quality:check

# 9. Commit
git add modules/ui/my-feature .modules/
git commit -m "feat(modules): add my-feature UI module"
```

---

## 🔧 Manutenção

### Remover Módulo

```bash
# Remover módulo (requer confirmação)
npm run modules remove user-profile-ui

# Forçar remoção sem confirmação
npm run modules remove user-profile-ui --force

# Remover e limpar dependências
npm run modules remove user-profile-ui --clean
```

**Ações realizadas**:

- Remove diretório do módulo
- Atualiza registry.json
- Atualiza installed.json
- Limpa cache (se --clean)

### Atualizar Módulo

```bash
# Atualizar versão do módulo
npm run modules update user-profile-ui --version 1.1.0

# Atualizar metadata
npm run modules update user-profile-ui --meta

# Forçar reprocessamento
npm run modules update user-profile-ui --reprocess
```

### Limpar Cache

```bash
# Limpar cache de descoberta
rm -rf .modules/cache/*

# Limpar e reconstruir
rm -rf .modules/cache/* && npm run modules:index

# Limpar cache de teste
npm run test:modules -- --clearCache
```

### Verificar Integridade

```bash
# Verificar integridade do sistema
npm run modules:check

# Verificar e reparar
npm run modules:check --repair

# Verificar dependências
npm run modules:check-deps
```

**Verifica**:

- Manifests válidos
- Exports declarados vs implementados
- Dependências satisfeitas
- Estrutura de diretórios
- Registry sincronizado

---

## 🤖 Comandos para Agentes IA

### Contexto para UI Agent

```bash
# Obter contexto completo para UI Agent
node scripts/modules/discover.js context --agent ui

# Listar componentes disponíveis
node scripts/modules/discover.js components --available

# Exemplos de UI patterns
node scripts/modules/discover.js examples --category ui
```

### Contexto para Backend Agent

```bash
# Obter contexto para Backend Agent
node scripts/modules/discover.js context --agent backend

# Listar services disponíveis
node scripts/modules/discover.js services --available

# Padrões de business logic
node scripts/modules/discover.js examples --category logic
```

### Contexto para Database Agent

```bash
# Obter contexto para Database Agent
node scripts/modules/discover.js context --agent database

# Listar schemas disponíveis
node scripts/modules/discover.js schemas --available

# Listar queries reutilizáveis
node scripts/modules/discover.js queries --available
```

### Contexto para Integration Agent

```bash
# Obter contexto para Integration Agent
node scripts/modules/discover.js context --agent integration

# Listar integrações disponíveis
npm run modules:list --category integration

# Padrões de integração
node scripts/modules/discover.js examples --category integration
```

---

## 📚 Scripts Package.json

### Referência Completa

```json
{
  "scripts": {
    // Gerenciamento
    "modules:list": "node scripts/modules/cli.js list",
    "modules:search": "node scripts/modules/cli.js search",
    "modules:validate": "node scripts/modules/cli.js validate",
    "modules:sync": "node scripts/modules/cli.js sync",
    "modules:check": "node scripts/modules/cli.js check",

    // Geração
    "generate:module": "node scripts/modules/generate-module.js",

    // Descoberta
    "modules:index": "node scripts/modules/discover.js index",
    "modules:suggest": "node scripts/modules/suggestions.js",

    // Testes
    "test:modules": "jest --config jest.config.modules.js",
    "test:modules:watch": "jest --config jest.config.modules.js --watch",
    "test:modules:coverage": "jest --config jest.config.modules.js --coverage",

    // Qualidade
    "quality:check": "node scripts/modules/quality-check.js",
    "quality:check:strict": "node scripts/modules/quality-check.js --strict",

    // Métricas
    "modules:metrics": "node scripts/modules/metrics.js report"
  }
}
```

---

## 🔗 Aliases TypeScript

### Configuração (tsconfig.json)

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

### Uso em Imports

```typescript
// UI Module
import { UserList, useUsers } from "@/modules/ui/user-profile-ui";

// Logic Module
import { UserService, type User } from "@/modules/logic/user-logic";

// Data Module (SQL queries)
import { getUsersQuery } from "@/modules/data/user-data";

// Integration Module
import { StripeProvider } from "@/modules/integration/stripe";
```

---

## ⚡ Comandos Rápidos (Cheatsheet)

### Dia a Dia

```bash
# Ver todos os módulos
npm run modules:list

# Buscar algo
npm run modules:search "keyword"

# Rodar testes
npm run test:modules

# Ver métricas
node scripts/modules/metrics.js report
```

### Criar Nova Feature

```bash
# 1. Verificar se já existe algo similar
npm run modules:suggest "minha feature"

# 2. Se não existir, criar módulo
npm run generate:module minha-feature --category ui

# 3. Implementar, testar e validar
npm test -- modules/ui/minha-feature
npm run modules:validate
npm run modules:sync
```

### Manutenção

```bash
# Health check completo
npm run quality:check && npm run test:modules:coverage

# Atualizar tudo
npm run modules:sync && npm run modules:index

# Limpar e reconstruir
rm -rf .modules/cache/* && npm run modules:index
```

---

## 🆘 Troubleshooting

### Erro: "Module not found"

```bash
npm run modules:sync
npm run modules:validate
```

### Erro: "Invalid manifest"

```bash
npm run modules validate <module-id>
# Corrigir module.json conforme indicado
```

### Performance lenta

```bash
rm -rf .modules/cache/*
npm run modules:index
```

### Testes falhando

```bash
# Limpar cache do Jest
npm run test:modules -- --clearCache

# Rodar novamente
npm run test:modules
```

---

## 📖 Documentação Relacionada

- [README Principal](./README.md)
- [Guia de Referência Rápida](./QUICK-REFERENCE.md)
- [CHANGELOG](./CHANGELOG.md)
- [Visão Geral](./00-OVERVIEW.md)

---

## 💡 Dicas

### Performance

1. **Use cache**: O índice de busca é cacheado. Reconstrua apenas quando necessário.
2. **Watch mode**: Para desenvolvimento ativo, use `test:modules:watch`.
3. **Busca focada**: Use keywords específicas para resultados mais rápidos.

### Qualidade

1. **Valide sempre**: `npm run modules:validate` antes de commit.
2. **Testes primeiro**: Crie testes antes de sincronizar módulo.
3. **Documentação rica**: Quanto mais metadata, melhor a descoberta da IA.

### Organização

1. **Categorias corretas**: UI, Logic, Data, Integration - mantenha separado.
2. **Nomenclatura clara**: Use kebab-case descritivo.
3. **Exports completos**: Declare todos os exports no manifest.

---

**Última atualização**: 2025-01-13
**Versão**: 1.0.0
**Feedback**: Abra issue ou consulte a documentação completa
