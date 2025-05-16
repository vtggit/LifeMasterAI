import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MealPlan } from "@/types";

interface WeeklySummaryProps {
  userId: number;
}

export default function WeeklySummary({ userId }: WeeklySummaryProps) {
  const [, navigate] = useLocation();
  const today = new Date();
  
  // Get start and end of current week (Sunday to Saturday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const { data: mealPlans, isLoading } = useQuery({
    queryKey: ['/api/meal-plans', { 
      userId, 
      startDate: startOfWeek.toISOString(), 
      endDate: endOfWeek.toISOString() 
    }],
    enabled: !!userId
  });

  // Filter for today's meals
  const todayString = today.toISOString().split('T')[0];
  const todaysMeals = mealPlans?.filter((meal: MealPlan) => 
    meal.date.startsWith(todayString)
  );

  // Calculate completion percentage
  const daysInWeek = 7;
  const daysWithMeals = mealPlans ? new Set(
    mealPlans.map((meal: MealPlan) => meal.date.split('T')[0])
  ).size : 0;
  
  const progressPercentage = Math.round((daysWithMeals / daysInWeek) * 100);

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader className="pb-0 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">This Week's Plan</CardTitle>
          <button 
            className="text-primary text-sm font-medium"
            onClick={() => navigate("/meal-plan")}
          >
            View All
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        {/* Weekly Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                `${daysWithMeals} of ${daysInWeek} days planned`
              )}
            </span>
            <span className="font-medium">
              {isLoading ? (
                <Skeleton className="h-4 w-10" />
              ) : (
                `${progressPercentage}%`
              )}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            {isLoading ? (
              <Skeleton className="h-full w-1/2" />
            ) : (
              <div 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            )}
          </div>
        </div>
        
        {/* Today's Meals */}
        <div>
          <h3 className="font-medium text-sm text-gray-500 mb-2">TODAY</h3>
          
          {isLoading ? (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              <Skeleton className="flex-shrink-0 w-36 h-32 rounded-lg" />
              <Skeleton className="flex-shrink-0 w-36 h-32 rounded-lg" />
            </div>
          ) : todaysMeals?.length ? (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {todaysMeals.map((meal: MealPlan) => (
                <div 
                  key={meal.id}
                  className="flex-shrink-0 w-36 rounded-lg border border-gray-100 overflow-hidden"
                >
                  <div className="h-20 bg-gray-100 relative">
                    {meal.recipeId && (
                      <img 
                        src={`https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300`} 
                        alt={meal.title}
                        className="w-full h-full object-cover"
                      />
                    )}
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
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">No meals planned for today</p>
              <button 
                className="mt-2 text-sm text-primary font-medium"
                onClick={() => navigate("/meal-plan")}
              >
                Add a meal
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
