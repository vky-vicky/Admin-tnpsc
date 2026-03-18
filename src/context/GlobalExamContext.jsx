import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../api/adminService';

const GlobalExamContext = createContext();

export const useGlobalExam = () => useContext(GlobalExamContext);

export const GlobalExamProvider = ({ children }) => {
  const [allExamTypes, setAllExamTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize from localStorage or default to null until fetched
  const [activeExamType, setActiveExamType] = useState(() => {
    return localStorage.getItem('global_exam_type') || null;
  });

  // Fetch all exam types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getExamTypes();
        const types = response || [];
        setAllExamTypes(types);
        
        // If no active type is set, or the stored one isn't in the list, set to first fetched type
        const storedType = localStorage.getItem('global_exam_type');
        if (types.length > 0) {
          if (!storedType || !types.find(t => t.slug === storedType)) {
            const defaultType = types[0].slug;
            setActiveExamType(defaultType);
            localStorage.setItem('global_exam_type', defaultType);
          }
        }
      } catch (error) {
        console.error("Failed to fetch exam types:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTypes();
  }, []);

  // Persist to localStorage whenever it changes
  useEffect(() => {
    if (activeExamType) {
      localStorage.setItem('global_exam_type', activeExamType);
    }
  }, [activeExamType]);

  return (
    <GlobalExamContext.Provider value={{ 
      activeExamType, 
      setActiveExamType, 
      allExamTypes, 
      isLoading 
    }}>
      {children}
    </GlobalExamContext.Provider>
  );
};
