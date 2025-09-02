import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return (
    <header style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="page-title" style={{ margin: 0 }}>🛍️ E-commerce Integration</h1>
        <nav aria-label="Huvudnavigation" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Link className="btn-secondary btn-inline" to="/">Hem</Link>
          <Link className="btn-secondary btn-inline" style={{ marginLeft: 8 }} to="/products">Produkter</Link>
        </nav>
      </div>
      <div style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 1rem)', right: 'calc(env(safe-area-inset-right, 0px) + 4.5rem)', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1000, flexWrap: 'wrap' }}>
        {!token ? (
          <>
            <span style={{ fontWeight: 700 }}>Har du redan ett konto?</span>
            <button
              className="btn-secondary btn-inline"
              onClick={(e) => {
                e.preventDefault();
                // Signal to switch the auth view to Login
                window.dispatchEvent(new Event('show-login'));
                // Ensure we are on the home route
                window.location.hash = '/';
              }}
            >Logga in</button>
          </>
        ) : (
          <>
            <span style={{ opacity: 0.85 }}>Inloggad</span>
            <button
              className="btn-primary btn-inline"
              onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
              }}
            >Logga ut</button>
          </>
        )}
      </div>
      <ThemeToggle />
    </header>
  );
};

export default Header;
