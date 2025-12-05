import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LedgerEntry {
  id: string;
  user_id: string;
  order_id: string | null;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

const CreditLedger = () => {
  const { user } = useAuth();
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    fetchLedger();
  }, [currentPage, user]);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      if (!user) {
        setError('Authentication required');
        return;
      }

      const { data, error } = await supabase
        .from('credit_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * limit, currentPage * limit - 1);

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to match current interface
      const entries = (data || []).map(entry => ({
        id: entry.id,
        user_id: entry.user_id,
        order_id: entry.reference_id,
        transaction_type: entry.type,
        amount: entry.change,
        balance_after: entry.balance_after,
        description: null, // Not in new schema
        created_at: entry.created_at
      }));

      setLedgerEntries(entries);

      // For pagination, we'd need a total count query in a real implementation
      // For now, just show what we have
      setPagination({
        page: currentPage,
        limit,
        total_count: entries.length,
        total_pages: entries.length > 0 ? Math.ceil(entries.length / limit) : 1,
        has_next: entries.length === limit,
        has_prev: currentPage > 1
      });
    } catch (err) {
      console.error('Error fetching ledger:', err);
      setError('Failed to load credit ledger');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit_purchase':
        return 'text-green-800 bg-green-100';
      case 'settlement_used':
        return 'text-red-800 bg-red-100';
      case 'reward':
        return 'text-blue-800 bg-blue-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const formatTransactionType = (type: string) => {
    return type.replace('_', ' ').toUpperCase();
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

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'credit_purchase' || type === 'reward' ? '+' : '-';
    return `${sign}${Math.abs(amount)} credits`;
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
        <h1 className="text-3xl font-bold text-gray-900">Ledger</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your credit transaction history
        </p>
      </div>

      {ledgerEntries.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have any credit transactions yet.</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Description</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-600">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-light hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">
                        {formatDate(entry.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(entry.transaction_type)}`}>
                        {formatTransactionType(entry.transaction_type)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {entry.description || 'No description'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`text-sm font-medium ${
                        entry.transaction_type === 'credit_purchase' || entry.transaction_type === 'reward'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {formatAmount(entry.amount, entry.transaction_type)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {entry.balance_after} credits
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="px-4 py-3 border-t border-light flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={!pagination.has_prev}
                  className="btn-secondary text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                  disabled={!pagination.has_next}
                  className="btn-secondary text-sm ml-3"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * limit) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * limit, pagination.total_count)}</span> of{' '}
                    <span className="font-medium">{pagination.total_count}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={!pagination.has_prev}
                      className="btn-secondary text-sm rounded-r-none border-r-0"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l-4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`btn-secondary text-sm rounded-none border-r-0 ${
                            page === currentPage ? 'bg-primary text-white' : ''
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                      disabled={!pagination.has_next}
                      className="btn-secondary text-sm rounded-l-none border-l-0"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditLedger;
