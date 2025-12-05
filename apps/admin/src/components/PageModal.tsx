import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Modal from './Modal'

interface Page {
  id?: string
  slug: string
  title: string
  content: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
}

interface PageModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  page?: Page | null
}

const PageModal = ({ isOpen, onClose, onSave, page }: PageModalProps) => {
  const [formData, setFormData] = useState<Page>({
    slug: '',
    title: '',
    content: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (page) {
      setFormData({
        id: page.id,
        slug: page.slug,
        title: page.title,
        content: page.content || '',
        seo_title: page.seo_title || '',
        seo_description: page.seo_description || '',
        seo_keywords: page.seo_keywords || ''
      })
    } else {
      setFormData({
        slug: '',
        title: '',
        content: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: ''
      })
    }
  }, [page, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const pageData = {
        title: formData.title.trim(),
        slug: formData.slug,
        content: formData.content?.trim() || null,
        seo_title: formData.seo_title?.trim() || null,
        seo_description: formData.seo_description?.trim() || null,
        seo_keywords: formData.seo_keywords?.trim() || null
      }

      if (page?.id) {
        // Update existing page
        const { error } = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', page.id)

        if (error) throw error
      } else {
        // Create new page
        const { error } = await supabase
          .from('pages')
          .insert(pageData)

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving page:', error)
      alert('Error saving page. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .substring(0, 100)
    setFormData({ ...formData, slug })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={page ? 'Edit Page' : 'Create Page'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            required
            className="input mt-1"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Page title"
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="slug"
              required
              className="input mt-1 flex-1"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="page-slug"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="mt-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Generate
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">URL: /{formData.slug}</p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            rows={10}
            className="input mt-1"
            value={formData.content || ''}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Page content (HTML allowed)"
          />
        </div>

        {/* SEO Title */}
        <div>
          <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700">
            SEO Title
          </label>
          <input
            type="text"
            id="seo_title"
            className="input mt-1"
            value={formData.seo_title || ''}
            onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
            placeholder="SEO title (max 70 chars)"
            maxLength={70}
          />
          <p className="text-xs text-gray-500 mt-1">{(formData.seo_title || '').length}/70</p>
        </div>

        {/* SEO Description */}
        <div>
          <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700">
            SEO Description
          </label>
          <textarea
            id="seo_description"
            rows={2}
            className="input mt-1"
            value={formData.seo_description || ''}
            onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
            placeholder="SEO description (max 160 chars)"
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">{(formData.seo_description || '').length}/160</p>
        </div>

        {/* SEO Keywords */}
        <div>
          <label htmlFor="seo_keywords" className="block text-sm font-medium text-gray-700">
            SEO Keywords
          </label>
          <input
            type="text"
            id="seo_keywords"
            className="input mt-1"
            value={formData.seo_keywords || ''}
            onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
            placeholder="keyword1, keyword2, keyword3 (max 255 chars)"
            maxLength={255}
          />
          <p className="text-xs text-gray-500 mt-1">{(formData.seo_keywords || '').length}/255</p>
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
            {loading ? 'Saving...' : (page ? 'Update Page' : 'Create Page')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default PageModal