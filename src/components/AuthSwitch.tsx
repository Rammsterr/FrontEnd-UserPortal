import React, { useEffect, useState } from 'react';
import Login from './Login/Login';
import Register from './Register';

// Wrapper component that toggles between Login and Register
// Default view on page load: Register
// Switch to Login when a global event 'show-login' is dispatched (from Header button)
// Switch back to Register via an inline "Skapa konto" button on the Login view

const AuthSwitch: React.FC = () => {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('register');

  useEffect(() => {
    const onShowLogin = () => setActiveForm('login');
    const onShowRegister = () => setActiveForm('register');

    window.addEventListener('show-login', onShowLogin as EventListener);
    window.addEventListener('show-register', onShowRegister as EventListener);
    return () => {
      window.removeEventListener('show-login', onShowLogin as EventListener);
      window.removeEventListener('show-register', onShowRegister as EventListener);
    };
  }, []);

  if (activeForm === 'login') {
    return (
      <>
        <p className="welcome-text">Välkommen tillbaka! Logga in för att fortsätta.</p>
        <Login />
        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          <span style={{ marginRight: 8 }}>Ny här?</span>
          <button
            className="btn-secondary btn-inline"
            type="button"
            onClick={() => setActiveForm('register')}
          >Skapa konto</button>
        </div>
      </>
    );
  }

  // Default register view
  return (
    <>
      <p className="welcome-text">Välkommen! Registrera dig för att komma igång.</p>
      <Register />
    </>
  );
};

export default AuthSwitch;
