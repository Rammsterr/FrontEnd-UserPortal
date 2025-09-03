// Product Service integration adapted to Spring Boot backend described in issue.
// Base URL: http://localhost:8081 (ProductService) | UserService remains at http://localhost:8080
// API base path: /api/products
// Swagger UI: `${baseUrl}/swagger-ui/index.html`

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  categoryName: string | null;
  stockQuantity: number;
  active: boolean;
  attributes: Record<string, string>;
  images: string[];
}

export interface ProductRequest {
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  categoryId?: string | null;
  categoryName?: string | null;
  stockQuantity?: number | null;
  attributes?: Record<string, string> | null;
  imageUrls?: string[] | null;
}

export interface ValidationErrorDetail {
  field: string;
  error: string;
}

export interface ApiErrorValidation {
  error: 'Validation failed' | 'validation_failed';
  details?: ValidationErrorDetail[];
  message?: string;
}
export interface ApiErrorConflict {
  error: 'Conflict' | 'conflict';
  message: string;
}
export type ApiError = Partial<ApiErrorValidation & ApiErrorConflict> & { [k: string]: any };

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

const baseUrl = process.env.REACT_APP_PRODUCT_API_BASE_URL || 'http://localhost:8081';

function toQuery(params: Record<string, any>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export const productService = {
  // List paginated products according to backend contract
  async listProducts(params?: { page?: number; size?: number; sortBy?: string; sortDir?: 'asc' | 'desc' }, signal?: AbortSignal): Promise<PageResponse<ProductResponse>> {
    const q = new URLSearchParams({
      page: String(params?.page ?? 0),
      size: String(params?.size ?? 20),
      sortBy: String(params?.sortBy ?? 'name'),
      sortDir: String(params?.sortDir ?? 'asc'),
    });
    const res = await fetch(`${baseUrl}/api/products?${q.toString()}`, { signal, headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
    return await res.json();
  },

  // List all products without pagination
  async listAllProducts(signal?: AbortSignal): Promise<ProductResponse[]> {
    const res = await fetch(`${baseUrl}/api/products/all`, { signal, headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
    return await res.json();
  },

  // No dedicated GET by id endpoint documented; temporary fallback: fetch all and find client-side
  async getProductById(id: string, signal?: AbortSignal): Promise<ProductResponse | null> {
    try {
      const all = await productService.listAllProducts(signal);
      return all.find(p => p.id === id) ?? null;
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
      throw new Error('Failed to load product');
    }
  },

  // No search endpoint in backend spec; emulate a simple name contains filter client-side
  async searchProducts(query: { q?: string }, signal?: AbortSignal): Promise<ProductResponse[]> {
    const term = (query.q ?? '').toLowerCase().trim();
    const all = await productService.listAllProducts(signal);
    if (!term) return all;
    return all.filter(p => p.name.toLowerCase().includes(term));
  },

  async addProduct(product: ProductRequest): Promise<ProductResponse> {
    const token = localStorage.getItem('token');
    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(product)
    });
    if (!res.ok) {
      let errBody: any;
      try { errBody = await res.json(); } catch {}
      if (res.status === 409) {
        const msg = errBody?.message || 'Konflikt: namn eller slug upptagen';
        throw new Error(msg);
      }
      if (res.status === 400) {
        const detailsArr = (errBody?.details as ValidationErrorDetail[] | undefined);
        if (detailsArr && detailsArr.length) {
          const details = detailsArr.map((d: ValidationErrorDetail) => `${d.field}: ${d.error}`).join('; ');
          throw new Error(`Valideringsfel: ${details}`);
        }
        throw new Error(errBody?.message || 'Valideringsfel vid skapande av produkt');
      }
      throw new Error(`Misslyckades att skapa produkt: ${res.status}`);
    }
    return await res.json();
  },

  // Update/delete/image upload are not available in backend spec; expose stubs to avoid runtime 404s
  async updateProduct(): Promise<ProductResponse> {
    throw new Error('Update product is not supported by backend yet');
  },
  async deleteProduct(): Promise<void> {
    throw new Error('Delete product is not supported by backend yet');
  },
  async uploadProductImage(): Promise<string> {
    throw new Error('Image upload is not supported by backend. Provide imageUrls in ProductRequest when creating product.');
  }
};

export default productService;
