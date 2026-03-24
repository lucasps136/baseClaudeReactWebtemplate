# Tasks: Plugin-and-Play Route Automation

**Input**: Design documents from `/specs/001-plugin-play-routes/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Organization**: Tasks são agrupadas por User Story para permitir implementação e teste independentes de cada história.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: User story correspondente (US1, US2, US3, US4)
- Paths exatos incluídos nas descrições

---

## Phase 1: Setup

**Purpose**: Atualizar artefatos de planejamento para refletir as 3 clarificações da sessão `/speckit.clarify`

- [x] T001 Atualizar `specs/001-plugin-play-routes/plan.md` — seção Fase A e Fase B — para refletir: (1) `'use client'` vai no componente, não no page.tsx; (2) `injectRouteConfig` recebe flag `isProtected` e injeta em `routes.protected`+`routeGroups.protected` ou `routes.public`; (3) módulos UI seguem o mesmo fluxo de auth que features

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Utilitários compartilhados e correções de template que TODOS as user stories dependem

**⚠️ CRITICAL**: Nenhuma user story pode ser implementada antes desta fase estar completa

- [x] T002 Adicionar diretiva `'use client'` no topo do template de componente dentro de `generateComponent()` em `scripts/generate-feature.js` (linha ~483 — string `content` do componente gerado)
- [x] T003 [P] Adicionar diretiva `'use client'` no topo do template de componente dentro de `generateUITemplate()` em `scripts/modules/generate-module.js` (linha ~264 — string `componentContent`)
- [x] T004 Criar estrutura inicial de `scripts/utils/route-cli-utils.js` com `module.exports = {}` vazio — arquivo existe mas funções ainda não implementadas

### Testes TDD (⚠️ Escrever ANTES de T005–T007 — devem FALHAR inicialmente)

> **Regra constitucional**: Verificar que cada teste falha antes de implementar a função correspondente

- [x] T004a [P] Criar `tests/unit/scripts/route-generator.test.js` com testes FALHANDO para `generateAppRoute`: (a) cria `page.tsx` com import correto; (b) retorna `{ conflict: true }` se arquivo já existe; (c) cria diretório pai automaticamente. (Nota: A normalização de strings exigida no FR-009 é de responsabilidade do script CLI caller, portanto não testada aqui no utilitário.)
- [x] T004b [P] Criar `tests/unit/scripts/route-injector.test.js` com testes FALHANDO para `injectRouteConfig`: (a) injeção em `routes.protected` + append em `routeGroups.protected` quando `isProtected=true`; (b) injeção em `routes.public` quando `isProtected=false`; (c) idempotência; (d) fallback quando padrão não encontrado
- [x] T004c [P] Criar `tests/unit/scripts/cli-helpers.test.js` com teste FALHANDO para `askQuestion`: modo CI (`isTTY=false`) retorna `Promise<false>` sem abrir readline

### Implementação (executar após T004a–T004c existirem e falharem)

- [x] T005 Adicionar função `generateAppRoute(routePath, importPath, componentName, pageName)` em `scripts/utils/route-cli-utils.js` — cria `src/app/[routePath]/page.tsx` como Server Component; retorna `{ conflict: boolean, pageFile: string }`
- [x] T005b [Edge Case] Em `generateAppRoute`, usar `fs.existsSync` para verificar se o importResolver alvo existe. Se não existir, adicionar `// TODO: O componente importado abaixo ainda não foi criado.` no topo do arquivo gerado.
- [x] T006 Adicionar função `injectRouteConfig(routeKey, routePath, isProtected)` em `scripts/utils/route-cli-utils.js` — `routeKey` é o identificador TypeScript válido (ex: `automacoes`, `testeUi`); `routePath` é a URL completa (ex: `/automacoes`, `/modules/teste-ui`); se `isProtected=true`: injeta `    ${routeKey}: "${routePath}",` em `routes.protected: {` **e** append `routePath` no array `routeGroups.protected`; se `false`: injeta em `routes.public: {`; fallback com mensagem manual se padrão não encontrado
- [x] T007a Adicionar função `askQuestion(question): Promise<boolean>` em `scripts/utils/route-cli-utils.js` — detecta `process.stdin.isTTY`; modo CI retorna `Promise<false>` sem abrir readline (permite que T004c passe antes do export)
- [x] T007b Exportar as três funções via `module.exports = { generateAppRoute, injectRouteConfig, askQuestion }` em `scripts/utils/route-cli-utils.js`
- [x] T007c Executar `npm run test -- tests/unit/scripts/` e confirmar que T004a–T004c (TDD) passam verde após a implementação acima.

**Checkpoint**: Utilitários prontos — as user stories podem ser implementadas ✅

---

## Phase 3: User Story 1 — Gerar feature com página acessível (Priority: P1) 🎯 MVP

**Goal**: `npm run generate:feature [nome]` com resposta "s" cria `src/app/[nome]/page.tsx` e atualiza `src/config/routes.ts` — zero edições manuais

**Independent Test**: Rodar `npm run generate:feature automacoes`, responder "s" + "protegida", verificar que `npm run build` passa sem erros e `src/app/automacoes/page.tsx` existe com import correto de `@/features/automacoes`

### Implementation for User Story 1

- [x] T008 [US1] Importar `askQuestion`, `generateAppRoute`, `injectRouteConfig` via `require('./utils/route-cli-utils')` no topo de `scripts/generate-feature.js`
- [x] T009 [US1] Converter `generateFeature()` em `scripts/generate-feature.js` para `async function` e atualizar chamada no final do arquivo para `generateFeature(featureName).catch(console.error)`
- [x] T010 [US1] Adicionar bloco de prompt de criação de rota após log "✅ Feature criada com sucesso!" em `scripts/generate-feature.js` — chama `askQuestion('🌐 Deseja criar uma rota para esta feature? (s/n): ')`
- [x] T011 [US1] Adicionar prompt de proteção de auth em `scripts/generate-feature.js` — se rota confirmada, chama `askQuestion('🔒 A rota deve ser protegida por autenticação? (s/n): ')` e passa `isProtected` para `injectRouteConfig`
- [x] T012 [US1] Implementar chamada de `generateAppRoute(kebabCase, \`@/features/${kebabCase}\`, \`${pascalCase}List\`, \`${pascalCase}Page\`)` em `scripts/generate-feature.js` com `importPath = \`@/features/${kebabCase}\``
- [x] T013 [US1] Implementar chamada de `injectRouteConfig(kebabCase, \`/${kebabCase}\`, isProtected)` em `scripts/generate-feature.js` após criação bem-sucedida do `page.tsx` — `routeKey=kebabCase` (ex: `automacoes`), `routePath=\`/${kebabCase}\``(ex:`/automacoes`)
- [x] T014 [US1] Atualizar bloco "📝 Próximos passos" em `scripts/generate-feature.js` — remover menção a "adicionar rota manualmente" quando rota foi criada; exibir URL gerada

**Checkpoint**: `npm run generate:feature automacoes` → responder "s"+"s" → `src/app/automacoes/page.tsx` criado, `routes.protected.automacoes` e `routeGroups.protected` atualizados, `npm run build` passa ✅

---

## Phase 4: User Story 3 — Controle de visibilidade (Priority: P2)

**Goal**: Desenvolvedor que responde "n" ao prompt não tem rota criada; modo CI não cria rota automaticamente

**Independent Test**: (a) Responder "n" ao prompt → `src/app/[nome]/` não existe; (b) Executar em modo CI (`echo "" | npm run generate:feature`) → nenhum arquivo de rota criado

### Implementation for User Story 3

- [x] T015 [US3] Adicionar detecção de conflito em `scripts/generate-feature.js` — se `src/app/[kebabCase]/page.tsx` já existe, chamar `askQuestion('⚠️ page.tsx já existe. Sobrescrever? (s/n): ')` antes de criar
- [x] T016 [US3] Garantir que o bloco de prompt de rota em `scripts/generate-feature.js` só executa quando `process.stdin.isTTY` é truthy — em modo CI (isTTY falsy), pular todos os prompts de rota sem criar arquivos (guarda defensivo explícito; `askQuestion` já cobre internamente, mas este bloco garante a intenção no ponto de chamada)
- [x] T017 [US3] Adicionar mensagem informativa em `scripts/generate-feature.js` quando rota não é criada (resposta "n" ou modo CI) — exibir caminho manual para criar posteriormente

**Checkpoint**: Comportamento "não criar rota" funciona corretamente em ambos os modos (interativo + CI) ✅

---

## Phase 5: User Story 2 — Gerar módulo UI com rota (Priority: P2)

**Goal**: `npm run generate:module [nome] --category ui` oferece opção de criar rota em `src/app/modules/[nome]/page.tsx` com mesmo fluxo de auth das features

**Independent Test**: Rodar `npm run generate:module teste-ui --category ui`, responder "s"+"protegida", verificar `src/app/modules/teste-ui/page.tsx` criado com import de `@/modules/ui/teste-ui` e campo `route` em `module.json`

### Implementation for User Story 2

- [x] T018 [US2] Importar `askQuestion`, `generateAppRoute`, `injectRouteConfig` via `require('../utils/route-cli-utils')` no topo de `scripts/modules/generate-module.js`
- [x] T019 [US2] Converter `generateModule()` em `scripts/modules/generate-module.js` para `async function` e atualizar chamada no final para `.catch(console.error)`
- [x] T020 [US2] Adicionar bloco de prompt de criação de rota no final do `switch(category)` em `scripts/modules/generate-module.js` — executar apenas quando `category === 'ui'`; chama `askQuestion('🌐 Deseja criar uma rota para este módulo UI? (s/n): ')`
- [x] T021 [US2] Adicionar prompt de proteção de auth para módulos UI em `scripts/modules/generate-module.js` — mesmo padrão do generate-feature.js; passar `isProtected` para `injectRouteConfig`
- [x] T022 [US2] Implementar chamada de `generateAppRoute(\`modules/${moduleName}\`, \`@/modules/ui/${moduleName}\`, \`${toPascalCase(moduleName)}List\`, \`${toPascalCase(moduleName)}Page\`)`em`scripts/modules/generate-module.js`
- [x] T023 [US2] Após criação bem-sucedida do `page.tsx` de módulo, atualizar `module.json` adicionando campo `"route": "/modules/${moduleName}"` em `scripts/modules/generate-module.js` (Nota: usar `JSON.parse` e `JSON.stringify` para preservar o AI Metadata original e outras chaves).
- [x] T024 [US2] Implementar chamada de `injectRouteConfig(toCamelCase(moduleName), \`/modules/${moduleName}\`, isProtected)`em`scripts/modules/generate-module.js`—`routeKey`é o camelCase do nome do módulo (ex:`testeUi`para`teste-ui`); `routePath`é`/modules/[nome]`(ex:`/modules/teste-ui`)
- [x] T025 [US2] Adicionar detecção de conflito para `src/app/modules/[moduleName]/` em `scripts/modules/generate-module.js` com mesmo padrão de confirmação de sobrescrita

**Checkpoint**: `npm run generate:module teste-ui --category ui` → responder "s"+"n" (pública) → página criada, `routes.public.testUi` atualizado, `module.json` com campo `route` ✅

---

## Phase 6: User Story 4 — Remoção de feature (Priority: P3)

**Goal**: `npm run remove:feature` existe no sistema e exibe mensagem clara com passos manuais e referência aos TODO

**Independent Test**: Rodar `npm run remove:feature automacoes` → CLI exibe mensagem de placeholder com 3 passos manuais e localização do arquivo para implementação futura

### Implementation for User Story 4

- [x] T026 [US4] Criar `scripts/remove-feature.js` com: validação de argumento, mensagem de "não implementado" com os 4 passos manuais, e comentários `// TODO` detalhando: (1) remover `src/features/[nome]/`, (2) remover `src/app/[nome]/`, (3) remover prop `src/config/routes.ts`, (4) remover do array `routeGroups.protected`
- [x] T027 [US4] Adicionar `"remove:feature": "node scripts/remove-feature.js"` ao objeto `"scripts"` em `package.json`

**Checkpoint**: `npm run remove:feature qualquer-nome` exibe mensagem de placeholder sem erros ✅

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Testes unitários, validação de qualidade e verificação final

- [ ] T032 Executar teste de aceitação manual conforme `specs/001-plugin-play-routes/quickstart.md` — `npm run generate:feature automacoes` completo com build; medir tempo total do comando até rota disponível e confirmar que é inferior a 60 segundos (SC-001)
- [x] T033 Executar `npm run type-check && npm run lint` após gerar feature de teste para confirmar zero erros no código gerado
- [x] T034 [P] Executar `npm run modules:validate` para confirmar que registry permanece válido após as modificações
- [x] T035 Executar `npm run quality:check` e confirmar que score permanece >70/100 (constitution gate 5)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sem dependências — começar imediatamente
- **Phase 2 (Foundational)**: Depende de Phase 1 — BLOQUEIA todas as user stories
- **Phase 3 (US1)**: Depende de Phase 2 — pode iniciar em paralelo com Phase 4 e 5 após Phase 2
- **Phase 4 (US3)**: Depende de Phase 3 — ajustes de comportamento "sem rota" do mesmo arquivo
- **Phase 5 (US2)**: Depende de Phase 2 — pode rodar em paralelo com Phase 3+4
- **Phase 6 (US4)**: Depende de Phase 2 apenas — pode rodar em paralelo com qualquer fase após Phase 2
- **Phase 7 (Polish)**: Depende de todas as fases anteriores

### User Story Dependencies

- **US1 (P1)**: Inicia após Phase 2 — núcleo do objetivo, MVP
- **US3 (P2)**: Inicia após US1 — ajustes no mesmo arquivo (`generate-feature.js`)
- **US2 (P2)**: Inicia após Phase 2 — independente de US1 (arquivo diferente)
- **US4 (P3)**: Inicia após Phase 2 — completamente independente (novo arquivo)

### Ordem dentro de cada User Story

- Imports e conversão async → prompts → lógica de criação → injeção de config → mensagens de saída

### Parallel Opportunities

- T002 e T003: paralelo (arquivos diferentes)
- T004, T005, T006: sequencial (mesmo arquivo, dependência de ordem)
- T004a, T004b, T004c: paralelo (arquivos de teste independentes — ver Phase 2)
- US2 (T018-T025) pode ser trabalhado em paralelo com US1+US3 (T008-T017)
- US4 (T026-T027) pode ser trabalhado em paralelo com qualquer fase após Phase 2

---

## Parallel Example: Phase 2

```bash
# Rodar em paralelo:
Task T002: Adicionar 'use client' em generate-feature.js (generateComponent)
Task T003: Adicionar 'use client' em generate-module.js (generateUITemplate)

# Sequencial (mesmo arquivo):
Task T004 → T005 → T006 → T007: Criar scripts/utils/route-cli-utils.js completo
```

## Parallel Example: Polish (Phase 7)

```bash
# Rodar em paralelo (arquivos diferentes):
Task T028: tests/unit/scripts/route-injector.test.js
Task T029: tests/unit/scripts/route-generator.test.js
Task T030: tests/unit/scripts/cli-helpers.test.js
Task T034: npm run modules:validate
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T007) — **CRÍTICO**
3. Complete Phase 3: US1 (T008–T014)
4. **STOP and VALIDATE**: `npm run generate:feature automacoes` → build ✅
5. Demonstrar rota `/automacoes` funcionando

### Incremental Delivery

1. Setup + Foundational → Utilitários prontos
2. US1 → Feature com rota funciona → **MVP demo**
3. US3 → Comportamento sem rota / CI funciona
4. US2 → Módulos UI com rota funcionam
5. US4 → Placeholder remove:feature registrado
6. Polish → Testes + validação final

### Parallel Team Strategy

Com 2 desenvolvedores após Phase 2:

- Dev A: US1 + US3 (`generate-feature.js`)
- Dev B: US2 + US4 (`generate-module.js` + `remove-feature.js`)

---

## Notes

- [P] = arquivos diferentes, sem dependências entre si
- [Story] mapeia a task para rastreabilidade com spec.md
- `scripts/utils/route-cli-utils.js` é o arquivo central — implementar com cuidado (regex de injeção em `routes.ts` cobre 3 cenários)
- Após cada task, verificar que scripts existentes não foram quebrados (executar `npm run generate:feature --help` como smoke test)
- Commit atômico por fase ou task lógica
- Para testes unitários, usar `jest.mock('fs')` para simular filesystem
