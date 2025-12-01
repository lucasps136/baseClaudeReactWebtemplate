// ProductsLogic domain types
export interface ProductsLogicItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductsLogicInput {
  name: string;
}

export interface UpdateProductsLogicInput {
  name?: string;
}
