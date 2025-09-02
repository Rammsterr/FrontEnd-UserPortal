import React, { useRef, useState } from 'react';
import productService from './productService';

// Grund för filuppladdning av produktbilder
const ProductImageUpload: React.FC<{ productId: string; onUploaded?: (url: string) => void }>
  = ({ productId, onUploaded }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await productService.uploadProductImage(productId, file);
      onUploaded?.(url);
    } catch (err) {
      setError('Uppladdning misslyckades. Försök igen.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label>Ladda upp bild</label>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} />
      {uploading && <p>Laddar upp…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ProductImageUpload;
