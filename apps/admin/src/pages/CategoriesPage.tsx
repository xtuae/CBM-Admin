import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { uploadCreditPackImage, type UploadResult } from '../lib/uploadImage'
import { getCategoryIconUrl } from '../lib/getCreditPackImageUrl'

interface Category {
  id?: string
  name: string
  slug?: string
  description?: string
  icon_url?: string | null
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
  created_at?: string
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    slug: string
    description: string
    icon_url: string | null
    seo_title: string
    seo_description: string
    seo_keywords: string
  }>({
    name: '',
    slug: '',
    description: '',
    icon_url: null,
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  })
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      // Import supabase client dynamically to avoid circular dependency issues
      const { supabase } = await import('../lib/supabase')

      // Direct query to categories table with RLS policies
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('Error fetching categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      icon_url: category.icon_url || null,
      seo_title: category.seo_title || '',
      seo_description: category.seo_description || '',
      seo_keywords: category.seo_keywords || ''
    })
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon_url: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: ''
    })
    setShowModal(true)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
      seo_title: prev.seo_title || name
    }))
  }

  const uploadCategoryImage = async (file: File): Promise<UploadResult> => {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileName = `categories/${timestamp}-${randomSuffix}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('public-assets')
        .getPublicUrl(fileName)

      if (!data.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      return { url: data.publicUrl, error: null }
    } catch (error) {
      console.error('Upload error:', error)
      return { url: null, error: error instanceof Error ? error.message : 'Upload failed' }
    }
  }

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload a valid image file');
      return;
    }

    setImageError(null);
    setImageUploading(true);

    try {
      const result = await uploadCategoryImage(file);

      if (result.error) {
        setImageError(result.error);
      } else if (result.url) {
        setFormData(prev => ({ ...prev, icon_url: result.url }));
        // Clear file input
        e.target.value = '';
      } else {
        setImageError("Upload completed but no URL returned. Please try again.");
      }
    } catch (err) {
      console.error('Upload error:', err);
      setImageError("An unexpected error occurred. Please try again.");
    } finally {
      setImageUploading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { supabase } = await import('../lib/supabase')

      // Safe string conversion for all fields
      const safeString = (value: string | null | undefined): string => {
        if (typeof value === 'string') return value.trim()
        return ''
      }

      const payload = {
        name: safeString(formData.name),
        slug: safeString(formData.slug) || generateSlug(safeString(formData.name)),
        description: safeString(formData.description) || null,
        icon_url: formData.icon_url || null,
        seo_title: safeString(formData.seo_title) || null,
        seo_description: safeString(formData.seo_description) || null,
        seo_keywords: safeString(formData.seo_keywords) || null
      }

      let error
      if (editingCategory?.id) {
        const result = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id)
        error = result.error
      } else {
        const result = await supabase
          .from('categories')
          .insert([payload])
        error = result.error
      }

      if (error) throw error

      await fetchCategories()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving category:', error)
      alert(`Error saving category: ${error}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { supabase } = await import('../lib/supabase')

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      await fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category. Please try again.')
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
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={handleCreate} className="btn">
          Create Category
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-8 w-8 rounded flex-shrink-0 mr-3 object-cover"
                      src={getCategoryIconUrl(category.icon_url)}
                      alt={category.name}
                      onError={(e) => {
                        console.log('Category icon failed to load:', {
                          categoryName: category.name,
                          iconUrl: category.icon_url,
                          finalSrc: e.currentTarget.src,
                          fallbackUrl: getCategoryIconUrl(null)
                        });
                        const target = e.currentTarget;
                        if (target.src !== window.location.origin + "/images/default-category.png") {
                          target.src = "/images/default-category.png";
                        }
                      }}
                    />
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.slug}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {category.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id!, category.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found.</p>
            <button onClick={handleCreate} className="mt-4 btn">
              Create Your First Category
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input mt-1"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Category name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Slug
                    </label>
                    <input
                      type="text"
                      className="input mt-1"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="URL-friendly slug"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="input mt-1"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category Icon
                  </label>
                  {/* Current image preview when editing */}
                  {editingCategory && formData.icon_url && (
                    <div className="mb-3">
                      <img
                        src={formData.icon_url}
                        alt="Current icon"
                        className="h-16 w-16 rounded-md object-cover border"
                      />
                    </div>
                  )}

                  {/* File upload input */}
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Upload a new icon image (JPG, PNG, GIF, WebP - max 5MB). This will replace any existing icon.
                    </p>
                  </div>

                  {/* Upload status and errors */}
                  {imageUploading && (
                    <p className="mt-2 text-xs text-blue-600">Uploading image…</p>
                  )}
                  {imageError && (
                    <p className="mt-2 text-xs text-red-600">{imageError}</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">SEO Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        className="input mt-1"
                        value={formData.seo_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        SEO Keywords
                      </label>
                      <input
                        type="text"
                        className="input mt-1"
                        value={formData.seo_keywords}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      SEO Description
                    </label>
                    <textarea
                      rows={2}
                      className="input mt-1"
                      value={formData.seo_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    />
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
                    {saving ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesPage
