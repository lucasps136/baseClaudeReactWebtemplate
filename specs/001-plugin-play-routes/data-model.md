# Data Model: Plugin-and-Play Route Automation

**Branch**: `001-plugin-play-routes` | **Date**: 2026-03-24

Esta feature não introduz entidades de banco de dados. As entidades relevantes são **configurações e arquivos gerados pelo CLI**, descritas abaixo.

---

## Entidades do Sistema de Geração

### 1. FeatureRouteConfig

Representa a entrada injetada em `src/config/routes.ts` para uma feature gerada.

| Campo   | Tipo                      | Descrição                                      |
| ------- | ------------------------- | ---------------------------------------------- |
| `key`   | `string`                  | Nome em camelCase (ex: `automacoes`)           |
| `path`  | `string`                  | Caminho URL (ex: `/automacoes`)                |
| `group` | `"protected" \| "public"` | Grupo no objeto `routes` — padrão: `protected` |

**Localização no arquivo**: Inserido como nova linha no bloco `protected: {` de `src/config/routes.ts`.

---

### 2. AppPageFile

Arquivo `page.tsx` criado no App Router do Next.js.

| Campo           | Tipo     | Descrição                                                                      |
| --------------- | -------- | ------------------------------------------------------------------------------ |
| `path`          | `string` | Ex: `src/app/automacoes/page.tsx`                                              |
| `importPath`    | `string` | Ex: `@/features/automacoes` (feature) ou `@/modules/ui/automacoes-ui` (módulo) |
| `componentName` | `string` | Ex: `AutomacoesList`                                                           |
| `exportName`    | `string` | Ex: `AutomacoesPage` (default export da page)                                  |

---

### 3. ModuleRouteField (extensão do `module.json`)

Campo adicional adicionado ao `module.json` de módulos UI com rota.

```json
{
  "route": "/modules/module-name"
}
```

| Campo   | Tipo             | Obrigatório | Descrição                                            |
| ------- | ---------------- | ----------- | ---------------------------------------------------- |
| `route` | `string \| null` | Não         | Caminho URL se o módulo tem rota; omitido se não tem |

---

## Transformações de Nome

Toda entrada de nome passa pelas seguintes transformações antes de uso:

| Input do usuário | kebab-case      | PascalCase     | camelCase      |
| ---------------- | --------------- | -------------- | -------------- |
| `automacoes`     | `automacoes`    | `Automacoes`   | `automacoes`   |
| `MinhaFeature`   | `minha-feature` | `MinhaFeature` | `minhaFeature` |
| `minha feature`  | `minha-feature` | `MinhaFeature` | `minhaFeature` |
| `orders-ui`      | `orders-ui`     | `OrdersUi`     | `ordersUi`     |

---

## Arquivos Afetados por Geração

### `npm run generate:feature [nome]` com rota confirmada

```
src/
├── features/
│   └── [kebab]/           ← existente (gerado antes)
│       └── ...
└── app/
    └── [kebab]/           ← NOVO
        └── page.tsx       ← NOVO

src/config/routes.ts       ← MODIFICADO (injeção na seção protected)
```

### `npm run generate:module [nome] --category ui` com rota confirmada

```
modules/
└── ui/
    └── [nome]/            ← existente (gerado antes)
        ├── module.json    ← MODIFICADO (campo "route" adicionado)
        └── ...

src/
└── app/
    └── modules/
        └── [nome]/        ← NOVO
            └── page.tsx   ← NOVO
```

### `npm run remove:feature [nome]` (placeholder)

```
scripts/remove-feature.js  ← NOVO (placeholder com TODO)
package.json               ← MODIFICADO (adicionar script)
```
