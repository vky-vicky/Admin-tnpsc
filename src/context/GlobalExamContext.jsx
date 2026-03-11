import React, { createContext, useContext, useState, useEffect } from 'react';

const GlobalExamContext = createContext();

export const useGlobalExam = () => useContext(GlobalExamContext);

export const GlobalExamProvider = ({ children }) => {
  // Initialize from localStorage or default to 'TNPSC_GROUP_4'
  const [activeExamType, setActiveExamType] = useState(() => {
    return localStorage.getItem('global_exam_type') || 'TNPSC_GROUP_4';
  });

  // Persist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('global_exam_type', activeExamType);
  }, [activeExamType]);

  return (
    <GlobalExamContext.Provider value={{ activeExamType, setActiveExamType }}>
      {children}
    </GlobalExamContext.Provider>
  );
};
