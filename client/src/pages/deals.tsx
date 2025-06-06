import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import StoreSelector from "@/components/deals/store-selector";
import DealItemCard from "@/components/deals/deal-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, SortDesc } from "lucide-react";
import { DealItem, Store } from "@/types";

export default function DealsPage() {
  // In a real app we would fetch the authenticated user from a context or state management
  const [userId] = useState<number>(1);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Use local state for stores to ensure consistency with settings
  const [stores] = useState<Store[]>([
    { id: 1, userId: 1, name: "Grocery Market", url: "https://example.com/grocery", isDefault: true },
    { id: 2, userId: 1, name: "Farmers Market", url: "https://example.com/farmers", isDefault: false }
  ]);
  
  // Set default store if not selected
  useEffect(() => {
    if (!selectedStoreId && stores?.length > 0) {
      const defaultStore = stores.find((store) => store.isDefault);
      setSelectedStoreId(defaultStore?.id || stores[0].id);
    }
  }, [stores, selectedStoreId]);

  // Sample deal data
  const [dealsLoading, setDealsLoading] = useState(false);
  const [deals] = useState<DealItem[]>([
    { 
      id: 1, 
      storeId: 1, 
      title: "Fresh Tomatoes", 
      salePrice: 1.99, 
      originalPrice: 3.49, 
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80", 
      discountPercentage: 43, 
      category: "produce", 
      unit: "lb", 
      validUntil: new Date().toISOString(), 
      createdAt: new Date().toISOString()
    },
    { 
      id: 2, 
      storeId: 1, 
      title: "Organic Chicken Breast", 
      salePrice: 5.99, 
      originalPrice: 7.99, 
      imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=200&q=80", 
      discountPercentage: 25, 
      category: "meat", 
      unit: "lb", 
      validUntil: new Date().toISOString(), 
      createdAt: new Date().toISOString()
    },
    { 
      id: 3, 
      storeId: 2, 
      title: "Organic Apples", 
      salePrice: 2.49, 
      originalPrice: 3.99, 
      imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=200&q=80", 
      discountPercentage: 38, 
      category: "produce", 
      unit: "lb", 
      validUntil: new Date().toISOString(), 
      createdAt: new Date().toISOString()
    },
    { 
      id: 4, 
      storeId: 1, 
      title: "Whole Wheat Bread", 
      salePrice: 3.49, 
      originalPrice: 4.99, 
      imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?auto=format&fit=crop&w=200&q=80", 
      discountPercentage: 30, 
      category: "bakery", 
      unit: "loaf", 
      validUntil: new Date().toISOString(), 
      createdAt: new Date().toISOString()
    },
    { 
      id: 5, 
      storeId: 2, 
      title: "Organic Milk", 
      salePrice: 4.49, 
      originalPrice: 5.99, 
      imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=200&q=80", 
      discountPercentage: 25, 
      category: "dairy", 
      unit: "gallon", 
      validUntil: new Date().toISOString(), 
      createdAt: new Date().toISOString()
    }
  ]);

  // Filter deals by category and store
  const filteredDeals = selectedCategory === "all" 
    ? deals?.filter((deal: DealItem) => deal.storeId === selectedStoreId) 
    : deals?.filter((deal: DealItem) => 
        deal.category === selectedCategory && deal.storeId === selectedStoreId
      );

  // Get unique categories from deals for the selected store
  const categories = deals 
    ? Array.from(new Set(
        deals
          .filter((deal: DealItem) => deal.storeId === selectedStoreId)
          .map((deal: DealItem) => deal.category)
          .filter((category): category is string => Boolean(category))
      ))
    : [];

  return (
    <>
      <Header title="Weekly Deals" showBackButton={true} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 space-y-5">
          {/* Store Selector */}
          <StoreSelector 
            selectedStoreId={selectedStoreId} 
            onSelectStore={setSelectedStoreId}
            userId={userId}
          />

          {/* Deal Filters */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Weekly Deals</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg bg-gray-100">
                <Filter size={18} className="text-gray-600" />
              </button>
              <button className="p-2 rounded-lg bg-gray-100">
                <SortDesc size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Categories Selector */}
          <div className="flex items-center space-x-3 overflow-x-auto py-1">
            <div 
              className={`flex-shrink-0 px-3 py-1.5 ${
                selectedCategory === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
              } rounded-full text-sm font-medium cursor-pointer`}
              onClick={() => setSelectedCategory("all")}
            >
              All Deals
            </div>
            
            {categories.map((category) => (
              <div 
                key={category}
                className={`flex-shrink-0 px-3 py-1.5 ${
                  selectedCategory === category ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                } rounded-full text-sm font-medium cursor-pointer`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </div>
            ))}
          </div>

          {/* Deal Items Grid */}
          {dealsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredDeals?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredDeals.map((deal: DealItem) => (
                <DealItemCard key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No deals available</p>
            </div>
          )}

          {/* Deal Viewer Section */}
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 flex items-center justify-between">
              <h3 className="font-medium">
                {stores?.find((store: Store) => store.id === selectedStoreId)?.name || ''} Weekly Ad
              </h3>
              <button className="text-primary text-sm font-medium">Open Original</button>
            </div>
            <div className="p-4 bg-white">
              <div className="rounded-lg border border-gray-200 h-48 flex items-center justify-center bg-gray-50">
                <div className="text-center px-4">
                  <i className="text-2xl text-gray-500 mb-2">📰</i>
                  <p className="text-sm text-gray-500">Interactive weekly ad preview</p>
                  <button className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm">
                    View Full Ad
                  </button>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Last updated: {new Date().toLocaleDateString()} • New deals every Wednesday
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
