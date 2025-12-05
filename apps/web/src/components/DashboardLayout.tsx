import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardRoutes from './DashboardRoutes';

const DashboardLayout = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: '🏠' },
    { name: 'Orders', href: '/dashboard/orders', icon: '📦' },
    { name: 'Ledger', href: '/dashboard/ledger', icon: '📊' },
    { name: 'Wallet', href: '/dashboard/wallet', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-light">
          <div className="flex flex-col h-full">
            {/* Logo/Brand */}
            <div className="flex items-center px-6 py-4 border-b border-light">
              <Link to="/" className="text-lg font-semibold text-gray-900">
                Credits Marketplace
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="px-4 py-4 border-t border-light">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="py-8">
            <div className="container-max">
              <DashboardRoutes />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
