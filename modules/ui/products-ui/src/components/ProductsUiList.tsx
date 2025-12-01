import { useEffect } from "react";
import { useProductsUi } from "../hooks/useProductsUi";

interface ProductsUiListProps {
  className?: string;
}

export const ProductsUiList = ({ className }: ProductsUiListProps) => {
  const { items, isLoading, error, fetchItems, deleteItem } = useProductsUi();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  if (items.length === 0) {
    return <div className="text-center p-4 text-gray-500">No items found</div>;
  }

  return (
    <div className={className || "space-y-4"}>
      <h2 className="text-2xl font-bold">ProductsUi List</h2>
      <div className="grid gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{item.name}</h3>
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
