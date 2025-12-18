import { useState, createContext, useEffect ,useContext } from 'react'


interface ThemeContextType {
    isDarkMode: boolean,
    toggleTheme: ()=>void,
}
const ThemeContext  = createContext<ThemeContextType| undefined>(undefined);

export const ThemeProvider = ({ children }:{children: React.ReactNode}) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') return true;
        if (savedTheme === 'light') return false;
        // Check system preference if no saved theme
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
    , [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    }

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};