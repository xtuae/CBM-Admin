import { useEffect, useState } from 'react'
import Modal from '../components/Modal'

interface Settlement {
  id?: string
  settlementId: string
  userId: string
  creditsUsed: number
  rewardAmount: number
  network: string
  walletAddress: string
  transactionHash?: string
  status: 'pending' | 'processed' | 'failed'
  notes?: string
  created_at: string
  updated_at: string
  // Joined data
  users?: {
    full_name: string
    email: string
    credit_balance?: number
  }
}

interface User {
  id: string
  full_name: string
  email: string
  credit_balance: number
}

const SettlementManagementPage = () => {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)

  const [formData, setFormData] = useState({
    userId: '',
    creditsUsed: 0,
    rewardAmount: 0,
    network: '',
    walletAddress: '',
    transactionHash: '',
    notes: ''
  })

  useEffect(() => {
    fetchSettlements()
    fetchUsers()
  }, [])

  const fetchSettlements = async () => {
    try {
      const { supabase } = await import('../lib/supabase')

      const { data, error } = await supabase
        .from('settlements')
        .select(`
          *,
          users: user_id (
            full_name,
            email,
            credit_balance
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSettlements(data || [])
    } catch (error) {
      console.error('Error fetching settlements:', error)
      alert('Error fetching settlements. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const { supabase } = await import('../lib/supabase')

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, credit_balance')
        .order('full_name')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Error fetching users. Please try again.')
    } finally {
      setUsersLoading(false)
    }
  }

  const generateSettlementId = (): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `STL_${timestamp}_${random}`.toUpperCase()
  }

  const handleRecordSettlement = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { supabase } = await import('../lib/supabase')

      // Validate inputs
      const selectedUser = users.find(u => u.id === formData.userId)
      if (!selectedUser) {
        alert('Please select a user')
        return
      }

      if (formData.creditsUsed > selectedUser.credit_balance) {
        alert(`User has insufficient credits. Current balance: ${selectedUser.credit_balance}`)
        return
      }

      // Generate settlement ID
      const settlementId = generateSettlementId()

      // Create settlement record
      const settlementPayload = {
        settlementId,
        userId: formData.userId,
        creditsUsed: formData.creditsUsed,
        rewardAmount: formData.rewardAmount,
        network: formData.network,
        walletAddress: formData.walletAddress.trim(),
        transactionHash: formData.transactionHash.trim() || null,
        status: 'processed' as const,
        notes: formData.notes.trim() || null
      }

      const { data: settlement, error: settlementError } = await supabase
        .from('settlements')
        .insert([settlementPayload])
        .select()
        .single()

      if (settlementError) throw settlementError

      // Deduct credits from user (add debit entry to ledger)
      const ledgerPayload = {
        userId: formData.userId,
        amount: -formData.creditsUsed, // Negative for debit
        transaction_type: 'settlement_debit',
        description: `Digital Asset Reward Settlement - ${settlementId}`,
        reference_id: settlement.id,
        balance_after: selectedUser.credit_balance - formData.creditsUsed
      }

      const { error: ledgerError } = await supabase
        .from('credit_ledger')
        .insert([ledgerPayload])

      if (ledgerError) throw ledgerError

      // Update user's credit balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          credit_balance: selectedUser.credit_balance - formData.creditsUsed,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.userId)

      if (updateError) throw updateError

      // Create NILA transfer record (admin-initiated transfer)
      const transferPayload = {
        userId: formData.userId,
        settlementId: settlement.id,
        nilaAmount: formData.rewardAmount,
        network: formData.network,
        walletAddress: formData.walletAddress.trim(),
        transactionHash: formData.transactionHash.trim() || null,
        status: 'completed' as const,
        transferType: 'settlement_reward' as const,
        notes: `Digital Asset Reward Settlement - ${settlementId}`
      }

      const { error: transferError } = await supabase
        .from('nila_transfers')
        .insert([transferPayload])

      if (transferError) throw transferError

      // Reset form and refresh data
      setFormData({
        userId: '',
        creditsUsed: 0,
        rewardAmount: 0,
        network: '',
        walletAddress: '',
        transactionHash: '',
        notes: ''
      })
      setShowModal(false)
      await fetchSettlements()
      await fetchUsers()

      alert('Settlement recorded successfully!')
    } catch (error) {
      console.error('Error recording settlement:', error)
      alert(`Error recording settlement: ${error}`)
    } finally {
      setSaving(false)
    }
  }

  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId)
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        userId,
        creditsUsed: Math.min(prev.creditsUsed || 0, selectedUser.credit_balance || 0)
      }))
    } else {
      setFormData(prev => ({ ...prev, userId }))
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const selectedUser = users.find(u => u.id === formData.userId)

  if (loading || usersLoading) {
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
        <h1 className="text-2xl font-bold text-gray-900">Settlement Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn"
        >
          Record Settlement
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Settlement ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits Used
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Network
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {settlements.map((settlement) => (
              <tr key={settlement.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {settlement.settlementId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {settlement.users?.full_name || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {settlement.users?.email || settlement.userId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {settlement.creditsUsed}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {settlement.rewardAmount} NIL
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {settlement.network}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(settlement.status)}`}>
                    {settlement.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(settlement.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {settlements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No settlements recorded yet.</p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Total Settlements</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {settlements.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Total Credits Used</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {settlements.reduce((sum, s) => sum + s.creditsUsed, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Total Rewards Paid</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {settlements.reduce((sum, s) => sum + s.rewardAmount, 0)} NIL
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Processed Today</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {settlements.filter(s =>
              new Date(s.created_at).toDateString() === new Date().toDateString() &&
              s.status === 'processed'
            ).length}
          </p>
        </div>
      </div>

      {/* Record Settlement Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Record Digital Asset Reward Settlement"
        >
          <form onSubmit={handleRecordSettlement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select User *
              </label>
              <select
                required
                className="input mt-1"
                value={formData.userId}
                onChange={(e) => handleUserSelect(e.target.value)}
              >
                <option value="">Choose a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} - ({user.credit_balance} credits available)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Credits Used *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="input mt-1"
                  value={formData.creditsUsed}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    creditsUsed: Number(e.target.value) || 0
                  }))}
                  placeholder="100"
                />
                {selectedUser && (
                  <p className="text-xs text-gray-500 mt-1">
                    Max: {selectedUser.credit_balance} credits
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reward Amount (NIL) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.000001"
                  className="input mt-1"
                  value={formData.rewardAmount}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rewardAmount: Number(e.target.value) || 0
                  }))}
                  placeholder="50.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Network *
              </label>
              <select
                required
                className="input mt-1"
                value={formData.network}
                onChange={(e) => setFormData(prev => ({ ...prev, network: e.target.value }))}
              >
                <option value="">Select network...</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="bsc">BSC</option>
                <option value="avalanche">Avalanche</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wallet Address *
              </label>
              <input
                type="text"
                required
                className="input mt-1 font-mono text-sm"
                value={formData.walletAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                placeholder="0x..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Transaction Hash
              </label>
              <input
                type="text"
                className="input mt-1 font-mono text-sm"
                value={formData.transactionHash}
                onChange={(e) => setFormData(prev => ({ ...prev, transactionHash: e.target.value }))}
                placeholder="0x..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Transaction hash from the reward transfer
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                rows={3}
                className="input mt-1"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes about this settlement..."
              />
            </div>

            {/* Summary */}
            <div className="border-t pt-4 bg-gray-50 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Settlement Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>User:</span>
                  <span className="font-medium">
                    {selectedUser ? selectedUser.full_name : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Balance Before:</span>
                  <span>
                    {selectedUser ? selectedUser.credit_balance : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Credits Used:</span>
                  <span className="text-red-600">-{formData.creditsUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Balance After:</span>
                  <span className="font-bold">
                    {(selectedUser?.credit_balance || 0) - formData.creditsUsed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reward Amount:</span>
                  <span className="font-bold text-green-600">
                    {formData.rewardAmount} NIL
                  </span>
                </div>
                {((selectedUser?.credit_balance || 0) - formData.creditsUsed) < 0 && (
                  <div className="flex justify-center mt-3">
                    <span className="text-red-600 font-bold">⚠️ Warning: Insufficient credits!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || (selectedUser && (selectedUser.credit_balance || 0) - formData.creditsUsed < 0)}
                className="btn"
              >
                {saving ? 'Processing...' : 'Record Settlement'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default SettlementManagementPage
