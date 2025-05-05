import { createContext, useContext, useState, ReactNode } from 'react';
import { Dream } from './types';

// Interface for the dream storage context
interface DreamStorageContextType {
  dreams: Map<string, Dream>;
  saveDream: (dateKey: string, dream: Dream) => void;
  getDream: (dateKey: string) => Dream | undefined;
  hasDream: (dateKey: string) => boolean;
}

// Create the context
const DreamStorageContext = createContext<DreamStorageContextType | undefined>(undefined);

// Provider component
export function DreamStorageProvider({ children }: { children: ReactNode }) {
  // In-memory storage for dreams
  const [dreams, setDreams] = useState<Map<string, Dream>>(new Map());

  const saveDream = (dateKey: string, dream: Dream) => {
    setDreams(prevDreams => {
      const newDreams = new Map(prevDreams);
      newDreams.set(dateKey, dream);
      return newDreams;
    });
  };

  const getDream = (dateKey: string) => {
    return dreams.get(dateKey);
  };

  const hasDream = (dateKey: string) => {
    return dreams.has(dateKey);
  };

  return (
    <DreamStorageContext.Provider value={{ dreams, saveDream, getDream, hasDream }}>
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