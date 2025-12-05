import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WishlistButton from '../components/WishlistButton';
import { EmptyWishlist } from '../components/EmptyState';

interface CreditSummary {
  credit_balance: number;
  total_purchased: number;
  total_converted: number;
}

interface RecentLedgerEntry {
  id: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

interface WishlistItem {
  id: string;
  created_at: string;
  credit_pack: {
    id: string;
    name: string;
    credit_amount: number;
    price_usd: number;
    is_featured: boolean;
    short_description: string;
  };
}

const Dashboard = () => {
  const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentLedgerEntry[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditSummary();
    fetchRecentActivity();
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/v1/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.slice(0, 3)); // Show only first 3 items
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const fetchCreditSummary = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('http://localhost:3000/api/v1/credits', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCreditSummary(data);
    } catch (err) {
      console.error('Error fetching credit summary:', err);
      setError('Failed to load credit summary');
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/v1/credits/ledger?page=1&limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'credit_purchase':
        return 'Credit Purchase';
      case 'settlement_used':
        return 'Settlement';
      case 'reward':
        return 'Reward';
      default:
        return type;
    }
  };

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'credit_purchase':
        return 'bg-blue-500';
      case 'settlement_used':
        return 'bg-green-500';
      case 'reward':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your account summary and recent activity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">C</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Credit Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditSummary ? creditSummary.credit_balance.toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold text-lg">$</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Purchased</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditSummary ? creditSummary.total_purchased.toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-lg">H</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Converted</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditSummary ? creditSummary.total_converted.toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">Your credit transactions will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {recentActivity.map((entry) => (
                  <li key={entry.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getActivityIconColor(entry.transaction_type)} flex items-center justify-center`}>
                            <span className="text-white font-medium text-sm">
                              {formatTransactionType(entry.transaction_type).slice(0, 1)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatTransactionType(entry.transaction_type)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.description || `${Math.abs(entry.amount)} credits`}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(entry.created_at)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Wishlist</h2>
            <Link
              to="/marketplace"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View all →
            </Link>
          </div>
          {wishlistItems.length === 0 ? (
            <EmptyWishlist />
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {wishlistItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/marketplace/${item.credit_pack.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-red-100 to-red-200 rounded-md flex items-center justify-center">
                              <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                {item.credit_pack.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.credit_pack.credit_amount.toLocaleString()} Credits
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                ${item.credit_pack.price_usd.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <WishlistButton
                            creditPackId={item.credit_pack.id}
                            variant="default"
                            size="sm"
                            className="ml-2"
                          />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <Link
              to="/dashboard/orders"
              className="block w-full text-left px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View All Orders
            </Link>
            <Link
              to="/dashboard/ledger"
              className="block w-full text-left px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Transaction History
            </Link>
            <Link
              to="/dashboard/wallet"
              className="block w-full text-left px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage Wallets
            </Link>
            <Link
              to="/marketplace"
              className="block w-full text-left px-4 py-3 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Buy More Credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
