import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MealPlan } from "@/types";
import { useLocation } from "wouter";

interface TodaysMealsProps {
  userId: number;
}

export default function TodaysMeals({ userId }: TodaysMealsProps) {
  const [, navigate] = useLocation();
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Get the end of today
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);
  
  // Fetch today's meals
  const { data: meals, isLoading } = useQuery({
    queryKey: ['/api/meal-plans', { 
      userId, 
      startDate: todayString, 
      endDate: endOfToday.toISOString() 
    }],
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="flex space-x-3 overflow-x-auto pb-2">
        <Skeleton className="flex-shrink-0 w-36 h-32 rounded-lg" />
        <Skeleton className="flex-shrink-0 w-36 h-32 rounded-lg" />
      </div>
    );
  }

  if (!meals || meals.length === 0) {
    return (
      <Card className="text-center p-4 bg-gray-50">
        <CardContent>
          <p className="text-sm text-gray-500">No meals planned for today</p>
          <button 
            className="mt-2 text-sm text-primary font-medium"
            onClick={() => navigate("/meal-plan")}
          >
            Add a meal
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex space-x-3 overflow-x-auto pb-2">
      {meals.map((meal: MealPlan) => (
        <div 
          key={meal.id}
          className="flex-shrink-0 w-36 rounded-lg border border-gray-100 overflow-hidden"
          onClick={() => navigate(`/meal-plan`)}
        >
          <div className="h-20 bg-gray-100 relative">
            {/* We would fetch the actual recipe image here if available */}
            <img 
              src={`https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300`} 
              alt={meal.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 left-2 bg-white px-2 py-0.5 rounded text-xs font-medium">
              {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
            </span>
          </div>
          <div className="p-2">
            <h4 className="font-medium text-sm truncate">{meal.title}</h4>
            <div className="flex items-center mt-1">
              {meal.calories && (
                <>
                  <span className="text-xs text-gray-500">{meal.calories} cal</span>
                  <span className="mx-1 text-gray-300">•</span>
                </>
              )}
              {meal.prepTime && (
                <span className="text-xs text-gray-500">{meal.prepTime}m</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
