import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, User } from "lucide-react";
import { User as UserType, FamilyMember } from "@/types";

interface ProfileSectionProps {
  userId: number;
}

export default function ProfileSection({ userId }: ProfileSectionProps) {
  const queryClient = useQueryClient();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberColor, setNewMemberColor] = useState("#4F46E5");
  
  // Fetch user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !!userId
  });
  
  // Fetch family members
  const { data: familyMembers, isLoading: membersLoading } = useQuery({
    queryKey: ['/api/family-members', { userId }],
    enabled: !!userId
  });
  
  // Add family member mutation
  const addMemberMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: newMemberName,
          color: newMemberColor,
          isAdmin: false
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add family member');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-members'] });
      setIsAddMemberOpen(false);
      setNewMemberName("");
    }
  });
  
  // Delete family member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/family-members/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete family member');
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-members'] });
    }
  });
  
  const handleAddMember = () => {
    if (newMemberName.trim()) {
      addMemberMutation.mutate();
    }
  };
  
  const handleDeleteMember = (id: number) => {
    deleteMemberMutation.mutate(id);
  };

  return (
    <Card className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium">Profile</h3>
      </CardHeader>
      <CardContent className="p-4">
        {userLoading ? (
          <div className="animate-pulse flex items-center space-x-4 mb-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-white">
              <User size={24} />
            </div>
            <div>
              <h4 className="font-medium">{user.username}'s Family</h4>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto h-8 w-8 p-0">
              <Pencil size={16} />
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">User profile not found</p>
          </div>
        )}
        
        <h4 className="font-medium text-sm mt-4 mb-2">Family Members</h4>
        {membersLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : familyMembers?.length > 0 ? (
          <div className="space-y-3">
            {familyMembers.map((member: FamilyMember) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: member.color }}
                  >
                    <User size={16} />
                  </div>
                  <span className="text-sm font-medium">
                    {member.name} {member.isAdmin ? '(You)' : ''}
                  </span>
                </div>
                {member.isAdmin ? (
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">Admin</span>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Pencil size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                      onClick={() => handleDeleteMember(member.id)}
                      disabled={deleteMemberMutation.isPending}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2 text-primary text-sm font-medium mt-2 p-0 h-auto"
                >
                  <Plus size={14} />
                  <span>Add family member</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name"
                      placeholder="Family member name" 
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="color"
                        type="color" 
                        value={newMemberColor}
                        onChange={(e) => setNewMemberColor(e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <div 
                        className="h-10 w-10 rounded-full"
                        style={{ backgroundColor: newMemberColor }}
                      ></div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddMember} 
                    disabled={!newMemberName.trim() || addMemberMutation.isPending}
                  >
                    {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No family members</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => setIsAddMemberOpen(true)}
            >
              Add family member
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
