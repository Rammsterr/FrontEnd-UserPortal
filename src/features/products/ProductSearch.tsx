import React, { useState } from 'react';
import productService, { ProductResponse } from './productService';

// Sök- och filtreringskomponent (grund)
const ProductSearch: React.FC = () => {
  const [name, setName] = useState('');
  const [results, setResults] = useState<ProductResponse[]>([]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await productService.searchProducts({ name });
    setResults(data);
  };

  return (
    <section>
      <h3>Sök produkter</h3>
      <form onSubmit={onSearch} className="auth-form">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sök…" />
        <button className="btn-primary" type="submit">Sök</button>
      </form>
      {results.length > 0 && (
        <ul>
          {results.map(p => (<li key={p.id}>{p.name}</li>))}
        </ul>
      )}
    </section>
  );
};

export default ProductSearch;
