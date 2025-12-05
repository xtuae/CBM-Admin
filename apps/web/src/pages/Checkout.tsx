import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import { OrderSummaryCard } from '../components/ui';

interface CartItem {
  id: string;
  credit_pack_id: string;
  name: string;
  credits: number;
  price: number;
  quantity: number;
  processing_fee?: number;
}

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (!parsedCart.length) {
          navigate('/cart');
          return;
        }
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('cart');
        navigate('/cart');
      }
    } else {
      navigate('/cart');
    }
  }, [navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateProcessingFee = () => {
    // Fixed processing fee of $0.99 per item
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    return itemCount * 0.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateProcessingFee();
  };

  const handleProceedToPayment = async () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      // For now, assuming single item orders as in marketplace
      // Later you can extend to support multiple items
      const firstItem = cartItems[0];
      if (!firstItem) {
        throw new Error('No items in cart');
      }

      // Use RPC function for order creation with business logic
      const { data, error } = await supabase.rpc('create_order', {
        p_credit_pack_id: firstItem.credit_pack_id,
        p_quantity: firstItem.quantity,
        p_total_amount: calculateTotal()
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.order_id) {
        throw new Error('Order creation failed - no order ID returned');
      }

      // Navigate to payment page with order ID
      navigate(`/payment/${data.order_id}`);

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Loading...</h3>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Cart', href: '/cart' },
    { label: 'Checkout', current: true }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-max py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: User details */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <Link
                to="/cart"
                className="text-primary hover:text-primary-hover transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Cart
              </Link>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Email</label>
                  <div className="text-gray-900 font-medium">{user.email}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h3>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-light rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-primary">{item.credits.toLocaleString()} Credits</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="space-y-6">
            <OrderSummaryCard
              subtotal={calculateSubtotal()}
              processingFee={calculateProcessingFee()}
              total={calculateTotal()}
              onProceed={handleProceedToPayment}
              loading={loading}
              buttonText="Pay Now"
              showTerms={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
