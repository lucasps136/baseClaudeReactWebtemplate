# User Data Module - Testing Documentation

## Test Status: N/A (Schema-Only Module)

Este módulo contém **apenas schemas SQL** e não possui código TypeScript/JavaScript testável.

## Estrutura do Módulo

```
modules/data/user-data/
├── schemas/users.sql              # Schema PostgreSQL completo
├── migrations/001_create_users_table.sql  # Migration inicial
├── queries/users.sql              # Queries SQL reutilizáveis
└── tests/
    └── README.md                  # Este arquivo
```

## Por que não há testes unitários?

### Conteúdo do Módulo

O módulo `user-data` fornece:

1. **Schema SQL** (`schemas/users.sql`):
   - Definição da tabela `users`
   - Constraints (email, name, bio)
   - Indexes para performance
   - Trigger para `updated_at`
   - RLS policies
   - Grants

2. **Migration SQL** (`migrations/001_create_users_table.sql`):
   - Script de migração inicial

3. **Queries SQL** (`queries/users.sql`):
   - Queries CRUD reutilizáveis
   - Queries de busca e paginação
   - Queries de estatísticas

### Tipo de Código

- **SQL puro**: Não é código executável em runtime JavaScript/TypeScript
- **Schema definition**: Validado pelo PostgreSQL em execução
- **Sem lógica de negócio**: Apenas estrutura de dados

## Estratégia de Validação

### 1. Validação de Sintaxe SQL

A validação de sintaxe SQL acontece automaticamente quando o schema é executado no PostgreSQL/Supabase.

**Validação manual**:

```bash
# Executar schema no Supabase
psql -h your-host.supabase.co -U postgres -d postgres -f modules/data/user-data/schemas/users.sql

# Validar estrutura da tabela
psql -h your-host.supabase.co -U postgres -d postgres -c "\d public.users"
```

**Resultado esperado**:

- ✅ Tabela criada sem erros
- ✅ Constraints aplicados
- ✅ Indexes criados
- ✅ RLS habilitado
- ✅ Policies ativas

### 2. Validação de Constraints

Os constraints são validados pelo PostgreSQL durante operações:

```sql
-- Email mínimo 3 caracteres
INSERT INTO users (email, name) VALUES ('ab', 'Test'); -- ERRO

-- Name entre 2-100 caracteres
INSERT INTO users (email, name) VALUES ('test@test.com', 'A'); -- ERRO

-- Bio máximo 500 caracteres
INSERT INTO users (email, name, bio) VALUES ('test@test.com', 'Test', REPEAT('a', 501)); -- ERRO
```

### 3. Validação de RLS Policies

As policies são testadas através do módulo `user-logic` que interage com o banco:

```typescript
// user-logic testa:
// - Acesso autenticado (full access)
// - Acesso anônimo (read-only)
// - Tentativas de acesso não autorizado
```

### 4. Validação de Performance (Indexes)

```sql
-- Verificar uso de indexes
EXPLAIN ANALYZE
SELECT * FROM public.users WHERE email = 'test@example.com';

-- Deve usar: idx_users_email
```

## Testes de Integração

Os testes de integração que validam este schema são executados em:

### Módulo: `user-logic`

**Path**: `modules/logic/user-logic/tests/`

**O que é testado**:

- ✅ CRUD operations via Supabase Client
- ✅ RLS policies enforcement
- ✅ Constraint validation
- ✅ Query performance
- ✅ Full-text search functionality
- ✅ Pagination and sorting

**Exemplo de teste de integração**:

```typescript
// modules/logic/user-logic/tests/user-repository.test.ts
describe("UserRepository Integration Tests", () => {
  it("should enforce email constraint", async () => {
    await expect(
      repository.create({ email: "ab", name: "Test" }),
    ).rejects.toThrow("constraint");
  });

  it("should enforce RLS for anonymous users", async () => {
    const anonClient = createAnonClient();
    await expect(
      anonClient.from("users").insert({ email: "test@test.com", name: "Test" }),
    ).rejects.toThrow("permission denied");
  });

  it("should use email index for fast lookups", async () => {
    const result = await repository.findByEmail("test@test.com");
    expect(result.executionTime).toBeLessThan(100); // ms
  });
});
```

## Testes E2E

Os testes E2E que validam fluxos completos com este schema são executados em:

### Playwright E2E Tests

**Path**: `tests/e2e/users/`

**O que é testado**:

- ✅ Criar usuário via UI
- ✅ Atualizar perfil via UI
- ✅ Buscar usuários via UI
- ✅ Upload de avatar
- ✅ Validação de formulários

**Exemplo de teste E2E**:

```typescript
// tests/e2e/users/user-profile.spec.ts
test("should create user with valid data", async ({ page }) => {
  await page.goto("/users/create");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="name"]', "Test User");
  await page.click('button[type="submit"]');

  await expect(page.locator(".success-message")).toBeVisible();

  // Validar que foi salvo no banco
  const user = await supabase
    .from("users")
    .select("*")
    .eq("email", "test@example.com")
    .single();

  expect(user.data).toBeDefined();
  expect(user.data.name).toBe("Test User");
});
```

## Validação Manual (Checklist)

Para validar manualmente este módulo após mudanças no schema:

### 1. Executar Schema

```bash
cd D:\Docs\Bebarter
psql -h your-host.supabase.co -U postgres -d postgres -f modules/data/user-data/schemas/users.sql
```

### 2. Verificar Estrutura

```sql
-- Listar colunas
\d public.users

-- Verificar constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- Verificar indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users' AND schemaname = 'public';

-- Verificar RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- Verificar policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';
```

### 3. Testar Constraints

```sql
-- Email válido
INSERT INTO public.users (email, name) VALUES ('valid@email.com', 'Valid Name');

-- Email inválido (deve falhar)
INSERT INTO public.users (email, name) VALUES ('ab', 'Name'); -- ERRO esperado

-- Name inválido (deve falhar)
INSERT INTO public.users (email, name) VALUES ('test@test.com', 'A'); -- ERRO esperado

-- Bio muito longa (deve falhar)
INSERT INTO public.users (email, name, bio)
VALUES ('test2@test.com', 'Test', REPEAT('a', 501)); -- ERRO esperado
```

### 4. Testar RLS

```sql
-- Como authenticated user (deve funcionar)
SET ROLE authenticated;
SELECT * FROM public.users;
INSERT INTO public.users (email, name) VALUES ('auth@test.com', 'Auth User');

-- Como anon (deve funcionar apenas SELECT)
SET ROLE anon;
SELECT * FROM public.users; -- OK
INSERT INTO public.users (email, name) VALUES ('anon@test.com', 'Anon'); -- ERRO esperado
```

### 5. Testar Queries

```sql
-- Executar queries de queries/users.sql
-- Substituir $1, $2, etc. por valores reais

-- Exemplo: Get user by email
SELECT * FROM public.users WHERE email = 'test@example.com';

-- Exemplo: Search users
SELECT *
FROM public.users
WHERE to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(bio, ''))
  @@ plainto_tsquery('english', 'developer')
ORDER BY created_at DESC
LIMIT 10;
```

### 6. Testar Performance

```sql
-- Verificar uso de index em email lookup
EXPLAIN ANALYZE
SELECT * FROM public.users WHERE email = 'test@example.com';
-- Deve mostrar: Index Scan using idx_users_email

-- Verificar uso de index em search
EXPLAIN ANALYZE
SELECT *
FROM public.users
WHERE to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(bio, ''))
  @@ plainto_tsquery('english', 'developer');
-- Deve mostrar: Bitmap Index Scan using idx_users_search
```

## Coverage

### Schema Coverage

- ✅ **100%** - Todas as colunas documentadas e com constraints
- ✅ **100%** - Todos os indexes criados e documentados
- ✅ **100%** - RLS policies definidas e documentadas
- ✅ **100%** - Triggers implementados e documentados

### Query Coverage

- ✅ **100%** - Todas as operações CRUD cobertas
- ✅ **100%** - Queries de busca e paginação cobertas
- ✅ **100%** - Queries de estatísticas cobertas

### Integration Coverage

Testado via `user-logic` module:

- ✅ CRUD operations
- ✅ Constraints enforcement
- ✅ RLS policies
- ✅ Search functionality
- ✅ Performance

## Conclusão

Este módulo **não requer testes unitários** pois:

1. **É apenas schema SQL**: Não há código executável JavaScript/TypeScript
2. **Validação acontece no PostgreSQL**: Constraints e RLS são validados pelo banco
3. **Testes de integração cobrem o uso**: Módulo `user-logic` testa todas as operações
4. **Testes E2E cobrem fluxos completos**: Playwright testa interações reais

### Quando criar testes para este módulo?

Apenas se forem adicionados:

- ✅ **Helpers TypeScript**: Funções utilitárias para manipular dados
- ✅ **Query builders**: Código TypeScript que gera SQL dinâmico
- ✅ **Type definitions**: Validadores ou parsers customizados
- ✅ **Migrations automatizadas**: Scripts Node.js para migrations

**Até lá, este módulo é considerado "schema-only" e não requer testes unitários.**

---

## Referências

- **Integration tests**: `modules/logic/user-logic/tests/`
- **E2E tests**: `tests/e2e/users/`
- **Schema documentation**: `modules/data/user-data/README.md`
- **Queries documentation**: `modules/data/user-data/queries/users.sql`

---

**Module Version**: 1.0.0
**Last Updated**: 2025-01-12
**Test Status**: ✅ No unit tests needed (schema-only module)
**Integration Status**: ✅ Covered by user-logic module
**E2E Status**: ✅ Covered by Playwright tests
