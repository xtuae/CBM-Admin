import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import RequireAdmin from './components/RequireAdmin'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import CreditPacksPage from './pages/CreditPacksPage'
import CategoriesPage from './pages/CategoriesPage'
import UsersPage from './pages/UsersPage'
import OrdersPage from './pages/OrdersPage'
import ActivityLogPage from './pages/ActivityLogPage'
import SettlementsPage from './pages/SettlementsPage'
import PagesPage from './pages/PagesPage'
import AuthDebug from './pages/_debug/AuthDebug'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public admin login */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected admin routes - each route individually wrapped */}
        <Route path="/admin/overview" element={
          <RequireAdmin>
            <AdminLayout>
              <OverviewPage />
            </AdminLayout>
          </RequireAdmin>
        } />
        <Route path="/admin/credit-packs" element={
          <RequireAdmin>
            <AdminLayout>
              <CreditPacksPage />
            </AdminLayout>
          </RequireAdmin>
        } />
        <Route path="/admin/categories" element={
          <RequireAdmin>
            <AdminLayout>
              <CategoriesPage />
            </AdminLayout>
          </RequireAdmin>
        } />
        <Route path="/admin/users" element={
          <RequireAdmin>
            <AdminLayout>
              <UsersPage />
            </AdminLayout>
          </RequireAdmin>
        } />
        <Route path="/admin/orders" element={
          <RequireAdmin>
            <AdminLayout>
              <OrdersPage />
            </AdminLayout>
          </RequireAdmin>
        } />
        <Route path="/admin/activity" element={
          <RequireAdmin>
            <AdminLayout>
              <ActivityLogPage />
            </AdminLayout>
          </RequireAdmin>
        } />
        <Route path="/admin/settlements" element={
          <RequireAdmin>
            <AdminLayout>
              <SettlementsPage />
            </AdminLayout>
          </RequireAdmin>
        } />
        <Route path="/admin/pages" element={
          <RequireAdmin>
            <AdminLayout>
              <PagesPage />
            </AdminLayout>
          </RequireAdmin>
        } />

        {/* Debug route - public for testing */}
        <Route path="/admin/_debug/auth" element={
          <AdminLayout>
            <AuthDebug />
          </AdminLayout>
        } />

        {/* Redirect root to overview */}
        <Route path="*" element={<Navigate to="/admin/overview" replace />} />
      </Routes>
    </Router>
  )
}

export default App