import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ShoppingCart } from "lucide-react";
import { AppSettings as AppSettingsType } from "@/types";

interface AppSettingsProps {
  userId: number;
}

export default function AppSettings({ userId }: AppSettingsProps) {
  const queryClient = useQueryClient();
  
  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/app-settings', { userId }],
    enabled: !!userId,
    onSuccess: (data) => {
      // If no settings exist yet, create default ones
      if (!data) {
        createSettingsMutation.mutate({
          userId,
          darkMode: false,
          enableNotifications: true,
          enableBudgetTracking: true,
          instacartConnected: false
        });
      }
    }
  });
  
  // Create settings mutation
  const createSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch('/api/app-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create app settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-settings'] });
    }
  });
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<AppSettingsType>) => {
      const response = await fetch(`/api/app-settings/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update app settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-settings'] });
    }
  });
  
  const handleToggleSettings = (setting: keyof AppSettingsType, checked: boolean) => {
    updateSettingsMutation.mutate({ [setting]: checked });
  };

  return (
    <Card className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium">App Settings</h3>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : settings ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Dark Mode</h4>
                <p className="text-xs text-gray-500">Change app appearance</p>
              </div>
              <Switch 
                checked={settings.darkMode} 
                onCheckedChange={(checked) => handleToggleSettings('darkMode', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Notifications</h4>
                <p className="text-xs text-gray-500">Meal reminders and deals</p>
              </div>
              <Switch 
                checked={settings.enableNotifications} 
                onCheckedChange={(checked) => handleToggleSettings('enableNotifications', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Budget Tracking</h4>
                <p className="text-xs text-gray-500">Track grocery spending</p>
              </div>
              <Switch 
                checked={settings.enableBudgetTracking} 
                onCheckedChange={(checked) => handleToggleSettings('enableBudgetTracking', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
            
            {/* Connected Apps */}
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Connected Apps</h4>
              <div className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="text-teal-600" size={16} />
                  </div>
                  <span className="text-sm">Instacart</span>
                </div>
                <span className={`text-xs ${settings.instacartConnected ? 'text-green-600' : 'text-gray-500'}`}>
                  {settings.instacartConnected ? 'Connected' : 'Not connected'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">App settings not found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
