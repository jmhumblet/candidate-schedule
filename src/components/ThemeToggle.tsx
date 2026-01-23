import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaSun, FaMoon } from 'react-icons/fa';
import { usePreferences } from '../hooks/usePreferences';

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
    const { theme: storedTheme, saveTheme, loading } = usePreferences();
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => {
        // Initial state
        if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;

        // Fallback to DOM attribute (set by index.html script) to prevent FOUC during hydration
        const domTheme = document.documentElement.getAttribute('data-bs-theme');
        if (domTheme === 'light' || domTheme === 'dark') return domTheme;

        return getSystemTheme();
    });

    // Update effective theme when stored preference changes
    useEffect(() => {
        if (loading) return;

        if (storedTheme === 'light' || storedTheme === 'dark') {
            setEffectiveTheme(storedTheme);
        } else {
             // If no preference (e.g. freshly loaded or explicitly null), check system
             // But if we just loaded and storedTheme is undefined/null, we might already be correct.
             // This mainly handles if the user logs out or data syncs.
             // We can check local storage as fallback if usePreferences returns null?
             // No, usePreferences handles local storage if logged out.
             if (storedTheme === null) {
                 setEffectiveTheme(getSystemTheme());
             }
        }
    }, [storedTheme, loading]);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', effectiveTheme);
    }, [effectiveTheme]);

    // Listen to system changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
             if (!storedTheme) {
                 setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
             }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [storedTheme]);

    const toggleTheme = () => {
        const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
        setEffectiveTheme(newTheme); // Optimistic UI update
        saveTheme(newTheme);
    };

    return (
        <Button
            variant={variant}
            onClick={toggleTheme}
            className={className}
            title={`Passer en mode ${effectiveTheme === 'light' ? 'sombre' : 'clair'}`}
            size="sm"
            aria-label={effectiveTheme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
        >
            {effectiveTheme === 'light' ? <FaMoon /> : <FaSun />}
            {showLabel && (
                <span className="d-none d-sm-inline">
                    {effectiveTheme === 'light' ? 'Sombre' : 'Clair'}
                </span>
            )}
        </Button>
    );
};

export default ThemeToggle;
