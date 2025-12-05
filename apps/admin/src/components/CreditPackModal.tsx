import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Modal from './Modal'

interface CreditPack {
  id?: string
  name: string
  description: string
  price: number
  credits: number
  image_url?: string | null
  is_active: boolean
}

interface CreditPackModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  pack?: CreditPack | null
}

const CreditPackModal = ({ isOpen, onClose, onSave, pack }: CreditPackModalProps) => {
  const [formData, setFormData] = useState<CreditPack>({
    name: '',
    description: '',
    price: 0,
    credits: 0,
    image_url: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    if (pack) {
      setFormData({
        id: pack.id,
        name: pack.name,
        description: pack.description,
        price: pack.price,
        credits: pack.credits,
        image_url: pack.image_url || '',
        is_active: pack.is_active
      })
      setImagePreview(pack.image_url || '')
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        credits: 0,
        image_url: '',
        is_active: true
      })
      setImagePreview('')
    }
    setImageFile(null)
  }, [pack, isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `credit-packs/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = formData.image_url

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const packData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        credits: formData.credits,
        image_url: imageUrl,
        is_active: formData.is_active
      }

      if (pack?.id) {
        // Update existing pack
        const { error } = await supabase
          .from('credit_packs')
          .update(packData)
          .eq('id', pack.id)

        if (error) throw error
      } else {
        // Create new pack
        const { error } = await supabase
          .from('credit_packs')
          .insert(packData)

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving credit pack:', error)
      alert('Error saving credit pack. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pack ? 'Edit Credit Pack' : 'Create Credit Pack'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            required
            className="input mt-1"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Starter Pack"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            required
            rows={3}
            className="input mt-1"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the credit pack..."
          />
        </div>

        {/* Price and Credits */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (USD) *
            </label>
            <input
              type="number"
              id="price"
              required
              min="0"
              step="0.01"
              className="input mt-1"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="29.99"
            />
          </div>

          <div>
            <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
              Credits *
            </label>
            <input
              type="number"
              id="credits"
              required
              min="1"
              className="input mt-1"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
              placeholder="100"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Image
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 rounded-lg object-cover border border-gray-200"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Active (visible to customers)
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn"
          >
            {loading ? 'Saving...' : (pack ? 'Update Pack' : 'Create Pack')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CreditPackModal