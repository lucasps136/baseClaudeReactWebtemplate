# Análise Detalhada da Arquitetura - Projeto Bebarter

## 1. ESTRUTURA DE DIRETÓRIOS MAPEADA

```
src/
├── app/                     # Next.js 14 App Router
│   ├── layout.tsx          # Root layout com RootProvider
│   ├── page.tsx            # Home page (landing)
│   ├── error.tsx           # Error boundary
│   └── loading.tsx         # Loading state
│
├── config/                  # Configuração centralizada
│   ├── env.ts              # Validação ENV com Zod
│   └── routes.ts           # Constantes de rotas
│
├── features/               # Vertical Slice Architecture
│   └── users/              # Feature de Usuários
│       ├── components/     # UI específica
│       ├── hooks/          # useUser, useUsers
│       ├── services/       # UserService
│       ├── stores/         # Zustand store
│       ├── types/          # Domain types
│       └── index.ts        # Exports
│
├── shared/                 # Cross-cutting concerns
│   ├── components/         # UI compartilhada
│   │   ├── providers/      # Context Providers
│   │   ├── rbac/          # Guard components
│   │   └── ui/            # shadcn/ui
│   ├── hooks/             # Global hooks
│   ├── services/          # Infraestrutura
│   │   ├── auth/          # Auth Factory
│   │   ├── database/      # Database Factory
│   │   ├── api/           # HTTP Client
│   │   ├── storage/       # Client storage
│   │   ├── rbac/          # RBAC Factory
│   │   ├── payments/      # Payment Factory
│   │   └── theme/         # Theme Factory
│   ├── stores/            # Zustand stores
│   ├── types/             # Shared types
│   └── utils/             # Utilities
│
└── middleware.ts           # Next.js middleware
```
