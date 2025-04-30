import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: number;
  name: string;
  role: string;
  username?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  allUsers: User[];
  areAllUsersLoading: boolean;
  selectUser: (userId: number) => Promise<void>;
  isSelecting: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  allUsers: [],
  areAllUsersLoading: true,
  selectUser: async () => {},
  isSelecting: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Hämta aktuell användare
  const { 
    data: user, 
    isLoading 
  } = useQuery<User>({
    queryKey: ['/api/user'],
  });
  
  // Hämta alla användare
  const { 
    data: allUsers = [], 
    isLoading: areAllUsersLoading 
  } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Mutation för att välja användare
  const {
    mutateAsync: selectUserMutation,
    isPending: isSelecting,
  } = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest<User>('POST', '/api/user/select', { userId });
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(['/api/user'], newUser);
      toast({
        title: "Användare bytt",
        description: `Du är nu inloggad som ${newUser.name}`,
      });
    },
    onError: () => {
      toast({
        title: "Fel vid byte av användare",
        description: "Kunde inte byta användare",
        variant: "destructive",
      });
    },
  });

  // Funktion för att välja användare
  const selectUser = async (userId: number) => {
    await selectUserMutation(userId);
  };

  const value = {
    user: user || null,
    isLoading,
    allUsers,
    areAllUsersLoading,
    selectUser,
    isSelecting,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
