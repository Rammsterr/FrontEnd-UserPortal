import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import productService, { Product } from './productService';

// Produktdetaljer – visar detaljerad info om en produkt.
const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        if (id) {
          const p = await productService.getProductById(id, abort.signal);
          setProduct(p);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, [id]);

  if (loading) return <p>Laddar produkt…</p>;
  if (!product) return <p>Produkt hittades inte.</p>;

  return (
    <section>
      <h2>{product.name}</h2>
      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.name} style={{ maxWidth: 320 }} />
      )}
      <p>{product.description || 'Ingen beskrivning'}</p>
      <p>
        Pris: {product.price ?? '-'} {product.currency ?? ''}
      </p>
      <p>
        Lagerstatus: {product.inStock ? 'I lager' : 'Slut i lager'}
      </p>
    </section>
  );
};

export default ProductDetails;
