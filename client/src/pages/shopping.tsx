import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, ShoppingCart, Calendar, Trash2 } from "lucide-react";
import { ShoppingList, ShoppingListItem } from "@/types";

export default function ShoppingPage() {
  // In a real app we would fetch the authenticated user from a context or state management
  const [userId] = useState<number>(1);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch shopping lists
  const { data: shoppingLists, isLoading: listsLoading } = useQuery({
    queryKey: ['/api/shopping-lists', { userId }],
    enabled: !!userId,
    onSuccess: (data) => {
      // If we have lists but no selection, select the first one
      if (data?.length && !selectedListId) {
        setSelectedListId(data[0].id);
      }
    }
  });
  
  // Fetch shopping list items
  const { data: selectedList, isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/shopping-lists', selectedListId],
    enabled: !!selectedListId
  });
  
  // Update shopping list item (toggle checked)
  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, isChecked }: { id: number, isChecked: boolean }) => {
      const response = await fetch(`/api/shopping-list-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isChecked })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-lists', selectedListId] });
    }
  });
  
  // Delete shopping list item
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/shopping-list-items/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-lists', selectedListId] });
    }
  });
  
  // Calculate total cost
  const calculateTotal = (items: ShoppingListItem[] = []) => {
    return items.reduce((sum, item) => sum + (item.price || 0), 0);
  };
  
  const isLoading = listsLoading || (itemsLoading && !!selectedListId);

  return (
    <>
      <Header title="Shopping Lists" showBackButton={true} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 space-y-5">
          {/* Shopping Lists Selector */}
          <div className="flex items-center space-x-3 overflow-x-auto py-1">
            {isLoading ? (
              <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-lg"></div>
            ) : shoppingLists?.length > 0 ? (
              <>
                {shoppingLists.map((list: ShoppingList) => (
                  <div 
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`flex-shrink-0 px-4 py-2 ${
                      selectedListId === list.id 
                        ? "bg-primary text-white" 
                        : "bg-gray-100 text-gray-600"
                    } rounded-lg text-sm font-medium cursor-pointer`}
                  >
                    {list.name}
                  </div>
                ))}
                <div className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm cursor-pointer flex items-center">
                  <PlusCircle size={16} className="mr-1" />
                  <span>New List</span>
                </div>
              </>
            ) : (
              <Button className="bg-primary text-white flex items-center space-x-2">
                <PlusCircle size={16} />
                <span>Create Shopping List</span>
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <Card>
              <CardHeader>
                <CardTitle className="h-6 w-32 bg-gray-100 animate-pulse rounded"></CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 animate-pulse rounded"></div>
                ))}
              </CardContent>
            </Card>
          ) : selectedList ? (
            <Card>
              <CardHeader className="pb-0 flex flex-row items-center justify-between">
                <CardTitle>{selectedList.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{new Date(selectedList.date).toLocaleDateString()}</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1 text-primary">
                    <ShoppingCart size={14} />
                    <span>Instacart</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                {/* Add Item Form */}
                <div className="flex space-x-2 mb-4">
                  <Input placeholder="Add item..." className="flex-1" />
                  <Button size="sm">Add</Button>
                </div>
                
                {/* Items List */}
                {selectedList.items?.length > 0 ? (
                  <div className="space-y-1">
                    {selectedList.items.map((item: ShoppingListItem) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100"
                      >
                        <div className="flex items-center">
                          <Checkbox 
                            id={`item-${item.id}`} 
                            checked={item.isChecked}
                            onCheckedChange={(checked) => {
                              toggleItemMutation.mutate({ id: item.id, isChecked: !!checked });
                            }}
                            className="mr-3 h-4 w-4"
                          />
                          <label 
                            htmlFor={`item-${item.id}`} 
                            className={`text-sm ${item.isChecked ? 'line-through text-gray-400' : ''}`}
                          >
                            {item.name} {item.quantity > 1 ? `(${item.quantity}${item.unit ? ' ' + item.unit : ''})` : ''}
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          {item.price && (
                            <span className="text-xs text-gray-500">${item.price.toFixed(2)}</span>
                          )}
                          <button 
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total */}
                    <div className="flex justify-between py-3 mt-2 bg-gray-50 px-3 rounded-lg">
                      <span className="font-medium">Total</span>
                      <span className="font-medium">${calculateTotal(selectedList.items).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">Your shopping list is empty</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No shopping lists yet</h3>
              <p className="text-gray-500 mb-4">Create a shopping list to get started</p>
              <Button className="bg-primary">Create Shopping List</Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
