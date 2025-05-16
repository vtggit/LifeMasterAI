import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { MealPlan, Recipe } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MealItemProps {
  title: string;
  meal: MealPlan | undefined;
  mealType: string;
  userId: number;
  selectedDate: Date;
}

export default function MealItem({ title, meal, mealType, userId, selectedDate }: MealItemProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  
  const queryClient = useQueryClient();
  
  // Format date for API
  const formatDateForApi = (date: Date) => {
    return date.toISOString();
  };
  
  // Fetch recipes for dropdown
  const { data: recipes } = useQuery({
    queryKey: ['/api/recipes', { userId }],
    enabled: !!userId
  });
  
  // Add meal mutation
  const addMealMutation = useMutation({
    mutationFn: async (newMeal: any) => {
      const response = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeal)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add meal');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/meal-plans'] 
      });
      setIsAddDialogOpen(false);
      setSelectedRecipeId("");
      setCustomTitle("");
      setCustomDescription("");
    }
  });
  
  // Delete meal mutation
  const deleteMealMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/meal-plans/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete meal');
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/meal-plans'] 
      });
    }
  });
  
  const handleAddMeal = () => {
    // If recipe is selected, use recipe data
    if (selectedRecipeId) {
      const recipe = recipes.find((r: Recipe) => r.id === parseInt(selectedRecipeId));
      
      if (recipe) {
        addMealMutation.mutate({
          userId,
          date: formatDateForApi(selectedDate),
          mealType,
          recipeId: recipe.id,
          title: recipe.title,
          description: recipe.description || '',
          calories: recipe.calories || null,
          prepTime: recipe.prepTime || null
        });
      }
    } else if (customTitle) {
      // If custom meal, use entered data
      addMealMutation.mutate({
        userId,
        date: formatDateForApi(selectedDate),
        mealType,
        title: customTitle,
        description: customDescription || ''
      });
    }
  };
  
  const handleDeleteMeal = () => {
    if (meal) {
      deleteMealMutation.mutate(meal.id);
    }
  };

  return (
    <Card className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="text-primary text-sm h-8">+ Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipe">Select Recipe</Label>
                <Select 
                  value={selectedRecipeId} 
                  onValueChange={setSelectedRecipeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes?.map((recipe: Recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id.toString()}>
                        {recipe.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Or Enter Custom Meal</Label>
                <Input 
                  placeholder="Meal title" 
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  disabled={!!selectedRecipeId}
                />
              </div>
              
              <div className="space-y-2">
                <Input 
                  placeholder="Description (optional)" 
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  disabled={!!selectedRecipeId}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAddMeal} 
                disabled={(!selectedRecipeId && !customTitle) || addMealMutation.isPending}
              >
                {addMealMutation.isPending ? 'Adding...' : 'Add Meal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      {meal ? (
        <CardContent className="p-4 flex items-center space-x-3">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {meal.recipeId ? (
              <img 
                src={`https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300`} 
                alt={meal.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-xl">🍽️</div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{meal.title}</h4>
            {meal.description && (
              <p className="text-xs text-gray-500 mt-1">{meal.description}</p>
            )}
            <div className="flex items-center mt-1">
              {meal.calories && (
                <>
                  <span className="text-xs text-gray-500">{meal.calories} cal</span>
                  <span className="mx-1 text-gray-300">•</span>
                </>
              )}
              {meal.prepTime && (
                <span className="text-xs text-gray-500">{meal.prepTime}m prep</span>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Pencil size={16} />
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-red-500"
              onClick={handleDeleteMeal}
              disabled={deleteMealMutation.isPending}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-4 text-center py-6">
          <p className="text-sm text-gray-500">No meal planned</p>
          <button 
            className="mt-2 text-sm text-primary font-medium"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Plan a meal
          </button>
        </CardContent>
      )}
    </Card>
  );
}
