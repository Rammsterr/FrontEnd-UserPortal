import React, { useEffect, useState } from 'react';

const THEME_KEY = 'theme';
const DARK_CLASS = 'dark-theme';

const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(THEME_KEY);
        const shouldUseDark = saved === 'dark';
        setIsDark(shouldUseDark);
        updateTheme(shouldUseDark);
    }, []);

    const updateTheme = (dark: boolean) => {
        const body = document.body;
        if (dark) {
            body.classList.add(DARK_CLASS);
            localStorage.setItem(THEME_KEY, 'dark');
        } else {
            body.classList.remove(DARK_CLASS);
            localStorage.setItem(THEME_KEY, 'light');
        }
    };

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        updateTheme(next);
    };

    return (
        <button
            id="theme-toggle"
            aria-label="Byt tema"
            onClick={toggleTheme}
            style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'inherit',
            }}
        >
            <span id="theme-icon">{isDark ? '☀️' : '🌙'}</span>
        </button>
    );
};

export default ThemeToggle;
