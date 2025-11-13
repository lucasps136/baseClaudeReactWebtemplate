# Fase 4: Otimização IA - Sistema Inteligente de Descoberta

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Objetivos](#objetivos)
- [Tarefas](#tarefas)
- [Entregáveis](#entregáveis)
- [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

A Fase 4 otimiza o sistema para uso intensivo por IA, criando prompts especializados, cache inteligente e sistema de sugestões automáticas de reutilização.

**Duração estimada**: 2-3 dias
**Complexidade**: Média-Alta
**Dependências**: Fases 1, 2 e 3 concluídas

---

## 🎯 Objetivos

1. ✅ Criar prompts especializados para cada agente
2. ✅ Implementar cache inteligente de descoberta
3. ✅ Sistema de sugestões de reutilização
4. ✅ Métricas e analytics
5. ✅ Otimizações de performance

---

## 📝 Tarefas

### Tarefa 4.1: Prompts Especializados por Agente

#### UI Agent Prompt

**Arquivo**: `.modules/prompts/ui-agent.md`

````markdown
# UI Agent - Especialista em Interface

Você é o **UI Agent**, especializado em componentes React, hooks UI e interfaces visuais.

## Responsabilidades

- Criar/modificar componentes React
- Gerenciar hooks de UI
- Implementar estilos com Tailwind CSS
- Garantir acessibilidade e responsividade

## Restrições

- ❌ NÃO modificar módulos logic, data ou integration
- ❌ NÃO implementar business logic em componentes
- ❌ NÃO acessar database diretamente

## Workflow Obrigatório

### 1. DESCOBERTA (SEMPRE PRIMEIRO)

```javascript
// Consultar registry antes de criar qualquer componente
const discovery = require("./scripts/modules/discover");
const components = discovery.findReusableComponents("list");
```
````

Se componente similar existir → **REUTILIZAR**
Se não existir → Criar novo

### 2. ANÁLISE DE REUTILIZAÇÃO

Antes de criar código novo, verificar:

- Componentes similares no registry (categoria: ui)
- Hooks existentes que resolvem o problema
- Patterns reutilizáveis

### 3. IMPLEMENTAÇÃO

Se criar novo componente:

1. Criar em `modules/ui/[module-name]/`
2. Atualizar `module.json` com metadata completa
3. Adicionar exemplos de uso
4. Registrar no registry: `npm run modules:sync`

### 4. DOCUMENTAÇÃO

Todo componente DEVE ter:

- Props documentadas
- Exemplo de uso no manifest
- Keywords para descoberta

## Exemplo de Uso

### ❌ ERRADO (sem descoberta):

```typescript
// Criar ComponenteX do zero sem verificar se já existe
```

### ✅ CORRETO (com descoberta):

```typescript
// 1. Consultar registry
node scripts/modules/discover.js components "list"

// 2. Se encontrar similar:
import { UserList } from '@/modules/ui/user-profile-ui'
// Adaptar via props ao invés de recriar

// 3. Se não encontrar:
// Criar novo módulo
npm run generate:module product-list --category ui
```

## Recursos Disponíveis

- **Registry**: `.modules/registry.json` (categoria: ui)
- **Search Index**: `.modules/cache/search-index.json`
- **Discovery**: `node scripts/modules/discover.js`
- **Templates**: `.modules/templates/ui/`

## Métricas de Sucesso

- Reutilização de componentes > 70%
- Tempo de discovery < 10 segundos
- Componentes novos com metadata completa

````

#### Backend Agent Prompt

**Arquivo**: `.modules/prompts/backend-agent.md`

```markdown
# Backend Agent - Especialista em Business Logic

Você é o **Backend Agent**, especializado em services, validações e lógica de negócio.

## Responsabilidades

- Implementar services com business logic
- Criar validações com Zod
- Garantir princípios SOLID
- Dependency injection

## Restrições

- ❌ NÃO modificar módulos ui, data ou integration
- ❌ NÃO criar componentes visuais
- ❌ NÃO escrever SQL diretamente

## Workflow Obrigatório

### 1. DESCOBERTA
```javascript
// Consultar services existentes
node scripts/modules/discover.js services "user"
````

### 2. ANÁLISE DE PATTERNS

Verificar:

- Services similares no registry (categoria: logic)
- Interfaces reutilizáveis (IRepository, IValidation)
- Patterns SOLID aplicados

### 3. IMPLEMENTAÇÃO

Sempre seguir:

- **Single Responsibility**: Um service = uma responsabilidade
- **Interface Segregation**: IRepository vs IValidation separadas
- **Dependency Injection**: Constructor injection

```typescript
// Template obrigatório
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  // ...
}

export class UserService {
  constructor(
    private repository: IUserRepository,
    private validation: IUserValidation,
  ) {}
}
```

### 4. VALIDAÇÃO

Todo input DEVE ter validação Zod:

```typescript
import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});
```

## Recursos

- **Registry**: `.modules/registry.json` (categoria: logic)
- **Templates**: `.modules/templates/logic/`
- **Discovery**: `node scripts/modules/discover.js services`

````

#### Database Agent Prompt

**Arquivo**: `.modules/prompts/database-agent.md`

```markdown
# Database Agent - Especialista em Dados

Você é o **Database Agent**, especializado em schemas SQL, migrations e RLS policies.

## Responsabilidades

- Criar/modificar schemas SQL
- Escrever migrations
- Implementar RLS policies
- Otimizar indexes

## Restrições

- ❌ NÃO modificar módulos ui, logic ou integration
- ❌ NÃO implementar business logic
- ❌ NÃO acessar providers externos

## Workflow Obrigatório

### 1. DESCOBERTA
```bash
# Verificar schemas existentes
ls modules/data/*/schemas/*.sql
````

### 2. ANÁLISE

Verificar:

- Schemas similares existentes
- Padrões de nomenclatura
- RLS policies padrão

### 3. IMPLEMENTAÇÃO

Todo schema DEVE ter:

```sql
-- Table com UUID primary key
CREATE TABLE IF NOT EXISTS public.table_name (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes necessários
CREATE INDEX IF NOT EXISTS idx_table_name_created_at
  ON public.table_name(created_at);

-- RLS policies
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Trigger updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.table_name
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### 4. DOCUMENTAÇÃO

Documentar no module.json:

- Tabelas criadas
- Indexes
- RLS policies
- Migrations

## Recursos

- **Registry**: `.modules/registry.json` (categoria: data)
- **Templates**: `.modules/templates/data/`
- **Schemas existentes**: `modules/data/*/schemas/`

````

#### Integration Agent Prompt

**Arquivo**: `.modules/prompts/integration-agent.md`

```markdown
# Integration Agent - Especialista em Integrações

Você é o **Integration Agent**, especializado em APIs externas e providers.

## Responsabilidades

- Implementar providers externos (Stripe, SendGrid, etc)
- Criar webhook handlers
- Desenvolver adapters
- Gerenciar configs e secrets

## Restrições

- ❌ NÃO modificar módulos ui, logic ou data
- ❌ NÃO expor secrets em código
- ❌ NÃO implementar UI

## Workflow Obrigatório

### 1. DESCOBERTA
```bash
# Verificar integrações existentes
npm run modules:list --category integration
````

### 2. PATTERN

Toda integração DEVE seguir:

```typescript
export interface ProviderConfig {
  apiKey: string;
  endpoint?: string;
}

export class ProviderName {
  constructor(private config: ProviderConfig) {}

  async initialize(): Promise<void> {}

  // Métodos da integração
}
```

### 3. SEGURANÇA

- Config via env variables
- Nunca hardcode secrets
- Validar webhooks
- Rate limiting

### 4. ERROR HANDLING

Tratamento robusto de erros de rede:

```typescript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error();
} catch (error) {
  // Retry logic
  // Logging
  // Fallback
}
```

## Recursos

- **Registry**: `.modules/registry.json` (categoria: integration)
- **Templates**: `.modules/templates/integration/`
- **Env vars**: `src/config/env.ts`

````

---

### Tarefa 4.2: Sistema de Sugestões Inteligentes

#### Arquivo: `scripts/modules/suggestions.js`

```javascript
#!/usr/bin/env node

const ModuleDiscovery = require('./discover')

/**
 * Sistema de sugestões automáticas de reutilização
 */

class SmartSuggestions {
  constructor() {
    this.discovery = new ModuleDiscovery()
  }

  /**
   * Sugerir componentes/hooks/services baseado em contexto
   */
  suggest(context) {
    const { task, keywords, category } = context

    const suggestions = {
      components: [],
      hooks: [],
      services: [],
      modules: [],
      patterns: [],
    }

    // Buscar por keywords
    if (keywords && keywords.length > 0) {
      suggestions.modules = this.discovery.findByKeywords(keywords)
    }

    // Buscar componentes
    if (category === 'ui' || !category) {
      keywords.forEach((keyword) => {
        const components = this.discovery.findReusableComponents(keyword)
        suggestions.components.push(...components)

        const hooks = this.discovery.findReusableHooks(keyword)
        suggestions.hooks.push(...hooks)
      })
    }

    // Buscar services
    if (category === 'logic' || !category) {
      keywords.forEach((keyword) => {
        const services = this.discovery.findServices(keyword)
        suggestions.services.push(...services)
      })
    }

    // Remover duplicatas
    suggestions.components = this.removeDuplicates(suggestions.components, 'name')
    suggestions.hooks = this.removeDuplicates(suggestions.hooks, 'name')
    suggestions.services = this.removeDuplicates(suggestions.services, 'name')
    suggestions.modules = this.removeDuplicates(suggestions.modules, 'id')

    // Ranquear sugestões
    this.rankSuggestions(suggestions, keywords)

    return suggestions
  }

  /**
   * Sugerir baseado em tarefa descrita em linguagem natural
   */
  suggestFromTask(taskDescription) {
    // Extrair keywords da descrição
    const keywords = this.extractKeywords(taskDescription)

    // Detectar categoria provável
    const category = this.detectCategory(taskDescription)

    return this.suggest({
      task: taskDescription,
      keywords,
      category,
    })
  }

  /**
   * Analisar código e sugerir onde reutilizar
   */
  analyzeCode(code) {
    const suggestions = []

    // Detectar padrões reutilizáveis
    const patterns = {
      'useState.*isLoading': {
        suggestion: 'Considere usar hook existente para loading states',
        search: 'loading',
      },
      'async.*fetch.*try.*catch': {
        suggestion: 'Considere usar service existente com error handling',
        search: 'fetch',
      },
      'map.*\.id.*key': {
        suggestion: 'Considere usar componente List existente',
        search: 'list',
      },
    }

    Object.entries(patterns).forEach(([pattern, { suggestion, search }]) => {
      const regex = new RegExp(pattern, 'g')
      if (regex.test(code)) {
        const results = this.discovery.findReusableComponents(search)
        suggestions.push({
          type: 'code-pattern',
          pattern,
          suggestion,
          alternatives: results.slice(0, 3),
        })
      }
    })

    return suggestions
  }

  // Helper methods

  extractKeywords(text) {
    // Palavras relevantes para busca
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
    ])

    return text
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .slice(0, 5) // Top 5 keywords
  }

  detectCategory(text) {
    const patterns = {
      ui: /component|button|form|input|modal|list|table|card/i,
      logic: /service|business|logic|validation|crud|repository/i,
      data: /database|table|schema|migration|sql|query/i,
      integration: /api|provider|webhook|integration|external/i,
    }

    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return category
      }
    }

    return null
  }

  removeDuplicates(array, key) {
    const seen = new Set()
    return array.filter((item) => {
      const value = item[key]
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  }

  rankSuggestions(suggestions, keywords) {
    // Ranquear por relevância baseado em keywords match
    const rank = (item) => {
      if (!item.keywords && !item.description) return 0

      const itemText = `${(item.keywords || []).join(' ')} ${item.description || ''}`.toLowerCase()

      return keywords.reduce((score, keyword) => {
        return itemText.includes(keyword.toLowerCase()) ? score + 1 : score
      }, 0)
    }

    suggestions.components.sort((a, b) => rank(b) - rank(a))
    suggestions.hooks.sort((a, b) => rank(b) - rank(a))
    suggestions.services.sort((a, b) => rank(b) - rank(a))
    suggestions.modules.sort((a, b) => rank(b) - rank(a))
  }
}

// CLI
if (require.main === module) {
  const suggestions = new SmartSuggestions()
  const task = process.argv.slice(2).join(' ')

  if (!task) {
    console.log(`
Usage: node scripts/modules/suggestions.js <task description>

Examples:
  node scripts/modules/suggestions.js "create user list with filters"
  node scripts/modules/suggestions.js "implement payment processing"
  node scripts/modules/suggestions.js "add authentication form"
    `)
    process.exit(1)
  }

  console.log(`\n🔍 Analyzing task: "${task}"\n`)

  const results = suggestions.suggestFromTask(task)

  console.log('💡 Suggestions:\n')

  if (results.components.length > 0) {
    console.log('📦 Reusable Components:')
    results.components.slice(0, 3).forEach((comp) => {
      console.log(`   ✅ ${comp.name} (${comp.module})`)
      console.log(`      ${comp.description || 'No description'}`)
      console.log(`      Example: ${comp.example}`)
      console.log('')
    })
  }

  if (results.hooks.length > 0) {
    console.log('🪝 Reusable Hooks:')
    results.hooks.slice(0, 3).forEach((hook) => {
      console.log(`   ✅ ${hook.name} (${hook.module})`)
      console.log(`      Returns: ${hook.returns}`)
      console.log(`      Example: ${hook.example}`)
      console.log('')
    })
  }

  if (results.services.length > 0) {
    console.log('⚙️  Reusable Services:')
    results.services.slice(0, 3).forEach((service) => {
      console.log(`   ✅ ${service.name} (${service.module})`)
      console.log(`      Methods: ${service.methods.join(', ')}`)
      console.log('')
    })
  }

  if (results.modules.length > 0) {
    console.log('📁 Related Modules:')
    results.modules.slice(0, 3).forEach((module) => {
      console.log(`   ✅ ${module.name}`)
      console.log(`      Keywords: ${module.keywords.join(', ')}`)
      console.log('')
    })
  }

  const totalSuggestions =
    results.components.length +
    results.hooks.length +
    results.services.length +
    results.modules.length

  if (totalSuggestions === 0) {
    console.log('   No suggestions found. This might be a new feature!')
    console.log('   Consider creating a new module.\n')
  }
}

module.exports = SmartSuggestions
````

#### Adicionar ao package.json

```json
{
  "scripts": {
    "modules:suggest": "node scripts/modules/suggestions.js"
  }
}
```

---

### Tarefa 4.3: Métricas e Analytics

#### Arquivo: `scripts/modules/metrics.js`

```javascript
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Sistema de métricas de módulos
 */

class ModuleMetrics {
  constructor() {
    this.registry = JSON.parse(
      fs.readFileSync(".modules/registry.json", "utf8"),
    );
  }

  /**
   * Gerar relatório completo
   */
  generateReport() {
    return {
      overview: this.getOverview(),
      byCategory: this.getByCategory(),
      reusability: this.getReusabilityMetrics(),
      growth: this.getGrowthMetrics(),
      quality: this.getQualityMetrics(),
    };
  }

  getOverview() {
    return {
      total_modules: this.registry.stats.total_modules,
      by_status: this.countByStatus(),
      last_updated: this.registry.updated,
    };
  }

  getByCategory() {
    const categories = {};

    Object.entries(this.registry.categories).forEach(([category, modules]) => {
      categories[category] = {
        count: modules.length,
        total_exports: this.sumExports(modules),
        keywords: this.collectKeywords(modules),
      };
    });

    return categories;
  }

  getReusabilityMetrics() {
    let totalComponents = 0;
    let totalHooks = 0;
    let totalServices = 0;

    Object.values(this.registry.categories).forEach((modules) => {
      modules.forEach((module) => {
        totalComponents += module.exports.components || 0;
        totalHooks += module.exports.hooks || 0;
        totalServices += module.exports.services || 0;
      });
    });

    return {
      total_components: totalComponents,
      total_hooks: totalHooks,
      total_services: totalServices,
      reusability_score: this.calculateReusabilityScore(),
    };
  }

  getGrowthMetrics() {
    // TODO: Implementar tracking de crescimento ao longo do tempo
    return {
      modules_this_month: 0,
      trend: "stable",
    };
  }

  getQualityMetrics() {
    let withDocs = 0;
    let withTests = 0;
    let withExamples = 0;
    let total = 0;

    Object.values(this.registry.categories).forEach((modules) => {
      modules.forEach((module) => {
        total++;

        const modulePath = module.path;
        if (fs.existsSync(path.join(modulePath, "docs"))) withDocs++;
        if (fs.existsSync(path.join(modulePath, "tests"))) withTests++;

        // Verificar se tem exemplos no manifest
        const manifestPath = path.join(modulePath, "module.json");
        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          const hasExamples = Object.values(manifest.exports).some((items) =>
            Array.isArray(items) ? items.some((item) => item.example) : false,
          );
          if (hasExamples) withExamples++;
        }
      });
    });

    return {
      documentation_coverage: ((withDocs / total) * 100).toFixed(1),
      test_coverage: ((withTests / total) * 100).toFixed(1),
      examples_coverage: ((withExamples / total) * 100).toFixed(1),
      quality_score: this.calculateQualityScore(
        withDocs,
        withTests,
        withExamples,
        total,
      ),
    };
  }

  // Helper methods

  countByStatus() {
    const counts = { stable: 0, experimental: 0, deprecated: 0 };

    Object.values(this.registry.categories).forEach((modules) => {
      modules.forEach((module) => {
        counts[module.status]++;
      });
    });

    return counts;
  }

  sumExports(modules) {
    return modules.reduce((sum, module) => {
      return (
        sum +
        (module.exports.components || 0) +
        (module.exports.hooks || 0) +
        (module.exports.services || 0)
      );
    }, 0);
  }

  collectKeywords(modules) {
    const keywords = new Set();
    modules.forEach((module) => {
      module.keywords.forEach((k) => keywords.add(k));
    });
    return Array.from(keywords);
  }

  calculateReusabilityScore() {
    // Score baseado em número de exports disponíveis
    const metrics = this.getReusabilityMetrics();
    const total =
      metrics.total_components + metrics.total_hooks + metrics.total_services;

    // Normalizar para 0-100
    return Math.min(
      100,
      (total / this.registry.stats.total_modules) * 20,
    ).toFixed(1);
  }

  calculateQualityScore(withDocs, withTests, withExamples, total) {
    const docScore = (withDocs / total) * 33.33;
    const testScore = (withTests / total) * 33.33;
    const exampleScore = (withExamples / total) * 33.33;

    return (docScore + testScore + exampleScore).toFixed(1);
  }

  /**
   * Gerar relatório formatado
   */
  printReport() {
    const report = this.generateReport();

    console.log("\n📊 Module Metrics Report\n");
    console.log("═".repeat(50));

    console.log("\n📈 Overview");
    console.log(`   Total Modules: ${report.overview.total_modules}`);
    console.log(`   Stable: ${report.overview.by_status.stable}`);
    console.log(`   Experimental: ${report.overview.by_status.experimental}`);
    console.log(`   Deprecated: ${report.overview.by_status.deprecated}`);

    console.log("\n📦 By Category");
    Object.entries(report.byCategory).forEach(([category, data]) => {
      console.log(
        `   ${category}: ${data.count} modules, ${data.total_exports} exports`,
      );
    });

    console.log("\n♻️  Reusability");
    console.log(`   Components: ${report.reusability.total_components}`);
    console.log(`   Hooks: ${report.reusability.total_hooks}`);
    console.log(`   Services: ${report.reusability.total_services}`);
    console.log(
      `   Reusability Score: ${report.reusability.reusability_score}/100`,
    );

    console.log("\n✅ Quality");
    console.log(`   Documentation: ${report.quality.documentation_coverage}%`);
    console.log(`   Tests: ${report.quality.test_coverage}%`);
    console.log(`   Examples: ${report.quality.examples_coverage}%`);
    console.log(`   Quality Score: ${report.quality.quality_score}/100`);

    console.log("\n" + "═".repeat(50) + "\n");
  }
}

// CLI
if (require.main === module) {
  const metrics = new ModuleMetrics();
  const command = process.argv[2];

  if (command === "json") {
    console.log(JSON.stringify(metrics.generateReport(), null, 2));
  } else {
    metrics.printReport();
  }
}

module.exports = ModuleMetrics;
```

#### Adicionar ao package.json

```json
{
  "scripts": {
    "modules:metrics": "node scripts/modules/metrics.js"
  }
}
```

---

## ✅ Entregáveis

### 1. Prompts Especializados

- ✅ 4 prompts (UI, Backend, Database, Integration)
- ✅ Workflows obrigatórios
- ✅ Exemplos de uso

### 2. Sistema de Sugestões

- ✅ Sugestões automáticas de reutilização
- ✅ Análise de código
- ✅ Ranking por relevância

### 3. Métricas

- ✅ Relatórios de uso
- ✅ Quality scores
- ✅ Reusability metrics

---

## 📊 Checklist de Conclusão

- [ ] Prompts criados para cada agente
- [ ] Sistema de sugestões funcionando
- [ ] Métricas sendo coletadas
- [ ] Cache otimizado
- [ ] Performance aceitável (< 10s discovery)

---

## 🚀 Próximos Passos

**[Fase 5 - Documentação e Testes](./05-FASE-5-DOCS-TESTES.md)**

---

**Última atualização**: 2025-01-11
**Duração estimada**: 2-3 dias
**Fase anterior**: [Fase 3 - Automação](./03-FASE-3-AUTOMACAO.md)
**Próxima fase**: [Fase 5 - Documentação e Testes](./05-FASE-5-DOCS-TESTES.md)
