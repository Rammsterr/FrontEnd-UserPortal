import React from 'react';
import { useCart } from '../../context/CartContext';
import formatPriceSEK from '../../utils/formatPrice';

type Props = { onClick?: () => void };

const CartBadge: React.FC<Props> = ({ onClick }) => {
  const { items, total } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);
  return (
    <button
      type="button"
      aria-label={`Kundvagn, ${count} varor, totalt ${formatPriceSEK(total)}`}
      className="btn-secondary btn-inline"
      onClick={onClick}
    >
      🛒 {count} | {formatPriceSEK(total)}
    </button>
  );
};

export default CartBadge;
