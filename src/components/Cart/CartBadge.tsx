import React from 'react';
import { useCart } from '../../context/CartContext';
import formatPriceSEK from '../../utils/formatPrice';

type Props = { onClick?: () => void };

const CartBadge: React.FC<Props> = ({ onClick }) => {
  const { items, total } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const handleClick = () => {
    if (!token) {
      // Requirement: nothing should happen when not logged in
      return;
    }
    onClick?.();
  };
  return (
    <button
      type="button"
      aria-label={token ? `Kundvagn, ${count} varor, totalt ${formatPriceSEK(total)}` : 'Logga in för att se kundvagnen'}
      title={token ? undefined : 'Logga in för att se kundvagnen'}
      className="btn-secondary btn-inline"
      onClick={handleClick}
      disabled={!token}
    >
      🛒 {count} | {formatPriceSEK(total)}
    </button>
  );
};

export default CartBadge;
