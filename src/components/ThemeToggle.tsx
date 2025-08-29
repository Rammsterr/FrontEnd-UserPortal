import React, { useEffect, useState } from 'react';

const THEME_KEY = 'theme';
const DARK_CLASS = 'dark-theme';

const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(THEME_KEY);
        let shouldUseDark: boolean;
        if (saved === 'dark' || saved === 'light') {
            shouldUseDark = saved === 'dark';
        } else {
            shouldUseDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
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
        >
            {isDark ? (
                // Sun icon (stylish, uses currentColor)
                <svg
                    id="theme-icon"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="4.5" fill="currentColor" opacity="0.9"/>
                    <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                        <path d="M12 2.5v2.8"/>
                        <path d="M12 18.7v2.8"/>
                        <path d="M2.5 12h2.8"/>
                        <path d="M18.7 12h2.8"/>
                        <path d="M5.05 5.05l1.98 1.98"/>
                        <path d="M16.97 16.97l1.98 1.98"/>
                        <path d="M5.05 18.95l1.98-1.98"/>
                        <path d="M16.97 7.03l1.98-1.98"/>
                    </g>
                </svg>
            ) : (
                // Moon icon (stylish crescent)
                <svg
                    id="theme-icon"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5a.6.6 0 0 0-.8-.74 8.6 8.6 0 1 0 12.44 12.44.6.6 0 0 0-.74-.8z"
                        fill="currentColor"
                        opacity="0.9"
                    />
                    <circle cx="16.8" cy="7.2" r="0.9" fill="currentColor" opacity="0.9"/>
                </svg>
            )}
        </button>
    );
};

export default ThemeToggle;
