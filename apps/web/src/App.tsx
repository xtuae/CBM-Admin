import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import Landing from './pages/Landing';
import BrowseMarketplace from './pages/BrowseMarketplace';
import CreditPackDetail from './pages/CreditPackDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import RequireAuth from './components/auth/RequireAuth';
import AuthForm from './components/AuthForm';

function AppContent() {
  const { loading } = useAuth();

  // Show loading screen while authentication initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Main Layout for public + user pages */}
      <Route path="/" element={<MainLayout />}>
        {/* Landing/Home Page */}
        <Route index element={<Landing />} />

        {/* Marketplace Pages */}
        <Route path="marketplace" element={<BrowseMarketplace />} />
        <Route path="marketplace/:slug" element={<CreditPackDetail />} />

        {/* Protected Commerce Pages - Require Authentication */}
        <Route
          path="cart"
          element={
            <RequireAuth>
              <Cart />
            </RequireAuth>
          }
        />

        <Route
          path="checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />

        <Route
          path="payment/:orderId"
          element={
            <RequireAuth>
              <Payment />
            </RequireAuth>
          }
        />

        {/* Dashboard Routes - Use separate DashboardLayout */}
        <Route
          path="/dashboard/*"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        />

        {/* Authentication Pages */}
        <Route path="login" element={<AuthForm mode="signin" />} />
        <Route path="register" element={<AuthForm mode="signup" />} />

        {/* Static Pages */}
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />

        {/* 404 Page - must be last */}
        <Route path="*" element={<div className="p-8 text-center"><h1 className="text-3xl font-bold text-gray-900">404 - Page Not Found</h1></div>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
