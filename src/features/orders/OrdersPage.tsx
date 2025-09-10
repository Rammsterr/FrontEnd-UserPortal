import React, { useEffect, useState } from 'react';
import { getOrderHistory, OrderHistoryItem } from './orderService';
import formatPriceSEK from '../../utils/formatPrice';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page when not authenticated
      window.dispatchEvent(new Event('show-login'));
      window.location.hash = '/';
      return;
    }

    const abort = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getOrderHistory();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setError(e?.message || 'Kunde inte hämta orderhistorik.');
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, []);

  function getOrderDate(o: OrderHistoryItem): string {
    const iso = o.createdAt || o.orderDate;
    if (iso) {
      const d = new Date(iso);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    }
    return '';
  }

  function getOrderTotal(o: OrderHistoryItem): number {
    return typeof o.totalAmount === 'number' ? o.totalAmount : (typeof o.total === 'number' ? o.total : 0);
  }

  return (
    <section className="auth-form" aria-labelledby="orders-title">
      <h2 id="orders-title" style={{ textAlign: 'center', marginTop: 0 }}>Orderhistorik</h2>
      {loading ? (
        <p>Laddar…</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : orders.length === 0 ? (
        <p>Du har inga tidigare ordrar.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
          {orders.map(o => (
            <li key={o.id} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Order #{o.id}</div>
                  <div style={{ opacity: 0.7 }}>{getOrderDate(o)}</div>
                </div>
                <div style={{ fontWeight: 600 }}>{formatPriceSEK(getOrderTotal(o))}</div>
              </div>
              {Array.isArray(o.items) && o.items.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', display: 'grid', gap: '0.25rem' }}>
                  {o.items.map((it, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        {it.productName || it.name || it.productId || 'Produkt'}
                        {typeof it.quantity === 'number' ? ` × ${it.quantity}` : ''}
                      </span>
                      {typeof it.price === 'number' && (
                        <span>{formatPriceSEK(it.price * (it.quantity || 1))}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default OrdersPage;
