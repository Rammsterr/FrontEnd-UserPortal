import React, { useState } from 'react';
import productService, { ProductRequest, ProductResponse } from './productService';

// Enkel formulärkomponent för att lägga till/redigera produkter (admin framöver)
interface Props {
  product?: Partial<ProductResponse>;
  onSaved?: (p: ProductResponse) => void;
}

const ProductForm: React.FC<Props> = ({ product, onSaved }) => {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState<string>('SEK');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<ProductResponse | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setCreated(null);
    try {
      const payload: ProductRequest = {
        name,
        description: description || undefined,
        price: price === '' ? 0 : Number(price),
        currency,
        categoryId: categoryId || undefined,
        categoryName: categoryName || undefined
      };
      if (!payload.price || payload.price <= 0) {
        throw new Error('Pris måste vara > 0');
      }

      let saved: ProductResponse;
      if (product?.id) {
        throw new Error('Uppdatering stöds inte av backend ännu.');
      } else {
        saved = await productService.addProduct(payload);
      }
      setCreated(saved);
      onSaved?.(saved);
    } catch (err: any) {
      setError(err?.message || 'Något gick fel vid sparande.');
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

      <label>Pris</label>
      <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} />

      <label>Valuta (ISO 4217, 3 tecken)</label>
      <input value={currency} maxLength={3} onChange={(e) => setCurrency(e.target.value.toUpperCase())} required />

      <fieldset style={{ marginTop: '0.5rem' }}>
        <legend>Kategori (valfritt)</legend>
        <label>Category ID</label>
        <input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="t.ex. 123e4567-..." />
        <label>Category Name</label>
        <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="t.ex. Elektronik" />
        <small>Enligt backend: ange antingen categoryId eller categoryName (eller lämna båda tomma).</small>
      </fieldset>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {created && (
        <p style={{ color: 'green' }}>Skapad produkt: {created.name} (ID: {created.id})</p>
      )}

      <button className="btn-primary" type="submit" disabled={saving}>
        {saving ? 'Sparar…' : 'Spara'}
      </button>
    </form>
  );
};

export default ProductForm;
