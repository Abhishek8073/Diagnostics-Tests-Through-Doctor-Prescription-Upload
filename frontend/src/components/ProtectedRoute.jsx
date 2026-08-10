import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token')
  const currentRole = localStorage.getItem('currentRole') || localStorage.getItem('selectedRole')

  if (!token) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
