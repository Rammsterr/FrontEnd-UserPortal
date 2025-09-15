// Order Service client
// Assumptions:
// - Base URL configured via REACT_APP_ORDER_API_BASE_URL, fallback to https://orderservice.drillbi.se
// - Purchase endpoint: POST /api/orders/purchase (JWT) expects { productId, quantity }
// - Legacy create order endpoint remains for backward compatibility
// - History: GET /api/orders (or /api/orders/history fallback)

export interface OrderItemRequest { productId: string; quantity: number; }
export interface CreateOrderRequest { items: OrderItemRequest[]; }
export interface CreateOrderResponse { id: string; status?: string; totalAmount?: number; currency?: string; message?: string; }

// Purchase request must match backend exactly
export interface PurchaseRequest { productId: string; quantity: number }
export interface PurchaseResponse { orderId: string; orderNumber?: string; totalAmount?: number }

export interface OrderHistoryItem {
  id: string;
  createdAt?: string;
  orderDate?: string;
  status?: string;
  totalAmount?: number;
  total?: number;
  currency?: string;
  items?: Array<{ productId?: string; name?: string; productName?: string; quantity?: number; price?: number }>;
}

export const orderApiBaseUrl = process.env.REACT_APP_ORDER_API_BASE_URL || 'https://orderservice.drillbi.se';

export async function purchase(req: PurchaseRequest): Promise<PurchaseResponse> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Missing bearer token');

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  } as const;

  // Log request body and headers
  try {
    console.log('[OrderService] POST /api/orders/purchase request', {
      url: `${orderApiBaseUrl}/api/orders/purchase`,
      headers,
      body: req
    });
  } catch {}

  const res = await fetch(`${orderApiBaseUrl}/api/orders/purchase`, {
    method: 'POST',
    mode: 'cors',
    headers,
    body: JSON.stringify(req)
  });

  const text = await res.text();
  // Log response status and text
  try { console.log('[OrderService] Response', { status: res.status, ok: res.ok, text }); } catch {}

  if (!res.ok) {
    // Try to parse error from response text (problem+json or generic)
    try {
      const body = JSON.parse(text);
      const detail = body?.detail || body?.message || body?.error;
      if (detail) throw new Error(detail);
    } catch (_) {
      // ignore parse error and fallback
    }
    throw new Error(`Köp misslyckades (${res.status})`);
  }

  try {
    return JSON.parse(text);
  } catch {
    // If backend returned empty body
    return { orderId: '' } as PurchaseResponse;
  }
}

export async function createOrder(req: CreateOrderRequest): Promise<CreateOrderResponse> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Du måste vara inloggad för att skapa en order.');
  const res = await fetch(`${orderApiBaseUrl}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(req)
  });
  if (!res.ok) {
    let msg = `Kunde inte skapa order (${res.status})`;
    try { const body = await res.json(); msg = body?.message || body?.error || msg; } catch {}
    throw new Error(msg);
  }
  return await res.json();
}

export async function getOrderHistory(): Promise<OrderHistoryItem[]> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Du måste vara inloggad för att visa orderhistorik.');

  async function fetchHistory(url: string): Promise<Response> {
    return fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
    });
  }

  // Primary: per requirement, try GET /api/orders first
  let res = await fetchHistory(`${orderApiBaseUrl}/api/orders`);

  // Fallback to legacy /history if needed
  if (!res.ok && (res.status === 404 || res.status === 405)) {
    res = await fetchHistory(`${orderApiBaseUrl}/api/orders/history`);
  }

  if (!res.ok) {
    let msg = `Kunde inte hämta orderhistorik (${res.status})`;
    try { const body = await res.json(); msg = body?.message || body?.error || msg; } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  if (Array.isArray(data)) return data as OrderHistoryItem[];
  if (Array.isArray((data as any)?.orders)) return (data as any).orders as OrderHistoryItem[];
  if (Array.isArray((data as any)?.content)) return (data as any).content as OrderHistoryItem[];
  return [];
}
