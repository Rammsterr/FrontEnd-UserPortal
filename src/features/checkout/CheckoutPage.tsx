import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import formatPriceSEK from '../../utils/formatPrice';
import { purchase, createOrder } from '../orders/orderService';

// Kassa-sida: visar sammanfattning och låter användaren skicka order till backend
const CheckoutPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { items, total, clearCart, updateQty, removeFromCart } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if not logged in
      window.location.hash = '/login';
    }
  }, []);

  const onPlaceOrder = async () => {
    setError(null);
    setSuccessMsg(null);
    if (items.length === 0) { setError('Din kundvagn är tom.'); return; }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Du måste vara inloggad för att beställa.');
      window.location.hash = '/login';
      return;
    }
    setSubmitting(true);
    try {
      if (items.length > 1) {
        // Flerprodukter: använd legacy createOrder med items[]
        const payload = { items: items.map(i => ({ productId: i.id, quantity: i.qty })) };
        const res = await createOrder(payload);
        const msg = `Tack för ditt köp! Order skapad med ID: ${res.id}`;
        setSuccessMsg(msg);
      } else {
        // Enstaka produkt: använd nya purchase-endpointen som kräver exakt { productId, quantity }
        const item = items[0];
        const payload = { productId: item.id, quantity: item.qty };
        const res = await purchase(payload);
        const ordNum = res.orderNumber ? ` (Ordernummer: ${res.orderNumber})` : '';
        const msg = `Tack för ditt köp! Order-ID: ${res.orderId}${ordNum}`;
        setSuccessMsg(msg);
      }
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
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', display: 'grid', gap: '0.75rem' }}>
            {items.map(i => (
              <li key={i.id} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', alignItems: 'center', gap: '0.5rem' }}>
                {/* Thumbnail */}
                {i.imageUrl ? (
                  <img src={i.imageUrl} alt={i.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: 8, background: 'rgba(0,0,0,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                    No img
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{i.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      aria-label={`Minska antal för ${i.name}`}
                      className="btn-secondary btn-inline"
                      onClick={() => updateQty(i.id, Math.max(1, i.qty - 1))}
                      disabled={i.qty <= 1}
                    >−</button>
                    <input
                      aria-label={`Antal för ${i.name}`}
                      value={i.qty}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isFinite(v)) updateQty(i.id, v);
                      }}
                      onBlur={(e) => {
                        let q = Number(e.target.value);
                        if (!Number.isFinite(q)) q = i.qty;
                        q = Math.max(1, Math.min(99, Math.round(q)));
                        updateQty(i.id, q);
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      style={{ width: 56, textAlign: 'center' }}
                    />
                    <button
                      type="button"
                      aria-label={`Öka antal för ${i.name}`}
                      className="btn-secondary btn-inline"
                      onClick={() => updateQty(i.id, Math.min(99, i.qty + 1))}
                      disabled={i.qty >= 99}
                    >+</button>
                    <button
                      type="button"
                      aria-label={`Ta bort ${i.name} från kundvagnen`}
                      className="btn-secondary btn-inline"
                      onClick={() => removeFromCart(i.id)}
                    >Ta bort</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 600 }}>{formatPriceSEK(i.price * i.qty)}</div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
            <strong>Summa: {formatPriceSEK(total)}</strong>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary btn-inline" type="button" onClick={clearCart} disabled={items.length === 0}>Töm kundvagn</button>
              <button className="btn-primary btn-inline" type="button" onClick={onPlaceOrder} disabled={submitting || items.length === 0}>
                {submitting ? 'Skickar…' : 'Skicka order'}
              </button>
            </div>
          </div>
          {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
          {successMsg && <p style={{ color: 'green', marginTop: '0.5rem' }}>{successMsg}</p>}
        </>
      )}
    </section>
  );
};

export default CheckoutPage;
