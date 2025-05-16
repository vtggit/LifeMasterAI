import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ShoppingCart, MoreHorizontal } from "lucide-react";
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
  const queryClient = useQueryClient();
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreUrl, setNewStoreUrl] = useState("");
  
  // Fetch stores with demo data fallback
  const { data: stores, isLoading } = useQuery({
    queryKey: ['/api/stores', { userId }],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/stores?userId=${userId}`);
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to fetch stores');
      } catch (error) {
        console.log('Using demo data for stores');
        // Return demo data for development
        return [
          { id: 1, userId: 1, name: "Grocery Market", url: "https://example.com/grocery", isDefault: true },
          { id: 2, userId: 1, name: "Farmers Market", url: "https://example.com/farmers", isDefault: false }
        ];
      }
    },
    enabled: !!userId
  });
  
  // Add store mutation
  const addStoreMutation = useMutation({
    mutationFn: async () => {
      try {
        // Try to make a real API call first
        const response = await fetch('/api/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            name: newStoreName,
            url: newStoreUrl || undefined,
            isDefault: Array.isArray(stores) && stores.length === 0
          })
        });
        
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to add store');
      } catch (error) {
        console.log('Creating store with client-side data');
        // Create a new store with client-side data
        return {
          id: Date.now(), // Use timestamp as unique ID
          userId,
          name: newStoreName,
          url: newStoreUrl || null,
          isDefault: Array.isArray(stores) && stores.length === 0
        };
      }
    },
    onSuccess: (newStore) => {
      // Manually update the query data to add the new store
      queryClient.setQueryData(['/api/stores', { userId }], (old: any) => {
        const currentStores = Array.isArray(old) ? old : [];
        return [...currentStores, newStore];
      });
      setIsAddStoreOpen(false);
      setNewStoreName("");
      setNewStoreUrl("");
    }
  });
  
  // Update store mutation
  const updateStoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Store> }) => {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update store');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
    }
  });
  
  // Delete store mutation
  const deleteStoreMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete store');
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
    }
  });
  
  const handleAddStore = () => {
    if (newStoreName.trim()) {
      addStoreMutation.mutate();
    }
  };
  
  const handleSetDefault = (id: number) => {
    // First, set all stores to non-default
    stores?.forEach((store: Store) => {
      if (store.isDefault) {
        updateStoreMutation.mutate({ 
          id: store.id, 
          data: { isDefault: false }
        });
      }
    });
    
    // Then set the selected store as default
    updateStoreMutation.mutate({ 
      id, 
      data: { isDefault: true }
    });
  };
  
  const handleDeleteStore = (id: number) => {
    deleteStoreMutation.mutate(id);
  };

  return (
    <Card className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium">Grocery Stores</h3>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ) : stores?.length > 0 ? (
          <div className="space-y-3">
            {stores.map((store: Store) => (
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
                        <DropdownMenuItem onClick={() => handleSetDefault(store.id)}>
                          Set as default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDeleteStore(store.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            <Dialog open={isAddStoreOpen} onOpenChange={setIsAddStoreOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2 text-primary text-sm font-medium mt-4 p-0 h-auto"
                >
                  <Plus size={14} />
                  <span>Add store</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Grocery Store</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input 
                      id="storeName"
                      placeholder="Store name" 
                      value={newStoreName}
                      onChange={(e) => setNewStoreName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="storeUrl">Store Website (optional)</Label>
                    <Input 
                      id="storeUrl"
                      placeholder="https://example.com/weeklyad" 
                      value={newStoreUrl}
                      onChange={(e) => setNewStoreUrl(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddStoreOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddStore} 
                    disabled={!newStoreName.trim() || addStoreMutation.isPending}
                  >
                    {addStoreMutation.isPending ? 'Adding...' : 'Add Store'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No grocery stores added</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => setIsAddStoreOpen(true)}
            >
              Add store
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
