import React from 'react';

// Bilduppladdning stöds inte av backend ännu. Visa info och instruktion.
const ProductImageUpload: React.FC = () => {
  return (
    <div>
      <label>Produktbilder</label>
      <p style={{ marginTop: 4 }}>
        Backend stöder för närvarande inte filuppladdning. Lägg till bild-URL:er i fältet imageUrls när du skapar produkten.
      </p>
    </div>
  );
};

export default ProductImageUpload;
