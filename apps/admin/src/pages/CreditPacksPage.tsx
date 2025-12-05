import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import CreditPackModal from '../components/CreditPackModal'

interface CreditPack {
  id: string
  name: string
  description: string
  price: number
  credits: number
  image_url: string | null
  is_active: boolean
  created_at: string
}

const CreditPacksPage = () => {
  const [packs, setPacks] = useState<CreditPack[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPack, setEditingPack] = useState<CreditPack | null>(null)

  useEffect(() => {
    fetchPacks()
  }, [])

  const fetchPacks = async () => {
    try {
      console.log('Fetching credit packs...')
      const { data, error } = await supabase
        .from('credit_packs')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Supabase response:', { data, error })

      if (error) throw error
      setPacks(data || [])
    } catch (error) {
      console.error('Error fetching credit packs:', error)
      alert(`Error fetching credit packs: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const togglePackStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('credit_packs')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchPacks()
    } catch (error) {
      console.error('Error updating pack status:', error)
    }
  }

  const handleCreate = () => {
    setEditingPack(null)
    setShowModal(true)
  }

  const handleEdit = (pack: CreditPack) => {
    setEditingPack(pack)
    setShowModal(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('credit_packs')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchPacks()
    } catch (error) {
      console.error('Error deleting credit pack:', error)
      alert('Error deleting credit pack. Please try again.')
    }
  }

  const handleSave = () => {
    fetchPacks()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Credit Packs</h1>
        <button
          onClick={handleCreate}
          className="btn"
        >
          Create New Pack
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pack
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits
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
            {packs.map((pack) => (
              <tr key={pack.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {pack.image_url && (
                      <img
                        className="h-10 w-10 rounded-lg mr-3 object-cover"
                        src={pack.image_url}
                        alt={pack.name}
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pack.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {pack.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${pack.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pack.credits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    pack.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {pack.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => togglePackStatus(pack.id, pack.is_active)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      pack.is_active
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {pack.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(pack)}
                    className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pack.id, pack.name)}
                    className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {packs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No credit packs found.</p>
            <button
              onClick={handleCreate}
              className="mt-4 btn"
            >
              Create Your First Pack
            </button>
          </div>
        )}
      </div>

      {/* Credit Pack Modal */}
      <CreditPackModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        pack={editingPack}
      />
    </div>
  )
}

export default CreditPacksPage