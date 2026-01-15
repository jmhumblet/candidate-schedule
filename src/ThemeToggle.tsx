import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaSun, FaMoon } from 'react-icons/fa';

interface ThemeToggleProps {
    className?: string;
    variant?: string;
    showLabel?: boolean;
}

const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const ThemeToggle: React.FC<ThemeToggleProps> = ({
    className = "position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2",
    variant = "outline-secondary",
    showLabel = true
}) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }
        return getSystemTheme();
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
             // Only update from system if no user preference is stored
             if (!localStorage.getItem('theme')) {
                 setTheme(mediaQuery.matches ? 'dark' : 'light');
             }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <Button
            variant={variant}
            onClick={toggleTheme}
            className={className}
            title={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
            size="sm"
            aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
        >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
            {showLabel && (
                <span className="d-none d-sm-inline">
                    {theme === 'light' ? 'Sombre' : 'Clair'}
                </span>
            )}
        </Button>
    );
};

export default ThemeToggle;
