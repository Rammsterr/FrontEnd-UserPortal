import React from 'react';
import Login from './components/Login/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import './Authform.css';
import './App.css';
import ThemeToggle from './components/ThemeToggle';

function App() {
    const token = localStorage.getItem("token");

    return (
        <main className="container">
            <ThemeToggle />
            <h1 className="page-title">🛍️ E-commerce Integration</h1>

            {token ? (
                <>
                    <UserProfile />
                    <button
                        className="btn-primary btn-inline"
                        style={{ marginTop: '1rem' }}
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.reload(); // enkel omdirigering
                        }}
                    >
                        Logga ut
                    </button>
                </>
            ) : (
                <>
                    <p className="welcome-text">Välkommen! Logga in eller registrera dig för att komma igång.</p>
                    <Login />
                    <Register />
                </>
            )}
        </main>
    );
}

export default App;
