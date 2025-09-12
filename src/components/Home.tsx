import React, { useEffect, useMemo, useState } from 'react';
import AuthSwitch from './AuthSwitch';
import { Link } from 'react-router-dom';
import productService, { ProductResponse, resolveImageUrl, getProductPrimaryImage } from '../features/products/productService';
import { useCart } from '../context/CartContext';

const Home: React.FC = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { addToCart } = useCart();

  // State for modal login/register
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Listen to global events so Header and other parts can open the modal
  useEffect(() => {
    const openLogin = () => { setAuthView('login'); setShowAuth(true); };
    const openRegister = () => { setAuthView('register'); setShowAuth(true); };
    window.addEventListener('show-login', openLogin as EventListener);
    window.addEventListener('show-register', openRegister as EventListener);
    return () => {
      window.removeEventListener('show-login', openLogin as EventListener);
      window.removeEventListener('show-register', openRegister as EventListener);
    };
  }, []);

  // Lightweight featured products (public)
  const [items, setItems] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const page = await productService.listProducts({ page: 0, size: 12, sortBy: 'name', sortDir: 'asc' }, abort.signal);
        setItems(page.content);
      } catch (e) {
        if ((e as any)?.name !== 'AbortError') console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, []);

  const visibleItems = useMemo(() => items.filter(p => p.active !== false), [items]);

  function requireAuth(action: () => void) {
    const hasToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!hasToken) {
      alert('Du måste vara inloggad för att fortsätta.');
      setAuthView('login');
      setShowAuth(true);
      return;
    }
    action();
  }

  // When the auth modal opens or the requested view changes, dispatch a one-time event
  useEffect(() => {
    if (!showAuth) return;
    const evt = authView === 'login' ? 'show-login' : 'show-register';
    // Defer to ensure the modal and AuthSwitch are mounted
    Promise.resolve().then(() => window.dispatchEvent(new Event(evt)));
  }, [showAuth, authView]);

  return (
    <div>
      {/* Hero / Banner */}
      <section className="hero-card" aria-label="Hero">
        <div className="hero-content">
          <h2 className="hero-title">VaruVansinne Deluxe ✨🤘</h2>
          <p className="hero-desc">Bläddra bland produkter, lägg i kundvagnen och checka ut. Enkelt och smidigt.</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="btn-primary btn-inline" to="/products">Bläddra produkter</Link>
          </div>
        </div>
      </section>

      {/* Produktgalleri – publikt, horisontell scroll */}
      <section aria-label="Populära produkter" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>Upptäck våra produkter</h3>
        {loading ? (
          <p>Laddar…</p>
        ) : visibleItems.length === 0 ? (
          <p>Inga produkter tillgängliga just nu.</p>
        ) : (
          <div style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(220px, 1fr)', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {visibleItems.map(p => {
              const img = getProductPrimaryImage(p);
              const imgUrl = img ? resolveImageUrl(img) : undefined;
              return (
                <article key={p.id} className="surface-light product-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="product-card__image" style={{ aspectRatio: '4 / 3', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#888' }}>Ingen bild</span>
                    )}
                  </div>
                  <div className="product-card__body" style={{ padding: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ opacity: 0.85 }}>{(p.price ?? 0).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link className="btn-secondary btn-inline" to={token ? `/products/${p.id}` : '#'} onClick={(e) => { if (!token) { e.preventDefault(); setAuthView('login'); setShowAuth(true); } }}>Detaljer</Link>
                      <button className="btn-primary btn-inline" onClick={() => requireAuth(() => addToCart({ id: p.id, name: p.name, price: p.price, imageUrl: imgUrl }))}>Lägg i kundvagn</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal för Auth */}
      {showAuth && (
        <div role="dialog" aria-modal="true" aria-label={authView === 'login' ? 'Logga in' : 'Registrera'}
             style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 2000 }}
             onClick={(e) => { if (e.target === e.currentTarget) setShowAuth(false); }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1rem', width: 'min(640px, 92vw)', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0 }}>{authView === 'login' ? 'Logga in' : 'Registrera'}</h4>
              <button className="btn-secondary btn-inline" onClick={() => setShowAuth(false)}>Stäng</button>
            </div>
            {/* AuthSwitch view is controlled via global events dispatched from a useEffect */}
            <AuthSwitch />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
