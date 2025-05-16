import { useLocation } from "wouter";
import { Home, Tag, UtensilsCrossed, Calendar, ShoppingCart } from "lucide-react";

export default function BottomNav() {
  const [location, navigate] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <nav className="sticky bottom-0 z-10 bg-white border-t border-gray-200 pb-safe">
      <div className="grid grid-cols-5 h-16">
        <button 
          onClick={() => navigate("/")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/") ? "text-primary" : "text-gray-500"
          }`}
        >
          <Home size={20} />
          <span className="text-xs">Home</span>
        </button>
        
        <button 
          onClick={() => navigate("/deals")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/deals") ? "text-primary" : "text-gray-500"
          }`}
        >
          <Tag size={20} />
          <span className="text-xs">Deals</span>
        </button>
        
        <button 
          onClick={() => navigate("/recipes")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/recipes") ? "text-primary" : "text-gray-500"
          }`}
        >
          <UtensilsCrossed size={20} />
          <span className="text-xs">Recipes</span>
        </button>
        
        <button 
          onClick={() => navigate("/meal-plan")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/meal-plan") ? "text-primary" : "text-gray-500"
          }`}
        >
          <Calendar size={20} />
          <span className="text-xs">Meal Plan</span>
        </button>
        
        <button 
          onClick={() => navigate("/shopping")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/shopping") ? "text-primary" : "text-gray-500"
          }`}
        >
          <ShoppingCart size={20} />
          <span className="text-xs">Shopping</span>
        </button>
      </div>
    </nav>
  );
}
