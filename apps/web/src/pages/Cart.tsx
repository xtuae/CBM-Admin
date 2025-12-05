import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import { OrderSummaryCard, CartItemRow } from '../components/ui';

interface CartItem {
  id: string;
  credit_pack_id: string;
  name: string;
  credits: number;
  price: number;
  quantity: number;
  processing_fee?: number;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart items to localStorage whenever cartItems change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    setCartItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.min(newQuantity, 99) }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const incrementQuantity = (itemId: string) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
          : item
      )
    );
  };

  const decrementQuantity = (itemId: string) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity - 1;
          if (newQuantity < 1) {
            return null; // Will be filtered out
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateProcessingFee = () => {
    // Fixed processing fee of $0.99 per item (configurable)
    const subtotal = calculateSubtotal();
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    return itemCount * 0.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateProcessingFee();
  };

  const handleCheckout = async () => {
    if (!user) {
      // Store current URL for post-login redirect
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Navigate to checkout page - checkout logic moved there
    navigate('/checkout');
  };

  const addToCart = (creditPack: any, quantity: number = 1) => {
    const cartItem: CartItem = {
      id: `${creditPack.id}_${Date.now()}`, // Unique ID for cart item
      credit_pack_id: creditPack.id,
      name: creditPack.name,
      credits: creditPack.credit_amount,
      price: creditPack.price_usd,
      quantity: quantity,
      processing_fee: 0.99, // $0.99 per item
    };

    setCartItems(prev => [...prev, cartItem]);
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-light-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H6M7 13l1.1-5m1.4 0H17m-9.5-1H3" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-light-600">Add some digital credits to get started.</p>
            <div className="mt-8">
              <Link
                to="/marketplace"
                className="text-primary hover:text-primary-hover transition-colors"
              >
                ← Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Cart', current: true }
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="container-max py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-light">
                    <th className="text-left py-4 px-2 text-sm font-medium text-gray-600">Product</th>
                    <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">Credits</th>
                    <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">Price</th>
                    <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">Quantity</th>
                    <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <Link
                to="/marketplace"
                className="text-primary hover:text-primary-hover transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummaryCard
              subtotal={calculateSubtotal()}
              processingFee={calculateProcessingFee()}
              total={calculateTotal()}
              onProceed={handleCheckout}
              loading={loading}
              buttonText="Continue to Checkout"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
