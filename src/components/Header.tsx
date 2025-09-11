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
          {token ? (
            <>
              <Link className="btn-secondary btn-inline" style={{ marginLeft: 8 }} to="/products">Produkter</Link>
              <Link className="btn-secondary btn-inline" style={{ marginLeft: 8 }} to="/checkout">Kassan</Link>
              <Link className="btn-secondary btn-inline" style={{ marginLeft: 8 }} to="/profile">Profil</Link>
              <button
                className="btn-secondary btn-inline"
                style={{ marginLeft: 8 }}
                onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
              >Logga ut</button>
            </>
          ) : (
            <>
              {/* När man inte är inloggad: visa Logga in/Registrera som länkar till dedikerade sidor */}
              <Link
                className="btn-secondary btn-inline"
                style={{ marginLeft: 8 }}
                to="/login"
              >Logga in</Link>
              <Link
                className="btn-secondary btn-inline"
                style={{ marginLeft: 8 }}
                to="/register"
              >Registrera</Link>
            </>
          )}
        </nav>
      </div>
      <div style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 1rem)', right: 'calc(env(safe-area-inset-right, 0px) + 1rem)', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1000, flexWrap: 'wrap' }}>
        {/* Flytta kundvagn + auth lite åt vänster genom att ha dem i en egen grupp och lämna plats till ThemeToggle längst till höger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '2.75rem', flexWrap: 'wrap' }}>
          <CartBadge onClick={onCartClick} />
          {/* Auth-knappar flyttade till navbaren för att undvika dubbletter. Lämna endast kundvagn här. */}
        </div>
        {/* ThemeToggle längst till höger, med egen placering */}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
