import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage or default to light mode
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });

    useEffect(() => {
        // Update document class and localStorage
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            console.log('🌙 Dark mode enabled');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            console.log('☀️ Light mode enabled');
        }
    }, [isDark]);

    const toggleTheme = () => {
        console.log('Toggle theme clicked. Current:', isDark ? 'dark' : 'light');
        setIsDark(!isDark);
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
