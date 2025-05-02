import { useState, useEffect } from "react";
import { useAuth, loginSchema, registerSchema, type RegisterData } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState("login");

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      name: "",
      password: "",
      confirmPassword: "",
      role: "Inventerare",
    },
  });

  function onLoginSubmit(values: { username: string; password: string }) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(values: RegisterData) {
    registerMutation.mutate(values);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Login/Register Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Inventariesystem</CardTitle>
            <CardDescription>
              Logga in för att fortsätta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Logga in</TabsTrigger>
                <TabsTrigger value="register">Skapa konto</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Användarnamn</FormLabel>
                          <FormControl>
                            <Input placeholder="Ange användarnamn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lösenord</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Ange lösenord" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Logga in
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Användarnamn</FormLabel>
                          <FormControl>
                            <Input placeholder="Välj användarnamn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Namn</FormLabel>
                          <FormControl>
                            <Input placeholder="Ange ditt namn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roll</FormLabel>
                          <FormControl>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              {...field}
                            >
                              <option value="Inventerare">Inventerare</option>
                              <option value="Lageransvarig">Lageransvarig</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lösenord</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Välj lösenord" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bekräfta lösenord</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Bekräfta lösenord" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Skapa konto
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-center text-sm">
            {tab === "login" ? (
              <p>
                Har du inget konto?{" "}
                <a
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => setTab("register")}
                >
                  Skapa ett här
                </a>
              </p>
            ) : (
              <p>
                Har du redan ett konto?{" "}
                <a
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => setTab("login")}
                >
                  Logga in här
                </a>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Hero section */}
      <div className="hidden md:block md:w-1/2 bg-gray-100 p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6">Inventariesystem</h1>
          <h2 className="text-2xl font-semibold mb-4">Hantera ditt lager enkelt och effektivt</h2>
          <p className="mb-6 text-gray-600">
            Med vårt inventariesystem kan du enkelt hantera och spåra alla dina lagerartiklar. 
            Importera och exportera data från Excel, uppdatera inventeringar, och håll koll på 
            viktinformation på ett smidigt sätt.
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
              Hantera olika användare och roller
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