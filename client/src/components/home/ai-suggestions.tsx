import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, Star } from "lucide-react";
import { DealItem, DietaryPreference, MealSuggestion } from "@/types";

interface AiSuggestionsProps {
  userId: number;
}

export default function AiSuggestions({ userId }: AiSuggestionsProps) {
  // Fetch deals for the default store
  const { data: stores } = useQuery({
    queryKey: ['/api/stores', { userId }],
    enabled: !!userId
  });

  const defaultStore = stores?.find((store: any) => store.isDefault);
  
  const { data: dealItems, isLoading: dealsLoading } = useQuery({
    queryKey: ['/api/deal-items', { storeId: defaultStore?.id }],
    enabled: !!defaultStore
  });
  
  // Fetch dietary preferences
  const { data: dietaryPrefs, isLoading: prefsLoading } = useQuery({
    queryKey: ['/api/dietary-preferences', { userId }],
    enabled: !!userId
  });
  
  // Get meal suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['/api/ai/meal-suggestions', { userId }],
    queryFn: async () => {
      const response = await fetch('/api/ai/meal-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealItems,
          dietaryPreferences: dietaryPrefs,
          count: 1
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get meal suggestions');
      }
      
      return response.json();
    },
    enabled: !!dealItems && !!dietaryPrefs && dealItems.length > 0
  });
  
  // Save recipe mutation
  const saveMutation = useMutation({
    mutationFn: async (suggestion: MealSuggestion) => {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: suggestion.title,
          description: suggestion.description,
          imageUrl: suggestion.imageUrl,
          tags: suggestion.tags,
          isFavorite: true,
          ingredients: [], // This would need AI generation for a full recipe
          instructions: [], // This would need AI generation for a full recipe
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }
      
      return response.json();
    }
  });
  
  const isLoading = dealsLoading || prefsLoading || suggestionsLoading;
  const suggestion = suggestions?.[0];
  const storeName = defaultStore?.name || '';

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader className="pb-0 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">AI Suggestions</CardTitle>
          <div className="text-xs px-2 py-1 bg-amber-100 text-amber-600 rounded-full">
            Based on deals
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : suggestion ? (
          <div className="relative rounded-lg border border-gray-100 overflow-hidden">
            {suggestion.imageUrl && (
              <img 
                src={suggestion.imageUrl} 
                alt={suggestion.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-3">
              <h3 className="font-medium">{suggestion.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Uses {suggestion.dealItems.length} on-sale items from {storeName}
              </p>
              <div className="flex mt-2 space-x-2">
                {suggestion.tags?.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-1.5 bg-primary text-white rounded-full"
                    onClick={() => saveMutation.mutate(suggestion)}
                    disabled={saveMutation.isPending}
                  >
                    <Utensils size={16} />
                  </button>
                  <span className="text-sm font-medium">
                    {saveMutation.isPending ? 'Saving...' : 'Save to recipes'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-1">{suggestion.rating?.toFixed(1)}</span>
                  <Star size={16} className="text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">
              {dealItems?.length ? 'Unable to generate suggestions' : 'No deals available for suggestions'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
