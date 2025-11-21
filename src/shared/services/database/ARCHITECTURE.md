# Database Service - Arquitetura de Interface Segregation

## Visão Geral

Este módulo implementa o **Interface Segregation Principle (ISP)** do SOLID, segregando a interface monolítica `IDatabaseProvider` em 7 interfaces especializadas.

## Estrutura de Interfaces

```
┌─────────────────────────────────────────────────────────┐
│           IDatabaseProvider (Interface Completa)        │
│                                                         │
│  Composição de todas as interfaces especializadas      │
│  + Storage opcional (uploadFile?, downloadFile?, etc.)  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ extends (herda de)
                            ▼
    ┌──────────────────────────────────────────────────┐
    │                                                  │
    ├─────────────────┬─────────────────┬──────────────┤
    │                 │                 │              │
    ▼                 ▼                 ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ IDatabase│   │ IDatabase│   │ IDatabase│   │ IDatabase│
│  Service │   │   CRUD   │   │ Advanced │   │  Health  │
└──────────┘   └──────────┘   │  Query   │   └──────────┘
                              └──────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
         ┌──────────┐      ┌──────────┐      ┌──────────┐
         │ IDatabase│      │ IDatabase│      │ IDatabase│
         │ Realtime │      │ Storage  │      │ Utilities│
         └──────────┘      └──────────┘      └──────────┘
```

## Interfaces Segregadas

### 1. IDatabaseService (Lifecycle)

**Responsabilidade**: Gerenciamento de ciclo de vida da conexão

**Métodos**:

- `initialize(): Promise<void>`
- `cleanup(): Promise<void>`

**Exemplo de Uso**:

```typescript
class DatabaseConnectionManager {
  constructor(private service: IDatabaseService) {}

  async connect() {
    await this.service.initialize();
  }

  async disconnect() {
    await this.service.cleanup();
  }
}
```

---

### 2. IDatabaseCRUD (Operações Básicas)

**Responsabilidade**: Create, Read, Update, Delete, Upsert

**Métodos**:

- Create: `insert<T>()`
- Read: `select<T>()`, `selectOne<T>()`, `selectBy<T>()`
- Update: `update<T>()`, `updateBy<T>()`
- Delete: `delete<T>()`, `deleteBy<T>()`
- Upsert: `upsert<T>()`

**Exemplo de Uso**:

```typescript
class UserService {
  constructor(private db: IDatabaseCRUD) {}

  async getUsers() {
    return this.db.select("users");
  }

  async createUser(data: any) {
    return this.db.insert("users", data);
  }
}
```

**Vantagens**:

- Services simples dependem apenas de CRUD
- Testes mais fáceis (mock apenas 9 métodos)
- Dependência explícita e clara

---

### 3. IDatabaseAdvancedQuery (Queries Avançadas)

**Responsabilidade**: SQL customizado e transações

**Métodos**:

- `query<T>(sql, params?): Promise<DatabaseResponse<T[]>>`
- `transaction<T>(callback): Promise<DatabaseResponse<T>>`

**Exemplo de Uso**:

```typescript
class ReportService {
  constructor(private db: IDatabaseAdvancedQuery) {}

  async getComplexReport() {
    return this.db.query(`
      SELECT u.*, COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
    `);
  }
}

class OrderService {
  constructor(
    private crud: IDatabaseCRUD,
    private advanced: IDatabaseAdvancedQuery,
  ) {}

  async createOrderWithStock(orderData: any) {
    return this.advanced.transaction(async (ctx) => {
      const order = await this.crud.insert("orders", orderData);
      await this.crud.update("products", orderData.productId, {
        stock: orderData.stock - orderData.quantity,
      });
      return order;
    });
  }
}
```

---

### 4. IDatabaseStorage (Arquivos)

**Responsabilidade**: Upload, download e delete de arquivos

**Métodos**:

- `uploadFile(bucket, path, file)`
- `downloadFile(bucket, path)`
- `deleteFile(bucket, path)`

**Exemplo de Uso**:

```typescript
class FileService {
  constructor(private storage: IDatabaseStorage) {}

  async uploadAvatar(userId: string, file: File) {
    const path = `avatars/${userId}.png`;
    return this.storage.uploadFile("avatars", path, file);
  }

  async deleteAvatar(userId: string) {
    const path = `avatars/${userId}.png`;
    return this.storage.deleteFile("avatars", path);
  }
}
```

**Nota**: Storage é opcional em `IDatabaseProvider` (métodos com `?`)

---

### 5. IDatabaseRealtime (Subscriptions)

**Responsabilidade**: Pub/Sub para mudanças em tempo real

**Métodos**:

- `subscribe<T>(table, callback, options?)`
- `unsubscribe(subscriptionId)`

**Exemplo de Uso**:

```typescript
class NotificationService {
  constructor(private realtime: IDatabaseRealtime) {}

  async watchNotifications(userId: string, callback: Function) {
    return this.realtime.subscribe(
      "notifications",
      (event) => {
        if (event.new?.user_id === userId) {
          callback(event.new);
        }
      },
      { event: "INSERT" },
    );
  }
}
```

---

### 6. IDatabaseHealth (Monitoramento)

**Responsabilidade**: Status de conexão e saúde do banco

**Métodos**:

- `isConnected(): Promise<boolean>`
- `getHealth(): Promise<{ status, details? }>`

**Exemplo de Uso**:

```typescript
class HealthCheckService {
  constructor(private health: IDatabaseHealth) {}

  async checkDatabaseStatus() {
    const connected = await this.health.isConnected();
    const health = await this.health.getHealth();

    return {
      database_connected: connected,
      database_health: health.status,
      details: health.details,
    };
  }
}
```

---

### 7. IDatabaseUtilities (Helpers)

**Responsabilidade**: Operações auxiliares comuns

**Métodos**:

- `count(table, options?): Promise<DatabaseResponse<number>>`
- `exists(table, id): Promise<DatabaseResponse<boolean>>`

**Exemplo de Uso**:

```typescript
class ValidationService {
  constructor(private utils: IDatabaseUtilities) {}

  async validateUniqueEmail(email: string) {
    const count = await this.utils.count("users", {
      where: { email },
    });
    return count.data === 0;
  }

  async validateUserExists(userId: string) {
    return this.utils.exists("users", userId);
  }
}
```

---

## IDatabaseProvider (Interface Completa)

**Composição**: Herda de todas as interfaces anteriores + Storage opcional

```typescript
export interface IDatabaseProvider
  extends IDatabaseService,
    IDatabaseCRUD,
    IDatabaseAdvancedQuery,
    IDatabaseHealth,
    IDatabaseUtilities,
    IDatabaseRealtime {
  // Storage opcional (nem todos providers suportam)
  uploadFile?(...): Promise<...>;
  downloadFile?(...): Promise<...>;
  deleteFile?(...): Promise<...>;
}
```

**Quando Usar**:

- Quando você precisa de **todas** as capacidades
- Em providers que implementam a interface completa (ex: SupabaseDatabaseProvider)
- Em facades que expõem toda a funcionalidade

**Exemplo**:

```typescript
class DatabaseFacade {
  constructor(private db: IDatabaseProvider) {}

  // Pode usar qualquer método de qualquer interface
  async complexOperation() {
    await this.db.initialize(); // Service
    const users = await this.db.select("users"); // CRUD
    await this.db.subscribe("users", callback); // Realtime
    const health = await this.db.getHealth(); // Health
    // etc...
  }
}
```

---

## Princípios SOLID Aplicados

### ✅ Interface Segregation Principle (ISP)

> "Clientes não devem ser forçados a depender de interfaces que não usam"

**Antes (Violação)**:

```typescript
class UserService {
  constructor(private db: IDatabaseProvider) {}
  // ^ Tem acesso a 22+ métodos, usa apenas 3
}
```

**Depois (ISP)**:

```typescript
class UserService {
  constructor(private db: IDatabaseCRUD) {}
  // ^ Tem acesso apenas aos 9 métodos que realmente precisa
}
```

### ✅ Single Responsibility Principle (SRP)

Cada interface tem **uma única responsabilidade**:

- `IDatabaseCRUD`: Apenas operações CRUD
- `IDatabaseRealtime`: Apenas subscriptions
- `IDatabaseStorage`: Apenas arquivos
- etc.

### ✅ Dependency Inversion Principle (DIP)

Services dependem de **abstrações** (interfaces), não de implementações concretas:

```typescript
// Bom: Depende de abstração
class UserService {
  constructor(private db: IDatabaseCRUD) {}
}

// Ruim: Depende de implementação
class UserService {
  constructor(private db: SupabaseDatabaseProvider) {}
}
```

---

## Benefícios da Segregação

### 1. Testes Mais Simples

**Antes**: Mock 22+ métodos
**Depois**: Mock apenas os necessários (ex: 9 métodos para CRUD)

### 2. Dependências Claras

Ao ver `constructor(private db: IDatabaseCRUD)`, você sabe **exatamente** o que o service precisa.

### 3. Flexibilidade

Permite implementações parciais (ex: provider read-only que implementa apenas `select*`)

### 4. Manutenibilidade

Mudanças em uma interface não afetam services que não a usam.

### 5. Documentação Viva

A assinatura do construtor documenta as capacidades necessárias.

---

## Backward Compatibility

**ZERO breaking changes**:

- `IDatabaseProvider` ainda existe e funciona como antes
- Services antigos continuam funcionando sem modificações
- A migração é **opcional** e **incremental**

```typescript
// Código antigo (ainda funciona)
class OldService {
  constructor(private db: IDatabaseProvider) {}
}

// Código novo (recomendado)
class NewService {
  constructor(private db: IDatabaseCRUD) {}
}
```

---

## Arquivos do Módulo

```
src/shared/services/database/
├── database-factory.ts          # Factory para criar providers
├── index.ts                     # Exports públicos (incluindo interfaces segregadas)
├── providers/
│   └── supabase-database-provider.ts  # Implementação Supabase
├── README.md                    # Documentação principal
├── ARCHITECTURE.md              # Este arquivo (arquitetura detalhada)
├── EXAMPLE-USAGE.md             # Exemplos práticos de uso
└── example-user-service.ts      # Exemplo de service usando ISP
```

---

## Próximos Passos (Opcional)

1. **Migrar services existentes** para usar interfaces segregadas
2. **Criar testes** demonstrando a facilidade de mock
3. **Documentar padrões** de uso para o time
4. **Metrics**: Medir redução de acoplamento

---

## Conclusão

A segregação de interfaces transforma `IDatabaseProvider` de uma interface monolítica em um conjunto de interfaces coesas e especializadas, respeitando o Interface Segregation Principle do SOLID.

**Resultado**: Código mais testável, claro, flexível e manutenível! 🎉
