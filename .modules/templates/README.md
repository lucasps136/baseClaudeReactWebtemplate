# Test Templates Documentation

Este diretório contém templates reutilizáveis para testes de módulos.

## Arquivos

### test-template.ts

Contém templates completos para diferentes tipos de testes:

#### 1. Component Test Template (`componentTestTemplate`)

Template para testar componentes React com Testing Library.

**Inclui:**

- Testes de renderização
- Testes de interação do usuário
- Testes de gerenciamento de estado
- Testes de operações assíncronas
- Testes de acessibilidade

**Uso:**

```typescript
import { componentTestTemplate } from "@/.modules/templates/test-template";

// Use o template como referência para criar seus testes
// Substitua "ComponentName" pelo nome do seu componente
```

#### 2. Hook Test Template (`hookTestTemplate`)

Template para testar custom hooks React.

**Inclui:**

- Testes de funcionalidade básica
- Testes de atualizações de estado
- Testes de operações assíncronas
- Testes de cleanup
- Testes de dependências

**Uso:**

```typescript
import { hookTestTemplate } from "@/.modules/templates/test-template";

// Use o template como referência para testar hooks
// Substitua "useCustomHook" pelo nome do seu hook
```

#### 3. Service Test Template (`serviceTestTemplate`)

Template para testar services e classes de lógica de negócio.

**Inclui:**

- Testes de construtor e inicialização
- Testes de operações CRUD
- Testes de validação
- Testes de tratamento de erros
- Testes de regras de negócio

**Uso:**

```typescript
import { serviceTestTemplate } from "@/.modules/templates/test-template";

// Use o template como referência para testar services
// Configure mocks apropriados para dependências
```

#### 4. Store Test Template (`storeTestTemplate`)

Template para testar Zustand stores.

**Inclui:**

- Testes de estado inicial
- Testes de mutações de estado
- Testes de estados de loading e erro
- Testes de reset

**Uso:**

```typescript
import { storeTestTemplate } from "@/.modules/templates/test-template";

// Use o template como referência para testar stores
// Substitua "useCustomStore" pelo nome da sua store
```

#### 5. Mock Examples (`mockExamples`)

Exemplos de padrões comuns de mocking.

**Inclui exemplos de mock para:**

- Fetch/API calls
- localStorage
- Supabase client
- Next.js router
- Zustand stores

## Como Usar os Templates

### 1. Para Componentes

```typescript
// modules/ui/my-module/src/components/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render without crashing', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### 2. Para Hooks

```typescript
// modules/ui/my-module/src/hooks/useMyHook.test.ts
import { renderHook, act } from "@testing-library/react";
import { useMyHook } from "./useMyHook";

describe("useMyHook", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useMyHook());

    expect(result.current.value).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it("should update state when action is called", () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.setValue("new value");
    });

    expect(result.current.value).toBe("new value");
  });
});
```

### 3. Para Services

```typescript
// modules/logic/my-module/src/services/my.service.test.ts
import { MyService } from "./my.service";

// Mock dependencies
jest.mock("../repository/my.repository");

describe("MyService", () => {
  let service: MyService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MyService();
  });

  it("should create item successfully", async () => {
    const newItem = { name: "Test" };
    const result = await service.create(newItem);

    expect(result).toBeDefined();
    expect(result.name).toBe("Test");
  });
});
```

### 4. Para Stores

```typescript
// modules/ui/my-module/src/stores/my.store.test.ts
import { renderHook, act } from "@testing-library/react";
import { useMyStore } from "./my.store";

describe("useMyStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useMyStore());
    act(() => {
      result.current.reset();
    });
  });

  it("should have correct initial state", () => {
    const { result } = renderHook(() => useMyStore());

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
```

## Estrutura Recomendada de Testes

```
modules/
├── ui/
│   └── my-module/
│       └── src/
│           ├── components/
│           │   ├── MyComponent.tsx
│           │   └── MyComponent.test.tsx
│           ├── hooks/
│           │   ├── useMyHook.ts
│           │   └── useMyHook.test.ts
│           └── stores/
│               ├── my.store.ts
│               └── my.store.test.ts
├── logic/
│   └── my-module/
│       └── src/
│           ├── services/
│           │   ├── my.service.ts
│           │   └── my.service.test.ts
│           └── validations/
│               ├── my.validation.ts
│               └── my.validation.test.ts
└── data/
    └── my-module/
        └── src/
            ├── repositories/
            │   ├── my.repository.ts
            │   └── my.repository.test.ts
            └── adapters/
                ├── my.adapter.ts
                └── my.adapter.test.ts
```

## Comandos de Teste

### Rodar todos os testes de módulos

```bash
npm run test:modules
```

### Modo watch (desenvolvimento)

```bash
npm run test:modules:watch
```

### Com coverage report

```bash
npm run test:modules:coverage
```

## Configuração

A configuração de testes para módulos está em:

- **Jest Config**: `jest.config.modules.js` (raiz do projeto)
- **Setup**: `jest.setup.js` (raiz do projeto)
- **Mocks**: `__mocks__/` (raiz do projeto)

## Coverage Thresholds

O projeto exige cobertura mínima de:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
it("should do something", () => {
  // Arrange - setup
  const input = "test";

  // Act - execute
  const result = myFunction(input);

  // Assert - verify
  expect(result).toBe("expected");
});
```

### 2. Test Behavior, Not Implementation

```typescript
// ✅ BOM - testa comportamento
it('should show error message when form is invalid', () => {
  render(<Form />)
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByText(/required/i)).toBeInTheDocument()
})

// ❌ RUIM - testa implementação
it('should call setState with error', () => {
  const { result } = renderHook(() => useForm())
  act(() => result.current.submit())
  expect(mockSetState).toHaveBeenCalledWith({ error: '...' })
})
```

### 3. Descriptive Test Names

```typescript
// ✅ BOM - nome descritivo
it("should display validation error when email is invalid", () => {});

// ❌ RUIM - nome vago
it("should work correctly", () => {});
```

### 4. One Assertion Per Test (quando possível)

```typescript
// ✅ BOM - foco em um comportamento
it("should set loading state to true when fetching", () => {
  expect(result.current.isLoading).toBe(true);
});

it("should set loading state to false after fetching", async () => {
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});

// ❌ RUIM - múltiplas preocupações
it("should handle the entire flow", () => {
  expect(result.current.isLoading).toBe(true);
  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeNull();
  // ... mais 10 assertions
});
```

### 5. Use Testing Library Queries Corretamente

**Ordem de prioridade:**

1. `getByRole` - mais acessível
2. `getByLabelText` - para forms
3. `getByPlaceholderText` - alternativa para inputs
4. `getByText` - para conteúdo
5. `getByTestId` - último recurso

```typescript
// ✅ BOM - acessível
screen.getByRole("button", { name: /submit/i });

// ❌ RUIM - frágil
screen.getByTestId("submit-button");
```

## Recursos Adicionais

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
