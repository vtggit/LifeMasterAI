import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Clock, ChevronRight } from "lucide-react";
import { Recipe, RecipeRating, FamilyMember } from "@/types";
import Rating from "./rating";

interface RecipeCardProps {
  recipe: Recipe & { ratings?: RecipeRating[] };
  familyMembers?: FamilyMember[];
}

export default function RecipeCard({ recipe, familyMembers = [] }: RecipeCardProps) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorite);
  
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const updatedRecipe = { ...recipe, isFavorite: !isFavorite };
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFavorite })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
    }
  });
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };
  
  const handleRecipeClick = () => {
    navigate(`/recipes/${recipe.id}`);
  };
  
  // Calculate average rating if available
  const ratings = recipe.ratings || [];
  const averageRating = ratings.length 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return (
    <Card 
      className="bg-white rounded-lg border border-gray-100 overflow-hidden cursor-pointer hover:shadow-sm transition-shadow"
      onClick={handleRecipeClick}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-1/3 h-32 sm:h-auto bg-gray-100 relative">
          {recipe.imageUrl && (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-2 right-2">
            <button 
              className={`p-1.5 bg-white bg-opacity-80 rounded-full ${
                isFavorite ? 'text-red-500' : 'text-gray-400'
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        
        <CardContent className="p-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{recipe.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{recipe.description}</p>
            </div>
            <div className="flex items-center">
              {averageRating > 0 && (
                <>
                  <span className="text-sm text-gray-500 mr-1">{averageRating.toFixed(1)}</span>
                  <Rating value={averageRating} size="sm" />
                </>
              )}
            </div>
          </div>
          
          <div className="flex mt-2 space-x-2">
            {recipe.prepTime && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs flex items-center">
                <Clock size={12} className="mr-1" />
                {recipe.prepTime} min
              </span>
            )}
            
            {recipe.tags?.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Family Ratings */}
          {ratings.length > 0 && familyMembers.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-500 mb-2">FAMILY RATINGS</h4>
              <div className="flex items-center space-x-3">
                {ratings.map(rating => {
                  const member = familyMembers.find(m => m.id === rating.familyMemberId);
                  
                  if (!member) return null;
                  
                  return (
                    <div key={rating.id} className="flex flex-col items-center">
                      <span className="text-xs mb-1">{member.name}</span>
                      <Rating value={rating.rating} size="xs" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-2">
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
