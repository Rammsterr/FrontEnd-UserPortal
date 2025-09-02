import React from 'react';
import { Product } from './productService';

// Lagerstatus och tillgänglighet (visuell komponent)
const ProductInventory: React.FC<{ product: Product | null }> = ({ product }) => {
  if (!product) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <strong>Lager:</strong>{' '}
      {product.inStock ? `I lager (${product.availableQuantity ?? 'okänd kvantitet'})` : 'Slut i lager'}
    </div>
  );
};

export default ProductInventory;
