import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import CartBadge from './Cart/CartBadge';

 type HeaderProps = { onCartClick?: () => void };
const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Fetch a lightweight user identity to show name in header
  useEffect(() => {
    let aborted = false;
    const fetchMe = async () => {
      if (!token) { setDisplayName(null); return; }
      try {
        const res = await fetch('https://userservice.drillbi.se/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) { setDisplayName(null); return; }
        const data: { firstName?: string; lastName?: string; email?: string } = await res.json();
        if (aborted) return;
        const fn = (data.firstName || '').trim();
        const ln = (data.lastName || '').trim();
        const name = [fn, ln].filter(Boolean).join(' ');
        setDisplayName(name || data.email || '');
      } catch {
        if (!aborted) setDisplayName(null);
      }
    };
    fetchMe();
    return () => { aborted = true; };
  }, [token]);

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
          <Link className="btn-secondary btn-inline" style={{ marginLeft: 8 }} to="/orders/new">Skapa order</Link>
        </nav>
      </div>
      <div style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 1rem)', right: 'calc(env(safe-area-inset-right, 0px) + 1rem)', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1000, flexWrap: 'wrap' }}>
        {/* Flytta kundvagn + auth lite åt vänster genom att ha dem i en egen grupp och lämna plats till ThemeToggle längst till höger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '2.75rem', flexWrap: 'wrap' }}>
          <CartBadge onClick={onCartClick} />
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
              <span style={{ opacity: 0.85 }}>
                {displayName && displayName.trim().length > 0 ? displayName : 'Inloggad'}
              </span>
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
        {/* ThemeToggle längst till höger, med egen placering */}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
