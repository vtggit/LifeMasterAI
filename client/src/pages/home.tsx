import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import WeeklySummary from "@/components/home/weekly-summary";
import GroceryDeals from "@/components/home/grocery-deals";
import AiSuggestions from "@/components/home/ai-suggestions";
import TodaysMeals from "@/components/home/todays-meals";

export default function HomePage() {
  // In a real app we would fetch the authenticated user from a context or state management
  // For this demo, we'll use a mock user ID
  const [userId] = useState<number>(1);

  return (
    <>
      <Header title="Home" showBackButton={false} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-dark">Welcome back</h1>
              <p className="text-gray-600">Let's plan your meals for the week</p>
            </div>
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white">
              <span className="font-medium">JD</span>
            </div>
          </div>
          
          {/* Weekly Summary */}
          <WeeklySummary userId={userId} />
          
          {/* Grocery Deals */}
          <GroceryDeals userId={userId} />
          
          {/* AI Meal Suggestions */}
          <AiSuggestions userId={userId} />
        </div>
      </main>
    </>
  );
}
