import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, CreateUserData } from "@/context/user-context";

const formSchema = z.object({
  username: z.string().min(3, "Användarnamn måste vara minst 3 tecken").max(50),
  name: z.string().min(2, "Namn måste vara minst 2 tecken").max(100),
  password: z.string().min(5, "Lösenord måste vara minst 5 tecken"),
  role: z.string().min(1, "Roll måste anges"),
});

export function UserForm() {
  const { createUser, isCreatingUser } = useUser();
  
  const form = useForm<CreateUserData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      name: "",
      password: "",
      role: "Användare",
    },
  });
  
  const onSubmit = async (data: CreateUserData) => {
    try {
      await createUser(data);
      form.reset();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Användarnamn</FormLabel>
              <FormControl>
                <Input placeholder="Användarnamn för inloggning" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visningsnamn</FormLabel>
              <FormControl>
                <Input placeholder="Namn som visas i systemet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lösenord</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Lösenord" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roll</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj roll" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Administratör">Administratör</SelectItem>
                  <SelectItem value="Användare">Användare</SelectItem>
                  <SelectItem value="Lagerarbetare">Lagerarbetare</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isCreatingUser}
        >
          {isCreatingUser ? "Skapar användare..." : "Skapa användare"}
        </Button>
      </form>
    </Form>
  );
}