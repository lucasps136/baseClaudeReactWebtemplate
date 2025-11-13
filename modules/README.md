# Módulos - Bebarter

Este diretório contém todos os módulos da aplicação organizados por categoria.

## 📁 Estrutura

```
modules/
├── ui/              # Componentes React, hooks de UI
├── logic/           # Services, business logic, validações
├── data/            # Schemas SQL, migrations, queries
└── integration/     # Integrações com APIs externas
```

## 🎯 Categorias

### UI Modules (`ui/`)

Componentes visuais, hooks customizados e estado de UI.

**Exemplos**: auth-ui, profile-ui, payment-ui

### Logic Modules (`logic/`)

Lógica de negócio, services, validações e transformações de dados.

**Exemplos**: user-logic, order-logic, notification-logic

### Data Modules (`data/`)

Schemas de banco de dados, migrations e queries reutilizáveis.

**Exemplos**: user-data, order-data, auth-data

### Integration Modules (`integration/`)

Integrações com serviços externos e providers de terceiros.

**Exemplos**: stripe-integration, sendgrid-integration

## 🚀 Como Usar

### Criar Novo Módulo

```bash
npm run generate:module <name> --category <ui|logic|data|integration>
```

### Listar Módulos

```bash
npm run modules:list
```

### Buscar Módulos

```bash
npm run modules:search "keyword"
```

### Importar de Módulos

```typescript
// UI Module
import { UserProfile } from "@/modules/ui/user-profile-ui";

// Logic Module
import { UserService } from "@/modules/logic/user-logic";

// Integration Module
import { StripeProvider } from "@/modules/integration/stripe";
```

## 📖 Documentação

Para mais informações, consulte:

- [Documentação Completa](../docs/modular-architecture/README.md)
- [Guia Rápido](../docs/modular-architecture/QUICK-REFERENCE.md)

## 🔧 Comandos Úteis

```bash
# Gerenciamento
npm run modules:list              # Listar todos
npm run modules:search <keyword>  # Buscar
npm run modules:sync              # Sincronizar registry
npm run modules:validate          # Validar manifests

# Descoberta (para IA)
npm run modules:suggest "<task>"  # Sugestões inteligentes
npm run modules:index             # Criar search index

# Qualidade
npm run modules:metrics           # Ver métricas
```

## ⚠️ Regras Importantes

1. **Cada módulo deve ter um `module.json`** com metadata completa
2. **Siga a estrutura recomendada** para cada categoria
3. **Documente exports** com exemplos no manifest
4. **Mantenha responsabilidade única** por módulo
5. **Sincronize o registry** após criar/modificar módulos

## 🤝 Contribuindo

Ao adicionar um novo módulo:

1. Use o generator: `npm run generate:module <name> --category <category>`
2. Implemente o código
3. Atualize `module.json` com metadata completa
4. Adicione documentação em `docs/README.md`
5. Crie testes
6. Sincronize: `npm run modules:sync`

---

**Última atualização**: 2025-01-11
**Sistema de módulos**: v1.0.0
