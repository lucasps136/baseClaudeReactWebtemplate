/**
 * EXEMPLO DE USO - Interface Segregation em Prática
 *
 * Este arquivo demonstra como usar as interfaces segregadas
 * ao invés da interface monolítica IDatabaseProvider.
 *
 * NÃO É CÓDIGO DE PRODUÇÃO - APENAS EXEMPLO EDUCACIONAL
 */

import type { IDatabaseProvider } from "@/shared/services/database";
// import type { IDatabaseResponse } from "@/shared/types/database"; // Example file - type not used

/**
 * ANTES (Interface Monolítica - Violação ISP)
 *
 * import type { IDatabaseProvider } from "@/shared/services/database";
 *
 * class UserService {
 *   constructor(private db: IDatabaseProvider) {}
 *   // ^ Dependência excessiva - tem acesso a métodos não utilizados
 * }
 */

/**
 * DEPOIS (Interface Segregada - ISP)
 *
 * Service depende APENAS de IDatabaseProvider
 * Não tem acesso a Realtime, Storage, Transactions, etc.
 */
export class UserService {
  constructor(private db: IDatabaseProvider) {}
  // ^ Dependência mínima - clara e explícita

  async getUsers(): Promise<ReturnType<IDatabaseProvider["select"]>> {
    return this.db.select("users", {
      orderBy: [{ column: "created_at", ascending: false }],
    });
  }

  async getUserById(
    id: string,
  ): Promise<ReturnType<IDatabaseProvider["selectOne"]>> {
    return this.db.selectOne("users", id);
  }

  async getUserByEmail(
    email: string,
  ): Promise<ReturnType<IDatabaseProvider["selectBy"]>> {
    return this.db.selectBy("users", "email", email);
  }

  async createUser(
    userData: Record<string, unknown>,
  ): Promise<ReturnType<IDatabaseProvider["insert"]>> {
    return this.db.insert("users", userData);
  }

  async updateUser(
    id: string,
    userData: Record<string, unknown>,
  ): Promise<ReturnType<IDatabaseProvider["update"]>> {
    return this.db.update("users", id, userData);
  }

  async deleteUser(
    id: string,
  ): Promise<ReturnType<IDatabaseProvider["delete"]>> {
    return this.db.delete("users", id);
  }
}

/**
 * BENEFÍCIOS DEMONSTRADOS:
 *
 * 1. TESTES MAIS SIMPLES
 *    - Mock apenas IDatabaseProvider (9 métodos)
 *    - Antes: mockava IDatabaseProvider (22+ métodos)
 *
 * 2. DEPENDÊNCIAS CLARAS
 *    - Ao ver o construtor, você sabe que precisa apenas de CRUD
 *    - Não há confusão sobre quais capacidades são usadas
 *
 * 3. FLEXIBILIDADE
 *    - Pode receber qualquer implementação de IDatabaseProvider
 *    - Não precisa de implementação completa de IDatabaseProvider
 *
 * 4. MANUTENIBILIDADE
 *    - Mudanças em Realtime/Storage não afetam este service
 *    - Acoplamento reduzido
 *
 * 5. SOLID - Interface Segregation Principle
 *    - "Clientes não devem depender de interfaces que não usam"
 *    - UserService não depende de métodos de Realtime, Storage, etc.
 */

/**
 * EXEMPLO DE TESTE (Jest)
 */
/*
import { UserService } from "./example-user-service";
import type { IDatabaseProvider } from "@/shared/services/database";

describe("UserService", () => {
  let mockDb: IDatabaseProvider;
  let service: UserService;

  beforeEach(() => {
    // Mock apenas IDatabaseProvider - muito mais simples!
    mockDb = {
      select: jest.fn(),
      selectOne: jest.fn(),
      selectBy: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      updateBy: jest.fn(),
      delete: jest.fn(),
      deleteBy: jest.fn(),
      upsert: jest.fn(),
    };

    service = new UserService(mockDb);
  });

  it("should get users", async () => {
    const mockUsers = [{ id: "1", email: "test@test.com" }];
    (mockDb.select as jest.Mock).mockResolvedValue({
      data: mockUsers,
      error: null,
    });

    const result = await service.getUsers();

    expect(mockDb.select).toHaveBeenCalledWith("users", {
      orderBy: [{ column: "created_at", ascending: false }],
    });
    expect(result.data).toEqual(mockUsers);
  });

  it("should get user by id", async () => {
    const mockUser = { id: "1", email: "test@test.com" };
    (mockDb.selectOne as jest.Mock).mockResolvedValue({
      data: mockUser,
      error: null,
    });

    const result = await service.getUserById("1");

    expect(mockDb.selectOne).toHaveBeenCalledWith("users", "1");
    expect(result.data).toEqual(mockUser);
  });

  it("should create user", async () => {
    const userData = { email: "new@test.com", name: "New IUser" };
    const mockCreated = { id: "2", ...userData };
    (mockDb.insert as jest.Mock).mockResolvedValue({
      data: [mockCreated],
      error: null,
    });

    const result = await service.createUser(userData);

    expect(mockDb.insert).toHaveBeenCalledWith("users", userData);
    expect(result.data).toEqual([mockCreated]);
  });
});
*/

/**
 * COMPARAÇÃO ANTES/DEPOIS
 *
 * ANTES (IDatabaseProvider):
 * - Mock com 22+ métodos
 * - Dependência pouco clara
 * - Testes complexos
 * - Violação do ISP
 *
 * DEPOIS (IDatabaseProvider):
 * - Mock com 9 métodos
 * - Dependência explícita
 * - Testes simples
 * - ISP respeitado
 *
 * RESULTADO: Código mais limpo, testável e manutenível!
 */
