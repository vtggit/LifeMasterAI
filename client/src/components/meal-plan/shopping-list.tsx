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
  
  // Fetch shopping lists - using sample data to demonstrate Instacart integration
  const { data: shoppingLists, isLoading: listsLoading } = useQuery({
    queryKey: ['/api/shopping-lists', { userId }],
    queryFn: async () => {
      // Sample shopping list data for demonstration
      return [{
        id: 1,
        userId: 1,
        name: "Weekly Grocery List",
        date: formatDateString,
        isCompleted: false
      }];
    },
    enabled: !!userId
  });
  
  // Handle shopping lists data after it's loaded
  useEffect(() => {
    if (shoppingLists && Array.isArray(shoppingLists)) {
      // Since we're using sample data, just use the first list
      if (shoppingLists.length > 0) {
        setShoppingListId(shoppingLists[0].id);
      }
    }
  }, [shoppingLists]);
  
  // Fetch shopping list items - using sample data for demonstration
  const { data: selectedList, isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/shopping-lists', shoppingListId],
    queryFn: async () => {
      // In a real app, we would fetch from the API
      // For demo, return sample data that shows Instacart categories
      return {
        id: 1,
        userId: 1,
        name: "Weekly Grocery List",
        date: formatDateString,
        isCompleted: false,
        items: [
          // Produce items
          { id: 1, shoppingListId: 1, name: "Apples", quantity: 6, unit: "", price: 3.99, isChecked: false },
          { id: 2, shoppingListId: 1, name: "Bananas", quantity: 1, unit: "bunch", price: 1.49, isChecked: false },
          { id: 3, shoppingListId: 1, name: "Lettuce", quantity: 1, unit: "head", price: 2.49, isChecked: false },
          { id: 4, shoppingListId: 1, name: "Tomatoes", quantity: 4, unit: "", price: 3.99, isChecked: false },
          
          // Dairy items
          { id: 5, shoppingListId: 1, name: "Milk", quantity: 1, unit: "gallon", price: 3.29, isChecked: false },
          { id: 6, shoppingListId: 1, name: "Eggs", quantity: 1, unit: "dozen", price: 4.99, isChecked: false },
          { id: 7, shoppingListId: 1, name: "Yogurt", quantity: 2, unit: "cups", price: 2.98, isChecked: false },
          
          // Meat items
          { id: 8, shoppingListId: 1, name: "Chicken breast", quantity: 2, unit: "lbs", price: 9.98, isChecked: false },
          { id: 9, shoppingListId: 1, name: "Ground beef", quantity: 1, unit: "lb", price: 6.99, isChecked: false },
          
          // Bakery items
          { id: 10, shoppingListId: 1, name: "Bread", quantity: 1, unit: "loaf", price: 3.49, isChecked: false },
          
          // Pantry items
          { id: 11, shoppingListId: 1, name: "Pasta", quantity: 2, unit: "boxes", price: 2.98, isChecked: false },
          { id: 12, shoppingListId: 1, name: "Rice", quantity: 1, unit: "bag", price: 4.99, isChecked: false },
          { id: 13, shoppingListId: 1, name: "Canned tomatoes", quantity: 3, unit: "cans", price: 5.97, isChecked: false },
          
          // Frozen items
          { id: 14, shoppingListId: 1, name: "Frozen vegetables", quantity: 2, unit: "bags", price: 5.98, isChecked: true },
          { id: 15, shoppingListId: 1, name: "Ice cream", quantity: 1, unit: "pint", price: 4.99, isChecked: true }
        ]
      };
    },
    enabled: !!shoppingListId
  });
  
  // Update shopping list item (toggle checked)
  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, isChecked }: { id: number, isChecked: boolean }) => {
      // In a real app, we would call the API endpoint
      // For demo purposes, simulate API call success
      return { success: true, id, isChecked };
    },
    onSuccess: () => {
      // In a real app, we would invalidate the query to refresh data
      // For demo, manually update the selectedList data
      if (selectedList && selectedList.items) {
        const updatedList = {
          ...selectedList,
          items: selectedList.items.map(item => {
            if (item.id === (toggleItemMutation.variables as any)?.id) {
              return { ...item, isChecked: (toggleItemMutation.variables as any)?.isChecked };
            }
            return item;
          })
        };
        
        // @ts-ignore - Manually update cache for demo
        queryClient.setQueryData(['/api/shopping-lists', shoppingListId], updatedList);
      }
    }
  });
  
  // Calculate total cost
  const calculateTotal = (items: ShoppingListItem[] = []) => {
    return items.reduce((sum, item) => sum + (item.price || 0), 0);
  };
  
  // Function to send shopping list to Instacart
  const sendToInstacart = (items: ShoppingListItem[]) => {
    if (!items || items.length === 0) {
      alert("No items to add to Instacart");
      return;
    }
    
    // Create Instacart URL with shopping list items
    // In a production app with full Instacart integration, we would use their API
    // with proper authentication. This simplified implementation uses deeplinks.
    const baseUrl = "https://www.instacart.com/store/partner";
    
    // Format items for the URL
    const uncheckedItems = items.filter(item => !item.isChecked);
    
    if (uncheckedItems.length === 0) {
      alert("No unchecked items to add to Instacart");
      return;
    }
    
    // Group items by category for better Instacart shopping experience
    const categories: {[key: string]: ShoppingListItem[]} = {
      produce: [],
      dairy: [],
      meat: [],
      bakery: [],
      frozen: [],
      pantry: [],
      other: []
    };
    
    // Categorize items (in a real app we'd have more sophisticated categorization)
    uncheckedItems.forEach(item => {
      // This is a simplified categorization
      // In a real app, we'd use AI or a database of product categories
      const name = item.name.toLowerCase();
      if (name.includes('fruit') || name.includes('vegetable') || 
          name.includes('lettuce') || name.includes('tomato') || 
          name.includes('onion') || name.includes('pepper')) {
        categories.produce.push(item);
      } else if (name.includes('milk') || name.includes('cheese') || 
                name.includes('yogurt') || name.includes('butter') || 
                name.includes('cream')) {
        categories.dairy.push(item);
      } else if (name.includes('chicken') || name.includes('beef') || 
                name.includes('pork') || name.includes('fish') || 
                name.includes('meat')) {
        categories.meat.push(item);
      } else if (name.includes('bread') || name.includes('bagel') || 
                name.includes('muffin') || name.includes('roll')) {
        categories.bakery.push(item);
      } else if (name.includes('frozen') || name.includes('ice cream')) {
        categories.frozen.push(item);
      } else if (name.includes('pasta') || name.includes('rice') || 
                name.includes('cereal') || name.includes('can') || 
                name.includes('sauce')) {
        categories.pantry.push(item);
      } else {
        categories.other.push(item);
      }
    });
    
    // Format items by category for the cart
    const cartItems = Object.entries(categories)
      .filter(([_, items]) => items.length > 0)
      .map(([category, items]) => {
        return items.map(item => {
          const quantity = item.quantity > 1 ? `${item.quantity}x ` : "";
          const unit = item.unit ? ` ${item.unit}` : "";
          return `${quantity}${item.name}${unit}`;
        }).join(",");
      })
      .join(",");
    
    // Open Instacart in a new tab with the items
    window.open(`${baseUrl}/search?q=${encodeURIComponent(cartItems)}`, "_blank");
  };
  
  const isLoading = listsLoading || (itemsLoading && !!shoppingListId);

  return (
    <Card className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium">Shopping List</h3>
        <button 
          onClick={() => sendToInstacart(selectedList?.items || [])}
          className="text-primary text-sm flex items-center hover:text-primary/80 transition-colors"
        >
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
      ) : selectedList && selectedList.items && selectedList.items.length > 0 ? (
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
