import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Payment = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      localStorage.setItem('redirectAfterLogin', `/payment/${orderId}`);
      navigate('/login');
      return;
    }

    // Check if we have an order ID
    if (!orderId) {
      navigate('/cart');
      return;
    }

    // Initialize payment
    initializePayment();
  }, [user, orderId, navigate]);

  const initializePayment = async () => {
    try {
      setLoading(true);

      // Get the authenticated user's session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      // Call backend to get payment information for this order
      const response = await fetch(`/api/v1/orders/${orderId}/payment`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const paymentInfo = await response.json();
      setPaymentData(paymentInfo);

      // Simulate payment processing delay
      setTimeout(() => {
        setLoading(false);
        handlePaymentSuccess();
      }, 3000);

    } catch (error) {
      console.error('Error initializing payment:', error);
      alert('Failed to initialize payment. Please try again.');
      navigate('/cart');
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      setProcessing(true);

      // Get the authenticated user's session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      // Call backend to confirm payment success
      // In a real implementation, this would be handled by a webhook
      await fetch('/api/v1/webhooks/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'mock-signature', // In real payment, this would be from Stripe/Square/etc
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: `pay_${Date.now()}`,
          status: 'paid',
          amount: paymentData?.amount || 0,
          currency: paymentData?.currency || 'USD',
        }),
      });

      // Clear the cart
      localStorage.removeItem('cart');

      // Redirect to success page or dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Show loading screen
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
              Processing payment...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we securely process your payment.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              This may take a few moments.
            </p>
          </div>

          {/* Security indicators */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-gray-600">SSL Encrypted</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-gray-600">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment processing state
  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
              Completing your purchase...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Processing your payment and activating your credits.
            </p>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
            <dl className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-gray-900">{orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium text-gray-900">Credit Card</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="font-medium text-gray-900 text-lg">
                  ${paymentData?.amount ? (paymentData.amount / 100).toFixed(2) : '0.00'}
                </span>
              </div>
            </dl>
          </div>
        </div>
      </div>
    );
  }

  // This component handles the payment automatically, so this shouldn't be reached
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            Payment Completed Successfully!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your credits have been added to your account.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-sm font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
