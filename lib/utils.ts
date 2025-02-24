import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export function isAdmin(user?: User | null): boolean {
  return user?.role === 'admin'
}

export function getCurrentUser(): User | null {
  // This is a mock implementation
  // Replace with your actual auth logic
  const user: User = {
    id: '123',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user'
  }
  
  return user
}
