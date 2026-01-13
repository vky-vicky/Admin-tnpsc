import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', options = {}) => {
        const id = Math.random().toString(36).substr(2, 9);
        const duration = options.duration || 5000;
        
        setToasts((prev) => [...prev, { id, message, type, ...options, duration, isExiting: false }]);

        if (duration !== Infinity) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => 
            prev.map(t => t.id === id ? { ...t, isExiting: true } : t)
        );
        
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 400); // Match animation duration
    }, []);

    const toast = {
        success: (msg, opts) => showToast(msg, 'success', opts),
        error: (msg, opts) => showToast(msg, 'error', opts),
        warning: (msg, opts) => showToast(msg, 'warning', opts),
        info: (msg, opts) => showToast(msg, 'info', opts),
    };

    return (
        <ToastContext.Provider value={{ toast, toasts, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};
