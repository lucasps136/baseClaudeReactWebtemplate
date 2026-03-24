# Implementation Plan: Plugin-and-Play Route Automation

**Branch**: `001-plugin-play-routes` | **Date**: 2026-03-24 | **Spec**: [spec.md](./spec.md)

---

## Summary

Adaptar os geradores CLI existentes (`generate-feature.js` e `generate-module.js`) para que, ao criar uma feature ou módulo UI, o desenvolvedor seja perguntado interativamente se deseja criar uma rota no Next.js App Router. Se confirmado, o CLI cria `src/app/[nome]/page.tsx` e injeta a entrada em `src/config/routes.ts` — eliminando todo trabalho manual. Adicionalmente, criar um placeholder `remove-feature.js` com `// TODO` documentando o escopo da remoção futura.

---

## Technical Context

**Language/Version**: Node.js 20 LTS (scripts) / TypeScript 5.4+ strict (código gerado)
**Primary Dependencies**: `readline` (nativo Node.js) — sem novas dependências externas
**Storage**: Sistema de arquivos local (`fs` nativo) + `src/config/routes.ts` (injeção por texto)
**Testing**: Jest (já configurado) — testes unitários para funções de geração e injeção
**Target Platform**: CLI local (developer workstation), compatível com CI (modo não-interativo via `isTTY`)
**Project Type**: Web application (Next.js 14 App Router)
**Performance Goals**: Geração completa em < 3 segundos (inclui escrita de arquivos e injeção)
**Constraints**: Sem novas dependências npm; compatibilidade com Node.js CommonJS (`require`); `routes.ts` usa `as const` — injeção via manipulação de string
**Scale/Scope**: 3 arquivos de script modificados/criados, 1 arquivo de config modificado (`package.json`)

---

## Constitution Check

### Gates verificados

| Princípio             | Status     | Observação                                                                                                      |
| --------------------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| Single Responsibility | ✅ PASS    | Cada função adicionada tem responsabilidade única: `generateAppRoute()`, `injectRouteConfig()`, `askQuestion()` |
| Open/Closed           | ✅ PASS    | Scripts existentes são estendidos (novas funções), não modificados em sua lógica central                        |
| Interface Segregation | ✅ PASS    | N/A para scripts Node.js sem classes                                                                            |
| Dependency Inversion  | ✅ PASS    | N/A para scripts simples                                                                                        |
| Module-First          | ✅ PASS    | Scripts de geração não são módulos da aplicação; os arquivos _gerados_ seguem módulo-first                      |
| TypeScript Strict     | ✅ PASS    | Os `page.tsx` gerados seguem tipagem estrita; scripts são `.js` (CommonJS)                                      |
| Test-First            | ⚠️ ATENÇÃO | Adicionar testes unitários para `injectRouteConfig()` e `generateAppRoute()` antes de finalizar                 |
| DRY                   | ✅ PASS    | Reutiliza `kebabCase`/`pascalCase` já existentes em cada script                                                 |
| Quality Gates         | ✅ PASS    | Geração deve passar `npm run type-check`, `npm run lint`, `npm run modules:validate`                            |

### Violações

Nenhuma violação identificada.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-plugin-play-routes/
├── plan.md              ← Este arquivo
├── spec.md              ← Especificação funcional
├── research.md          ← Fase 0: decisões técnicas
├── data-model.md        ← Entidades e arquivos afetados
├── quickstart.md        ← Guia de uso pós-implementação
└── checklists/
    └── requirements.md
```

### Source Code (modificações)

```text
scripts/
├── generate-feature.js        ← MODIFICAR: adicionar prompt + generateAppRoute()
├── modules/
│   └── generate-module.js     ← MODIFICAR: adicionar prompt em generateUITemplate()
└── remove-feature.js          ← CRIAR: placeholder com // TODO

src/
└── app/
    └── [feature-name]/        ← GERADO pelo CLI (exemplo)
        └── page.tsx

src/config/
└── routes.ts                  ← MODIFICADO pelo CLI (injeção automática)

package.json                   ← MODIFICAR: adicionar script "remove:feature"
```

**Structure Decision**: Single project. Scripts Node.js em `scripts/`, código gerado em `src/`. Sem novos diretórios.

---

## Implementation Phases

### Fase A — Funções utilitárias compartilhadas nos scripts

**Objetivo**: Extrair lógica reutilizável que será usada em ambos os scripts

**A.1 — Função `askQuestion(question)` → Promise<boolean>**

Adicionar em `generate-feature.js` E em `generate-module.js` (duplicação aceitável — scripts são independentes, YAGNI para módulo compartilhado):

```js
function askQuestion(question) {
  // Modo CI: stdin não é TTY → retornar false por padrão
  if (!process.stdin.isTTY) {
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "s");
    });
  });
}
```

**A.2 — Função `generateAppRoute(routePath, importPath, componentName, pageName)` → void**

Cria o arquivo `page.tsx`:

```js
function generateAppRoute(routePath, importPath, componentName, pageName) {
  const appDir = path.join("src", "app", routePath);
  const pageFile = path.join(appDir, "page.tsx");

  // Verifica se o caminho base do componente já existe
  const expectedPath = path.join(
    process.cwd(),
    importPath.replace("@/", "src/"),
  );
  const componentExists =
    fs.existsSync(expectedPath + ".tsx") ||
    fs.existsSync(expectedPath + "/index.ts") ||
    fs.existsSync(expectedPath);

  // Detectar conflito
  if (fs.existsSync(pageFile)) {
    return { conflict: true, pageFile };
  }

  fs.mkdirSync(appDir, { recursive: true });

  const pendingComment = componentExists
    ? ""
    : "\n// TODO: O componente importado abaixo ainda não foi criado.";
  const content = `${pendingComment}\nimport { ${componentName} } from '${importPath}'

export default function ${pageName}() {
  return (
    <main className="container mx-auto py-8">
      <${componentName} />
    </main>
  )
}
`;
  fs.writeFileSync(pageFile, content);
  return { conflict: false, pageFile };
}
```

**A.3 — Função `injectRouteConfig(routeKey, routePathUrl, isProtected)` → boolean**

Injeta entrada em `src/config/routes.ts`:

```js
function injectRouteConfig(routeKey, routePathUrl, isProtected) {
  const routesPath = path.join('src', 'config', 'routes.ts')

  if (!fs.existsSync(routesPath)) {
    console.warn('⚠️  src/config/routes.ts não encontrado. Adicione manualmente.')
    return false
  }

  let content = fs.readFileSync(routesPath, 'utf8')

  // Verificar se já existe
  if (content.includes(`${routeKey}:`)) {
    console.log(`ℹ️  Rota '${routeKey}' já existe em routes.ts`)
    return true
  }

  const injection = `    ${routeKey}: "${routePathUrl}",\n`

  if (isProtected) {
    const protectedObjRegex = /(  protected: \\{)\n/
    const protectedArrayRegex = /(  protected: \\[)\n/
    const arrayInjection = `    "${routePathUrl}",\n`

    if (protectedObjRegex.test(content) && protectedArrayRegex.test(content)) {
      content = content.replace(protectedObjRegex, `$1\n${injection}`)
      content = content.replace(protectedArrayRegex, `$1\n${arrayInjection}`)
      console.log(`📝 routes.ts atualizado: protected obj & array recebem a rota`)
    } else {
      console.warn('⚠️  Padrão esperado não encontrado para rotas protegidas.')
      return false
    }
  } else {
    const publicObjRegex = /(  public: \\{)\n/
    if (publicObjRegex.test(content)) {
      content = content.replace(publicObjRegex, `$1\n${injection}`)
      console.log(`📝 routes.ts atualizado: public obj recebe a rota`)
    } else {
      console.warn('⚠️  Padrão esperado não encontrado para rotas públicas.')
      return false
    }
  }

  fs.writeFileSync(routesPath, content)
  return true
}
```

---

### Fase B — Modificar `generate-feature.js`

**Objetivo**: Adicionar fluxo interativo de criação de rota ao final da geração da feature

**B.1 — Tornar `generateFeature` assíncrona**

A função `generateFeature` precisa usar `await askQuestion()`. Converter para `async function` e chamar com `.then()` ou `async IIFE` no final.

**B.2 — Adicionar prompt após criação da feature**

Após o log "✅ Feature criada com sucesso!", adicionar:

```js
// Prompt para criação de rota
const createRoute = await askQuestion(
  `\n🌐 Deseja criar uma rota pública para '${kebabCase}'? (s/n): `,
);

if (createRoute) {
  const appRoutePath = kebabCase;
  const importPath = `@/features/${kebabCase}`;
  const componentName = `${pascalCase}List`;
  const pageName = `${pascalCase}Page`;

  const result = generateAppRoute(
    appRoutePath,
    importPath,
    componentName,
    pageName,
  );

  if (result.conflict) {
    const overwrite = await askQuestion(
      `⚠️  src/app/${kebabCase}/page.tsx já existe. Sobrescrever? (s/n): `,
    );
    if (overwrite) {
      fs.rmSync(path.join("src", "app", kebabCase), { recursive: true });
      generateAppRoute(appRoutePath, importPath, componentName, pageName);
      injectRouteConfig(kebabCase, `/${kebabCase}`, isProtected);
      console.log(`✅ Rota /${kebabCase} criada!`);
    } else {
      console.log("ℹ️  Rota não criada (conflito mantido).");
    }
  } else {
    injectRouteConfig(kebabCase, `/${kebabCase}`, isProtected);
    console.log(`✅ Rota /${kebabCase} criada!`);
    console.log(`📄 src/app/${kebabCase}/page.tsx`);
  }
} else {
  console.log("ℹ️  Rota não criada. Para criar depois, adicione manualmente:");
  console.log(`   src/app/${kebabCase}/page.tsx`);
}
```

**B.3 — Atualizar mensagem de "Próximos passos"**

Remover item "Adicionar rota no App Router" pois agora é automático quando confirmado.

---

### Fase C — Modificar `generate-module.js` (função `generateUITemplate`)

**Objetivo**: Adicionar pergunta de rota apenas para módulos de categoria `ui`

**C.1 — Tornar `generateModule` assíncrona**

Mesmo padrão da Fase B — converter para `async function`.

**C.2 — Adicionar prompt ao final de `generateUITemplate`**

A função `generateUITemplate` será chamada de dentro de `generateModule`. Após a criação de todos os arquivos, no retorno para `generateModule`, após o switch de categoria:

```js
// Somente para módulos UI
if (category === "ui") {
  const createRoute = await askQuestion(
    `\n🌐 Deseja criar uma rota para o módulo '${moduleName}'? (s/n): `,
  );

  if (createRoute) {
    const appRoutePath = `modules/${moduleName}`;
    const importPath = `@/modules/ui/${moduleName}`;
    const componentName = `${toPascalCase(moduleName)}List`;
    const pageName = `${toPascalCase(moduleName)}Page`;

    const result = generateAppRoute(
      appRoutePath,
      importPath,
      componentName,
      pageName,
    );

    const isProtected = await askQuestion(
      `🔒 A rota deve ser protegida por autenticação? (s/n): `,
    );

    const result = generateAppRoute(
      appRoutePath,
      importPath,
      componentName,
      pageName,
    );

    if (!result.conflict) {
      // Atualizar module.json com campo route
      const manifestPath = path.join(modulePath, "module.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      manifest.route = `/modules/${moduleName}`;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      // Injetar em routes.ts (mesmo fluxo de auth das features — FR-007b)
      injectRouteConfig(
        toCamelCase(moduleName),
        `/modules/${moduleName}`,
        isProtected,
      );
      console.log(`✅ Rota /modules/${moduleName} criada!`);
    }
  }
}
```

---

### Fase D — Criar `scripts/remove-feature.js` (placeholder)

**Objetivo**: Registrar o comando no sistema com documentação clara do escopo futuro

**Conteúdo:**

```js
#!/usr/bin/env node

/**
 * remove-feature.js
 *
 * TODO: Implementação futura — Remoção completa de feature
 *
 * Este comando está planejado mas ainda não implementado.
 * Quando implementado, deverá:
 *
 * TODO 1: Remover pasta da feature
 *   - Alvo: src/features/[nome]/
 *   - Ação: fs.rmSync(featurePath, { recursive: true })
 *   - Verificar: garantir que nenhum outro arquivo importa da feature antes de remover
 *
 * TODO 2: Remover rota do App Router
 *   - Alvo: src/app/[nome]/page.tsx (e a pasta, se vazia)
 *   - Ação: fs.rmSync(appRoutePath, { recursive: true })
 *   - Verificar: confirmar que a pasta existe antes de remover
 *
 * TODO 3: Remover entrada de routes.ts (objeto)
 *   - Alvo: src/config/routes.ts — linha `[nome]: "/[nome]",`
 *   - Ação: regex replace para remover a linha específica no bloco correspondente
 *
 * TODO 4: Remover entrada de routes.ts (array)
 *   - Alvo: src/config/routes.ts — item `"/nome",` no array routeGroups.protected
 *   - Ação: regex replace para remover a string do array
 *   - Verificar: fazer backup ou usar confirmação interativa antes
 *
 * IMPORTANTE: Sempre solicitar confirmação explícita antes de qualquer deleção.
 * IMPORTANTE: Executar `npm run build` após remoção para verificar ausência de referências quebradas.
 */

const featureName = process.argv[2];

if (!featureName) {
  console.error("❌ Forneça o nome da feature: npm run remove:feature <nome>");
  process.exit(1);
}

console.log(`\n⚠️  remove:feature ainda não está implementado.`);
console.log(`\nPara remover a feature '${featureName}' manualmente:`);
console.log(`  1. Apagar pasta:  src/features/${featureName}/`);
console.log(`  2. Apagar rota:   src/app/${featureName}/`);
console.log(
  `  3. Remover linha: '${featureName}: "/${featureName}"' do objeto em src/config/routes.ts`,
);
console.log(
  `  4. Remover string: '"/${featureName}"' do array routeGroups.protected em src/config/routes.ts se aplicável`,
);
console.log(`  5. Verificar:     npm run build`);
console.log(
  `\nConsulte os TODO em scripts/remove-feature.js para o escopo da implementação futura.\n`,
);
```

---

### Fase E — Atualizar `package.json`

**Objetivo**: Registrar o novo script `remove:feature`

**Modificação**: Adicionar ao objeto `"scripts"`:

```json
"remove:feature": "node scripts/remove-feature.js"
```

---

### Fase F — Testes unitários

**Objetivo**: Cobrir as funções críticas com testes antes de considerar a entrega completa (Constitution — Test-First)

**F.1 — Criar `tests/unit/scripts/route-injector.test.js` e `tests/unit/scripts/cli-helpers.test.js`**

Testar:

- `injectRouteConfig('automacoes')` injeta corretamente no bloco `protected`
- `injectRouteConfig('automacoes')` é idempotente (não duplica se já existe)
- `injectRouteConfig('automacoes')` fallback quando padrão não encontrado
- `askQuestion(...)` modo CI e interativo

**F.2 — Criar `tests/unit/scripts/route-generator.test.js`**

Testar:

- `generateAppRoute(...)` cria o arquivo com conteúdo correto
- `generateAppRoute(...)` retorna `{ conflict: true }` quando arquivo já existe
- `generateAppRoute(...)` para módulo UI usa `@/modules/ui/[nome]` no import
- `module.json` recebe campo `route` após confirmação

**Estratégia de mock**: Usar `jest.mock('fs')` para simular sistema de arquivos nos testes unitários dos scripts.

---

## Ordem de Execução

```
Fase A (utilitários)
    ↓
Fase B (generate-feature.js)  ←→ Fase C (generate-module.js)  [paralelo]
    ↓
Fase D (remove-feature.js)
    ↓
Fase E (package.json)
    ↓
Fase F (testes)
    ↓
Verificação: npm run generate:feature automacoes → build → confirmar rota /automacoes
```

---

## Acceptance Test (manual)

```bash
# 1. Gerar feature com rota
npm run generate:feature automacoes
# Responder 's' ao prompt

# 2. Verificar arquivos criados
ls src/app/automacoes/          # deve existir page.tsx
grep "automacoes" src/config/routes.ts  # deve ter entrada

# 3. Compilar
npm run build                  # deve passar sem erros

# 4. Verificar qualidade
npm run type-check             # zero erros
npm run lint                   # zero erros

# 5. Testar placeholder de remoção
npm run remove:feature automacoes  # deve exibir mensagem de TODO

# 6. Testar módulo UI com rota
npm run generate:module teste-ui --category ui
# Responder 's' ao prompt
ls src/app/modules/teste-ui/   # deve existir page.tsx
```

---

## Riscos e Mitigações

| Risco                                                   | Probabilidade | Mitigação                                                                                                                                           |
| ------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `routes.ts` editado manualmente em formato não esperado | Baixa         | Fallback com mensagem + trecho manual (FR-010)                                                                                                      |
| Componente gerado usa hooks → precisa de `'use client'` | Confirmado    | `page.tsx` é Server Component wrapper; componente filho (`${PascalCase}List`) deve ter `'use client'` adicionado separadamente (já usa `useEffect`) |
| Script assíncrono quebra chamada síncrona existente     | Baixa         | Wrapper `async` IIFE no ponto de entrada — não afeta funções internas                                                                               |
| Conflito de nome entre feature e módulo em `src/app/`   | Baixa         | Features em `src/app/[nome]/`, módulos em `src/app/modules/[nome]/` — namespaces distintos                                                          |
