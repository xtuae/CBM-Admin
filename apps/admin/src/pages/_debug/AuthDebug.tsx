import { useAuth } from '../../contexts/AuthContext'

const AuthDebug = () => {
  const { user, profile, loading, lastError, refreshProfile } = useAuth()

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Auth Debug Page</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Auth State */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Auth State</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Loading:</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded ${
                loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {loading ? 'true' : 'false'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">User:</span>
              <pre className="mt-1 text-xs bg-gray-50 p-2 rounded border overflow-auto">
                {user ? JSON.stringify({
                  id: user.id,
                  email: user.email,
                  role: user.role,
                  aud: user.aud,
                  created_at: user.created_at
                }, null, 2) : 'null'}
              </pre>
            </div>
          </div>
        </div>

        {/* Profile State */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Profile State</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Profile:</span>
              <pre className="mt-1 text-xs bg-gray-50 p-2 rounded border overflow-auto">
                {profile ? JSON.stringify(profile, null, 2) : 'null'}
              </pre>
            </div>
            {profile && (
              <div>
                <span className="font-medium text-gray-700">Role:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  profile.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {profile.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Last Error */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Last Error</h2>
          <pre className="text-xs bg-gray-50 p-4 rounded border overflow-auto">
            {lastError ? JSON.stringify(lastError, Object.getOwnPropertyNames(lastError), 2) : 'null'}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
        <div className="flex gap-3">
          <button
            onClick={refreshProfile}
            disabled={loading}
            className="btn"
          >
            {loading ? 'Refreshing...' : 'Refresh Profile'}
          </button>
        </div>
      </div>

      {/* SQL Helper */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">SQL Helper</h2>
        <p className="text-sm text-gray-600 mb-3">
          If profile is null, run this SQL in Supabase SQL Editor to create admin user:
        </p>
        <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">
{`INSERT INTO public.profiles (id, email, full_name, role)
VALUES ((SELECT id FROM auth.users WHERE email='hello@hmhlabz.com'),'hello@hmhlabz.com','Admin User','admin')
ON CONFLICT (id) DO UPDATE SET role='admin', updated_at=now();`}
        </pre>
      </div>
    </div>
  )
}

export default AuthDebug