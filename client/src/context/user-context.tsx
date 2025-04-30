import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

export interface User {
  id: number;
  name: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
    select: (data: User) => data,
    // Return a default user if the API fails
    onError: () => {
      return {
        id: 1,
        name: "Anonym Användare",
        role: "Användare",
      };
    },
  });

  const value = {
    user: user || null,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
