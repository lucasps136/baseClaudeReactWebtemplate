# ProductsLogic Logic Module

> Business logic for products-logic following SOLID principles

## Usage

```typescript
import {
  ProductsLogicService,
  IProductsLogicRepository,
  ProductsLogicValidation,
} from "@/modules/logic/products-logic";

// Create service with dependencies
const repository = new MyProductsLogicRepository();
const validation = new ProductsLogicValidation();
const service = new ProductsLogicService(repository, validation);

// Use service
const item = await service.getById("123");
```

## Exports

- **Service**: ProductsLogicService
- **Repository Interface**: IProductsLogicRepository
- **Validation**: ProductsLogicValidation, IProductsLogicValidation
- **Types**: ProductsLogicItem, CreateProductsLogicInput, UpdateProductsLogicInput
