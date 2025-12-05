interface CartItem {
  id: string;
  name: string;
  credits: number;
  price: number;
  quantity: number;
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItemRow = ({ item, onUpdateQuantity, onRemove }: CartItemRowProps) => {
  return (
    <tr className="border-b border-light">
      <td className="py-6 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
          </div>
        </div>
      </td>
      <td className="text-center py-6 px-2">
        <span className="text-sm font-medium text-primary">{item.credits.toLocaleString()}</span>
      </td>
      <td className="text-center py-6 px-2">
        <span className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</span>
      </td>
      <td className="text-center py-6 px-2">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 rounded border border-light flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 rounded border border-light flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            disabled={item.quantity >= 99}
          >
            +
          </button>
        </div>
      </td>
      <td className="text-center py-6 px-2">
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default CartItemRow;