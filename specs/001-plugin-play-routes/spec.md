# Feature Specification: Automação de Rotas Plugin-and-Play

**Feature Branch**: `001-plugin-play-routes`
**Created**: 2026-03-24
**Status**: Draft
**Input**: Plano de Implementação — Arquitetura "Plugin-and-Play" para geração automática de rotas

---

## Clarifications

### Session 2026-03-24

- Q: Onde deve viver o diretivo `'use client'` para garantir que `page.tsx` compile sem erros no Next.js App Router? → A: O diretivo `'use client'` deve ser adicionado ao template do componente (`${PascalCase}List.tsx`), mantendo `page.tsx` como Server Component puro.
- Q: O gerador deve atualizar `routeGroups.protected` (array usado pelo middleware) além de `routes.protected` (objeto)? → A: O CLI pergunta separadamente se a rota deve ser protegida por autenticação; se sim, injeta em `routes.protected` **e** no array `routeGroups.protected`; se não, injeta apenas em `routes.public`.
- Q: Rotas de módulos UI com rota devem seguir o mesmo fluxo de proteção que features (pergunta + injeção em `routes.ts` + `routeGroups`)? → A: Sim — módulos UI com rota passam pelo mesmo fluxo interativo de pergunta "protegida ou pública?" e atualizam `routes.ts` e `routeGroups` da mesma forma que features.

## Contexto

Atualmente, adicionar uma nova funcionalidade ao projeto exige trabalho manual em múltiplos arquivos após rodar o gerador CLI: criar o arquivo de rota no App Router, atualizar `routes.ts`, e adicionar manualmente o item de navegação. O objetivo desta feature é eliminar esses passos braçais, fazendo com que **um único comando CLI produza tudo que é necessário para uma nova página funcionar no sistema** — sem nenhuma edição manual posterior.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Gerar feature com página acessível (Priority: P1)

Um desenvolvedor quer adicionar um novo domínio ao projeto (ex: "automacoes"). Ele roda um único comando e, ao terminar, consegue navegar para a URL `/automacoes` no browser sem nenhuma configuração adicional.

**Why this priority**: É o núcleo do objetivo "Plugin-and-Play". Sem isso, todas as outras melhorias são cosméticas.

**Independent Test**: Pode ser verificado rodando `npm run generate:feature automacoes` e confirmando que a rota `/automacoes` retorna HTTP 200 em `npm run build` sem edições manuais adicionais.

**Acceptance Scenarios**:

1. **Given** um projeto sem a feature "automacoes", **When** o desenvolvedor roda `npm run generate:feature automacoes`, **Then** o arquivo `src/app/automacoes/page.tsx` existe e importa corretamente o componente principal da feature.
2. **Given** o arquivo `src/app/automacoes/page.tsx` foi criado, **When** o projeto é compilado (`npm run build`), **Then** a compilação é concluída sem erros relacionados à nova rota.
3. **Given** o arquivo `src/app/automacoes/page.tsx` foi criado, **When** o desenvolvedor verifica `src/config/routes.ts`, **Then** a rota `/automacoes` já está registrada nesse arquivo sem edição manual.

---

### User Story 2 — Gerar módulo UI com rota opcional (Priority: P2)

Um desenvolvedor cria um novo módulo de interface via `npm run generate:module`. Ao escolher a categoria `ui`, ele tem a opção de também criar uma rota acessível para aquele módulo.

**Why this priority**: Completa a segunda frente do plano — módulos UI ganham rotas sem depender da estrutura de features.

**Independent Test**: Rodar `npm run generate:module` com categoria `ui` e opção de rota ativada; verificar se `src/app/modules/[nome]/page.tsx` é criado e compila sem erros.

**Acceptance Scenarios**:

1. **Given** o desenvolvedor escolhe criar um módulo de categoria `ui`, **When** o CLI pergunta se deve criar uma rota e o desenvolvedor confirma, **Then** o arquivo `src/app/modules/[moduleName]/page.tsx` é criado importando o componente principal do módulo.
2. **Given** o desenvolvedor escolhe criar um módulo de categoria `ui`, **When** o CLI pergunta se deve criar uma rota e o desenvolvedor recusa, **Then** nenhum arquivo em `src/app/` é criado, mantendo o módulo como componente puro.
3. **Given** um módulo UI sem rota é criado, **When** o desenvolvedor precisar adicionar rota depois, **Then** o CLI exibe instruções claras dos arquivos a criar manualmente (fora do escopo desta entrega — geração retroativa é feature futura).

---

### User Story 3 — Controle de visibilidade: feature com ou sem rota pública (Priority: P2)

Um desenvolvedor precisa criar uma feature que contém apenas lógica de negócio (ex: serviços de background, hooks utilitários), sem expor uma rota pública.

**Why this priority**: Evita que features internas gerem URLs desnecessárias e potencialmente inseguras. O CLI pergunta interativamente ao desenvolvedor se deseja criar uma rota, garantindo que a decisão seja sempre explícita.

**Acceptance Scenarios**:

1. **Given** o desenvolvedor roda `npm run generate:feature [nome]`, **When** o CLI exibe a pergunta "Deseja criar uma rota pública para esta feature? (s/n)", **Then** se o desenvolvedor responder "n", nenhum arquivo é criado em `src/app/`.
2. **Given** uma feature criada sem rota, **When** o desenvolvedor inspeciona `src/app/`, **Then** nenhuma pasta foi criada para aquela feature.
3. **Given** o CLI está sendo executado em modo não-interativo (ex: CI/scripts com input redirecionado), **When** nenhuma resposta é fornecida, **Then** o comportamento padrão é **não criar rota** (opção segura).

---

### User Story 4 — Remoção limpa de feature (Priority: P3)

Um desenvolvedor precisa remover uma feature obsoleta. Atualmente não há comando para isso — ele teria que apagar manualmente a pasta da feature, o arquivo de rota e a entrada em `routes.ts`.

**Why this priority**: Completa o ciclo de vida da feature (criar → usar → remover). Nesta entrega, o comando será registrado no CLI com um placeholder claro indicando implementação futura via `// TODO`.

**Acceptance Scenarios**:

1. **Given** o desenvolvedor roda `npm run remove:feature [nome]`, **When** o comando é executado, **Then** o CLI exibe a mensagem: "remove:feature ainda não está implementado. Consulte TODO em scripts/remove-feature.js para o escopo planejado."
2. **Given** o arquivo `scripts/remove-feature.js` existe como placeholder, **When** o desenvolvedor o abre, **Then** encontra comentários `// TODO` detalhando as três ações planejadas: remover pasta de feature, remover rota em `src/app/` e remover entrada em `routes.ts`.

---

### Edge Cases

- O que acontece se o desenvolvedor rodar `generate:feature` com um nome que já existe em `src/app/`? O CLI deve detectar o conflito e perguntar se deseja sobrescrever ou abortar.
- O que acontece se o nome da feature contém caracteres especiais ou maiúsculas (ex: `MinhaFeature`)? O CLI deve normalizar para `kebab-case` antes de criar pastas e para `PascalCase` nos imports.
- O que acontece se `src/config/routes.ts` estiver em formato inesperado (editado manualmente)? A injeção automática deve falhar com mensagem clara em vez de corromper o arquivo.
- O que acontece se o componente principal da feature ainda não existe no momento em que a página é gerada? O arquivo de página deve ser criado com um placeholder funcional e um comentário indicando o import pendente.
- Feature de categoria `logic` ou `data` recebe prompt de rota? Não — o prompt de rota deve aparecer apenas para features com componentes UI ou módulos de categoria `ui`.

---

## Requirements _(mandatory)_

### Functional Requirements

**Geração de Rota por Feature**

- **FR-001**: O gerador de features DEVE criar automaticamente um arquivo de página em `src/app/[feature-name]/page.tsx` ao criar uma nova feature com componentes UI.
- **FR-002**: O arquivo de página gerado DEVE importar o componente principal da feature usando o path alias TypeScript (`@/features/[nome]`), sem caminhos relativos.
- **FR-003**: O gerador DEVE atualizar `src/config/routes.ts` adicionando a nova rota ao grupo adequado (público ou protegido), determinado por uma segunda pergunta interativa ao desenvolvedor. Se protegida, a rota DEVE ser injetada em `routes.protected` **e** no array `routeGroups.protected`; se pública, apenas em `routes.public`.
- **FR-004**: O arquivo de página gerado DEVE ser compilável sem erros pelo Next.js imediatamente após a geração, sem nenhuma edição manual. O template do componente `${PascalCase}List.tsx` DEVE incluir a diretiva `'use client'` no topo, mantendo `page.tsx` como Server Component.

**Geração de Rota por Módulo UI**

- **FR-005**: O gerador de módulos DEVE oferecer, de forma opcional e controlada por interação explícita do usuário (pergunta sim/não), a criação de uma rota em `src/app/modules/[module-name]/page.tsx` quando a categoria escolhida for `ui`. _(absorve FR-006 — opcionalidade e interação são parte do mesmo requisito)_
- **FR-007**: O `module.json` de módulos com rota DEVE incluir um campo `route` registrando o caminho gerado (ex: `"/modules/products-ui"`).
- **FR-007b**: O gerador de módulos UI com rota DEVE seguir o mesmo fluxo interativo de features: perguntar se a rota é protegida e, conforme resposta, injetar em `routes.protected` + `routeGroups.protected` ou apenas em `routes.public`.

**Consistência e Segurança de Geração**

- **FR-008**: O gerador DEVE detectar conflito quando já existir uma pasta em `src/app/` com o mesmo nome e DEVE pedir confirmação antes de sobrescrever.
- **FR-009**: O gerador DEVE normalizar o nome fornecido pelo desenvolvedor para `kebab-case` em paths e `PascalCase` em nomes de componentes e imports.
- **FR-010**: Caso `src/config/routes.ts` não possa ser atualizado automaticamente — definido como: o padrão regex esperado (`routes.protected: {`, `routeGroups.protected: [`, ou `routes.public: {`) não for encontrado no arquivo — o gerador DEVE exibir uma mensagem clara com o trecho exato que precisa ser adicionado manualmente, **sem modificar o arquivo**. Se apenas um dos dois alvos de rotas protegidas estiver ausente, ambos são reportados no fallback (nenhuma modificação parcial).

**Remoção de Feature (placeholder — implementação futura)**

- **FR-011**: O sistema DEVE registrar o comando `npm run remove:feature` no `package.json`, apontando para um arquivo `scripts/remove-feature.js` que exibe uma mensagem explicando que a funcionalidade está planejada mas não implementada.
- **FR-012**: O arquivo `scripts/remove-feature.js` DEVE conter comentários `// TODO` descrevendo as **quatro** ações planejadas: (1) remover pasta de feature em `src/features/`, (2) remover rota em `src/app/`, (3) remover entrada no objeto em `src/config/routes.ts`, (4) remover entrada no array `routeGroups.protected` em `src/config/routes.ts`.

### Key Entities

- **Feature**: Domínio de negócio autocontido em `src/features/[nome]/`, com componentes, hooks, services e stores.
- **Módulo UI**: Componente visual reutilizável em `modules/ui/[nome]-ui/`, registrado no `.modules/registry.json` com `module.json`.
- **App Route**: Arquivo `page.tsx` dentro de `src/app/[caminho]/` que expõe uma URL acessível no Next.js App Router.
- **Route Config**: Entrada no objeto `routes` de `src/config/routes.ts`, usada por middleware, guardas e navegação.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Um desenvolvedor consegue ter uma nova página funcionando (acessível via URL, sem 404) em **menos de 60 segundos** após rodar o comando de geração, sem nenhuma edição manual de arquivos.
- **SC-002**: **100% dos arquivos gerados** pelo CLI compilam sem erros no primeiro `npm run build` após a geração.
- **SC-003**: `src/config/routes.ts` está **sempre em sincronia** com as pastas existentes em `src/app/` — nenhuma rota em `app/` sem entrada no config, e vice-versa.
- **SC-004**: O CLI detecta e reporta **100% dos conflitos de nome** antes de sobrescrever arquivos existentes.
- **SC-005**: O sistema fornece instruções claras e passo-a-passo para que um desenvolvedor remova manualmente uma feature (lógica + rota + config) sem deixar referências quebradas. A implementação completa de remoção automatizada é escopo de entrega futura.

---

## Assumptions

- O componente principal de uma feature segue a convenção `[PascalCaseName]List` ou `[PascalCaseName]Page` — o gerador usará essa convenção para montar o import na página.
- Rotas de módulos UI ficam sob o prefixo `/modules/[nome]` para distinguir de rotas de features em `src/app/[nome]`.
- `src/config/routes.ts` exporta um objeto `routes` com sub-objetos `public` e `protected`, e um `routeGroups.protected` (array). O gerador pergunta ao desenvolvedor se a rota é protegida e injeta nos lugares corretos em ambas as estruturas.
- A geração de navegação automática (menu lateral/topbar que lê `routes.ts`) está fora do escopo desta entrega e será tratada como feature separada.
