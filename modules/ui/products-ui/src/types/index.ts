// Product domain types - UI specific
export interface Product {
  id: string;
  active: boolean;
  name: string;
  description?: string;
  image?: string;
  price?: number;
  currency?: string;
  ownerId?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  image?: string;
  price?: number;
  currency?: string;
  active?: boolean;
  metadata?: Record<string, string>;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  currency?: string;
  active?: boolean;
  metadata?: Record<string, string>;
}

export interface ProductListFilter {
  search?: string;
  active?: boolean;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface PaginationState {
  hasMore: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}
