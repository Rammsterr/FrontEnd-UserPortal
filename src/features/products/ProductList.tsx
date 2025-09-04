import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import productService, { ProductResponse, resolveImageUrl, getProductPrimaryImage } from './productService';

// Produktlista – med förberedd sökfunktionalitet via querystring (?q=)
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';

  // Enkel debounce så vi inte gör anrop vid varje tangenttryck
  const [input, setInput] = useState(q);
  useEffect(() => setInput(q), [q]);
  const debouncedQ = useDebouncedValue(input, 300);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        setLoading(true);
        // Använd backendens paginerade listning tills riktigt sök-API finns.
        // Om debouncedQ finns, använd temporär client-side filter via searchProducts.
        if (debouncedQ) {
          const results = await productService.searchProducts({ q: debouncedQ }, abort.signal);
          setProducts(results);
        } else {
          const page = await productService.listProducts({ page: 0, size: 20, sortBy: 'name', sortDir: 'asc' }, abort.signal);
          setProducts(page.content);
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          console.error('Failed to load products', e);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, [debouncedQ]);

  return (
    <section className="auth-form" aria-labelledby="products-title">
      <h2 id="products-title" style={{ textAlign: 'center', marginTop: 0 }}>Produkter</h2>

      {/* Sökfält – synkar med URL:ens query (?q=) */}
      <form
        role="search"
        aria-label="Sök produkter"
        onSubmit={(e) => {
          e.preventDefault();
          const next = input.trim();
          if (next) setSearchParams({ q: next }); else setSearchParams({});
        }}
        style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '0.5rem 0 1rem' }}
      >
        <label htmlFor="search" className="visually-hidden">Sök produkter</label>
        <input
          id="search"
          type="search"
          placeholder="Sök produkter…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
          style={{ minWidth: 240 }}
        />
        <button className="btn-primary btn-inline" type="submit">Sök</button>
        {q && (
          <button
            type="button"
            className="btn-secondary btn-inline"
            onClick={() => { setInput(''); setSearchParams({}); }}
          >Rensa</button>
        )}
      </form>

      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <p>Laddar produkter…</p>
        </div>
      ) : products.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Inga produkter matchade din sökning.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
          {products.map(p => (
            <li key={p.id} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', alignItems: 'center', gap: '0.75rem' }}>
              {/* Bild */}
              <Link to={`/products/${p.id}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {(() => { const img = getProductPrimaryImage(p); if (img) {
                  return (<img src={resolveImageUrl(img)} alt={p.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />);
                }
                return (
                  <div style={{ width: 64, height: 64, borderRadius: 8, background: 'rgba(0,0,0,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                    No img
                  </div>
                ); })()}
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

// Enkel hook för debounce av ett värde
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
