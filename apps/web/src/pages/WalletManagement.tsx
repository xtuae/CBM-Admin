import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WalletAddress {
  id: string;
  network: string;
  address: string;
  label: string | null;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
}

const WalletManagement = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWallet, setNewWallet] = useState({
    network: '',
    address: '',
    label: '',
    is_primary: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, [user]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      if (!user) {
        setError('Authentication required');
        return;
      }

      const { data, error } = await supabase
        .from('wallet_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setWallets(data || []);
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setError('Failed to load wallet addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      if (!user) {
        setError('Authentication required');
        return;
      }

      const { data, error } = await supabase
        .from('wallet_addresses')
        .insert([{
          user_id: user.id,
          network: newWallet.network,
          address: newWallet.address,
          label: newWallet.label || null,
          is_primary: newWallet.is_primary,
          is_verified: false,
        }])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      setNewWallet({ network: '', address: '', label: '', is_primary: false });
      setShowAddModal(false);
      setError(null);
      fetchWallets(); // Refresh the list
    } catch (err) {
      console.error('Error adding wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to add wallet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!confirm('Are you sure you want to delete this wallet address?')) {
      return;
    }

    try {
      if (!user) {
        setError('Authentication required');
        return;
      }

      const { error } = await supabase
        .from('wallet_addresses')
        .delete()
        .eq('id', walletId)
        .eq('user_id', user.id); // Extra security - ensure user can only delete their own wallets

      if (error) {
        throw new Error(error.message);
      }

      fetchWallets(); // Refresh the list
    } catch (err) {
      console.error('Error deleting wallet:', err);
      setError('Failed to delete wallet');
    }
  };

  const getNetworkColor = (network: string) => {
    switch (network.toLowerCase()) {
      case 'polygon':
        return 'bg-purple-100 text-purple-800';
      case 'ethereum':
        return 'bg-blue-100 text-blue-800';
      case 'solana':
        return 'bg-purple-100 text-purple-800';
      case 'bitcoin':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your blockchain wallet addresses
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Wallet
        </button>
      </div>

      {error && (
        <div className="mb-6 card border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {wallets.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No wallets added</h3>
          <p className="mt-1 text-sm text-gray-500">Add your first wallet address to receive rewards.</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Wallet</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Network</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Address</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.id} className="border-b border-light hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {wallet.network.slice(0, 1).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {wallet.label || `${wallet.network} Wallet`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getNetworkColor(wallet.network)}`}>
                        {wallet.network}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono text-gray-600">
                        {formatAddress(wallet.address)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {wallet.is_primary && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Primary
                          </span>
                        )}
                        {!wallet.is_verified && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Unverified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(wallet.address)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="Copy address"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteWallet(wallet.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete wallet"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Wallet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Wallet Address</h3>
              <form onSubmit={handleAddWallet}>
                <div className="mb-4">
                  <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-1">
                    Network
                  </label>
                  <select
                    id="network"
                    value={newWallet.network}
                    onChange={(e) => setNewWallet(prev => ({ ...prev, network: e.target.value }))}
                    required
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select network</option>
                    <option value="polygon">Polygon</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="solana">Solana</option>
                    <option value="bitcoin">Bitcoin</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={newWallet.address}
                    onChange={(e) => setNewWallet(prev => ({ ...prev, address: e.target.value }))}
                    required
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="0x..."
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                    Label (optional)
                  </label>
                  <input
                    type="text"
                    id="label"
                    value={newWallet.label}
                    onChange={(e) => setNewWallet(prev => ({ ...prev, label: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="My MetaMask wallet"
                  />
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newWallet.is_primary}
                      onChange={(e) => setNewWallet(prev => ({ ...prev, is_primary: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Set as primary wallet for this network</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewWallet({ network: '', address: '', label: '', is_primary: false });
                      setError(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Add Wallet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;
