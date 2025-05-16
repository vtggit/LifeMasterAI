import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { DietaryPreference } from "@/types";

interface DietaryPreferencesProps {
  userId: number;
}

export default function DietaryPreferences({ userId }: DietaryPreferencesProps) {
  const queryClient = useQueryClient();
  const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false);
  const [isAddDislikeOpen, setIsAddDislikeOpen] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");
  const [newDislike, setNewDislike] = useState("");
  
  // Fetch dietary preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/dietary-preferences', { userId }],
    enabled: !!userId,
    onSuccess: (data) => {
      // If no preferences exist yet, create default one
      if (!data) {
        createDietaryPrefsMutation.mutate({
          userId,
          allergies: [],
          dietTypes: [],
          dislikes: []
        });
      }
    }
  });
  
  // Create dietary preferences mutation
  const createDietaryPrefsMutation = useMutation({
    mutationFn: async (prefs: any) => {
      const response = await fetch('/api/dietary-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create dietary preferences');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dietary-preferences'] });
    }
  });
  
  // Update dietary preferences mutation
  const updateDietaryPrefsMutation = useMutation({
    mutationFn: async (prefs: Partial<DietaryPreference>) => {
      const response = await fetch(`/api/dietary-preferences/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update dietary preferences');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dietary-preferences'] });
    }
  });
  
  const handleAddAllergy = () => {
    if (newAllergy.trim() && preferences) {
      const allergies = [...(preferences.allergies || []), newAllergy.trim()];
      updateDietaryPrefsMutation.mutate({ allergies });
      setNewAllergy("");
      setIsAddAllergyOpen(false);
    }
  };
  
  const handleRemoveAllergy = (allergy: string) => {
    if (preferences) {
      const allergies = (preferences.allergies || []).filter(a => a !== allergy);
      updateDietaryPrefsMutation.mutate({ allergies });
    }
  };
  
  const handleAddDislike = () => {
    if (newDislike.trim() && preferences) {
      const dislikes = [...(preferences.dislikes || []), newDislike.trim()];
      updateDietaryPrefsMutation.mutate({ dislikes });
      setNewDislike("");
      setIsAddDislikeOpen(false);
    }
  };
  
  const handleRemoveDislike = (dislike: string) => {
    if (preferences) {
      const dislikes = (preferences.dislikes || []).filter(d => d !== dislike);
      updateDietaryPrefsMutation.mutate({ dislikes });
    }
  };
  
  const handleToggleDietType = (type: string, checked: boolean) => {
    if (preferences) {
      let dietTypes = [...(preferences.dietTypes || [])];
      
      if (checked) {
        dietTypes.push(type);
      } else {
        dietTypes = dietTypes.filter(t => t !== type);
      }
      
      updateDietaryPrefsMutation.mutate({ dietTypes });
    }
  };
  
  const isDietTypeChecked = (type: string) => {
    return preferences?.dietTypes?.includes(type) || false;
  };

  return (
    <Card className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium">Dietary Preferences</h3>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            <h4 className="font-medium text-sm mb-3">Allergies & Restrictions</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {preferences?.allergies?.map((allergy: string) => (
                <div 
                  key={allergy}
                  className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {allergy}
                  <button 
                    className="ml-2"
                    onClick={() => handleRemoveAllergy(allergy)}
                    disabled={updateDietaryPrefsMutation.isPending}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <Dialog open={isAddAllergyOpen} onOpenChange={setIsAddAllergyOpen}>
                <DialogTrigger asChild>
                  <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm cursor-pointer flex items-center">
                    <Plus size={14} className="mr-1" />
                    Add allergy
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Allergy or Restriction</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="allergy">Allergy or Restriction</Label>
                      <Input 
                        id="allergy"
                        placeholder="Enter allergy or restriction" 
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddAllergyOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddAllergy} 
                      disabled={!newAllergy.trim() || updateDietaryPrefsMutation.isPending}
                    >
                      {updateDietaryPrefsMutation.isPending ? 'Adding...' : 'Add'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <h4 className="font-medium text-sm mb-3">Diet Types</h4>
            <div className="space-y-2 mb-4">
              <div className="flex items-center">
                <Checkbox 
                  id="vegetarian" 
                  checked={isDietTypeChecked('vegetarian')}
                  onCheckedChange={(checked) => handleToggleDietType('vegetarian', !!checked)}
                  className="mr-3 h-4 w-4"
                />
                <label htmlFor="vegetarian" className="text-sm">Vegetarian</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="vegan" 
                  checked={isDietTypeChecked('vegan')}
                  onCheckedChange={(checked) => handleToggleDietType('vegan', !!checked)}
                  className="mr-3 h-4 w-4"
                />
                <label htmlFor="vegan" className="text-sm">Vegan</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="glutenFree" 
                  checked={isDietTypeChecked('gluten-free')}
                  onCheckedChange={(checked) => handleToggleDietType('gluten-free', !!checked)}
                  className="mr-3 h-4 w-4"
                />
                <label htmlFor="glutenFree" className="text-sm">Gluten-free</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="keto" 
                  checked={isDietTypeChecked('keto')}
                  onCheckedChange={(checked) => handleToggleDietType('keto', !!checked)}
                  className="mr-3 h-4 w-4"
                />
                <label htmlFor="keto" className="text-sm">Keto</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="lowCarb" 
                  checked={isDietTypeChecked('low-carb')}
                  onCheckedChange={(checked) => handleToggleDietType('low-carb', !!checked)}
                  className="mr-3 h-4 w-4"
                />
                <label htmlFor="lowCarb" className="text-sm">Low-carb</label>
              </div>
            </div>
            
            <h4 className="font-medium text-sm mb-3">Dislikes</h4>
            <div className="flex flex-wrap gap-2">
              {preferences?.dislikes?.map((dislike: string) => (
                <div 
                  key={dislike}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {dislike}
                  <button 
                    className="ml-2"
                    onClick={() => handleRemoveDislike(dislike)}
                    disabled={updateDietaryPrefsMutation.isPending}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <Dialog open={isAddDislikeOpen} onOpenChange={setIsAddDislikeOpen}>
                <DialogTrigger asChild>
                  <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm cursor-pointer flex items-center">
                    <Plus size={14} className="mr-1" />
                    Add dislike
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Food Dislike</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="dislike">Food Dislike</Label>
                      <Input 
                        id="dislike"
                        placeholder="Enter food dislike" 
                        value={newDislike}
                        onChange={(e) => setNewDislike(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDislikeOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddDislike} 
                      disabled={!newDislike.trim() || updateDietaryPrefsMutation.isPending}
                    >
                      {updateDietaryPrefsMutation.isPending ? 'Adding...' : 'Add'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
