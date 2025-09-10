// Order Service client
// Assumptions:
// - Base URL configured via REACT_APP_ORDER_API_BASE_URL, fallback to https://orderservice.drillbi.se
// - Endpoint to create order: POST /api/orders with Authorization: Bearer <token>
// - Endpoint to get history: GET /api/orders/history (JWT)
// - Payload shape: { items: [{ productId: string, quantity: number }]} and optional notes/shipping data later

export interface OrderItemRequest { productId: string; quantity: number; }
export interface CreateOrderRequest { items: OrderItemRequest[]; }
export interface CreateOrderResponse { id: string; status?: string; totalAmount?: number; currency?: string; message?: string; }

export interface OrderHistoryItem {
  id: string;
  createdAt?: string;
  orderDate?: string;
  totalAmount?: number;
  total?: number;
  currency?: string;
  items?: Array<{ productId?: string; name?: string; productName?: string; quantity?: number; price?: number }>;
}

export const orderApiBaseUrl = process.env.REACT_APP_ORDER_API_BASE_URL || 'https://orderservice.drillbi.se';

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
  const res = await fetch(`${orderApiBaseUrl}/api/orders/history`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    let msg = `Kunde inte hämta orderhistorik (${res.status})`;
    try { const body = await res.json(); msg = body?.message || body?.error || msg; } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  if (Array.isArray(data)) return data as OrderHistoryItem[];
  // Some backends might wrap in { orders: [...] } or { content: [...] }
  if (Array.isArray((data as any)?.orders)) return (data as any).orders as OrderHistoryItem[];
  if (Array.isArray((data as any)?.content)) return (data as any).content as OrderHistoryItem[];
  return [];
}
