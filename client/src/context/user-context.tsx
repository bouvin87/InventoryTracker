import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: number;
  name: string;
  role: string;
  username?: string;
}

export interface CreateUserData {
  username: string;
  name: string;
  password: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  allUsers: User[];
  areAllUsersLoading: boolean;
  selectUser: (userId: number) => Promise<void>;
  isSelecting: boolean;
  createUser: (userData: CreateUserData) => Promise<void>;
  isCreatingUser: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  allUsers: [],
  areAllUsersLoading: true,
  selectUser: async () => {},
  isSelecting: false,
  createUser: async () => {},
  isCreatingUser: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Hämta aktuell användare
  const { 
    data: user, 
    isLoading 
  } = useQuery<User>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user', { credentials: 'include' });
        if (response.status === 401) return null;
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    }
  });
  
  // Hämta alla användare
  const { 
    data: allUsers = [], 
    isLoading: areAllUsersLoading 
  } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/users', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    }
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

  // Mutation för att skapa användare
  const {
    mutateAsync: createUserMutation,
    isPending: isCreatingUser,
  } = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      return apiRequest<User>('POST', '/api/users', userData);
    },
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Användare skapad",
        description: `Användare ${newUser.name} har skapats`,
      });
    },
    onError: (error) => {
      toast({
        title: "Fel vid skapande av användare",
        description: error instanceof Error ? error.message : "Kunde inte skapa användare",
        variant: "destructive",
      });
    },
  });

  // Funktion för att välja användare
  const selectUser = async (userId: number) => {
    await selectUserMutation(userId);
  };
  
  // Funktion för att skapa användare
  const createUser = async (userData: CreateUserData) => {
    await createUserMutation(userData);
  };

  const value = {
    user: user || null,
    isLoading,
    allUsers,
    areAllUsersLoading,
    selectUser,
    isSelecting,
    createUser,
    isCreatingUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
