import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import WeeklySummary from "@/components/home/weekly-summary";
import GroceryDeals from "@/components/home/grocery-deals";
import AiSuggestions from "@/components/home/ai-suggestions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ShoppingCartIcon, CookingPotIcon, SettingsIcon, ActivityIcon, ClockIcon } from "lucide-react";

export default function HomePage() {
  // In a real app we would fetch the authenticated user from a context or state management
  // For this demo, we'll use a mock user ID
  const [userId] = useState<number>(1);

  // Activity cards for the dashboard
  const activityCards = [
    {
      title: "Meal Planning",
      description: "Plan your weekly meals, browse recipes",
      icon: <CookingPotIcon className="h-6 w-6" />,
      path: "/meal-plan",
      color: "bg-green-50",
      iconColor: "text-green-500"
    },
    {
      title: "Shopping",
      description: "Manage lists, track grocery deals",
      icon: <ShoppingCartIcon className="h-6 w-6" />,
      path: "/shopping",
      color: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      title: "Calendar",
      description: "Schedule and organize your week",
      icon: <CalendarIcon className="h-6 w-6" />,
      path: "/calendar",
      color: "bg-purple-50",
      iconColor: "text-purple-500"
    },
    {
      title: "Time Management",
      description: "Track tasks and set reminders",
      icon: <ClockIcon className="h-6 w-6" />,
      path: "/time",
      color: "bg-orange-50",
      iconColor: "text-orange-500"
    },
    {
      title: "Activity Tracking",
      description: "Monitor your daily activities",
      icon: <ActivityIcon className="h-6 w-6" />,
      path: "/activity",
      color: "bg-pink-50",
      iconColor: "text-pink-500"
    },
    {
      title: "Settings",
      description: "Customize your preferences",
      icon: <SettingsIcon className="h-6 w-6" />,
      path: "/settings",
      color: "bg-gray-50",
      iconColor: "text-gray-500"
    }
  ];

  return (
    <>
      <Header title="Life Organizer" showBackButton={false} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-dark">Welcome back</h1>
              <p className="text-gray-600">Your daily organization hub</p>
            </div>
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white">
              <span className="font-medium">JD</span>
            </div>
          </div>
          
          {/* Activity Dashboard */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {activityCards.map((card, index) => (
                <Link key={index} href={card.path}>
                  <Card className={`h-full cursor-pointer hover:shadow-md transition-shadow ${card.color} border-none`}>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div className={`p-3 rounded-full ${card.iconColor} bg-white mb-3`}>
                        {card.icon}
                      </div>
                      <CardTitle className="text-md mb-1">{card.title}</CardTitle>
                      <CardDescription className="text-xs">{card.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
          
          {/* Weekly Summary - Include but smaller */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">This Week's Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklySummary userId={userId} />
            </CardContent>
          </Card>
          
          {/* Grocery Deals - Show as one component of the app */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current Grocery Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <GroceryDeals userId={userId} />
            </CardContent>
          </Card>
          
          {/* AI Suggestions - More general, not just meals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">AI-Powered Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <AiSuggestions userId={userId} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
