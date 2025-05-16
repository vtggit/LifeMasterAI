import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import BottomNav from "@/components/layout/bottom-nav";
import HomePage from "@/pages/home";
import DealsPage from "@/pages/deals";
import RecipesPage from "@/pages/recipes";
import MealPlanPage from "@/pages/meal-plan";
import ShoppingPage from "@/pages/shopping";
import SettingsPage from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/deals" component={DealsPage} />
      <Route path="/recipes" component={RecipesPage} />
      <Route path="/meal-plan" component={MealPlanPage} />
      <Route path="/shopping" component={ShoppingPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <div className="app-container flex flex-col min-h-screen max-w-md mx-auto bg-white">
        <Toaster />
        <Router />
        <BottomNav />
      </div>
    </TooltipProvider>
  );
}

export default App;
