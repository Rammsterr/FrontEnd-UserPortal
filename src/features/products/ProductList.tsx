import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productService, { ProductResponse } from './productService';

// Produktlista – visar produkter. När backend är redo, fylls listan från API.
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        const page = await productService.listProducts({ page: 0, size: 20, sortBy: 'name', sortDir: 'asc' }, abort.signal);
        setProducts(page.content);
      } catch (e: any) {
        // Swallow AbortError (happens in React StrictMode due to effect double-invoke)
        if (e?.name !== 'AbortError') {
          console.error('Failed to load products', e);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, []);

  if (loading) return (
    <div className="auth-form" style={{ textAlign: 'center' }}>
      <p>Laddar produkter…</p>
    </div>
  );

  return (
    <section className="auth-form" aria-labelledby="products-title">
      <h2 id="products-title" style={{ textAlign: 'center', marginTop: 0 }}>Produkter</h2>
      {products.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Inga produkter ännu. Backend-integration kommer fylla listan.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
          {products.map(p => (
            <li key={p.id} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', alignItems: 'center', gap: '0.75rem' }}>
              {/* Bild */}
              <Link to={`/products/${p.id}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: 8, background: 'rgba(0,0,0,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                    No img
                  </div>
                )}
              </Link>
              {/* Namn */}
              <Link className="btn-secondary btn-inline" to={`/products/${p.id}`}>{p.name}</Link>
              {/* Status */}
              {(p.stockQuantity <= 0 || !p.active) && <span style={{marginLeft: 8, color: 'red', whiteSpace: 'nowrap'}}>(Ej tillgänglig)</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ProductList;
