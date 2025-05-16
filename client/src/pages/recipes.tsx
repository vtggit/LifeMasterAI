import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import RecipeCard from "@/components/recipes/recipe-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Recipe, FamilyMember } from "@/types";

export default function RecipesPage() {
  // In a real app we would fetch the authenticated user from a context or state management
  const [userId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState("favorites");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch recipes
  const { data: recipes, isLoading: recipesLoading } = useQuery({
    queryKey: ['/api/recipes', { userId, favorites: activeTab === "favorites" }],
    enabled: !!userId
  });

  // Fetch family members for ratings display
  const { data: familyMembers } = useQuery({
    queryKey: ['/api/family-members', { userId }],
    enabled: !!userId
  });

  // Filter recipes by search term
  const filteredRecipes = recipes?.filter((recipe: Recipe) => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <>
      <Header title="Recipes" showBackButton={true} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 space-y-5">
          {/* Recipe Tabs */}
          <Tabs defaultValue="favorites" onValueChange={setActiveTab}>
            <TabsList className="w-full border-b border-gray-200">
              <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
              <TabsTrigger value="suggested" className="flex-1">Suggested</TabsTrigger>
              <TabsTrigger value="my-recipes" className="flex-1">My Recipes</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              type="text" 
              placeholder="Search recipes..." 
              className="w-full px-4 py-2 pl-10 bg-gray-100 border-0 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Recipe List */}
          <div className="space-y-4">
            {recipesLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
              ))
            ) : filteredRecipes?.length > 0 ? (
              filteredRecipes.map((recipe: Recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  familyMembers={familyMembers} 
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed size={24} className="text-gray-500" />
                </div>
                <h3 className="font-medium">No {activeTab === "favorites" ? "favorite" : ""} recipes yet</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === "favorites" 
                    ? "Save recipes from suggestions or create your own" 
                    : "Try adding a new recipe"}
                </p>
                <button className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">
                  {activeTab === "favorites" ? "Browse suggestions" : "Add recipe"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

import { UtensilsCrossed } from "lucide-react";
