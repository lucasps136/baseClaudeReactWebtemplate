# OrdersUi UI Module

> UI components, hooks and stores for orders-ui

## Usage

```typescript
import { OrdersUiList, useOrdersUi } from '@/modules/ui/orders-ui'

// Use component
<OrdersUiList />

// Or use hook
const { items, fetchItems, createItem } = useOrdersUi()
```

## Exports

- **Components**: OrdersUiList
- **Hooks**: useOrdersUi
- **Store**: useOrdersUiStore
- **Types**: OrdersUiItem, CreateOrdersUiInput, UpdateOrdersUiInput

## Development

```bash
npm test -- modules/ui/orders-ui
```
