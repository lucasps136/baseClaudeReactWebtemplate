import type {
  IAuthProvider,
  AuthProviderType,
  IAuthProviderConfig,
} from "@/shared/types/auth";

// Factory para criação de providers (Factory Pattern + Strategy Pattern)
export class AuthProviderFactory {
  private static providers: Map<
    AuthProviderType,
    () => Promise<IAuthProvider>
  > = new Map();

  // Registrar provider (Open/Closed Principle)
  static registerProvider(
    type: AuthProviderType,
    factory: () => Promise<IAuthProvider>,
  ): void {
    this.providers.set(type, factory);
  }

  // Criar provider baseado no tipo (Strategy Pattern)
  static async createProvider(
    config: IAuthProviderConfig,
  ): Promise<IAuthProvider> {
    const factory = this.providers.get(config.type);

    if (!factory) {
      throw new Error(`Auth provider '${config.type}' not registered`);
    }

    const provider = await factory();
    await provider.initialize();

    return provider;
  }

  // Listar providers disponíveis
  static getAvailableProviders(): AuthProviderType[] {
    return Array.from(this.providers.keys());
  }

  // Verificar se provider está disponível
  static isProviderAvailable(type: AuthProviderType): boolean {
    return this.providers.has(type);
  }
}

// Auto-registro de providers disponíveis
export const registerDefaultProviders = async (): Promise<void> => {
  // Supabase Provider (padrão)
  AuthProviderFactory.registerProvider("supabase", async () => {
    const { SupabaseAuthProvider } = await import(
      "./providers/supabase-auth-provider"
    );
    return new SupabaseAuthProvider();
  });

  // Clerk Provider (futuro)
  AuthProviderFactory.registerProvider("clerk", async () => {
    const { ClerkAuthProvider } = await import(
      "./providers/clerk-auth-provider"
    );
    return new ClerkAuthProvider();
  });

  // NOTE: Provider not yet implemented - uncomment when ready
  // Auth0 Provider (futuro)
  // AuthProviderFactory.registerProvider("auth0", async () => {
  //   const { Auth0AuthProvider } = await import(
  //     "./providers/auth0-auth-provider"
  //   );
  //   return new Auth0AuthProvider();
  // });

  // NOTE: Provider not yet implemented - uncomment when ready
  // NextAuth Provider (futuro)
  // AuthProviderFactory.registerProvider("nextauth", async () => {
  //   const { NextAuthProvider } = await import(
  //     "./providers/nextauth-auth-provider"
  //   );
  //   return new NextAuthProvider();
  // });
};
