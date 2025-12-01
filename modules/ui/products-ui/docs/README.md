# ProductsUi UI Module

> UI components, hooks and stores for products-ui

## Usage

```typescript
import { ProductsUiList, useProductsUi } from '@/modules/ui/products-ui'

// Use component
<ProductsUiList />

// Or use hook
const { items, fetchItems, createItem } = useProductsUi()
```

## Exports

- **Components**: ProductsUiList
- **Hooks**: useProductsUi
- **Store**: useProductsUiStore
- **Types**: ProductsUiItem, CreateProductsUiInput, UpdateProductsUiInput

## Development

```bash
npm test -- modules/ui/products-ui
```
