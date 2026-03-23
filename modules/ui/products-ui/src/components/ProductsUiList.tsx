import { useEffect, useState } from "react";
import { useProducts } from "../hooks/useProductsUi";
import { ProductCard } from "./ProductCard";
import type { Product } from "../types";

interface ProductListProps {
  onProductView?: (product: Product) => void;
  onProductEdit?: (product: Product) => void;
  currentUserId?: string;
  className?: string;
}

// Loading skeleton component
const ProductCardSkeleton = () => (
  <div className="overflow-hidden rounded-lg border bg-card">
    <div className="aspect-square w-full animate-pulse bg-muted" />
    <div className="space-y-3 p-4">
      <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
    </div>
  </div>
);

// Error display component
const ErrorDisplay = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-4 h-12 w-12 text-destructive"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <h3 className="mb-2 text-lg font-semibold text-destructive">Error</h3>
    <p className="mb-4 text-sm text-muted-foreground">{error}</p>
    <button
      onClick={onRetry}
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Try Again
    </button>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="rounded-lg border-2 border-dashed p-12 text-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-4 h-16 w-16 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
    <h3 className="mb-2 text-lg font-semibold">No products found</h3>
    <p className="text-sm text-muted-foreground">
      There are no products to display at the moment.
    </p>
  </div>
);

export const ProductList = ({
  onProductView,
  onProductEdit,
  currentUserId,
  className = "",
}: ProductListProps) => {
  const {
    products,
    isLoadingProducts,
    productsError,
    fetchProducts,
    deleteProduct,
    pagination,
    loadMore,
  } = useProducts();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      setDeletingId(product.id);
      await deleteProduct(product.id);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRetry = () => {
    fetchProducts();
  };

  // Loading state
  if (isLoadingProducts && products.length === 0) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground">
            Browse our product catalog
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (productsError) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
        </div>
        <ErrorDisplay error={productsError} onRetry={handleRetry} />
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground">
            Browse our product catalog
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground">
            {pagination.total} {pagination.total === 1 ? "product" : "products"}{" "}
            found
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onView={onProductView}
            onEdit={onProductEdit}
            onDelete={handleDelete}
            isOwner={currentUserId === product.ownerId}
            className={deletingId === product.id ? "opacity-50" : ""}
          />
        ))}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={isLoadingProducts}
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoadingProducts ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};
