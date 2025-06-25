import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, User } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definiera typen för användare som kommer från API
interface UserItem {
  id: number;
  username: string;
  name: string;
  role: string;
}

export default function AuthPage() {
  const { user, isLoading, directLoginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Hämta alla användare för dropdownen
  const { data: users = [], isLoading: usersLoading } = useQuery<UserItem[]>({
    queryKey: ["/api/users"],
    staleTime: 30000, // 30 sekunder cache
  });

  // Redirect till dashboard om redan inloggad
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Hantera inloggning när användaren väljs
  const handleLogin = () => {
    if (!selectedUserId) return;

    // Använd mutationen för att logga in
    directLoginMutation.mutate({
      userId: parseInt(selectedUserId),
    });
  };

  if (isLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Användarväljare */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Inventeringssystem
            </CardTitle>
            <CardDescription>Välj vem du är för att fortsätta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="user-select" className="text-sm font-medium">
                Välj användare
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select" className="w-full">
                  <SelectValue placeholder="Välj användare" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={!selectedUserId || directLoginMutation.isPending}
            >
              {directLoginMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <User className="mr-2 h-4 w-4" />
              )}
              Logga in
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Hero section */}
      <div className="hidden md:block md:w-1/2 bg-gray-100 p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6">Inventariesystem</h1>
          <h2 className="text-2xl font-semibold mb-4">
            Hantera ditt lager enkelt och effektivt
          </h2>
          <p className="mb-6 text-gray-600">
            Med vårt inventariesystem kan du enkelt hantera och spåra alla dina
            lagerartiklar. Importera och exportera data från Excel, uppdatera
            inventeringar, och håll koll på viktinformation på ett smidigt sätt.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              Excel import/export funktionalitet
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              Spåra viktbaserad inventeringsstatus
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              Enkel användarväljare utan lösenord
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              Realtidsstatistik och filtreringsfunktioner
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
