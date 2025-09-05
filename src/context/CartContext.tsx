import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import formatPriceSEK from '../utils/formatPrice';

export type Product = { id: string; name: string; price: number; imageUrl?: string };
export type CartItem = { id: string; name: string; price: number; imageUrl?: string; qty: number };

type State = {
  items: CartItem[];
};

type Action =
  | { type: 'ADD'; payload: Product }
  | { type: 'REMOVE'; payload: { id: string } }
  | { type: 'UPDATE_QTY'; payload: { id: string; qty: number } }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; payload: { items: CartItem[] } };

const initialState: State = { items: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE': {
      const items = sanitizeItems(action.payload.items);
      return { items };
    }
    case 'ADD': {
      const idx = state.items.findIndex(i => i.id === action.payload.id);
      if (idx >= 0) {
        const next = [...state.items];
        const current = next[idx];
        const newQty = Math.min(99, (current.qty ?? 0) + 1);
        next[idx] = { ...current, qty: newQty };
        return { items: next };
      }
      const newItem: CartItem = {
        id: action.payload.id,
        name: action.payload.name,
        price: action.payload.price,
        imageUrl: action.payload.imageUrl,
        qty: 1,
      };
      return { items: [...state.items, newItem] };
    }
    case 'REMOVE': {
      return { items: state.items.filter(i => i.id !== action.payload.id) };
    }
    case 'UPDATE_QTY': {
      let { qty } = action.payload;
      if (!Number.isFinite(qty)) qty = 1;
      qty = Math.max(1, Math.min(99, Math.round(qty)));
      return {
        items: state.items.map(i => i.id === action.payload.id ? { ...i, qty } : i)
      };
    }
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

function sanitizeItems(items: CartItem[]): CartItem[] {
  return (items ?? []).map(i => ({
    id: String(i.id),
    name: String(i.name),
    price: Number(i.price) || 0,
    imageUrl: i.imageUrl,
    qty: Math.max(1, Math.min(99, Math.round(Number(i.qty) || 1)))
  }));
}

function calcTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export type CartContextValue = {
  items: CartItem[];
  total: number;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart');
      if (raw) {
        const parsed = JSON.parse(raw) as { items?: CartItem[] } | CartItem[];
        const items = Array.isArray(parsed) ? parsed : parsed?.items ?? [];
        dispatch({ type: 'HYDRATE', payload: { items } });
      }
    } catch (e) {
      console.warn('Failed to read cart from localStorage', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify({ items: state.items }));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [state.items]);

  const value = useMemo<CartContextValue>(() => ({
    items: state.items,
    total: calcTotal(state.items),
    addToCart: (p) => dispatch({ type: 'ADD', payload: p }),
    removeFromCart: (id) => dispatch({ type: 'REMOVE', payload: { id } }),
    updateQty: (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
  }), [state.items]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export { formatPriceSEK };
