# Sistema de Módulos - Arquivos Internos

Este diretório contém os arquivos internos do sistema de módulos.

## 📁 Arquivos

### `schema.ts`

Schemas TypeScript e Zod para validação de manifests e registry.

### `registry.json`

Catálogo centralizado de todos os módulos disponíveis.

Estrutura:

```json
{
  "version": "1.0.0",
  "updated": "ISO-8601 timestamp",
  "categories": {
    "ui": [...],
    "logic": [...],
    "data": [...],
    "integration": [...]
  },
  "stats": {
    "total_modules": 0,
    "ui": 0,
    "logic": 0,
    "data": 0,
    "integration": 0,
    "reusability_score": 0
  }
}
```

### `installed.json`

Lista de módulos instalados localmente com versões e timestamps.

Estrutura:

```json
{
  "version": "1.0.0",
  "updated": "ISO-8601 timestamp",
  "modules": [
    {
      "id": "module-id",
      "version": "1.0.0",
      "installedAt": "ISO-8601 timestamp",
      "path": "modules/category/module-name",
      "active": true
    }
  ]
}
```

## 📂 Subdiretórios

### `cache/`

Cache de descoberta para performance do sistema de busca.

Arquivos gerados:

- `search-index.json` - Índice de busca full-text
- `dependencies-graph.json` - Grafo de dependências entre módulos
- `metrics-cache.json` - Cache de métricas calculadas

### `templates/`

Templates para geração de novos módulos por categoria.

Estrutura:

```
templates/
├── ui-module/          # Template para UI modules
├── logic-module/       # Template para Logic modules
├── data-module/        # Template para Data modules
└── integration-module/ # Template para Integration modules
```

### `prompts/`

Prompts especializados para agentes de IA.

Arquivos:

- `ui-agent.md` - Instruções para UI Agent
- `backend-agent.md` - Instruções para Backend Agent
- `database-agent.md` - Instruções para Database Agent
- `integration-agent.md` - Instruções para Integration Agent

## 🔒 Segurança

**IMPORTANTE**: Este diretório contém metadados internos do sistema. Não modifique manualmente, exceto:

- ✅ `schema.ts` - pode ser estendido com novos tipos
- ❌ `registry.json` - use `npm run modules:sync` para atualizar
- ❌ `installed.json` - gerenciado automaticamente pelo CLI
- ❌ `cache/*` - reconstruído automaticamente quando necessário

## 🛠️ Comandos para Manutenção

```bash
# Reconstruir registry
npm run modules:sync

# Reconstruir cache de busca
npm run modules:index

# Validar todos os manifests
npm run modules:validate

# Ver métricas do sistema
npm run modules:metrics
```

## 📖 Documentação

Para informações sobre como usar o sistema de módulos:

- [Documentação Principal](../docs/modular-architecture/README.md)
- [Guia Rápido](../docs/modular-architecture/QUICK-REFERENCE.md)

---

**Última atualização**: 2025-01-11
**Sistema de módulos**: v1.0.0
