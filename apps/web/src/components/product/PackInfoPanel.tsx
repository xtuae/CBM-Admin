import { useState } from 'react';
import { Badge, Button } from '../ui';

interface PackInfoPanelProps {
  pack: {
    id: string;
    name: string;
    credit_amount: number;
    price_usd: number;
    categories?: Array<{ name: string }>;
    short_description?: string;
    is_featured?: boolean;
  };
  onAddToCart: (quantity: number) => void;
  onBuyNow: (quantity: number) => void;
  loading?: boolean;
}

const PackInfoPanel = ({ pack, onAddToCart, onBuyNow, loading = false }: PackInfoPanelProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(quantity);
  };

  const handleBuyNow = () => {
    onBuyNow(quantity);
  };

  // Placeholder logic for badges
  const isNew = Math.random() > 0.8;
  const isPopular = Math.random() > 0.7;

  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {isPopular && <Badge variant="primary">Popular</Badge>}
        {isNew && <Badge>New</Badge>}
        {pack.is_featured && <Badge>Featured</Badge>}
      </div>

      {/* Product Name */}
      <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
        {pack.name}
      </h1>

      {/* Price */}
      <div className="text-5xl font-bold text-white">
        ${pack.price_usd.toFixed(2)}
      </div>

      {/* Credits Amount */}
      <div className="text-xl text-indigo-400 font-semibold">
        {pack.credit_amount.toLocaleString()} Digital Credits
      </div>

      {/* Short Description */}
      <div className="text-lg text-gray-300 leading-relaxed max-w-md">
        {pack.short_description || 'Secure digital credits for premium platform services.'}
      </div>

      {/* Category Badges */}
      {pack.categories && pack.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pack.categories.map((category, index) => (
            <Badge key={index} variant="secondary">
              {category.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label className="text-gray-300 font-medium">Quantity:</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-white font-medium transition-colors"
          >
            -
          </button>
          <span className="w-12 text-center text-white font-medium text-lg">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= 99}
            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-white font-medium transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={handleAddToCart}
          variant="secondary"
          className="flex-1"
          disabled={loading}
        >
          Add to Cart
        </Button>
        <Button
          onClick={handleBuyNow}
          variant="primary"
          className="flex-1"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Buy Now'}
        </Button>
      </div>

      {/* Features List */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Instant Delivery</h3>
          <p className="text-xs text-gray-400">Credits added immediately</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Secure Payment</h3>
          <p className="text-xs text-gray-400">Bank-level encryption</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Never Expires</h3>
          <p className="text-xs text-gray-400">Credits remain valid</p>
        </div>
      </div>
    </div>
  );
};

export default PackInfoPanel;