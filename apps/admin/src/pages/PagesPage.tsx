import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import PageModal from '../components/PageModal'

interface Page {
  id: string
  slug: string
  title: string
  content: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
  created_at: string
  updated_at: string
}

const PagesPage = () => {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [search, setSearch] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [search, pageNum])

  const fetchPages = async () => {
    try {
      console.log('Fetching pages...')
      const limit = 20
      const offset = (pageNum - 1) * limit

      let query = supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (search.trim()) {
        query = query.or(`title.ilike.%${search.trim()}%,slug.ilike.%${search.trim()}%`)
      }

      const { data, error } = await query
      console.log('Supabase response:', { data, error })

      if (error) throw error
      setPages(data || [])

      // Get total count
      let countQuery = supabase.from('pages').select('*', { count: 'exact', head: true })
      if (search.trim()) {
        countQuery = countQuery.or(`title.ilike.%${search.trim()}%,slug.ilike.%${search.trim()}%`)
      }
      const { count } = await countQuery
      const total = count || 0
      setTotalPages(Math.ceil(total / limit))
      setHasNext(pageNum < Math.ceil(total / limit))
      setHasPrev(pageNum > 1)
    } catch (error) {
      console.error('Error fetching pages:', error)
      alert(`Error fetching pages: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPage(null)
    setShowModal(true)
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setShowModal(true)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchPages()
    } catch (error) {
      console.error('Error deleting page:', error)
      alert('Error deleting page. Please try again.')
    }
  }

  const handleSave = () => {
    fetchPages()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPageNum(1)
    fetchPages()
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
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <button
          onClick={handleCreate}
          className="btn"
        >
          Create New Page
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Search
          </button>
        </div>
      </form>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Page
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SEO Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{page.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {page.content ? page.content.substring(0, 100) + '...' : 'No content'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  /{page.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {page.seo_title || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(page.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(page)}
                    className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(page.id, page.title)}
                    className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No pages found.</p>
            <button
              onClick={handleCreate}
              className="mt-4 btn"
            >
              Create Your First Page
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPageNum(pageNum - 1)}
            disabled={!hasPrev}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pageNum} of {totalPages}
          </span>
          <button
            onClick={() => setPageNum(pageNum + 1)}
            disabled={!hasNext}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Page Modal */}
      <PageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        page={editingPage}
      />
    </div>
  )
}

export default PagesPage