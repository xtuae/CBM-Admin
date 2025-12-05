import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { EmptyOrders } from '../components/EmptyState';
import { OrdersListSkeleton } from '../components/Skeletons';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  credit_packs: {
    id: string;
    name: string;
    credit_amount: number;
    price_usd: number;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_id?: string;
  payment_gateway?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  // For backward compatibility with single item orders
  credit_pack_id?: string;
  credit_packs?: {
    id: string;
    name: string;
    description: string;
    credit_amount: number;
    price_usd: number;
  };
}

const OrdersHistory = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    } else {
      fetchOrders();
    }
  }, [id]);

  const fetchOrders = async () => {
    try {
      if (!user) {
        setError('Authentication required');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          credit_packs (
            id, name, description, credit_amount, price_usd
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to match the expected format
      const transformedOrders = (data || []).map(order => ({
        ...order,
        // For backward compatibility - single item orders
        credit_pack_id: order.credit_pack_id,
        credit_packs: order.credit_packs,
        // Map database fields to expected format
        total_amount: order.amount,
        payment_gateway: 'stripe', // Default since not in schema
      }));

      setOrders(transformedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      if (!user) {
        setError('Authentication required');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            credit_packs (
              id,
              name,
              credit_amount,
              price_usd
            )
          ),
          credit_packs (
            id, name, description, credit_amount, price_usd
          )
        `)
        .eq('user_id', user.id)
        .eq('id', orderId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Order not found');
      }

      // Transform the data to match expected format
      const transformedOrder = {
        ...data,
        total_amount: data.amount,
        payment_gateway: 'stripe',
        order_items: data.order_items || [],
        // For backward compatibility with single item orders
        credit_pack_id: data.credit_pack_id,
        credit_packs: data.credit_packs,
      };

      setSelectedOrder(transformedOrder);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getCreditsGranted = (order: Order) => {
    if (order.order_items && order.order_items.length > 0) {
      return order.order_items.reduce((total, item) =>
        total + (item.quantity * item.credit_packs.credit_amount), 0
      );
    }
    return order.credit_packs?.credit_amount || 0;
  };

  const getItemsCount = (order: Order) => {
    if (order.order_items && order.order_items.length > 0) {
      return order.order_items.reduce((total, item) => total + item.quantity, 0);
    }
    return 1;
  };

  const getOrderSummary = (order: Order) => {
    if (order.order_items && order.order_items.length > 0) {
      const itemNames = order.order_items.map(item => item.credit_packs.name);
      return itemNames.length > 1 ? `${itemNames[0]} +${itemNames.length - 1} more` : itemNames[0];
    }
    return order.credit_packs?.name || 'Credit Pack';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'text-green-800 bg-green-100';
      case 'pending':
        return 'text-yellow-800 bg-yellow-100';
      case 'failed':
      case 'cancelled':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render order detail view
  if (selectedOrder) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="flex items-center text-blue-600 hover:text-blue-500 mb-4"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Order #{selectedOrder.id.slice(-8)}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Order details and status information
          </p>
        </div>

        <div className="space-y-6">
          {/* Order Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
              <p className="mt-1">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                ${selectedOrder.total_amount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Items ({getItemsCount(selectedOrder)})</h3>
              <p className="mt-1 text-sm text-gray-600">Credits granted: {getCreditsGranted(selectedOrder).toLocaleString()}</p>
            </div>
            <div className="px-6 py-4">
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                <div className="space-y-4">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{item.credit_packs.name}</h4>
                          <p className="text-sm text-gray-600">{item.quantity} × ${item.unit_price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.quantity * item.credit_packs.credit_amount} credits
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Fallback for orders without order_items (backward compatibility)
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {selectedOrder.credit_packs?.name || 'Credit Pack'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        1 × ${selectedOrder.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${selectedOrder.total_amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedOrder.credit_packs?.credit_amount || 0} credits
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedOrder.payment_id || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment Gateway</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedOrder.payment_gateway || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount Paid</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    ${selectedOrder.total_amount.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Credits Granted</dt>
                  <dd className="mt-1 text-sm font-semibold text-green-600">
                    {getCreditsGranted(selectedOrder).toLocaleString()} Credits
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render orders list view
  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders History</h1>
          <p className="mt-2 text-sm text-gray-600">
            View all your credit purchase orders
          </p>
        </div>
        <OrdersListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your credit purchase history
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Order</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Credits</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-light hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-primary font-medium text-sm">P</span>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">#{order.id.slice(-8)}</div>
                          <div className="text-sm text-gray-600">{getOrderSummary(order)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-primary">
                        {getCreditsGranted(order).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/dashboard/orders/${order.id}`}
                        className="btn-secondary text-sm px-3 py-1"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersHistory;
