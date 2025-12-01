# PaymentsLogic Logic Module

> Business logic for payments-logic following SOLID principles

## Usage

```typescript
import {
  PaymentsLogicService,
  IPaymentsLogicRepository,
  PaymentsLogicValidation,
} from "@/modules/logic/payments-logic";

// Create service with dependencies
const repository = new MyPaymentsLogicRepository();
const validation = new PaymentsLogicValidation();
const service = new PaymentsLogicService(repository, validation);

// Use service
const item = await service.getById("123");
```

## Exports

- **Service**: PaymentsLogicService
- **Repository Interface**: IPaymentsLogicRepository
- **Validation**: PaymentsLogicValidation, IPaymentsLogicValidation
- **Types**: PaymentsLogicItem, CreatePaymentsLogicInput, UpdatePaymentsLogicInput
