import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUserCircle, FaSignOutAlt, FaHome, FaStethoscope, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from '../context/AuthContext'
const navByRole = {
  PATIENT: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/labs', label: 'Labs' },
    { to: '/my-orders', label: 'My Orders' }
  ],
  LAB: [
    { to: '/lab-dashboard', label: 'Lab Dashboard' }
  ],
  ADMIN: [
    { to: '/admin-dashboard', label: 'Admin command center' },
    { to: '/labs', label: 'Labs' }
  ]
}

const brandByRole = {
  PATIENT: { label: 'Patients', href: '/dashboard' },
  LAB: { label: 'Labs', href: '/lab-dashboard' },
  ADMIN: { label: 'Admin command center', href: '/admin-dashboard' }
}

export default function Navbar() {
  const currentRole = localStorage.getItem('currentRole') || 'PATIENT'
  const items = navByRole[currentRole] || navByRole.PATIENT
  const brand = brandByRole[currentRole] || brandByRole.PATIENT
  const hasRoleGradient = ['PATIENT', 'LAB', 'ADMIN'].includes(currentRole)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    setMobileMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className={`sticky top-0 z-40 border-b shadow-sm backdrop-blur-xl ${hasRoleGradient ? 'border-white/10 bg-gradient-to-r from-slate-900 to-brand-700 text-white' : 'border-slate-200/80 bg-white/85'}`}>
  <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

    <a
      href={brand.href}
      className={`flex min-w-0 shrink items-center gap-2 text-lg font-bold tracking-tight ${hasRoleGradient ? 'text-white' : 'text-slate-900'}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm"><FaStethoscope size={17} /></span>
      <span className="hidden truncate sm:inline">{brand.label}</span>
    </a>

    <div className="flex items-center gap-2 sm:gap-4">

      <nav className="hidden flex-wrap gap-1 md:flex">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${hasRoleGradient ? 'text-white/75 hover:bg-white/15 hover:text-white' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link to="/" title="Back to landing page" className={`hidden h-9 w-9 items-center justify-center rounded-xl hover:-translate-y-0.5 sm:flex ${hasRoleGradient ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}>
        <FaHome size={16} />
      </Link>

      <Link
        to="/profile"
        className={hasRoleGradient ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-brand-600'}
      >
        <FaUserCircle size={30} className="sm:hidden" />
        <FaUserCircle size={34} className="hidden sm:block" />
      </Link>

      <button
        onClick={handleLogout}
        className={`hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium sm:flex ${hasRoleGradient ? 'bg-white/15 text-white hover:bg-rose-400/25 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'}`}
      >
        <FaSignOutAlt size={16} />
        <span className="hidden sm:inline">Logout</span>
      </button>

      <button
        onClick={() => setMobileMenuOpen((open) => !open)}
        className={`flex h-9 w-9 items-center justify-center rounded-xl md:hidden ${hasRoleGradient ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}
        aria-label="Toggle navigation"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

    </div>

  </div>

  {mobileMenuOpen ? (
    <nav className={`flex flex-col gap-1 border-t px-4 py-3 md:hidden ${hasRoleGradient ? 'border-white/10' : 'border-slate-200/80'}`}>
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => setMobileMenuOpen(false)}
          className={`rounded-xl px-3 py-2 text-sm font-medium ${hasRoleGradient ? 'text-white/75 hover:bg-white/15 hover:text-white' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'}`}
        >
          {item.label}
        </Link>
      ))}

      <Link
        to="/"
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${hasRoleGradient ? 'text-white/75 hover:bg-white/15 hover:text-white' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'}`}
      >
        <FaHome size={14} /> Landing page
      </Link>

      <button
        onClick={handleLogout}
        className={`mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium ${hasRoleGradient ? 'bg-white/15 text-white hover:bg-rose-400/25' : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'}`}
      >
        <FaSignOutAlt size={14} /> Logout
      </button>
    </nav>
  ) : null}
</header>

  )
}
