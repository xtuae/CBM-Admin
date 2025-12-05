import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from './Header'
import Footer from './Footer'

const MainLayout = () => {
  const { user } = useAuth()
  const location = useLocation()

  const isDashboard = location.pathname.startsWith('/dashboard')

  // Layout is always shown for all users (public marketplace)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Header */}
      <Header />

      {/* Sub-navigation for logged-in sections */}
      {user && (
        <>
          {/* Dashboard Sub-navigation */}
          {isDashboard && (
            <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
              <div className="container-max">
                <div className="flex space-x-8 overflow-x-auto">
                  <Link
                    to="/dashboard"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-300 hover:text-primary'
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    to="/dashboard/orders"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard/orders'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-300 hover:text-primary'
                    }`}
                  >
                    Orders History
                  </Link>
                  <Link
                    to="/dashboard/ledger"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard/ledger'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-300 hover:text-primary'
                    }`}
                  >
                    Credit Ledger
                  </Link>
                  <Link
                    to="/dashboard/wallet"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard/wallet'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-300 hover:text-primary'
                    }`}
                  >
                    Wallet Management
                  </Link>
                </div>
              </div>
            </nav>
          )}
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] mx-auto py-8 px-6 lg:px-8 w-full">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}

export default MainLayout
