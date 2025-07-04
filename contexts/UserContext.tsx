'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  userId: string | null;
  setUserId: (id: string) => void;
  clearUserId: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load userId from localStorage on mount
  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserIdState(storedUserId);
      }
    } catch (error) {
      console.error('Error loading userId from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setUserId = (id: string) => {
    setUserIdState(id);
    try {
      localStorage.setItem('userId', id);
    } catch (error) {
      console.error('Error saving userId to localStorage:', error);
    }
  };

  const clearUserId = () => {
    setUserIdState(null);
    try {
      localStorage.removeItem('userId');
    } catch (error) {
      console.error('Error removing userId from localStorage:', error);
    }
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, clearUserId, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}