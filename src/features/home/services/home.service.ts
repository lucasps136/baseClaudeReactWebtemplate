import type { IHomeAction, IHomeData, IHomeStat } from "../types/home.types";

// ISP — duas interfaces pequenas em vez de uma grande
export interface IHomeRepository {
  getStats(): Promise<IHomeStat[]>;
  getActions(): Promise<IHomeAction[]>;
}

export interface IHomeDataAssembler {
  assemble(stats: IHomeStat[], actions: IHomeAction[]): IHomeData;
}

// Implementação mock — satisfaz IHomeRepository; trocar por Supabase no futuro (OCP)
class MockHomeRepository implements IHomeRepository {
  async getStats(): Promise<IHomeStat[]> {
    return [
      {
        id: "active-listings",
        label: "Anúncios Ativos",
        value: 12,
        description: "Itens disponíveis para troca",
        trend: "up",
      },
      {
        id: "completed-trades",
        label: "Trocas Realizadas",
        value: 47,
        description: "Trocas concluídas com sucesso",
        trend: "up",
      },
      {
        id: "pending-offers",
        label: "Ofertas Pendentes",
        value: 3,
        description: "Aguardando sua resposta",
        trend: "neutral",
      },
      {
        id: "rating",
        label: "Avaliação Média",
        value: "4.8",
        description: "Pontuação de 5.0",
        trend: "up",
      },
    ];
  }

  async getActions(): Promise<IHomeAction[]> {
    return [
      {
        id: "new-listing",
        label: "Novo Anúncio",
        href: "/listings/new",
        variant: "default",
      },
      {
        id: "browse",
        label: "Ver Trocas",
        href: "/browse",
        variant: "outline",
      },
      {
        id: "profile",
        label: "Meu Perfil",
        href: "/profile",
        variant: "secondary",
      },
      {
        id: "settings",
        label: "Configurações",
        href: "/settings",
        variant: "ghost",
      },
    ];
  }
}

// SRP — assembler apenas compõe o objeto de dados
class HomeDataAssembler implements IHomeDataAssembler {
  assemble(stats: IHomeStat[], actions: IHomeAction[]): IHomeData {
    return { stats, actions };
  }
}

// DIP — HomeService depende de abstrações, não de concretos
export class HomeService {
  constructor(
    private readonly repository: IHomeRepository,
    private readonly assembler: IHomeDataAssembler,
  ) {}

  async getHomeData(): Promise<IHomeData> {
    const [stats, actions] = await Promise.all([
      this.repository.getStats(),
      this.repository.getActions(),
    ]);
    return this.assembler.assemble(stats, actions);
  }
}

// Factory — ponto único de troca para a implementação real (OCP)
export const createHomeService = (): HomeService =>
  new HomeService(new MockHomeRepository(), new HomeDataAssembler());
