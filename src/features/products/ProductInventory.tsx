import React from 'react';
import { ProductResponse } from './productService';

// Lagerstatus och tillgänglighet (visuell komponent)
const ProductInventory: React.FC<{ product: ProductResponse | null }> = ({ product }) => {
  if (!product) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <strong>Lager:</strong>{' '}
      {product.active && product.stockQuantity > 0 ? `I lager (${product.stockQuantity})` : 'Slut / inaktiv'}
    </div>
  );
};

export default ProductInventory;
