import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import productService, { ProductResponse, resolveImageUrl, getProductPrimaryImage } from './productService';
import { useCart } from '../../context/CartContext';
import formatPriceSEK from '../../utils/formatPrice';

// Produktdetaljer – visar detaljerad info om en produkt.
const ProductDetails: React.FC = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!token) {
      alert('Du måste vara inloggad för att se produktdetaljer.');
      window.dispatchEvent(new Event('show-login'));
      window.location.hash = '/';
      return;
    }
    const abort = new AbortController();
    (async () => {
      try {
        if (id) {
          const p = await productService.getProductById(id, abort.signal);
          setProduct(p);
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          console.error('Failed to load product', e);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, [id]);

  if (loading) return (
    <div className="auth-form" style={{ textAlign: 'center' }}>
      <p>Laddar produkt…</p>
    </div>
  );
  if (!product) return (
    <div className="auth-form" style={{ textAlign: 'center' }}>
      <p>Produkt hittades inte.</p>
    </div>
  );

  const available = (product.stockQuantity > 0) && !!product.active;
  return (
    <section className="auth-form" aria-labelledby="product-title">
      <h2 id="product-title" style={{ textAlign: 'center', marginTop: 0 }}>{product.name}</h2>
      {(() => { const img = getProductPrimaryImage(product); if (!img) return null; return (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <img src={resolveImageUrl(img)} alt={product.name} style={{ maxWidth: 420, borderRadius: 12 }} />
        </div>
      ); })()}
      <p>{product.description || 'Ingen beskrivning'}</p>
      <div style={{ display: 'grid', gap: '0.5rem', alignItems: 'start' }}>
        <div><strong>Pris:</strong> {formatPriceSEK(product.price)}{product.currency && product.currency.toUpperCase() !== 'SEK' ? ` ${product.currency}` : ''}</div>
        <div><strong>Lagerstatus:</strong> {available ? 'I lager' : 'Slut / inaktiv'}</div>
        <div>
          <button
            type="button"
            className="btn-primary btn-inline"
            disabled={!token || !available}
            onClick={() => {
              const tokenNow = localStorage.getItem('token');
              if (!tokenNow) {
                alert('Du måste vara inloggad för att lägga till i kundvagnen.');
                window.dispatchEvent(new Event('show-login'));
                window.location.hash = '/';
                return;
              }
              const img = getProductPrimaryImage(product);
              addToCart({ id: product.id, name: product.name, price: product.price, imageUrl: img ? resolveImageUrl(img) : undefined });
            }}
            aria-label={`Lägg ${product.name} i kundvagnen`}
            title={!available ? 'Produkten är inte tillgänglig' : (token ? 'Lägg i kundvagnen' : 'Logga in för att handla')}
          >
            {token ? (available ? 'Lägg i kundvagn' : 'Ej tillgänglig') : 'Logga in för att handla'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
