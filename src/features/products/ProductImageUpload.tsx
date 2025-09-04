import React, { useRef, useState } from 'react';
import productService, { resolveImageUrl } from './productService';

interface Props {
  value?: string[];
  onChange?: (urls: string[]) => void;
  multiple?: boolean;
}

// Komponent för att ladda upp produktbilder via backend och förhandsvisa resultatet.
const ProductImageUpload: React.FC<Props> = ({ value = [], onChange, multiple = true }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const current = [...value];
      for (let i = 0; i < files.length; i++) {
        const f = files.item(i)!;
        const url = await productService.uploadProductImage(f);
        current.push(url);
      }
      onChange?.(current);
    } catch (e: any) {
      setError(e?.message || 'Misslyckades att ladda upp bild(er).');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange?.(next);
  };

  return (
    <div>
      <label>Produktbilder</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={uploading}
      />
      {uploading && <p>Laddar upp…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {value.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
          {value.map((u, idx) => (
            <li key={idx} style={{ position: 'relative' }}>
              <img src={resolveImageUrl(u)} alt={`Produktbild ${idx + 1}`} style={{ width: '100%', height: 72, objectFit: 'cover', borderRadius: 8 }} />
              <button type="button" className="btn-secondary btn-inline" onClick={() => removeAt(idx)} style={{ position: 'absolute', top: 4, right: 4 }}>
                Ta bort
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductImageUpload;
