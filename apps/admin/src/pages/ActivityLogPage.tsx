import { useEffect, useState } from 'react'

interface ActivityLog {
  id: string
  admin_user_id: string
  action_type: string
  entity_type: string
  entity_id: string
  metadata?: any
  old_values?: any
  new_values?: any
  created_at: string
  profiles?: {
    id: string
    full_name: string
    email: string
  }
}

const ActivityLogPage = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionTypeFilter, setActionTypeFilter] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [adminUserFilter, setAdminUserFilter] = useState('')

  useEffect(() => {
    fetchActivityLogs()
  }, [page, actionTypeFilter, entityTypeFilter, adminUserFilter])

  const fetchActivityLogs = async () => {
    try {
      const { supabase } = await import('../lib/supabase')

      // Build query with RLS policies for authenticated admins
      let query = supabase
        .from('admin_activity_log')
        .select(`
          *,
          profiles:admin_user_id (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * 50, page * 50 - 1)

      // Add filters if provided
      if (actionTypeFilter) {
        query = query.eq('action_type', actionTypeFilter)
      }
      if (entityTypeFilter) {
        query = query.eq('entity_type', entityTypeFilter)
      }
      if (adminUserFilter) {
        query = query.eq('admin_user_id', adminUserFilter)
      }

      // Get total count for pagination
      let countQuery = supabase.from('admin_activity_log').select('*', { count: 'exact', head: true })
      if (actionTypeFilter) {
        countQuery = countQuery.eq('action_type', actionTypeFilter)
      }
      if (entityTypeFilter) {
        countQuery = countQuery.eq('entity_type', entityTypeFilter)
      }
      if (adminUserFilter) {
        countQuery = countQuery.eq('admin_user_id', adminUserFilter)
      }

      const [result, countResult] = await Promise.all([query, countQuery])
      if (result.error) throw result.error

      setLogs(result.data || [])
      setTotalPages(Math.ceil((countResult.count || 0) / 50))
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      alert('Error fetching activity logs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionBadgeColor = (actionType: string) => {
    switch (actionType) {
      case 'created':
        return 'bg-green-100 text-green-800'
      case 'updated':
        return 'bg-blue-100 text-blue-800'
      case 'deleted':
        return 'bg-red-100 text-red-800'
      case 'SETTLEMENT_INITIATED':
      case 'SETTLEMENT_CREATED':
        return 'bg-purple-100 text-purple-800'
      case 'SETTLEMENT_FAILED_INSUFFICIENT_BALANCE':
      case 'SETTLEMENT_FAILED_USER_NOT_FOUND':
      case 'SETTLEMENT_FAILED_LEDGER_ERROR':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'credit_pack':
        return 'bg-indigo-100 text-indigo-800'
      case 'category':
        return 'bg-cyan-100 text-cyan-800'
      case 'page':
        return 'bg-pink-100 text-pink-800'
      case 'user':
        return 'bg-lime-100 text-lime-800'
      case 'order':
        return 'bg-emerald-100 text-emerald-800'
      case 'nila_transfer':
        return 'bg-violet-100 text-violet-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return 'N/A'
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  const renderChanges = (log: ActivityLog) => {
    if (log.action_type === 'updated' && log.old_values && log.new_values) {
      const oldVals = typeof log.old_values === 'object' ? log.old_values : {}
      const newVals = typeof log.new_values === 'object' ? log.new_values : {}

      return (
        <div className="text-xs space-y-1">
          {Object.keys(newVals).map(key => {
            const oldVal = oldVals[key]
            const newVal = newVals[key]
            if (oldVal !== newVal) {
              return (
                <div key={key}>
                  <span className="font-medium">{key}:</span>
                  <span className="text-red-600 line-through mr-2"> {String(oldVal || 'N/A')} </span>
                  <span className="text-green-600">→ {String(newVal || 'N/A')} </span>
                </div>
              )
            }
            return null
          })}
        </div>
      )
    }

    if (log.metadata) {
      return (
        <div className="text-xs text-gray-600">
          {JSON.stringify(log.metadata, null, 2)}
        </div>
      )
    }

    return <span className="text-xs text-gray-500">No details available</span>
  }

  const getUniqueValues = (field: string) => {
    const values = logs.map(log => log[field as keyof ActivityLog]).filter(Boolean)
    return [...new Set(values)].sort()
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
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={actionTypeFilter}
            onChange={(e) => {
              setActionTypeFilter(e.target.value)
              setPage(1)
            }}
            className="input"
          >
            <option value="">All Actions</option>
            {getUniqueValues('action_type').map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value)
              setPage(1)
            }}
            className="input"
          >
            <option value="">All Entities</option>
            {getUniqueValues('entity_type').map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>

          <select
            value={adminUserFilter}
            onChange={(e) => {
              setAdminUserFilter(e.target.value)
              setPage(1)
            }}
            className="input"
          >
            <option value="">All Admins</option>
            {logs
              .map(log => ({ id: log.admin_user_id, name: log.profiles?.full_name || 'Unknown' }))
              .filter((admin, index, arr) => arr.findIndex(a => a.id === admin.id) === index)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(admin => (
                <option key={admin.id} value={admin.id}>{admin.name}</option>
              ))
            }
          </select>
        </div>

        {(actionTypeFilter || entityTypeFilter || adminUserFilter) && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                setActionTypeFilter('')
                setEntityTypeFilter('')
                setAdminUserFilter('')
                setPage(1)
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {log.profiles?.full_name || 'Unknown Admin'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {log.profiles?.email || log.admin_user_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(log.action_type)}`}>
                    {log.action_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEntityTypeColor(log.entity_type)}`}>
                      {log.entity_type}
                    </span>
                    <span className="text-sm text-gray-500 font-mono">
                      {log.entity_id.slice(0, 8)}...
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  {renderChanges(log)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(log.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
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

      {logs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No activity logs found.</p>
          {(actionTypeFilter || entityTypeFilter || adminUserFilter) && (
            <button
              onClick={() => {
                setActionTypeFilter('')
                setEntityTypeFilter('')
                setAdminUserFilter('')
                setPage(1)
              }}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Activity Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Total Actions</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {logs.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Creations</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {logs.filter(log => log.action_type === 'created').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Updates</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {logs.filter(log => log.action_type === 'updated').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Deletions</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {logs.filter(log => log.action_type === 'deleted').length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ActivityLogPage
