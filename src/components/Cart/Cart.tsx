import React from 'react';
import { useCart } from '../../context/CartContext';
import formatPriceSEK from '../../utils/formatPrice';

interface Props {
  open: boolean;
  onClose: () => void;
}

const Cart: React.FC<Props> = ({ open, onClose }) => {
  const { items, total, updateQty, removeFromCart, clearCart } = useCart();

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 1001 }} />
      <div role="dialog" aria-label="Kundvagn" aria-modal="true" style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(360px, 92vw)',
      background: 'var(--card-bg, #fff)', boxShadow: '-8px 0 24px rgba(0,0,0,0.2)', padding: '1rem', zIndex: 1002,
      overflowY: 'auto', borderTopLeftRadius: 12, borderBottomLeftRadius: 12
    }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Kundvagn</h3>
        <button aria-label="Stäng kundvagn" className="btn-secondary btn-inline" onClick={onClose}>Stäng</button>
      </header>

      {items.length === 0 ? (
        <p style={{ marginTop: '1rem' }}>Kundvagnen är tom</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
            {items.map(i => (
              <li key={i.id} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                {i.imageUrl ? (
                  <img src={i.imageUrl} alt={i.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: 8, background: 'rgba(0,0,0,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>No img</div>
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{i.name}</div>
                  <div>{formatPriceSEK(i.price)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      aria-label={`Minska antal för ${i.name}`}
                      className="btn-secondary btn-inline"
                      onClick={() => updateQty(i.id, i.qty - 1)}
                      disabled={i.qty <= 1}
                    >−</button>
                    <input
                      aria-label={`Antal för ${i.name}`}
                      value={i.qty}
                      onChange={(e) => {
                        const v = e.target.value;
                        const parsed = Number(v);
                        const next = Number.isInteger(parsed) ? parsed : i.qty;
                        updateQty(i.id, next);
                      }}
                      onBlur={(e) => {
                        let q = Number(e.target.value);
                        if (!Number.isFinite(q)) q = i.qty;
                        q = Math.max(1, Math.min(99, Math.round(q)));
                        updateQty(i.id, q);
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      style={{ width: 48, textAlign: 'center' }}
                    />
                    <button
                      type="button"
                      aria-label={`Öka antal för ${i.name}`}
                      className="btn-secondary btn-inline"
                      onClick={() => updateQty(i.id, i.qty + 1)}
                      disabled={i.qty >= 99}
                    >+</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '0.25rem', justifyItems: 'end' }}>
                  <div>{formatPriceSEK(i.price * i.qty)}</div>
                  <button
                    type="button"
                    aria-label={`Ta bort ${i.name} från kundvagnen`}
                    className="btn-secondary btn-inline"
                    onClick={() => removeFromCart(i.id)}
                  >Ta bort</button>
                </div>
              </li>
            ))}
          </ul>
          <footer style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700 }}>Summa: {formatPriceSEK(total)}</div>
            <button type="button" className="btn-secondary btn-inline" onClick={clearCart}>Töm kundvagn</button>
          </footer>
        </>
      )}
    </div>
    </>
  );
};

export default Cart;
