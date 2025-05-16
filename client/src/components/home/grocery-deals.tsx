import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Store, DealItem } from "@/types";

interface GroceryDealsProps {
  userId: number;
}

export default function GroceryDeals({ userId }: GroceryDealsProps) {
  const [, navigate] = useLocation();
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  
  // Use local state instead of fetching from API to ensure we have consistent data
  const [stores, setStores] = useState<Store[]>([
    { id: 1, userId: 1, name: "Grocery Market", url: "https://example.com/grocery", isDefault: true },
    { id: 2, userId: 1, name: "Farmers Market", url: "https://example.com/farmers", isDefault: false }
  ]);
  
  // Set loading states
  const [storesLoading, setStoresLoading] = useState(false);
  const [dealsLoading, setDealsLoading] = useState(false);
  
  // Sample deals data for demonstration
  const [deals, setDeals] = useState<DealItem[]>([
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
    }
  ]);
  
  // Set default store if not selected
  useEffect(() => {
    if (!selectedStoreId && stores?.length > 0) {
      const defaultStore = stores.find((store) => store.isDefault);
      setSelectedStoreId(defaultStore?.id || stores[0].id);
    }
  }, [stores, selectedStoreId]);
  
  const isLoading = storesLoading || (dealsLoading && !!selectedStoreId);
  
  // Filter deals based on selected store
  const filteredDeals = selectedStoreId 
    ? deals.filter(deal => deal.storeId === selectedStoreId)
    : deals;
    
  const limitedDeals = filteredDeals.slice(0, 2);

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader className="pb-0 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Weekly Deals</CardTitle>
          <button 
            className="text-primary text-sm font-medium"
            onClick={() => navigate("/deals")}
          >
            View All
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        {/* Store Selection */}
        <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </>
          ) : (
            <>
              {stores?.map((store: Store) => (
                <div 
                  key={store.id}
                  onClick={() => setSelectedStoreId(store.id)}
                  className={`flex-shrink-0 px-3 py-1.5 ${
                    selectedStoreId === store.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600'
                  } rounded-full text-sm cursor-pointer transition-colors`}
                >
                  {store.name}
                </div>
              ))}
              <div 
                onClick={() => navigate("/settings")}
                className="flex-shrink-0 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200"
              >
                <Plus size={16} className="inline mr-1" />
                Add Store
              </div>
            </>
          )}
        </div>
        
        {/* Deal Items */}
        <div className="space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </>
          ) : limitedDeals.length > 0 ? (
            <>
              {limitedDeals.map((deal: DealItem) => (
                <div key={deal.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    {deal.imageUrl && (
                      <img 
                        src={deal.imageUrl} 
                        alt={deal.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{deal.title}</h4>
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-red-600">${deal.salePrice.toFixed(2)}</span>
                      {deal.originalPrice && (
                        <span className="text-xs text-gray-500 line-through ml-1">${deal.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <button className="p-2 text-primary">
                    <Plus size={18} />
                  </button>
                </div>
              ))}
              <button 
                className="w-full py-2 text-primary text-sm font-medium"
                onClick={() => navigate("/deals")}
              >
                See more deals
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No deals available</p>
              <button 
                className="mt-2 text-sm text-primary font-medium"
                onClick={() => navigate("/deals")}
              >
                Browse deals
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
