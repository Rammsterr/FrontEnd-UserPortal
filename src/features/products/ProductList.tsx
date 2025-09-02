import React, { useEffect, useState } from 'react';
import productService, { Product } from './productService';

// Produktlista – visar produkter. När backend är redo, fylls listan från API.
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        const data = await productService.getAllProducts(abort.signal);
        setProducts(data);
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, []);

  if (loading) return <p>Laddar produkter…</p>;

  return (
    <section>
      <h2>Produkter</h2>
      {products.length === 0 ? (
        <p>Inga produkter ännu. Backend-integration kommer fylla listan.</p>
      ) : (
        <ul>
          {products.map(p => (
            <li key={p.id}>
              <a href={`#/products/${p.id}`}>{p.name}</a>
              {p.inStock === false && <span style={{marginLeft: 8, color: 'red'}}>(Slut i lager)</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ProductList;
