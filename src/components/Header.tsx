import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import CartBadge from './Cart/CartBadge';
import { useAuth } from '../context/AuthContext';

 type HeaderProps = { onCartClick?: () => void };
const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { user, logout } = useAuth();
  const token = user?.token || null;
  const [displayName, setDisplayName] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch a lightweight user identity to show name in header
  useEffect(() => {
    let aborted = false;
    const fetchMe = async () => {
      if (!token) { setDisplayName(null); return; }
      // Prefill display name from stored user data (if present) for instant feedback
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw) as { firstName?: string; lastName?: string; email?: string };
          const fn0 = (u.firstName || '').trim();
          const ln0 = (u.lastName || '').trim();
          const name0 = [fn0, ln0].filter(Boolean).join(' ');
          if (name0 || u.email) {
            setDisplayName(name0 || u.email || '');
          }
        }
      } catch { /* ignore parse errors */ }
      try {
        const res = await fetch('https://userservice.drillbi.se/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) { /* keep any prefilled name, but ensure we don't show stale */ return; }
        const data: { firstName?: string; lastName?: string; email?: string } = await res.json();
        if (aborted) return;
        const fn = (data.firstName || '').trim();
        const ln = (data.lastName || '').trim();
        const name = [fn, ln].filter(Boolean).join(' ');
        setDisplayName(name || data.email || '');
      } catch {
        // Ignore network errors; prefilled name (if any) remains
      }
    };
    fetchMe();
    return () => { aborted = true; };
  }, [token]);

  const handleLogout = () => {
    logout();
  };

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
          <Link className="btn-secondary btn-inline" style={{ marginLeft: 8 }} to="/checkout">Kassa</Link>
          {user?.role === 'ADMIN' && (
            <button
              className="btn-secondary btn-inline"
              style={{ marginLeft: 8 }}
              onClick={() => navigate('/admin/analytics')}
            >Admin Analytics</button>
          )}
          {token ? (
            <Link className="btn-secondary btn-inline" style={{ marginLeft: 8 }} to="/profile">Profil</Link>
          ) : null}
        </nav>
      </div>
      <div style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 1rem)', right: 'calc(env(safe-area-inset-right, 0px) + 1rem)', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1000, flexWrap: 'wrap' }}>
        {/* Flytta kundvagn + auth lite åt vänster genom att ha dem i en egen grupp och lämna plats till ThemeToggle längst till höger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '2.75rem', flexWrap: 'wrap' }}>
          {token ? (
            <button
              className="btn-secondary btn-inline"
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
              aria-label="Logga ut"
              title="Logga ut"
              onClick={handleLogout}
            >Logga ut</button>
          ) : null}
          {!token ? (
            <>
              <Link
                className="btn-secondary btn-inline"
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                to="/login"
                aria-label="Logga in"
                title="Logga in"
              >Logga in</Link>
              <Link
                className="btn-secondary btn-inline"
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                to="/register"
                aria-label="Registrera"
                title="Registrera"
              >Registrera</Link>
            </>
          ) : null}
          {token && displayName ? (
            <div
              title={displayName}
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'inherit',
                opacity: 0.9,
                maxWidth: '20ch',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >Hej, {displayName}</div>
          ) : null}
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
