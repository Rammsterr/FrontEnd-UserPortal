import React, { useEffect, useState } from 'react';
import productService, { ProductResponse, resolveImageUrl, getProductPrimaryImage } from '../products/productService';
import { useCart } from '../../context/CartContext';
import { createOrder } from './orderService';
import formatPriceSEK from '../../utils/formatPrice';

// Sida för att skapa en order: listar tillgängliga produkter och låter användaren lägga dem i kundvagn
// och skicka en order till Order Service (POST /api/orders) med JWT.

const OrderCreatePage: React.FC = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<string | null>(null);
  const { items, addToCart, total, clearCart } = useCart();

  useEffect(() => {
    if (!token) {
      alert('Du måste vara inloggad för att skapa order.');
      window.dispatchEvent(new Event('show-login'));
      window.location.hash = '/';
      return;
    }
    const abort = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const page = await productService.listProducts({ page: 0, size: 20, sortBy: 'name', sortDir: 'asc' }, abort.signal);
        // Visa endast aktiva med lager
        setProducts(page.content.filter(p => p.active && p.stockQuantity > 0));
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError('Kunde inte hämta produkter.');
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, []);

  const onSubmitOrder = async () => {
    setError(null);
    setOrderResult(null);
    if (items.length === 0) { setError('Lägg till minst en produkt i kundvagnen.'); return; }
    setSubmitting(true);
    try {
      const payload = { items: items.map(i => ({ productId: i.id, quantity: i.qty })) };
      const res = await createOrder(payload);
      const msg = `Order skapad! ID: ${res.id}${res.totalAmount ? `, Summa: ${formatPriceSEK(res.totalAmount)}` : ''}`;
      setOrderResult(msg);
      clearCart();
    } catch (e: any) {
      setError(e?.message || 'Misslyckades att skapa order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-form" aria-labelledby="order-title">
      <h2 id="order-title" style={{ textAlign: 'center', marginTop: 0 }}>Skapa order</h2>

      {loading ? (
        <p>Laddar produkter…</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
            {products.map(p => (
              <li key={p.id} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', alignItems: 'center', gap: '0.75rem' }}>
                <div>
                  {(() => { const img = getProductPrimaryImage(p); if (img) return <img src={resolveImageUrl(img)} alt={p.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />; return (
                    <div style={{ width: 64, height: 64, borderRadius: 8, background: 'rgba(0,0,0,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>No img</div>
                  ); })()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div>{formatPriceSEK(p.price)}</div>
                </div>
                <div>
                  <button className="btn-primary btn-inline" disabled={!localStorage.getItem('token')} onClick={() => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      alert('Du måste vara inloggad för att lägga till i kundvagnen.');
                      window.dispatchEvent(new Event('show-login'));
                      window.location.hash = '/';
                      return;
                    }
                    addToCart({ id: p.id, name: p.name, price: p.price, imageUrl: getProductPrimaryImage(p) || undefined });
                  }}>{localStorage.getItem('token') ? 'Lägg i kundvagn' : 'Logga in för att handla'}</button>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.75rem' }}>
            <strong>Kundvagn:</strong>
            {items.length === 0 ? (
              <p>Inga varor ännu.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', display: 'grid', gap: '0.25rem' }}>
                {items.map(i => (
                  <li key={i.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{i.name} × {i.qty}</span>
                    <span>{formatPriceSEK(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>Summa: {formatPriceSEK(total)}</div>
              <button className="btn-primary btn-inline" onClick={onSubmitOrder} disabled={submitting || items.length === 0}>
                {submitting ? 'Skickar…' : 'Skicka order'}
              </button>
            </div>
            {orderResult && <p style={{ color: 'green', marginTop: '0.5rem' }}>{orderResult}</p>}
          </div>
        </>
      )}
    </section>
  );
};

export default OrderCreatePage;
