import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ShoppingCart, MoreHorizontal, Check } from "lucide-react";
import { Store } from "@/types";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface GroceryStoresProps {
  userId: number;
}

export default function GroceryStores({ userId }: GroceryStoresProps) {
  // Simplified UI with direct state management
  const [storeList, setStoreList] = useState<Store[]>([
    { id: 1, userId: 1, name: "Grocery Market", url: "https://example.com/grocery", isDefault: true },
    { id: 2, userId: 1, name: "Farmers Market", url: "https://example.com/farmers", isDefault: false }
  ]);
  
  // Add store form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  
  // Simple functions for store management
  function addStore() {
    if (storeName.trim()) {
      const newStore = {
        id: Date.now(),
        userId,
        name: storeName,
        url: storeUrl || null,
        isDefault: storeList.length === 0
      };
      
      setStoreList([...storeList, newStore]);
      setStoreName("");
      setStoreUrl("");
      setShowAddForm(false);
    }
  }
  
  function setDefaultStore(id: number) {
    setStoreList(storeList.map(store => ({
      ...store,
      isDefault: store.id === id
    })));
  }
  
  function deleteStore(id: number) {
    setStoreList(storeList.filter(store => store.id !== id));
  }

  return (
    <Card className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium">Grocery Stores</h3>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {storeList.map((store) => (
            <div 
              key={store.id}
              className="flex items-center justify-between p-2 border border-gray-100 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-red-600" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{store.name}</h4>
                  {store.isDefault && (
                    <p className="text-xs text-gray-500">Default store</p>
                  )}
                </div>
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!store.isDefault && (
                      <DropdownMenuItem onClick={() => setDefaultStore(store.id)}>
                        Set as default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => deleteStore(store.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          
          {/* Simple Add Store Form - no complex dialog */}
          {showAddForm ? (
            <div className="mt-4 border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium mb-3">Add New Store</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input 
                    id="storeName"
                    placeholder="Store name" 
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="storeUrl">Store Website (optional)</Label>
                  <Input 
                    id="storeUrl"
                    placeholder="https://example.com/weeklyad" 
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 mt-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setStoreName("");
                      setStoreUrl("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={addStore} 
                    disabled={!storeName.trim()}
                  >
                    Add Store
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 text-primary text-sm font-medium mt-4 p-0 h-auto"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={14} />
              <span>Add store</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
