# PaymentsUi UI Module

> UI components, hooks and stores for payments-ui

## Usage

```typescript
import { PaymentsUiList, usePaymentsUi } from '@/modules/ui/payments-ui'

// Use component
<PaymentsUiList />

// Or use hook
const { items, fetchItems, createItem } = usePaymentsUi()
```

## Exports

- **Components**: PaymentsUiList
- **Hooks**: usePaymentsUi
- **Store**: usePaymentsUiStore
- **Types**: PaymentsUiItem, CreatePaymentsUiInput, UpdatePaymentsUiInput

## Development

```bash
npm test -- modules/ui/payments-ui
```
