# Database Service - Interface Segregation

Este módulo implementa o princípio SOLID de Interface Segregation (ISP), permitindo que services dependam apenas das capacidades que realmente precisam.

## Interfaces Disponíveis

### IDatabaseService

Lifecycle management (initialize, cleanup)

**Métodos:**

- `initialize(): Promise<void>` - Inicializa a conexão com o banco
- `cleanup(): Promise<void>` - Limpa recursos e fecha conexão

### IDatabaseCRUD

Operações básicas: Create, Read, Update, Delete, Upsert

**Métodos:**

- `insert<T>()` - Cria novos registros
- `select<T>()` - Busca múltiplos registros
- `selectOne<T>()` - Busca um registro por ID
- `selectBy<T>()` - Busca registros por campo específico
- `update<T>()` - Atualiza um registro por ID
- `updateBy<T>()` - Atualiza registros por campo específico
- `delete<T>()` - Remove um registro por ID
- `deleteBy<T>()` - Remove registros por campo específico
- `upsert<T>()` - Insere ou atualiza registros

### IDatabaseAdvancedQuery

Queries SQL customizadas e transações

**Métodos:**

- `query<T>()` - Executa query SQL customizada
- `transaction<T>()` - Executa operações em transação ACID

### IDatabaseStorage

Upload, download e delete de arquivos

**Métodos:**

- `uploadFile()` - Faz upload de arquivo para bucket
- `downloadFile()` - Faz download de arquivo do bucket
- `deleteFile()` - Remove arquivo do bucket

### IDatabaseRealtime

Subscriptions para mudanças em tempo real

**Métodos:**

- `subscribe<T>()` - Se inscreve em mudanças de uma tabela
- `unsubscribe()` - Remove inscrição

### IDatabaseHealth

Status de conexão e health checks

**Métodos:**

- `isConnected()` - Verifica se está conectado
- `getHealth()` - Retorna status de saúde detalhado

### IDatabaseUtilities

Operações auxiliares: count, exists

**Métodos:**

- `count()` - Conta registros em uma tabela
- `exists()` - Verifica se registro existe

### IDatabaseProvider

Interface completa (composição de todas acima)

Estende todas as interfaces anteriores, fornecendo acesso completo a todas as capacidades do banco de dados.

## Exemplos de Uso

### Service que precisa apenas de CRUD

```typescript
import type { IDatabaseCRUD } from "@/shared/services/database";

class UserService {
  constructor(private db: IDatabaseCRUD) {}

  async getUsers() {
    return this.db.select("users");
  }

  async createUser(userData: any) {
    return this.db.insert("users", userData);
  }
}
```

### Service que precisa de Realtime

```typescript
import type { IDatabaseRealtime } from "@/shared/services/database";

class NotificationService {
  constructor(private db: IDatabaseRealtime) {}

  async watchNotifications(callback) {
    return this.db.subscribe("notifications", callback);
  }
}
```

### Service que precisa de Storage

```typescript
import type { IDatabaseStorage } from "@/shared/services/database";

class FileService {
  constructor(private db: IDatabaseStorage) {}

  async uploadAvatar(file: File) {
    return this.db.uploadFile("avatars", `user-${Date.now()}.png`, file);
  }
}
```

### Service que precisa de CRUD + Realtime

```typescript
import type {
  IDatabaseCRUD,
  IDatabaseRealtime,
} from "@/shared/services/database";

// Composição de interfaces específicas
interface IUserDatabase extends IDatabaseCRUD, IDatabaseRealtime {}

class UserService {
  constructor(private db: IUserDatabase) {}

  async getUsers() {
    return this.db.select("users");
  }

  async watchUsers(callback) {
    return this.db.subscribe("users", callback);
  }
}
```

### Service que precisa de tudo

```typescript
import type { IDatabaseProvider } from "@/shared/services/database";

class CompleteService {
  constructor(private db: IDatabaseProvider) {}

  // Acesso a todas as capacidades
  async complexOperation() {
    // CRUD
    await this.db.insert("users", data);

    // Storage
    await this.db.uploadFile("bucket", "path", file);

    // Realtime
    await this.db.subscribe("users", callback);

    // Transaction
    await this.db.transaction(async (ctx) => {
      // ...
    });
  }
}
```

## Benefícios

1. **Testabilidade**: Mock apenas o necessário
   - Se seu service usa apenas CRUD, mock apenas `IDatabaseCRUD`
   - Não precisa implementar métodos de Realtime, Storage, etc.

2. **Clareza**: Dependências explícitas
   - Ao ver a assinatura do construtor, fica claro quais capacidades o service precisa
   - `constructor(private db: IDatabaseCRUD)` é mais claro que `constructor(private db: IDatabaseProvider)`

3. **Flexibilidade**: Implementações parciais
   - Permite criar providers que implementam apenas parte das funcionalidades
   - Exemplo: Um provider read-only pode implementar apenas `IDatabaseCRUD` (sem write)

4. **Manutenibilidade**: Mudanças isoladas
   - Mudanças em uma interface não afetam services que não a usam
   - Reduz acoplamento e facilita evolução

5. **SOLID**: Interface Segregation Principle
   - "Clientes não devem ser forçados a depender de interfaces que não usam"
   - Cada interface tem uma responsabilidade clara e coesa

## Arquitetura

```
IDatabaseProvider (completo)
├── IDatabaseService (lifecycle)
├── IDatabaseCRUD (create, read, update, delete)
├── IDatabaseAdvancedQuery (query, transaction)
├── IDatabaseStorage (uploadFile, downloadFile, deleteFile)
├── IDatabaseRealtime (subscribe, unsubscribe)
├── IDatabaseHealth (isConnected, getHealth)
└── IDatabaseUtilities (count, exists)
```

## Migração de Código Existente

Código existente que usa `IDatabaseProvider` continua funcionando sem modificações:

```typescript
// Antes (ainda funciona)
class MyService {
  constructor(private db: IDatabaseProvider) {}
}

// Depois (mais explícito, recomendado)
class MyService {
  constructor(private db: IDatabaseCRUD) {}
}
```

## Backward Compatibility

- **ZERO breaking changes**
- `IDatabaseProvider` continua existindo e funcionando exatamente como antes
- Services existentes não precisam ser modificados
- A migração para interfaces segregadas é **opcional** e **incremental**
