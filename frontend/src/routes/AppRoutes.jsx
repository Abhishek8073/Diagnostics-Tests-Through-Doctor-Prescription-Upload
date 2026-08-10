import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LandingPage from '../pages/Landing'
import LoginPage from '../pages/Login'
import RegisterPage from '../pages/Register'
import DashboardPage from '../pages/Dashboard'
import LabsPage from '../pages/Labs'
import PlaceOrderPage from '../pages/PlaceOrder'
import MyOrdersPage from '../pages/MyOrders'
import LabDashboardPage from '../pages/LabDashboard'
import LabOrdersPage from '../pages/LabOrders'
import AdminDashboardPage from '../pages/AdminDashboard'
import NotFoundPage from '../pages/NotFound'
import Profile from "../pages/Profile";
function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token')
  const currentRole = localStorage.getItem('currentRole') || 'PATIENT'

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default function AppRoutes() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  if (isLandingPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen text-slate-900">
      {!isAuthPage ? <Navbar /> : null}
      <main className={`mx-auto ${isAuthPage ? 'max-w-xl px-4' : 'max-w-7xl px-4 sm:px-6'} py-8`}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/profile" element={<Profile />} />
          <Route element={<ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']} />}>
          
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/labs" element={<LabsPage />} />
            <Route path="/place-order" element={<PlaceOrderPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['LAB', 'ADMIN']} />}>
            <Route path="/lab-dashboard" element={<LabDashboardPage />} />
            <Route path="/lab-dashboard/orders" element={<LabOrdersPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAuthPage ? <Footer /> : null}
    </div>
  )
}
