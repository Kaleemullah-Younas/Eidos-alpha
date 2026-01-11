'use client';

import {
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { useSession } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const user: User | null = session?.user
    ? {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: (session.user as unknown as { role?: string }).role || 'user',
    }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!session?.user,
        isLoading: isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
