import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart } from "lucide-react";
import { ShoppingList, ShoppingListItem } from "@/types";

interface ShoppingListProps {
  userId: number;
  date: Date;
}

export default function MealPlanShoppingList({ userId, date }: ShoppingListProps) {
  const queryClient = useQueryClient();
  const [shoppingListId, setShoppingListId] = useState<number | null>(null);
  
  // Format date for API
  const formatDateString = date.toISOString().split('T')[0];
  
  // Fetch shopping lists
  const { data: shoppingLists, isLoading: listsLoading } = useQuery({
    queryKey: ['/api/shopping-lists', { userId }],
    enabled: !!userId
  });
  
  // Handle shopping lists data after it's loaded
  useEffect(() => {
    if (shoppingLists) {
      // Find a shopping list for the selected date
      const listForDate = shoppingLists.find((list: ShoppingList) => 
        list.date.startsWith(formatDateString)
      );
      
      if (listForDate) {
        setShoppingListId(listForDate.id);
      } else if (shoppingLists.length) {
        // If no list for this date, use the most recent list
        setShoppingListId(shoppingLists[0].id);
      }
    }
  }, [shoppingLists, formatDateString]);
  
  // Fetch shopping list items
  const { data: selectedList, isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/shopping-lists', shoppingListId],
    enabled: !!shoppingListId
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
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-lists', shoppingListId] });
    }
  });
  
  // Calculate total cost
  const calculateTotal = (items: ShoppingListItem[] = []) => {
    return items.reduce((sum, item) => sum + (item.price || 0), 0);
  };
  
  const isLoading = listsLoading || (itemsLoading && !!shoppingListId);

  return (
    <Card className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium">Shopping List</h3>
        <button className="text-primary text-sm flex items-center">
          <ShoppingCart size={14} className="mr-1" />
          Send to Instacart
        </button>
      </CardHeader>
      
      {isLoading ? (
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-100 rounded w-3/4"></div>
            <div className="h-6 bg-gray-100 rounded w-2/3"></div>
            <div className="h-6 bg-gray-100 rounded w-4/5"></div>
          </div>
        </CardContent>
      ) : selectedList && selectedList.items?.length > 0 ? (
        <CardContent className="px-4 py-3">
          {selectedList.items.map((item: ShoppingListItem) => (
            <div 
              key={item.id}
              className="flex items-center justify-between py-1 border-b border-gray-100"
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
              {item.price && (
                <span className="text-xs text-gray-500">${item.price.toFixed(2)}</span>
              )}
            </div>
          ))}
          
          <div className="px-4 py-3 bg-gray-50 flex justify-between mt-2 -mx-4 -mb-3">
            <span className="text-sm font-medium">Total</span>
            <span className="text-sm font-medium">${calculateTotal(selectedList.items).toFixed(2)}</span>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-4 text-center py-6">
          <p className="text-sm text-gray-500">No shopping list items</p>
          <button className="mt-2 text-sm text-primary font-medium">
            Create shopping list
          </button>
        </CardContent>
      )}
    </Card>
  );
}
