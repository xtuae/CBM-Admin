import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Spinner from './Spinner'

interface RequireAdminProps {
  children: ReactNode
  redirectOnUnauthenticated?: boolean
}

const RequireAdmin = ({ children, redirectOnUnauthenticated = true }: RequireAdminProps) => {
  const { user, profile, loading, refreshProfile, signOut, lastError } = useAuth()
  const location = useLocation()

  // Show spinner while loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // If user is not authenticated
  if (!user) {
    if (redirectOnUnauthenticated) {
      return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="btn"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  // If user is authenticated but profile fetch failed (null) or not yet fetched (undefined, shouldn't happen here)
  if (profile === null || profile === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Access Pending</h2>
          <p className="text-gray-600 mb-4">
            Your account is logged in but profile could not be loaded. Click Retry to fetch profile. Contact hello@hmhlabz.com if this continues.
          </p>
          {lastError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <strong>Error:</strong> {lastError}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={refreshProfile}
              className="btn"
            >
              Retry
            </button>
            <button
              onClick={signOut}
              className="btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If user has profile but role is not admin
  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have admin privileges to access this page.
          </p>
          <button
            onClick={signOut}
            className="btn-secondary"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // User is admin, render children
  return <>{children}</>
}

export default RequireAdmin