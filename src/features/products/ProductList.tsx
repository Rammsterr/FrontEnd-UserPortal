import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import productService, { ProductResponse, resolveImageUrl, getProductPrimaryImage } from './productService';

// Produktlista – utökad sök/filtrering via querystring (?name=&category=&min=&max=)
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Läs parametrar från URL
  const nameParam = searchParams.get('name') ?? '';
  const categoryParam = searchParams.get('category') ?? '';
  const minParam = searchParams.get('min') ?? '';
  const maxParam = searchParams.get('max') ?? '';

  // Lokalt formulärstate + debounce
  const [name, setName] = useState(nameParam);
  const [category, setCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState(minParam);
  const [maxPrice, setMaxPrice] = useState(maxParam);

  useEffect(() => { setName(nameParam); }, [nameParam]);
  useEffect(() => { setCategory(categoryParam); }, [categoryParam]);
  useEffect(() => { setMinPrice(minParam); }, [minParam]);
  useEffect(() => { setMaxPrice(maxParam); }, [maxParam]);

  const debouncedName = useDebouncedValue(name, 300);
  const debouncedCategory = useDebouncedValue(category, 300);
  const debouncedMin = useDebouncedValue(minPrice, 300);
  const debouncedMax = useDebouncedValue(maxPrice, 300);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        setLoading(true);
        // Om något filter är ifyllt, använd client-side filter; annars ladda en sida från backend
        const hasAnyFilter = !!(debouncedName || debouncedCategory || debouncedMin || debouncedMax);
        if (hasAnyFilter) {
          const results = await productService.searchProducts({
            name: debouncedName,
            category: debouncedCategory,
            minPrice: debouncedMin,
            maxPrice: debouncedMax,
          }, abort.signal);
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
  }, [debouncedName, debouncedCategory, debouncedMin, debouncedMax]);

  return (
    <section className="auth-form products-form" aria-labelledby="products-title">
      <h2 id="products-title" style={{ textAlign: 'center', marginTop: 0 }}>Produkter</h2>

      {/* Filtreringsformulär – synkar med URL:ens query */}
      <form
        role="search"
        aria-label="Sök produkter"
        className="filter-grid"
        onSubmit={(e) => {
          e.preventDefault();
          const nextParams: Record<string, string> = {};
          const n = name.trim();
          const c = category.trim();
          let minStr = minPrice.trim();
          let maxStr = maxPrice.trim();
          // Om både min och max finns och min > max, byt plats för en bättre UX
          const minNum = minStr !== '' ? Number(minStr) : NaN;
          const maxNum = maxStr !== '' ? Number(maxStr) : NaN;
          if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
            const tmp = minStr; minStr = maxStr; maxStr = tmp;
            setMinPrice(minStr); setMaxPrice(maxStr);
          }
          if (n) nextParams.name = n;
          if (c) nextParams.category = c;
          if (minStr) nextParams.min = minStr;
          if (maxStr) nextParams.max = maxStr;
          setSearchParams(nextParams);
        }}
      >
        <label htmlFor="name" className="visually-hidden">Namn</label>
        <input
          id="name"
          type="search"
          placeholder="Namn…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
        <label htmlFor="category" className="visually-hidden">Kategori</label>
        <input
          id="category"
          type="search"
          placeholder="Kategori…"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
        />
        <label htmlFor="min" className="visually-hidden">Lägsta pris</label>
        <input
          id="min"
          type="number"
          inputMode="decimal"
          placeholder="Lägsta pris"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="input"
        />
        <label htmlFor="max" className="visually-hidden">Högsta pris</label>
        <input
          id="max"
          type="number"
          inputMode="decimal"
          placeholder="Högsta pris"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="input"
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-primary btn-inline" type="submit">Sök</button>
          {(nameParam || categoryParam || minParam || maxParam) && (
            <button
              type="button"
              className="btn-secondary btn-inline"
              onClick={() => { setName(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setSearchParams({}); }}
            >Rensa</button>
          )}
        </div>
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
