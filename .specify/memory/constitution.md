# Bebarter Project Constitution

## Core Principles

### I. SOLID Principles (NON-NEGOTIABLE)

Every implementation MUST follow SOLID principles:

- **Single Responsibility**: One class/function = one responsibility. Modules separated by concern (UI, Logic, Data, Integration)
- **Open/Closed**: Open for extension, closed for modification. Use interfaces and abstractions
- **Liskov Substitution**: Subtypes must be substitutable. Providers are interchangeable (Supabase ↔ Firebase)
- **Interface Segregation**: Specific interfaces > general interfaces. IRepository, IService, IValidation
- **Dependency Inversion**: Depend on abstractions, not concretes. Constructor injection pattern

### II. Module-First Architecture (NON-NEGOTIABLE)

All new features MUST be implemented as modules:

- **Discovery Before Creation**: Always search existing modules before creating new code
- **Registry Sync**: All modules must be registered in `.modules/registry.json`
- **Manifest Required**: Every module needs a complete `module.json` with AI metadata
- **Category Separation**: UI, Logic, Data, Integration - never mix concerns

### III. TypeScript Strict Mode (NON-NEGOTIABLE)

- Strict mode enabled in `tsconfig.json`
- No `any` types without explicit justification
- All functions must have explicit return types
- All parameters must be typed

### IV. Test-First Development

- Write tests before implementation when adding new features
- Maintain >70% coverage (current: 98.24%)
- Contract tests for service interfaces
- Quality score must stay >70/100 (current: 92/100)

### V. DRY and Code Reuse

- Always search existing code before creating new
- Use `npm run modules:search` and `npm run modules:suggest`
- Extend functionality instead of duplicating
- Reusability score target: >80% (current: 85%)

## Technology Stack Constraints

### Allowed

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript 5.4+ strict mode
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand for client state
- **Validation**: Zod for schema validation
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase Auth via @supabase/ssr

### Prohibited

- Direct database drivers (pg, Prisma, Knex, Drizzle)
- Manual JWT handling (jose, jsonwebtoken)
- Direct REST calls to PostgREST
- Direct database connections (use Supabase SDK only)
- ORM libraries (Supabase SDK only)

## Security Requirements

### Database

- RLS (Row Level Security) always ON
- Service role only in Edge Functions
- Never expose service key to client

### Storage

- Encrypt sensitive data in client storage
- Use HttpOnly, Secure, SameSite flags for cookies
- Follow OWASP Top 10 guidelines

## Performance Standards

- Discovery time: <100ms (achieved: 69ms)
- Context tokens per module: <5k
- API response p95: <500ms
- Storage operations p95: <100ms

## Quality Gates

All PRs must pass:

1. `npm run type-check` - Zero TypeScript errors
2. `npm run lint` - Zero ESLint errors
3. `npm run test` - All tests passing
4. `npm run modules:validate` - All modules valid
5. `npm run quality:check` - Score >70/100

## Development Workflow

### Before Implementation

1. Run discovery: `npm run modules:search "<keyword>"`
2. Check suggestions: `npm run modules:suggest "<task>"`
3. Confirm requirements with user
4. Plan following SOLID principles

### During Implementation

1. Follow module category guidelines (UI/Logic/Data/Integration)
2. Create/update module.json with AI metadata
3. Sync registry: `npm run modules:sync`
4. Write tests alongside code

### After Implementation

1. Run all quality gates
2. Update documentation if needed
3. Request user approval before marking complete

## Governance

- Constitution supersedes all other practices
- Amendments require documentation and explicit approval
- CLAUDE.md provides runtime development guidance
- All PRs must verify constitutional compliance

**Version**: 1.0.0 | **Ratified**: 2025-12-08 | **Last Amended**: 2025-12-08
