// Product Service API stubs prepared for future Spring Boot backend integration.
// NOTE: Methods are defined with signatures and placeholder implementations.
// When the Product Service backend is available, replace baseUrl and complete implementations.

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  sku?: string;
  category?: string;
  imageUrl?: string;
  inStock?: boolean;
  availableQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQuery {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const baseUrl = process.env.REACT_APP_PRODUCT_API_BASE_URL || 'http://localhost:8081';
// Swagger UI (to be linked later): `${baseUrl}/swagger-ui/index.html`

// Helper to build query string
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toQuery(params: Record<string, any>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export const productService = {
  async getAllProducts(signal?: AbortSignal): Promise<Product[]> {
    // Placeholder implementation — returns empty until backend is ready.
    // Replace with: await fetch(`${baseUrl}/api/products`, { signal }).then(r => r.json())
    return [];
  },

  async getProductById(id: string, signal?: AbortSignal): Promise<Product | null> {
    // Replace with fetch to `${baseUrl}/api/products/${id}`
    return null;
  },

  async searchProducts(query: ProductQuery, signal?: AbortSignal): Promise<Product[]> {
    // Replace with fetch to `${baseUrl}/api/products/search${toQuery(query)}`
    return [];
  },

  async addProduct(product: Partial<Product>): Promise<Product> {
    // Requires auth (e.g., admin). Replace with POST to `${baseUrl}/api/products`.
    return { id: 'temp-id', name: product.name || 'Ny produkt' } as Product;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    // Replace with PUT/PATCH to `${baseUrl}/api/products/${id}`
    return { id, name: product.name || 'Uppdaterad produkt' } as Product;
  },

  async deleteProduct(id: string): Promise<void> {
    // Replace with DELETE to `${baseUrl}/api/products/${id}`
    return;
  },

  async uploadProductImage(id: string, file: File): Promise<string> {
    // Prepare for Azure Blob or backend file handling later.
    // Replace with POST to `${baseUrl}/api/products/${id}/image`
    // Returns image URL (placeholder for now).
    return `https://placeholder.local/images/${id}`;
  }
};

export default productService;
