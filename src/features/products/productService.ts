// Product Service integration adapted to Spring Boot backend described in issue.
// Base URL: https://productservice.drillbi.se (ProductService) | UserService at https://userservice.drillbi.se
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
  // Optional alternative fields some backends may use
  imageUrls?: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
  mainImageUrl?: string;
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

export const productApiBaseUrl = process.env.REACT_APP_PRODUCT_API_BASE_URL || 'https://productservice.drillbi.se';
export const productAssetsBaseUrl = process.env.REACT_APP_PRODUCT_ASSETS_BASE_URL || productApiBaseUrl;

// Join base and path with normalized single slash
function joinUrl(base: string, path: string): string {
  const b = (base || '').replace(/\/+$/, '');
  const p = (path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

// Resolve image URL possibly returned as relative path from backend
export function resolveImageUrl(src: string | undefined | null): string {
  const s = (src ?? '').trim();
  if (!s) return '';
  // Absolute URLs (http, https), protocol-relative (//), data URIs, blob and filesystem should pass through
  if (/^(?:https?:)?\/\//i.test(s) || s.startsWith('data:') || s.startsWith('blob:') || s.startsWith('filesystem:')) return s;
  // Otherwise, treat as path relative to the assets base (fallbacks to API base)
  return joinUrl(productAssetsBaseUrl, s);
}

// Try to determine a primary image URL from varying backend response shapes
export function getProductPrimaryImage(p: ProductResponse | null | undefined): string | null {
  if (!p) return null;
  if (Array.isArray(p.images) && p.images.length > 0) return p.images[0] ?? null;
  if (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) return p.imageUrls[0] ?? null;
  if (p.imageUrl) return p.imageUrl;
  if (p.thumbnailUrl) return p.thumbnailUrl;
  if (p.mainImageUrl) return p.mainImageUrl;
  return null;
}

export const productService = {
  // List paginated products according to backend contract. Optional name search support when backend adds it.
  async listProducts(params?: { page?: number; size?: number; sortBy?: string; sortDir?: 'asc' | 'desc'; search?: string }, signal?: AbortSignal): Promise<PageResponse<ProductResponse>> {
    const q = new URLSearchParams({
      page: String(params?.page ?? 0),
      size: String(params?.size ?? 20),
      sortBy: String(params?.sortBy ?? 'name'),
      sortDir: String(params?.sortDir ?? 'asc'),
      ...(params?.search ? { search: params.search } : {}),
    } as Record<string, string>);
    const res = await fetch(`${productApiBaseUrl}/api/products?${q.toString()}`, { signal, headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
    return await res.json();
  },

  // List all products without pagination
  async listAllProducts(signal?: AbortSignal): Promise<ProductResponse[]> {
    const res = await fetch(`${productApiBaseUrl}/api/products/all`, { signal, headers: { 'Accept': 'application/json' } });
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
    const res = await fetch(`${productApiBaseUrl}/api/products`, {
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

  // Update/delete are not available in backend spec; expose stubs to avoid runtime 404s
  async updateProduct(): Promise<ProductResponse> {
    throw new Error('Update product is not supported by backend yet');
  },
  async deleteProduct(): Promise<void> {
    throw new Error('Delete product is not supported by backend yet');
  },
  async uploadProductImage(file: File): Promise<string> {
    const token = localStorage.getItem('token');
    const uploadPath = process.env.REACT_APP_PRODUCT_IMAGE_UPLOAD_PATH || '/api/products/images';
    const url = joinUrl(productApiBaseUrl, uploadPath);

    const form = new FormData();
    form.append('file', file);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: form
    });

    if (!res.ok) {
      let errBody: any;
      try { errBody = await res.json(); } catch {}
      const msg = errBody?.message || `Misslyckades att ladda upp bild: ${res.status}`;
      throw new Error(msg);
    }

    // Accept common backend shapes
    const data = await res.json();
    const urlField = data?.url || data?.imageUrl || data?.path || data?.location;
    if (!urlField) {
      throw new Error('Uppladdning lyckades men inget bild-URL-fält hittades i svaret. Förväntade fält: url | imageUrl | path | location');
    }
    return String(urlField);
  }
};

export default productService;
