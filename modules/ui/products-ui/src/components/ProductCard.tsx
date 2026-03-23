import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  isOwner?: boolean;
  className?: string;
}

export const ProductCard = ({
  product,
  onView,
  onEdit,
  onDelete,
  isOwner = false,
  className = "",
}: ProductCardProps) => {
  const handleView = () => {
    onView?.(product);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(product);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(product);
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return "Price not set";
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    });
    return formatter.format(price);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg ${
        onView ? "cursor-pointer" : ""
      } ${className}`}
      onClick={handleView}
      role={onView ? "button" : undefined}
      tabIndex={onView ? 0 : undefined}
      onKeyDown={(e) => {
        if (onView && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleView();
        }
      }}
      aria-label={`Product: ${product.name}`}
    >
      {/* Product Image */}
      <div className="aspect-square w-full overflow-hidden bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
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
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-lg font-semibold">
            {product.name}
          </h3>
          {!product.active && (
            <span
              className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              aria-label="Status: Inactive"
            >
              Inactive
            </span>
          )}
          {product.active && (
            <span
              className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
              aria-label="Status: Active"
            >
              Active
            </span>
          )}
        </div>

        {product.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="mb-4 text-xl font-bold text-primary">
          {formatPrice(product.price, product.currency)}
        </div>

        {/* Actions */}
        {isOwner && (onEdit || onDelete) && (
          <div className="flex gap-2 border-t pt-3">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                aria-label={`Edit ${product.name}`}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex-1 rounded-md border border-destructive bg-background px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                aria-label={`Delete ${product.name}`}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
