import { useEffect, useState } from 'react'
import Modal from '../components/Modal'

interface PaymentProvider {
  id?: string
  name: string
  provider: string
  sandboxApiUrl: string
  sandboxApiKey: string
  productionApiUrl: string
  productionApiKey: string
  isEnabled: boolean
  isDefaultTest: boolean
}

const PaymentManagementPage = () => {
  const [providers, setProviders] = useState<PaymentProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState<PaymentProvider | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<PaymentProvider>({
    name: '',
    provider: '3thix',
    sandboxApiUrl: '',
    sandboxApiKey: '',
    productionApiUrl: '',
    productionApiKey: '',
    isEnabled: true,
    isDefaultTest: false
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      // Use dynamic import to access supabase
      const { supabase } = await import('../lib/supabase')

      const { data, error } = await supabase
        .from('payment_providers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProviders(data || [])
    } catch (error) {
      console.error('Error fetching payment providers:', error)
      alert('Error fetching payment providers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (provider: PaymentProvider) => {
    setEditingProvider(provider)
    setFormData({
      ...provider,
      sandboxApiKey: provider.sandboxApiKey ? provider.sandboxApiKey : '', // Masks would show *****
      productionApiKey: provider.productionApiKey ? provider.productionApiKey : ''
    })
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditingProvider(null)
    setFormData({
      name: '3THix Payment Gateway',
      provider: '3thix',
      sandboxApiUrl: '',
      sandboxApiKey: '',
      productionApiUrl: '',
      productionApiKey: '',
      isEnabled: true,
      isDefaultTest: false
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { supabase } = await import('../lib/supabase')

      // Prepare payload (API keys should be encrypted/hashed in production)
      const payload: Partial<PaymentProvider> = {
        name: formData.name,
        provider: formData.provider,
        sandboxApiUrl: formData.sandboxApiUrl,
        sandboxApiKey: formData.sandboxApiKey,
        productionApiUrl: formData.productionApiUrl,
        productionApiKey: formData.productionApiKey,
        isEnabled: formData.isEnabled,
        isDefaultTest: formData.isDefaultTest ? true : false // Ensure only one is default
      }

      if (editingProvider?.id) {
        const { error } = await supabase
          .from('payment_providers')
          .update(payload)
          .eq('id', editingProvider.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('payment_providers')
          .insert([payload])
        if (error) throw error
      }

      await fetchProviders()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving payment provider:', error)
      alert(`Error saving payment provider: ${error}`)
    } finally {
      setSaving(false)
    }
  }

  const toggleProviderStatus = async (providerId: string, currentStatus: boolean) => {
    try {
      const { supabase } = await import('../lib/supabase')
      const { error } = await supabase
        .from('payment_providers')
        .update({ isEnabled: !currentStatus })
        .eq('id', providerId)

      if (error) throw error
      await fetchProviders()
    } catch (error) {
      console.error('Error updating provider status:', error)
      alert('Error updating provider status. Please try again.')
    }
  }

  const setAsDefaultTest = async (providerId: string) => {
    try {
      const { supabase } = await import('../lib/supabase')

      // First, unset all default test flags
      await supabase
        .from('payment_providers')
        .update({ isDefaultTest: false })

      // Then set the selected provider as default test
      const { error } = await supabase
        .from('payment_providers')
        .update({ isDefaultTest: true })
        .eq('id', providerId)

      if (error) throw error
      await fetchProviders()
    } catch (error) {
      console.error('Error setting default test provider:', error)
      alert('Error setting default test provider. Please try again.')
    }
  }

  const maskApiKey = (key: string | undefined): string => {
    if (!key || key === '') return ''
    if (key.length <= 8) return '*'
    return key.substring(0, 4) + '*'.repeat(Math.max(0, key.length - 8)) + key.substring(key.length - 4)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <button onClick={handleCreate} className="btn">
          Add Payment Provider
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sandbox API Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Production API Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {providers.map((provider) => (
              <tr key={provider.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                    <div className="text-sm text-gray-500">{provider.provider}</div>
                    {provider.isDefaultTest && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default Test
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-mono">
                    {maskApiKey(provider.sandboxApiKey)}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {provider.sandboxApiUrl}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-mono">
                    {maskApiKey(provider.productionApiKey)}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {provider.productionApiUrl}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    provider.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {provider.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => toggleProviderStatus(provider.id!, provider.isEnabled)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      provider.isEnabled
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {provider.isEnabled ? 'Disable' : 'Enable'}
                  </button>
                  {!provider.isDefaultTest && (
                    <button
                      onClick={() => setAsDefaultTest(provider.id!)}
                      className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 ml-2"
                    >
                      Set as Default Test
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(provider)}
                    className="px-3 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ml-2"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {providers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payment providers configured.</p>
            <button onClick={handleCreate} className="mt-4 btn">
              Configure Your First Payment Provider
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingProvider ? 'Edit Payment Provider' : 'Add Payment Provider'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provider Name *
                </label>
                <input
                  type="text"
                  required
                  className="input mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 3THix Payment Gateway"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provider Code
                </label>
                <input
                  type="text"
                  readOnly
                  className="input mt-1 bg-gray-50"
                  value={formData.provider}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3"> Sandbox Configuration</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sandbox API URL *
                  </label>
                  <input
                    type="url"
                    required
                    className="input mt-1"
                    value={formData.sandboxApiUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, sandboxApiUrl: e.target.value }))}
                    placeholder="https://sandbox-api.3thix.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sandbox API Key *
                  </label>
                  <input
                    type="password"
                    required
                    className="input mt-1"
                    value={formData.sandboxApiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, sandboxApiKey: e.target.value }))}
                    placeholder="3thix_sandbox_key_..."
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Production Configuration</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Production API URL *
                  </label>
                  <input
                    type="url"
                    required
                    className="input mt-1"
                    value={formData.productionApiUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, productionApiUrl: e.target.value }))}
                    placeholder="https://api.3thix.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Production API Key *
                  </label>
                  <input
                    type="password"
                    required
                    className="input mt-1"
                    value={formData.productionApiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, productionApiKey: e.target.value }))}
                    placeholder="3thix_prod_key_..."
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status Settings
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Configure how this provider behaves</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isEnabled"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, isEnabled: e.target.checked }))}
                  />
                  <label htmlFor="isEnabled" className="ml-2 block text-sm text-gray-900">
                    Enable this payment provider
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefaultTest"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.isDefaultTest}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefaultTest: e.target.checked }))}
                  />
                  <label htmlFor="isDefaultTest" className="ml-2 block text-sm text-gray-900">
                    Mark as default test payment provider
                  </label>
                  <p className="text-xs text-gray-500 ml-6">
                    Only select this if testing payment flows
                  </p>
                </div>
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
                disabled={saving}
                className="btn"
              >
                {saving
                  ? (editingProvider ? 'Updating...' : 'Adding...')
                  : (editingProvider ? 'Update Provider' : 'Add Provider')
                }
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default PaymentManagementPage
