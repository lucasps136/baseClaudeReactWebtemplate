export interface IHomeStat {
  id: string;
  label: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

export interface IHomeAction {
  id: string;
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export interface IHomeData {
  stats: IHomeStat[];
  actions: IHomeAction[];
}

export interface IHomeState {
  data: IHomeData | null;
  isLoading: boolean;
  error: string | null;
}

export interface IHomeActions {
  setData: (data: IHomeData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
