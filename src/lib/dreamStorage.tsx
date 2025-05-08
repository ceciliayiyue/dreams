'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dream } from './types';
import { authClient } from "@/lib/auth-client";

// Interface for the dream storage context
interface DreamStorageContextType {
  dreams: Map<string, Dream>;
  saveDream: (dateKey: string, dream: Dream) => Promise<void>;
  getDream: (dateKey: string) => Dream | undefined;
  hasDream: (dateKey: string) => boolean;
  deleteDream: (dateKey: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create the context
const DreamStorageContext = createContext<DreamStorageContextType | undefined>(undefined);

// Provider component
export function DreamStorageProvider({ children }: { children: ReactNode }) {
  // Store dreams in a Map for client-side access
  const [dreams, setDreams] = useState<Map<string, Dream>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  // Load dreams from API when component mounts or user changes
  useEffect(() => {
    const fetchDreams = async () => {
      if (isSessionLoading) return;
      if (!session) {
        setDreams(new Map());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/dreams');

        if (!response.ok) {
          throw new Error('Failed to fetch dreams');
        }

        const userDreams = await response.json();
        const dreamMap = new Map<string, Dream>();

        userDreams.forEach((dream: Dream) => {
          dreamMap.set(dream.dateKey, {
            date: new Date(dream.dateKey),
            dateKey: dream.dateKey,
            content: dream.content,
            interpretation: dream.interpretation || undefined,
            id: dream.id,
            title: dream.title || undefined
          });
        });

        setDreams(dreamMap);
      } catch (error) {
        console.error('Failed to fetch dreams:', error);
        setError('Failed to load your dreams. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDreams();
  }, [session, isSessionLoading]);

  // Save dream via API and update local state
  const saveDream = async (dateKey: string, dream: Dream) => {
    if (!session) {
      setError('You must be signed in to save dreams');
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/dreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateKey,
          content: dream.content,
          interpretation: dream.interpretation || null,
          title: dream.title || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save dream');
      }

      const savedDream = await response.json();

      // Update local state with the saved dream
      setDreams(prevDreams => {
        const newDreams = new Map(prevDreams);
        newDreams.set(dateKey, {
          ...dream,
          id: savedDream.id
        });
        return newDreams;
      });
    } catch (error) {
      console.error('Failed to save dream:', error);
      setError('Failed to save your dream. Please try again later.');
      throw error;
    }
  };

  // Get dream from local state
  const getDream = (dateKey: string) => {
    return dreams.get(dateKey);
  };

  // Check if dream exists in local state
  const hasDream = (dateKey: string) => {
    return dreams.has(dateKey);
  };

  // Delete dream via API and update local state
  const deleteDream = async (dateKey: string) => {
    if (!session) {
      setError('You must be signed in to delete dreams');
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/dreams/${dateKey}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dream');
      }

      // Update local state
      setDreams(prevDreams => {
        const newDreams = new Map(prevDreams);
        newDreams.delete(dateKey);
        return newDreams;
      });
    } catch (error) {
      console.error('Failed to delete dream:', error);
      setError('Failed to delete your dream. Please try again later.');
      throw error;
    }
  };

  return (
      <DreamStorageContext.Provider value={{
        dreams,
        saveDream,
        getDream,
        hasDream,
        deleteDream,
        loading,
        error
      }}>
        {children}
      </DreamStorageContext.Provider>
  );
}

// Custom hook for using the dream storage
export const useDreamStorage = () => {
  const context = useContext(DreamStorageContext);
  if (!context) {
    throw new Error('useDreamStorage must be used within a DreamStorageProvider');
  }
  return context;
};