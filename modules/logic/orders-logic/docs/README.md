# OrdersLogic Logic Module

> Business logic for orders-logic following SOLID principles

## Usage

```typescript
import {
  OrdersLogicService,
  IOrdersLogicRepository,
  OrdersLogicValidation,
} from "@/modules/logic/orders-logic";

// Create service with dependencies
const repository = new MyOrdersLogicRepository();
const validation = new OrdersLogicValidation();
const service = new OrdersLogicService(repository, validation);

// Use service
const item = await service.getById("123");
```

## Exports

- **Service**: OrdersLogicService
- **Repository Interface**: IOrdersLogicRepository
- **Validation**: OrdersLogicValidation, IOrdersLogicValidation
- **Types**: OrdersLogicItem, CreateOrdersLogicInput, UpdateOrdersLogicInput
