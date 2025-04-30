import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Clear all batches
  const clearAllBatchesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/batches', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear batches');
      }
      
      return response.json();
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

  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  
  // Hårdkodade användardata istället för att använda useUser
  const users = [
    { id: 1, name: "John Doe", role: "Lageransvarig" },
    { id: 2, name: "Anna Svensson", role: "Inventerare" },
    { id: 3, name: "Erik Johansson", role: "Inventerare" },
    { id: 4, name: "Maria Larsson", role: "Lageransvarig" }
  ];
  
  const currentUser = users[currentUserIndex];
  
  const handleUserChange = async (userIndexString: string) => {
    const userIndex = parseInt(userIndexString);
    setCurrentUserIndex(userIndex);
    
    // Visa ett meddelande efter användarval
    toast({
      title: "Användare bytt",
      description: `Du är nu inloggad som ${users[userIndex].name}`,
    });
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User management section */}
            <Card>
              <CardHeader>
                <CardTitle>Användare</CardTitle>
                <CardDescription>
                  Välj användare för inventering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Aktuell användare</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {currentUser.name} ({currentUser.role})
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-select">Byt användare</Label>
                    <Select onValueChange={handleUserChange} defaultValue={currentUserIndex.toString()}>
                      <SelectTrigger id="user-select" className="w-full">
                        <SelectValue placeholder="Välj användare" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user, index) => (
                          <SelectItem key={user.id} value={index.toString()}>
                            {user.name} - {user.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
      </main>
    </div>
  );
}