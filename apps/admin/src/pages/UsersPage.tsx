import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  credit_balance?: number
  credit_summary?: {
    balance: number
    total_purchased: number
    total_converted: number
  }
  orders?: any[]
  wallet_addresses?: any[]
  nila_transfers?: any[]
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [page])

  const fetchUsers = async () => {
    try {
      const { supabase } = await import('../lib/supabase')

      // Build query with RLS policies for authenticated admins
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1)

      // Add search filter if provided
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      // Get total count for pagination
      let countQuery = supabase.from('profiles').select('*', { count: 'exact', head: true })
      if (searchTerm) {
        countQuery = countQuery.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      const [result, countResult] = await Promise.all([query, countQuery])
      if (result.error) throw result.error

      setUsers(result.data || [])
      setTotalPages(Math.ceil((countResult.count || 0) / 20))
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Error fetching users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  const handleUserClick = async (userId: string) => {
    try {
      const { supabase } = await import('../lib/supabase')

      // For now, just fetch basic profile data (we can enhance this with orders/wallets later)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      // Basic user object - we can expand this later with orders/wallets if needed
      const userData = {
        ...data,
        orders: [],
        wallet_addresses: [],
        nila_transfers: [],
        credit_summary: {
          balance: data.credit_balance || 0,
          total_purchased: 0,
          total_converted: 0
        }
      }

      setSelectedUser(userData)
    } catch (error) {
      console.error('Error fetching user details:', error)
      alert('Error fetching user details. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'moderator':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search users..."
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn">
            Search
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleUserClick(user.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.full_name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.credit_balance || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUserClick(user.id)
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedUser.full_name}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Overview */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Account Overview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credit Balance:</span>
                      <span className="font-medium">{selectedUser.credit_summary?.balance || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Purchased:</span>
                      <span className="font-medium">{selectedUser.credit_summary?.total_purchased || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Converted:</span>
                      <span className="font-medium">{selectedUser.credit_summary?.total_converted || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joined:</span>
                      <span className="font-medium">{formatDate(selectedUser.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h4>
                  {selectedUser.orders && selectedUser.orders.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedUser.orders.slice(0, 5).map((order: any) => (
                        <div key={order.id} className="text-sm border-b pb-2">
                          <div className="flex justify-between">
                            <span>${order.total_amount}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'paid' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {order.credit_packs?.name} • {formatDate(order.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No orders yet</p>
                  )}
                </div>
              </div>

              {/* Wallet Addresses */}
              {selectedUser.wallet_addresses && selectedUser.wallet_addresses.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Wallet Addresses</h4>
                  <div className="space-y-2">
                    {selectedUser.wallet_addresses.map((wallet: any) => (
                      <div key={wallet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{wallet.network}</p>
                          <p className="text-xs text-gray-500 font-mono">{wallet.address}</p>
                          {wallet.label && <p className="text-xs text-gray-400">{wallet.label}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {wallet.is_primary && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Primary
                            </span>
                          )}
                          {wallet.is_verified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NILA Transfers */}
              {selectedUser.nila_transfers && selectedUser.nila_transfers.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Recent NILA Transfers</h4>
                  <div className="space-y-2">
                    {selectedUser.nila_transfers.slice(0, 3).map((transfer: any) => (
                      <div key={transfer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm">{transfer.nila_amount} NIL on {transfer.network}</p>
                          <p className="text-xs text-gray-500">Status: {transfer.status}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(transfer.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage
