import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import formatPriceSEK from '../../utils/formatPrice';
import { createOrder } from '../orders/orderService';

// Kassa-sida: visar sammanfattning och låter användaren skicka order till backend
const CheckoutPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { items, total, clearCart } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if not logged in
      window.dispatchEvent(new Event('show-login'));
      window.location.hash = '/';
    }
  }, []);

  const onPlaceOrder = async () => {
    setError(null);
    setSuccessMsg(null);
    if (items.length === 0) { setError('Din kundvagn är tom.'); return; }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Du måste vara inloggad för att beställa.');
      window.dispatchEvent(new Event('show-login'));
      window.location.hash = '/';
      return;
    }
    setSubmitting(true);
    try {
      const payload = { items: items.map(i => ({ productId: i.id, quantity: i.qty })) };
      const res = await createOrder(payload);
      const msg = `Tack för din beställning! Order-ID: ${res.id}`;
      setSuccessMsg(msg);
      clearCart();
      // Redirect to order history after short delay
      setTimeout(() => { window.location.hash = '/orders'; }, 800);
    } catch (e: any) {
      setError(e?.message || 'Kunde inte lägga ordern.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-form" aria-labelledby="checkout-title">
      <h2 id="checkout-title" style={{ textAlign: 'center', marginTop: 0 }}>Kassan</h2>

      {items.length === 0 ? (
        <p>Din kundvagn är tom. Lägg till produkter innan du går till kassan.</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', display: 'grid', gap: '0.5rem' }}>
            {items.map(i => (
              <li key={i.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{i.name}</div>
                  <div style={{ opacity: 0.7 }}>Antal: {i.qty}</div>
                </div>
                <div>{formatPriceSEK(i.price * i.qty)}</div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong>Summa: {formatPriceSEK(total)}</strong>
            <button className="btn-primary btn-inline" type="button" onClick={onPlaceOrder} disabled={submitting}>
              {submitting ? 'Skickar…' : 'Slutför köp'}
            </button>
          </div>
          {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
          {successMsg && <p style={{ color: 'green', marginTop: '0.5rem' }}>{successMsg}</p>}
        </>
      )}
    </section>
  );
};

export default CheckoutPage;
