# Research: Plugin-and-Play Route Automation

**Branch**: `001-plugin-play-routes` | **Date**: 2026-03-24

---

## 1. Prompts Interativos no CLI (Node.js)

**Decisão**: Usar `readline` nativo do Node.js
**Racional**: Ambos os scripts (`generate-feature.js`, `generate-module.js`) já usam CommonJS puro sem dependências externas. Manter o padrão evita adicionar `inquirer` ou `prompts` ao package.json. `readline.createInterface` é suficiente para perguntas sim/não.
**Alternativas descartadas**: `inquirer` (dependência extra), `prompts` (dependência extra), args `--route` (usuário queria interação, não flag — decisão Q1)

**Padrão a usar:**

```js
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question("Pergunta (s/n): ", (answer) => {
  rl.close();
  // resposta: 's' ou 'n'
});
// Modo não-interativo (CI): detectar process.stdin.isTTY === false → default 'n'
```

**Comportamento para respostas inesperadas**: A expressão `answer.trim().toLowerCase() === 's'` define que qualquer valor diferente de `'s'` (incluindo `'S'`, `'n'`, `'N'`, `'y'`, `'sim'`, Enter vazio) resolve para `false` — equivalente a responder "não". Não há reperguntas; a semântica é binária: só `'s'` confirma.

**Modo CI — definição precisa**: `process.stdin.isTTY` é `undefined` quando stdin é redirecionado (pipe, `echo "" |`, CI/CD). A verificação `!process.stdin.isTTY` cobre `false` e `undefined`. Ambientes Docker e SSH com stdin redirecionado também são tratados como modo CI.

---

## 2. Injeção em `src/config/routes.ts`

**Decisão**: Injeção via manipulação de string/regex no arquivo TypeScript
**Racional**: O arquivo usa `as const` — não é executável como módulo CommonJS sem transpilação. AST transformation (ts-morph) adicionaria dependência. Regex simples é suficiente dado que o formato do arquivo é estável e controlado.
**Alternativas descartadas**: `ts-morph` (dependência pesada), require/import (requer transpilação), reescrever o arquivo completo (destrutivo)

**Assinatura da função**: `injectRouteConfig(routeKey, routePath, isProtected)`

- `routeKey`: identificador TypeScript válido, sem barras (ex: `automacoes`, `testeUi`)
- `routePath`: URL completa (ex: `/automacoes`, `/modules/teste-ui`)
- `isProtected`: boolean — determina em qual bloco injetar

**Estratégia de injeção no bloco `protected` (isProtected=true):**

```js
const injection = `    ${routeKey}: "${routePath}",\n`;
const protectedObjRegex = /(  protected: \{)\n/;
content = content.replace(protectedObjRegex, `$1\n${injection}`);

// Também append no array routeGroups.protected
// Buscar: `  protected: [\n` ou `  protected: [`
const protectedArrayRegex = /(  protected: \[)([\s\S]*?)(\])/s;
content = content.replace(
  protectedArrayRegex,
  (_, open, body, close) => `${open}${body}    "${routePath}",\n  ${close}`,
);
```

**Estratégia de injeção no bloco `public` (isProtected=false):**

```js
const injection = `    ${routeKey}: "${routePath}",\n`;
const publicBlockRegex = /(  public: \{)\n/;
content = content.replace(publicBlockRegex, `$1\n${injection}`);
// Nota: routes.public não tem array no routeGroups — nenhum append adicional
```

**Posição de injeção**: As entradas são inseridas **imediatamente após a chave/colchete de abertura** do bloco — ou seja, no topo da lista existente. Isso garante que novas rotas apareçam primeiro na ordem de leitura, facilitando revisão visual.

**Fallback — definição objetiva (FR-010)**: O fallback é acionado quando **o padrão regex específico não é encontrado no conteúdo do arquivo**. Os três padrões monitorados são:

- `routes.protected: {` — regex `/(  protected: \{)\n/`
- `routeGroups.protected: [` — regex `/(  protected: \[)([\s\S]*?)(\])/s`
- `routes.public: {` — regex `/(  public: \{)\n/`

Se `isProtected=true` e qualquer um dos dois primeiros padrões falhar, a função retorna `false` e exibe o trecho manual para AMBAS as inserções (objeto + array). Se `isProtected=false` e o terceiro padrão falhar, exibe o trecho manual para `routes.public`. O arquivo **não é modificado** quando o fallback é acionado.

**Comportamento para ausência parcial** (apenas um dos dois alvos protected encontrado): A função verifica ambos os padrões **antes de fazer qualquer substituição** (via `.test()` pré-validação). Se apenas um for encontrado, aciona fallback completo — nenhuma modificação parcial é aplicada.

---

## 3. Template do `page.tsx` gerado

**Decisão**: Server Component por padrão, sem `'use client'`
**Racional**: Next.js App Router usa Server Components por default. O componente `${PascalCase}List` já usa hooks (`useEffect`, `useState` via store Zustand) — então `page.tsx` será um Server Component wrapper e o componente filho precisará ter `'use client'`. Os componentes gerados pelo CLI já são Client Components implicitamente.

**Template para feature:**

```tsx
import { PascalCaseList } from "@/features/kebab-case";

export default function KebabCasePage() {
  return (
    <main className="container mx-auto py-8">
      <PascalCaseList />
    </main>
  );
}
```

**Template para módulo UI:**

```tsx
import { PascalCaseList } from "@/modules/ui/module-name";

export default function ModuleNamePage() {
  return (
    <main className="container mx-auto py-8">
      <PascalCaseList />
    </main>
  );
}
```

---

## 4. Normalização de nomes

**Decisão**: Reutilizar lógica existente já presente nos dois scripts
**Racional**: `generate-feature.js` já tem `kebabCase` e `pascalCase` via `toLowerCase().replace()` e `split('-').map(capitalize).join('')`. `generate-module.js` tem `toPascalCase()`. Não há necessidade de extrair para módulo compartilhado (fora do escopo — YAGNI).

**Comportamento esperado:**

- Input `MinhaFeature` → `minha-feature` (kebab) → `MinhaFeature` (pascal)
- Input `minha feature` → `minha-feature` (kebab) → `MinhaFeature` (pascal)

---

## 5. Detecção de conflito de rota

**Decisão**: Verificar existência da pasta em `src/app/[kebabCase]/` antes de criar
**Racional**: Evita sobrescrever page.tsx customizado pelo desenvolvedor. Perguntar confirmação via `readline` antes de sobrescrever (mesmo padrão da pergunta de rota).

**Diferente do conflito de feature** (que já aborta com `process.exit(1)`): para rota, perguntar se deseja sobrescrever — feature pode existir sem rota.

---

## 6. Atualização de `module.json` para módulos UI com rota

**Decisão**: Adicionar campo `route` ao manifest quando rota for criada
**Racional**: FR-007 — permite que ferramentas futuras (navegação dinâmica) descubram automaticamente quais módulos têm rotas. Não impacta o schema existente do registry (campo extra é ignorado).

**Campo a adicionar:**

```json
{
  "route": "/modules/module-name"
}
```

---

## 7. Modo não-interativo (CI)

**Decisão**: Detectar `process.stdin.isTTY` para identificar ambiente não-interativo
**Racional**: Em CI/scripts com input redirecionado, `isTTY` é `undefined` ou `false`. Neste caso, pular o prompt e usar default seguro (não criar rota) — conforme decisão Q1.

**Implementação:**

```js
if (!process.stdin.isTTY) {
  // Modo CI: não criar rota, continuar sem prompt
  generateFeatureFiles(...)
  return
}
// Modo interativo: fazer pergunta
```
