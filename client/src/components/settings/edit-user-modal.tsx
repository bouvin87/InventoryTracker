import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const editUserSchema = z.object({
  name: z.string().min(1, "Namnet får inte vara tomt"),
  username: z.string().min(1, "Användarnamnet får inte vara tomt"),
  role: z.string().min(1, "Rollen får inte vara tom"),
  password: z.string().optional()
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (id: number, data: EditUserFormData) => Promise<void>;
}

export function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      username: "",
      role: "",
      password: ""
    }
  });

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        name: user.name,
        username: user.username,
        role: user.role,
        password: ""
      });
    }
  }, [user, isOpen, form]);

  const handleSubmit = async (data: EditUserFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Om inget lösenord anges, ta bort det från data
      const submitData = { ...data };
      if (!submitData.password || submitData.password.trim() === "") {
        delete submitData.password;
      }

      await onSave(user.id, submitData);
      onClose();
      form.reset();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editera användare</DialogTitle>
          <DialogDescription>
            Ändra användaruppgifter. Lämna lösenordsfältet tomt för att behålla nuvarande lösenord.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Namn</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Ange användarens namn"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Användarnamn</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Ange användarnamnet"
                    />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj en roll" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="operator">Operatör</SelectItem>
                      <SelectItem value="viewer">Granskare</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nytt lösenord (valfritt)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password"
                      placeholder="Lämna tomt för att behålla nuvarande"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sparar..." : "Spara ändringar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}