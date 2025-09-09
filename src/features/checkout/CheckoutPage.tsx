import React from 'react';
import { useCart } from '../../context/CartContext';
import formatPriceSEK from '../../utils/formatPrice';

// Enkel kassa-sida som är separat från kundvagnen
// Inga order-skapande anrop – endast sammanfattning och nästa steg (placeholder)
const CheckoutPage: React.FC = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { items, total } = useCart();

  if (!token) {
    return (
      <section className="auth-form" aria-labelledby="checkout-title">
        <h2 id="checkout-title" style={{ textAlign: 'center', marginTop: 0 }}>Kassan</h2>
        <p>Du måste vara inloggad för att komma till kassan.</p>
      </section>
    );
  }

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
            {/* Placeholder för framtida steg, t.ex. adress/betalning */}
            <button className="btn-primary btn-inline" type="button" onClick={() => alert('Här kommer betalningssteget senare.')}>Fortsätt</button>
          </div>
        </>
      )}
    </section>
  );
};

export default CheckoutPage;
