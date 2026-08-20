import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  selectRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, User> = {
  learner: {
    id: 1,
    name: 'Alex Johnson',
    email: 'learner@example.com',
    role: 'learner',
    programme: 'Level 3 Business Administration',
  },
  assessor: {
    id: 2,
    name: 'Sarah Smith',
    email: 'assessor@example.com',
    role: 'assessor',
    centreId: 1,
  },
  trainer: {
    id: 3,
    name: 'Michael Brown',
    email: 'trainer@example.com',
    role: 'trainer',
    centreId: 1,
  },
  iqa: {
    id: 4,
    name: 'Emma Wilson',
    email: 'iqa@example.com',
    role: 'iqa',
    centreId: 1,
  },
  eqa: {
    id: 5,
    name: 'David Lee',
    email: 'eqa@example.com',
    role: 'eqa',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('learnport_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const demoUser = DEMO_USERS[role];
      if (demoUser) {
        setUser(demoUser);
        localStorage.setItem('learnport_user', JSON.stringify(demoUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('learnport_user');
  };

  const selectRole = (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    if (demoUser) {
      setUser(demoUser);
      localStorage.setItem('learnport_user', JSON.stringify(demoUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, selectRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
