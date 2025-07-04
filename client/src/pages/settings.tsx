import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EditUserModal } from "@/components/settings/edit-user-modal";
import { AddUserModal } from "@/components/settings/add-user-modal";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
}

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Hämta alla användare
  const { data: allUsers = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Clear all batches
  const clearAllBatchesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/batches");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batches'] });
      toast({
        title: "Rensning klar",
        description: "Alla artiklar har rensats från listan",
      });
    },
    onError: () => {
      toast({
        title: "Rensning misslyckades",
        description: "Det gick inte att rensa artiklarna",
        variant: "destructive",
      });
    }
  });
  
  const handleClearAll = () => {
    if (window.confirm('Är du säker på att du vill rensa hela listan? Denna åtgärd kan inte ångras.')) {
      clearAllBatchesMutation.mutate();
    }
  };

  // Hämta användarinformation från auth context
  const { user, logoutMutation } = useAuth();

  // Editera användare
  const editUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PUT", `/api/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Användare uppdaterad",
        description: "Användaruppgifterna har sparats",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fel vid uppdatering",
        description: error.message || "Det gick inte att uppdatera användaren",
        variant: "destructive",
      });
    }
  });

  // Lägg till användare
  const addUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/register", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Användare skapad",
        description: "Den nya användaren har lagts till",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fel vid skapande",
        description: error.message || "Det gick inte att skapa användaren",
        variant: "destructive",
      });
    }
  });

  // Ta bort användare
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Användare borttagen",
        description: "Användaren har tagits bort från systemet",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fel vid borttagning",
        description: error.message || "Det gick inte att ta bort användaren",
        variant: "destructive",
      });
    }
  });

  const handleEditUser = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditUserModalOpen(true);
  };

  const handleDeleteUser = (userToDelete: User) => {
    if (window.confirm(`Är du säker på att du vill ta bort användaren "${userToDelete.name}"? Denna åtgärd kan inte ångras.`)) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const handleSaveUser = async (id: number, data: any) => {
    await editUserMutation.mutateAsync({ id, data });
  };

  const handleAddUser = async (data: any) => {
    await addUserMutation.mutateAsync(data);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-20">
        <Button
          onClick={() => setIsSidebarOpen(true)}
          className="bg-primary text-white p-3 rounded-full shadow-lg flex items-center justify-center h-12 w-12"
        >
          <span className="material-icons">menu</span>
        </Button>
      </div>
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-10">
        <TopBar 
          toggleSidebar={() => setIsSidebarOpen(true)} 
          onSearch={() => {}} // No search functionality on settings page
          onAddBatch={() => {}} // No add batch functionality on settings page
        />
        
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Inställningar</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User info section */}
            <Card>
              <CardHeader>
                <CardTitle>Användarinformation</CardTitle>
                <CardDescription>
                  Information om inloggad användare
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Inloggad som</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {user?.name} ({user?.role})
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium">Användare</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {user?.username}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => logoutMutation.mutate()}
                  variant="outline"
                  className="w-full"
                >
                  <span className="material-icons mr-2 text-sm">logout</span>
                  Logga ut
                </Button>
              </CardFooter>
            </Card>

            {/* User management section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Användarhantering</span>
                  <Button 
                    size="sm"
                    onClick={() => setAddUserModalOpen(true)}
                    className="ml-4"
                  >
                    <span className="material-icons mr-1 text-sm">add</span>
                    Lägg till
                  </Button>
                </CardTitle>
                <CardDescription>
                  Hantera användarkonton i systemet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersLoading ? (
                    <div className="text-sm text-gray-500">Laddar användare...</div>
                  ) : (
                    <div className="space-y-3">
                      {allUsers.map((userItem) => (
                        <div key={userItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{userItem.name}</span>
                              <Badge variant={userItem.role === 'admin' ? 'default' : 'secondary'}>
                                {userItem.role}
                              </Badge>
                              {user?.id === userItem.id && (
                                <Badge variant="outline">Du</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">@{userItem.username}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(userItem)}
                            >
                              <span className="material-icons text-sm">edit</span>
                            </Button>
                            {user?.id !== userItem.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(userItem)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <span className="material-icons text-sm">delete</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Data management section */}
            <Card>
              <CardHeader>
                <CardTitle>Datahantering</CardTitle>
                <CardDescription>
                  Hantera inventariedata och systemkonfiguration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Rensa all data</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Ta bort alla artiklar från inventarielistan. Den här åtgärden kan inte ångras.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  onClick={handleClearAll}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <span className="material-icons mr-2 text-sm">delete_sweep</span>
                  Rensa alla artiklar
                </Button>
              </CardFooter>
            </Card>
            
            {/* System section */}
            <Card>
              <CardHeader>
                <CardTitle>Systeminformation</CardTitle>
                <CardDescription>
                  Information om systemet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Systemversion</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Batchinventering v1.0.0
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium">Teknisk support</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Vid tekniska problem, kontakta systemadministratören.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit User Modal */}
        <EditUserModal
          isOpen={editUserModalOpen}
          onClose={() => setEditUserModalOpen(false)}
          user={selectedUser}
          onSave={handleSaveUser}
        />

        {/* Add User Modal */}
        <AddUserModal
          isOpen={addUserModalOpen}
          onClose={() => setAddUserModalOpen(false)}
          onAdd={handleAddUser}
        />
      </main>
    </div>
  );
}