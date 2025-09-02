import React, { useState } from 'react';
import productService, { Product } from './productService';

// Enkel formulärkomponent för att lägga till/redigera produkter (admin framöver)
interface Props {
  product?: Partial<Product>;
  onSaved?: (p: Product) => void;
}

const ProductForm: React.FC<Props> = ({ product, onSaved }) => {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let saved: Product;
      if (product?.id) {
        saved = await productService.updateProduct(product.id, { name, description });
      } else {
        saved = await productService.addProduct({ name, description });
      }
      onSaved?.(saved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <h3>{product?.id ? 'Redigera produkt' : 'Ny produkt'}</h3>
      <label>Namn</label>
      <input value={name} onChange={(e) => setName(e.target.value)} required />
      <label>Beskrivning</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      <button className="btn-primary" type="submit" disabled={saving}>
        {saving ? 'Sparar…' : 'Spara'}
      </button>
    </form>
  );
};

export default ProductForm;
