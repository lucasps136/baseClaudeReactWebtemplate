# Products UI Module

> UI components, hooks and stores for product management with pagination, filtering, and CRUD operations

## Overview

Complete UI module for product catalog management following SOLID principles and Single Responsibility Pattern. Includes grid layout for product listings, detail views, and comprehensive state management with Zustand.

## Features

- Product list display with responsive grid layout
- Product card component with images, prices, and status badges
- Detailed product view with full information
- Loading states with skeleton components
- Error handling with retry functionality
- Empty state displays
- Pagination support with "Load More" functionality
- Search and filtering capabilities
- Owner-specific actions (edit/delete)
- Proper TypeScript typing throughout
- Accessibility support (aria labels, keyboard navigation)

## Usage

### Basic Product List

```typescript
import { ProductList } from '@/modules/ui/products-ui'

function ProductCatalog() {
  const handleView = (product) => {
    console.log('View product:', product)
  }

  return (
    <ProductList
      onProductView={handleView}
      currentUserId="user-123"
    />
  )
}
```

### Product Card

```typescript
import { ProductCard } from '@/modules/ui/products-ui'

function MyProductCard({ product }) {
  return (
    <ProductCard
      product={product}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isOwner={true}
    />
  )
}
```

### Product Detail

```typescript
import { ProductDetail } from '@/modules/ui/products-ui'

function ProductPage({ productId }) {
  return (
    <ProductDetail
      productId={productId}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onClose={handleClose}
      isOwner={true}
    />
  )
}
```

### Using Hooks

```typescript
import { useProducts, useProduct } from '@/modules/ui/products-ui'

// Managing product list
function ProductManager() {
  const {
    products,
    isLoadingProducts,
    productsError,
    fetchProducts,
    searchProducts,
    createProduct,
    deleteProduct,
    loadMore,
    pagination
  } = useProducts()

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSearch = (query: string) => {
    searchProducts(query)
  }

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
      {pagination.hasMore && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  )
}

// Managing single product
function ProductEditor({ productId }) {
  const {
    selectedProduct,
    isLoadingProduct,
    fetchProduct,
    updateProduct,
    deleteProduct
  } = useProduct()

  useEffect(() => {
    fetchProduct(productId)
  }, [productId])

  const handleUpdate = async (data) => {
    await updateProduct(productId, data)
  }

  return (
    <div>
      {selectedProduct && (
        <div>
          <h1>{selectedProduct.name}</h1>
          <button onClick={() => handleUpdate({ name: 'New Name' })}>
            Update
          </button>
        </div>
      )}
    </div>
  )
}
```

### Direct Store Access

```typescript
import { useProductStore } from '@/modules/ui/products-ui'

function MyComponent() {
  const {
    products,
    selectedProduct,
    setProducts,
    setFilter,
    pagination
  } = useProductStore()

  return (
    <div>
      <p>Total products: {pagination.total}</p>
      {/* ... */}
    </div>
  )
}
```

## Exports

### Components

- **ProductList**: Grid display with pagination and filtering
- **ProductCard**: Individual product card with actions
- **ProductDetail**: Full product detail view

### Hooks

- **useProduct**: Single product operations (fetch, update, delete)
- **useProducts**: List operations (fetch, search, filter, CRUD, pagination)

### Store

- **useProductStore**: Zustand store for global product state

### Types

- **Product**: Complete product interface
- **CreateProductInput**: Input for creating products
- **UpdateProductInput**: Input for updating products
- **ProductListFilter**: Filter options for product lists
- **PaginationState**: Pagination state management
- **ProductListResponse**: API response type

## Architecture

### SOLID Principles

**Single Responsibility**:

- `useProduct`: Only handles single product operations
- `useProducts`: Only handles list operations
- Each component has a single, well-defined purpose

**Open/Closed**:

- Components accept callbacks for extensibility
- Store can be extended without modification

**Dependency Inversion**:

- Components depend on hooks, not direct store access
- Hooks abstract away state management details

### State Management

The module uses Zustand with separate state slices:

```typescript
// Single product state
selectedProduct: Product | null
isLoadingProduct: boolean
productError: string | null

// List state
products: Product[]
isLoadingProducts: boolean
productsError: string | null
filter: ProductListFilter
pagination: PaginationState
```

## Integration

This module is designed to work with a product-logic module (to be created) that will provide the actual service layer for API calls. Currently, hooks contain TODO comments where service integration should occur.

```typescript
// TODO: Replace with actual service call when product-logic module is integrated
// import { productService } from '@/modules/logic/product-logic'
// const result = await productService.getProducts({ ...filter, ...newFilter })
```

## Development

```bash
npm test -- modules/ui/products-ui
```

## Status

**Experimental** - Ready for testing and integration with product-logic module
