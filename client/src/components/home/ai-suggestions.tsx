import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, Calendar, Star, BrainCircuit, ShoppingCart, Clock } from "lucide-react";
import { MealSuggestion } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AiSuggestionsProps {
  userId: number;
}

// Mock suggestions for different categories to demonstrate expanded app functionality
const mockSuggestions = {
  meals: {
    title: "Weeknight Pasta Primavera",
    description: "A quick and nutritious dinner using seasonal vegetables on sale this week.",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=500&q=80",
    dealItems: ["Bell peppers", "Zucchini", "Cherry tomatoes"],
    tags: ["Quick", "Vegetarian", "Budget-friendly"],
    rating: 4.5,
    type: "meal"
  },
  shopping: {
    title: "Smart Shopping Trip",
    description: "Plan your shopping on Tuesday morning when the store is 40% less crowded.",
    imageUrl: "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?auto=format&fit=crop&w=500&q=80",
    tags: ["Time-saving", "Cost-effective"],
    rating: 4.8,
    type: "shopping"
  },
  schedule: {
    title: "Optimize your week",
    description: "Block 2 hours on Thursday for meal prep to save 5 hours during the week.",
    imageUrl: "https://images.unsplash.com/photo-1606103920295-9a091668705c?auto=format&fit=crop&w=500&q=80",
    tags: ["Productivity", "Time management"],
    rating: 4.7,
    type: "schedule"
  }
};

export default function AiSuggestions({ userId }: AiSuggestionsProps) {
  const [activeTab, setActiveTab] = useState("meals");
  
  // Mock loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Icons for each tab
  const tabIcons = {
    meals: <Utensils className="w-4 h-4 mr-2" />,
    shopping: <ShoppingCart className="w-4 h-4 mr-2" />,
    schedule: <Calendar className="w-4 h-4 mr-2" />
  };
  
  // Get current suggestion based on active tab
  const suggestion = mockSuggestions[activeTab as keyof typeof mockSuggestions];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="meals" onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="meals" className="flex items-center">
            {tabIcons.meals} Meals
          </TabsTrigger>
          <TabsTrigger value="shopping" className="flex items-center">
            {tabIcons.shopping} Shopping
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center">
            {tabIcons.schedule} Schedule
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="meals" className="pt-2">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : suggestion ? (
            <SuggestionCard suggestion={suggestion} />
          ) : null}
        </TabsContent>
        
        <TabsContent value="shopping" className="pt-2">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : suggestion ? (
            <SuggestionCard suggestion={suggestion} />
          ) : null}
        </TabsContent>
        
        <TabsContent value="schedule" className="pt-2">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : suggestion ? (
            <SuggestionCard suggestion={suggestion} />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Common suggestion card component
function SuggestionCard({ suggestion }: { suggestion: any }) {
  return (
    <div className="relative rounded-lg border border-gray-100 overflow-hidden bg-white">
      {suggestion.imageUrl && (
        <img 
          src={suggestion.imageUrl} 
          alt={suggestion.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-center">
          <h3 className="font-medium flex-1">{suggestion.title}</h3>
          <div className="flex items-center ml-2">
            <span className="text-sm text-gray-600 mr-1">{suggestion.rating?.toFixed(1)}</span>
            <Star size={16} className="text-amber-400" />
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          {suggestion.description}
        </p>
        
        {suggestion.dealItems && (
          <p className="text-sm text-primary mt-1 font-medium">
            Using: {suggestion.dealItems.join(", ")}
          </p>
        )}
        
        <div className="flex mt-3 flex-wrap gap-2">
          {suggestion.tags?.map((tag: string, index: number) => (
            <span 
              key={index}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <button className="px-3 py-1.5 bg-primary text-white rounded-md text-sm flex items-center hover:bg-primary/90">
            <BrainCircuit size={16} className="mr-2" />
            Apply suggestion
          </button>
          
          {suggestion.type === "schedule" && (
            <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 flex items-center hover:bg-gray-50">
              <Clock size={16} className="mr-2" />
              Schedule
            </button>
          )}
          
          {suggestion.type === "meal" && (
            <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 flex items-center hover:bg-gray-50">
              <Utensils size={16} className="mr-2" />
              Add to plan
            </button>
          )}
          
          {suggestion.type === "shopping" && (
            <button className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 flex items-center hover:bg-gray-50">
              <ShoppingCart size={16} className="mr-2" />
              Shopping list
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
