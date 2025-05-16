import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import DaySelector from "@/components/meal-plan/day-selector";
import MealItem from "@/components/meal-plan/meal-item";
import MealPlanShoppingList from "@/components/meal-plan/shopping-list";
import { MealPlan } from "@/types";

export default function MealPlanPage() {
  // In a real app we would fetch the authenticated user from a context or state management
  const [userId] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Get week dates
  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    
    return weekDates;
  };
  
  const weekDates = getWeekDates();
  
  // Format to YYYY-MM-DD for API query
  const formatDateForApi = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const startDate = formatDateForApi(weekDates[0]);
  const endDate = formatDateForApi(weekDates[6]);
  
  // Fetch meal plans for the selected week
  const { data: mealPlans, isLoading } = useQuery({
    queryKey: ['/api/meal-plans', userId, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/meal-plans?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meal plans');
      }
      return response.json();
    },
    enabled: !!userId
  });
  
  // Filter meals for selected date
  const selectedDateString = formatDateForApi(selectedDate);
  const mealsForSelectedDate = Array.isArray(mealPlans) 
    ? mealPlans.filter((meal: MealPlan) => meal.date.startsWith(selectedDateString)) 
    : [];
  
  // Group meals by type
  const breakfast = mealsForSelectedDate.find((meal: MealPlan) => meal.mealType === 'breakfast');
  const lunch = mealsForSelectedDate.find((meal: MealPlan) => meal.mealType === 'lunch');
  const dinner = mealsForSelectedDate.find((meal: MealPlan) => meal.mealType === 'dinner');

  return (
    <>
      <Header title="Meal Planning" showBackButton={true} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 space-y-5">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">Meal Calendar</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <i className="fas fa-chevron-left text-gray-500"></i>
              </button>
              <span className="font-medium">
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -
                {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <i className="fas fa-chevron-right text-gray-500"></i>
              </button>
            </div>
          </div>

          {/* Day Selector */}
          <DaySelector 
            days={weekDates} 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
          />

          {/* Meal Times */}
          <div className="space-y-4">
            {/* Breakfast */}
            <MealItem 
              title="Breakfast"
              meal={breakfast}
              mealType="breakfast"
              userId={userId}
              selectedDate={selectedDate}
            />

            {/* Lunch */}
            <MealItem 
              title="Lunch"
              meal={lunch}
              mealType="lunch"
              userId={userId}
              selectedDate={selectedDate}
            />

            {/* Dinner */}
            <MealItem 
              title="Dinner"
              meal={dinner}
              mealType="dinner"
              userId={userId}
              selectedDate={selectedDate}
            />

            {/* Shopping List for Day */}
            <MealPlanShoppingList userId={userId} date={selectedDate} />
          </div>
        </div>
      </main>
    </>
  );
}
