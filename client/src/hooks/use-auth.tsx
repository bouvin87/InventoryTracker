import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User, insertUserSchema } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  directLoginMutation: UseMutationResult<User, Error, {userId: number}>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

const loginSchema = z.object({
  username: z.string().min(1, "Användarnamn krävs"),
  password: z.string().min(1, "Lösenord krävs"),
});

// Extend the user schema for registration
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Lösenordet måste vara minst 6 tecken"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Lösenorden matchar inte",
  path: ["confirmPassword"],
});

export type RegisterData = z.infer<typeof registerSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      return await apiRequest<User>("POST", "/api/login", credentials);
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Inloggning lyckades",
        description: `Välkommen ${user.name}!`,
      });
      
      // Omdirigera till startsidan
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Inloggning misslyckades",
        description: error.message || "Fel användarnamn eller lösenord",
        variant: "destructive",
      });
    },
  });
  
  const directLoginMutation = useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      return await apiRequest<User>("POST", `/api/login/user/${userId}`);
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Inloggning lyckades",
        description: `Välkommen ${user.name}!`,
      });
      
      // Uppdatera sidan för att säkerställa att allt uppdateras korrekt
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Inloggning misslyckades",
        description: error.message || "Kunde inte logga in med valt användar-ID",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = data;
      return await apiRequest<User>("POST", "/api/register", userData);
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registrering lyckades",
        description: `Välkommen ${user.name}!`,
      });
      
      // Omdirigera till startsidan
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Registrering misslyckades",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Skicka false för att inte försöka tolka svaret som JSON
      await apiRequest("POST", "/api/logout", undefined, false);
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Du har loggat ut",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Utloggning misslyckades",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        directLoginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { loginSchema, registerSchema };