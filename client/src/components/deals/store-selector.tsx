import { useState } from "react";
import { Plus } from "lucide-react";
import { Store } from "@/types";

interface StoreSelectorProps {
  selectedStoreId: number | null;
  onSelectStore: (storeId: number) => void;
  userId: number;
}

export default function StoreSelector({ selectedStoreId, onSelectStore, userId }: StoreSelectorProps) {
  const [showAddStore, setShowAddStore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use demo store data instead of querying API
  const [stores] = useState<Store[]>([
    { id: 1, userId: 1, name: "Grocery Market", url: "https://example.com/grocery", isDefault: true },
    { id: 2, userId: 1, name: "Farmers Market", url: "https://example.com/farmers", isDefault: false }
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3 overflow-x-auto py-1">
        <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  // If no stores, show add store button
  if (!stores || stores.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <button 
          onClick={() => setShowAddStore(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Plus size={18} />
          <span>Add Store</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 overflow-x-auto py-1">
      {stores.map((store: Store) => (
        <div 
          key={store.id}
          onClick={() => onSelectStore(store.id)}
          className={`flex-shrink-0 px-4 py-2 ${
            selectedStoreId === store.id 
              ? "bg-primary text-white" 
              : "bg-gray-100 text-gray-600"
          } rounded-lg text-sm font-medium cursor-pointer transition-colors`}
        >
          {store.name}
        </div>
      ))}
      
      <div 
        onClick={() => setShowAddStore(true)}
        className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors"
      >
        Add Store
      </div>
    </div>
  );
}
