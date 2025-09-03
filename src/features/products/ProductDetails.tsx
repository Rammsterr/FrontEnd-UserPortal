import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import productService, { ProductResponse } from './productService';

// Produktdetaljer – visar detaljerad info om en produkt.
const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <section className="auth-form" aria-labelledby="product-title">
      <h2 id="product-title" style={{ textAlign: 'center', marginTop: 0 }}>{product.name}</h2>
      {product.images && product.images.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <img src={product.images[0]} alt={product.name} style={{ maxWidth: 420, borderRadius: 12 }} />
        </div>
      )}
      <p>{product.description || 'Ingen beskrivning'}</p>
      <p>
        <strong>Pris:</strong> {product.price ?? '-'} {product.currency ?? ''}
      </p>
      <p>
        <strong>Lagerstatus:</strong> {product.stockQuantity > 0 && product.active ? 'I lager' : 'Slut / inaktiv'}
      </p>
    </section>
  );
};

export default ProductDetails;
