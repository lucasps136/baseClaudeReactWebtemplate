# Quickstart: Plugin-and-Play Route Automation

**Branch**: `001-plugin-play-routes` | **Date**: 2026-03-24

---

## Para o Desenvolvedor (após implementação)

### Criar uma nova feature com página

```bash
npm run generate:feature automacoes
# CLI pergunta: "Deseja criar uma rota pública para esta feature? (s/n)"
# Responder 's' → cria src/app/automacoes/page.tsx + atualiza routes.ts
# Responder 'n' → cria apenas a feature (comportamento anterior)
```

### Criar um módulo UI com rota

```bash
npm run generate:module automacoes-ui --category ui
# CLI pergunta: "Deseja criar uma rota para este módulo? (s/n)"
# Responder 's' → cria src/app/modules/automacoes-ui/page.tsx + atualiza module.json
# Responder 'n' → módulo puro sem rota
```

### Remover uma feature (futuro)

```bash
npm run remove:feature automacoes
# Atualmente: exibe mensagem de placeholder com instruções manuais
# Futuramente: remove feature + rota + entrada no routes.ts
```

---

## Verificação após geração

```bash
# Verificar se a rota foi criada
ls src/app/automacoes/

# Verificar se routes.ts foi atualizado
grep "automacoes" src/config/routes.ts

# Compilar e verificar sem erros
npm run build

# Verificar qualidade (manter score > 70)
npm run type-check
npm run lint
```

---

## Modo CI/Scripts (sem interação)

Em ambientes não-interativos, o CLI detecta automaticamente e **não cria rota** (comportamento seguro):

```bash
# Em CI: executa sem prompts, só cria a feature
echo "" | npm run generate:feature automacoes
# Ou via pipe (stdin não é TTY → modo silencioso)
```
