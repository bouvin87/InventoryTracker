// Shared user data
export interface User {
  id: number;
  name: string;
  role: string;
}

export const users: User[] = [
  { id: 1, name: "John Doe", role: "Lageransvarig" },
  { id: 2, name: "Anna Svensson", role: "Inventerare" },
  { id: 3, name: "Erik Johansson", role: "Inventerare" },
  { id: 4, name: "Maria Larsson", role: "Lageransvarig" }
];

// Globally stored setting for user's choice
let currentUserIndex = 0;

export function getCurrentUser(): User {
  return users[currentUserIndex];
}

export function setCurrentUser(index: number) {
  currentUserIndex = index;
}