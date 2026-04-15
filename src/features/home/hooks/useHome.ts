import { useCallback, useEffect } from "react";

import { useAuthState } from "@/shared/components/providers/auth-provider";

import { createHomeService } from "../services/home.service";
import { useHomeStore } from "../stores/home.store";
import type { IHomeData } from "../types/home.types";

export interface IUseHomeReturn {
  data: IHomeData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// SRP — conversão de erro isolada
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Falha ao carregar dados da home";

// SRP — chamada de serviço isolada do body do hook
const fetchHomeData = async (): Promise<IHomeData> => {
  const service = createHomeService();
  return service.getHomeData();
};

export const useHome = (): IUseHomeReturn => {
  const { data, isLoading, error, setData, setLoading, setError } =
    useHomeStore();

  // ISP: usa useAuthState() em vez de useAuth() — só precisa do state
  const { isAuthenticated } = useAuthState();

  const refresh = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const result = await fetchHomeData();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setData, setError, setLoading]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
};
