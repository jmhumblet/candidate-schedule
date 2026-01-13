import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <Button
            variant="outline-secondary"
            onClick={toggleTheme}
            className="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
            <span className="d-none d-sm-inline">
                {theme === 'light' ? 'Sombre' : 'Clair'}
            </span>
        </Button>
    );
};

export default ThemeToggle;
