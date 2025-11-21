# Exemplo Prático - Interface Segregation

Este arquivo demonstra o uso prático das interfaces segregadas do Database Service.

## Cenário Real: Sistema de Usuários

### Antes (Interface Única - Violação ISP)

```typescript
import type { IDatabaseProvider } from "@/shared/services/database";

// UserService precisa apenas de CRUD
class UserService {
  constructor(private db: IDatabaseProvider) {}
  // ^ Dependência excessiva - tem acesso a Realtime, Storage, etc.

  async getUsers() {
    return this.db.select("users");
  }

  async createUser(data: any) {
    return this.db.insert("users", data);
  }
}

// Problema no teste - precisa mockar TUDO
const mockDb: IDatabaseProvider = {
  // CRUD
  select: jest.fn(),
  insert: jest.fn(),
  selectOne: jest.fn(),
  selectBy: jest.fn(),
  update: jest.fn(),
  updateBy: jest.fn(),
  delete: jest.fn(),
  deleteBy: jest.fn(),
  upsert: jest.fn(),
  // Realtime (não usado!)
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  // Storage (não usado!)
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  deleteFile: jest.fn(),
  // Advanced Query (não usado!)
  query: jest.fn(),
  transaction: jest.fn(),
  // Health (não usado!)
  isConnected: jest.fn(),
  getHealth: jest.fn(),
  // Utilities (não usado!)
  count: jest.fn(),
  exists: jest.fn(),
  // Service (não usado!)
  initialize: jest.fn(),
  cleanup: jest.fn(),
};
```

### Depois (Interfaces Segregadas - ISP)

```typescript
import type { IDatabaseCRUD } from "@/shared/services/database";

// UserService depende APENAS de CRUD
class UserService {
  constructor(private db: IDatabaseCRUD) {}
  // ^ Dependência mínima - clara e explícita

  async getUsers() {
    return this.db.select("users");
  }

  async createUser(data: any) {
    return this.db.insert("users", data);
  }
}

// Teste - mocka apenas o necessário
const mockDb: IDatabaseCRUD = {
  select: jest.fn(),
  insert: jest.fn(),
  selectOne: jest.fn(),
  selectBy: jest.fn(),
  update: jest.fn(),
  updateBy: jest.fn(),
  delete: jest.fn(),
  deleteBy: jest.fn(),
  upsert: jest.fn(),
  // Fim! Apenas 9 métodos ao invés de 22+
};
```

## Múltiplos Services com Necessidades Diferentes

```typescript
import type {
  IDatabaseCRUD,
  IDatabaseRealtime,
  IDatabaseStorage,
  IDatabaseAdvancedQuery,
} from "@/shared/services/database";

// 1. Service básico - apenas CRUD
class ProductService {
  constructor(private db: IDatabaseCRUD) {}

  async getProducts() {
    return this.db.select("products");
  }
}

// 2. Service de notificações - CRUD + Realtime
class NotificationService {
  constructor(
    private dbCrud: IDatabaseCRUD,
    private dbRealtime: IDatabaseRealtime,
  ) {}

  async getNotifications(userId: string) {
    return this.dbCrud.selectBy("notifications", "user_id", userId);
  }

  async watchNotifications(userId: string, callback: Function) {
    // Subscribe em tempo real
    return this.dbRealtime.subscribe("notifications", (event) => {
      if (event.new?.user_id === userId) {
        callback(event.new);
      }
    });
  }
}

// 3. Service de arquivos - apenas Storage
class FileService {
  constructor(private storage: IDatabaseStorage) {}

  async uploadAvatar(userId: string, file: File) {
    const path = `avatars/${userId}-${Date.now()}.png`;
    return this.storage.uploadFile("avatars", path, file);
  }

  async deleteAvatar(path: string) {
    return this.storage.deleteFile("avatars", path);
  }
}

// 4. Service complexo - transações
class OrderService {
  constructor(
    private dbCrud: IDatabaseCRUD,
    private dbAdvanced: IDatabaseAdvancedQuery,
  ) {}

  async createOrder(orderData: any) {
    // Usa transação para operações atômicas
    return this.dbAdvanced.transaction(async (ctx) => {
      // Cria pedido
      const order = await this.dbCrud.insert("orders", orderData);

      // Atualiza estoque
      for (const item of orderData.items) {
        await this.dbCrud.update("products", item.productId, {
          stock: item.stock - item.quantity,
        });
      }

      return order;
    });
  }
}
```

## Composição de Interfaces

```typescript
import type {
  IDatabaseCRUD,
  IDatabaseRealtime,
} from "@/shared/services/database";

// Cria interface customizada combinando apenas o necessário
interface IChatDatabase extends IDatabaseCRUD, IDatabaseRealtime {}

class ChatService {
  constructor(private db: IChatDatabase) {}

  async getMessages(roomId: string) {
    return this.db.selectBy("messages", "room_id", roomId);
  }

  async sendMessage(message: any) {
    return this.db.insert("messages", message);
  }

  async watchMessages(roomId: string, callback: Function) {
    return this.db.subscribe("messages", (event) => {
      if (event.new?.room_id === roomId) {
        callback(event.new);
      }
    });
  }
}
```

## Vantagens Demonstradas

### 1. Testes Mais Simples

```typescript
// Antes: 22+ métodos para mockar
// Depois: Apenas os métodos necessários

describe("UserService", () => {
  it("should get users", async () => {
    const mockDb: IDatabaseCRUD = {
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      // ... apenas métodos CRUD
    };

    const service = new UserService(mockDb);
    await service.getUsers();

    expect(mockDb.select).toHaveBeenCalledWith("users");
  });
});
```

### 2. Dependências Claras

```typescript
// Ao olhar o construtor, você sabe EXATAMENTE o que o service precisa

class UserService {
  constructor(private db: IDatabaseCRUD) {}
  // ^ Precisa apenas de CRUD
}

class NotificationService {
  constructor(private db: IDatabaseRealtime) {}
  // ^ Precisa apenas de Realtime
}

class FileService {
  constructor(private storage: IDatabaseStorage) {}
  // ^ Precisa apenas de Storage
}
```

### 3. Facilita Implementações Parciais

```typescript
// Provider read-only (apenas leitura)
class ReadOnlyDatabaseProvider
  implements Pick<IDatabaseCRUD, "select" | "selectOne" | "selectBy">
{
  async select<T>(table: string) {
    // implementação read-only
  }

  async selectOne<T>(table: string, id: string) {
    // implementação read-only
  }

  async selectBy<T>(table: string, field: string, value: any) {
    // implementação read-only
  }
}

// Uso
class ReportService {
  constructor(private db: Pick<IDatabaseCRUD, "select" | "selectOne">) {}
  // ^ Aceita provider read-only
}
```

## Conclusão

A segregação de interfaces permite:

- **Testes mais simples**: Mock apenas o necessário
- **Código mais claro**: Dependências explícitas
- **Maior flexibilidade**: Implementações parciais
- **Melhor manutenibilidade**: Mudanças isoladas
- **SOLID**: Interface Segregation Principle aplicado

**Backward Compatibility**: Código antigo usando `IDatabaseProvider` continua funcionando!
