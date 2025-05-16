import { useState } from "react";
import Header from "@/components/layout/header";
import ProfileSection from "@/components/settings/profile-section";
import DietaryPreferences from "@/components/settings/dietary-preferences";
import GroceryStores from "@/components/settings/grocery-stores";
import AppSettings from "@/components/settings/app-settings";
import { Button } from "@/components/ui/button";
import { CircleHelp, LogOutIcon } from "lucide-react";

export default function SettingsPage() {
  // In a real app we would fetch the authenticated user from a context or state management
  const [userId] = useState<number>(1);

  const handleLogOut = () => {
    console.log("Log out clicked");
    // In a real app, we would clear auth state and redirect to login
  };

  return (
    <>
      <Header title="Settings" showBackButton={true} showSettingsButton={false} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 space-y-5">
          <h2 className="font-semibold text-xl">Settings</h2>
          
          {/* Profile Section */}
          <ProfileSection userId={userId} />
          
          {/* Dietary Preferences */}
          <DietaryPreferences userId={userId} />
          
          {/* Grocery Stores */}
          <GroceryStores userId={userId} />
          
          {/* App Settings */}
          <AppSettings userId={userId} />
          
          {/* Account Actions */}
          <div className="mt-4 space-y-3">
            <Button 
              variant="outline" 
              className="w-full py-3 text-center text-gray-800 font-medium"
            >
              <CircleHelp className="mr-2 h-4 w-4" />
              Help & Support
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-3 text-center text-red-600 font-medium"
              onClick={handleLogOut}
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
