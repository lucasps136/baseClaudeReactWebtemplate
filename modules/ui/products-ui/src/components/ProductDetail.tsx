import { useEffect } from "react";
import { useProduct } from "../hooks/useProduct";
import type { Product } from "../types";

interface ProductDetailProps {
  productId: string;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onClose?: () => void;
  isOwner?: boolean;
  className?: string;
}

// Loading skeleton component
const ProductDetailSkeleton = () => (
  <div className="space-y-6">
    <div className="aspect-square w-full animate-pulse rounded-lg bg-muted md:aspect-video" />
    <div className="space-y-4">
      <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-6 w-1/4 animate-pulse rounded bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  </div>
);

// Error display component
const ErrorDisplay = ({
  error,
  onRetry,
  onClose,
}: {
  error: string;
  onRetry: () => void;
  onClose?: () => void;
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
    <div className="flex justify-center gap-2">
      <button
        onClick={onRetry}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try Again
      </button>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          Close
        </button>
      )}
    </div>
  </div>
);

export const ProductDetail = ({
  productId,
  onEdit,
  onDelete,
  onClose,
  isOwner = false,
  className = "",
}: ProductDetailProps) => {
  const {
    selectedProduct,
    isLoadingProduct,
    productError,
    fetchProduct,
    deleteProduct,
  } = useProduct();

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId, fetchProduct]);

  const handleEdit = () => {
    if (selectedProduct) {
      onEdit?.(selectedProduct);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    if (
      !window.confirm(
        `Are you sure you want to delete "${selectedProduct.name}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteProduct(selectedProduct.id);
      onClose?.();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleRetry = () => {
    fetchProduct(productId);
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return "Price not set";
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    });
    return formatter.format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Loading state
  if (isLoadingProduct) {
    return (
      <div className={className}>
        <ProductDetailSkeleton />
      </div>
    );
  }

  // Error state
  if (productError) {
    return (
      <div className={className}>
        <ErrorDisplay
          error={productError}
          onRetry={handleRetry}
          onClose={onClose}
        />
      </div>
    );
  }

  // No product found
  if (!selectedProduct) {
    return (
      <div className={className}>
        <ErrorDisplay
          error="Product not found"
          onRetry={handleRetry}
          onClose={onClose}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Close button */}
      {onClose && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md p-2 transition-colors hover:bg-accent"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-lg bg-muted md:aspect-auto">
          {selectedProduct.image ? (
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="mb-2 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold">{selectedProduct.name}</h1>
              {!selectedProduct.active && (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Inactive
                </span>
              )}
              {selectedProduct.active && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-primary">
              {formatPrice(selectedProduct.price, selectedProduct.currency)}
            </div>
          </div>

          {/* Description */}
          {selectedProduct.description && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h2>
              <p className="text-base leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          {selectedProduct.metadata &&
            Object.keys(selectedProduct.metadata).length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Additional Information
                </h2>
                <dl className="space-y-2">
                  {Object.entries(selectedProduct.metadata).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between border-b pb-2"
                      >
                        <dt className="font-medium capitalize">
                          {key.replace(/_/g, " ")}
                        </dt>
                        <dd className="text-muted-foreground">{value}</dd>
                      </div>
                    ),
                  )}
                </dl>
              </div>
            )}

          {/* Dates */}
          <div className="border-t pt-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(selectedProduct.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last updated</span>
                <span>{formatDate(selectedProduct.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isOwner && (onEdit || onDelete) && (
            <div className="flex gap-3 border-t pt-6">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="flex-1 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  aria-label={`Edit ${selectedProduct.name}`}
                >
                  Edit Product
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isLoadingProduct}
                  className="flex-1 rounded-md border border-destructive bg-background px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                  aria-label={`Delete ${selectedProduct.name}`}
                >
                  Delete Product
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
