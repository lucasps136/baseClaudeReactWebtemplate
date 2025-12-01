// ProductsUi types
export interface ProductsUiItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductsUiInput {
  name: string;
}

export interface UpdateProductsUiInput {
  name?: string;
}
