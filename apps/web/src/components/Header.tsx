import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/cbm-logo.webp';

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        try {
          const cartItems = JSON.parse(cart);
          const count = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);
          setCartItemCount(count);
        } catch (error) {
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };

    updateCartCount();
    // Listen for storage changes
    const handleStorageChange = () => updateCartCount();
    window.addEventListener('storage', handleStorageChange);

    // Also listen for cart updates (custom events we might add later)
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdate', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 h-16">
      <div className="container-max h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center text-xl font-semibold text-white hover:text-indigo-400 transition-colors"
            >
              <img src={logo} alt="Credits Marketplace" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-indigo-400'
                  : 'text-gray-300 hover:text-indigo-400'
              }`}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className={`text-sm font-medium transition-colors ${
                location.pathname.startsWith('/marketplace')
                  ? 'text-indigo-400'
                  : 'text-gray-300 hover:text-indigo-400'
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/about'
                  ? 'text-indigo-400'
                  : 'text-gray-300 hover:text-indigo-400'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/contact'
                  ? 'text-indigo-400'
                  : 'text-gray-300 hover:text-indigo-400'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon with Badge */}
            <Link
              to="/cart"
              className="relative text-gray-300 hover:text-indigo-400 transition-colors p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H6M7 13l1.1-5m1.4 0H17m-9.5-1H3" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              /* User Avatar with Dropdown - Logged In */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-2 hover:bg-white/20 transition-colors"
                >
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-300 hidden sm:block">Dashboard</span>
                  <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Menu Dropdown */}
                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    ></div>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 text-sm text-gray-300 border-b border-white/10">
                          <div className="font-medium">{user.email}</div>
                          <div className="text-xs text-gray-400">Signed in</div>
                        </div>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Auth Buttons - Logged Out */
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-indigo-400 text-sm font-medium transition-colors px-3 py-2 border border-white/20 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium rounded-md transition-colors"
                >
                  Get Credits
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
