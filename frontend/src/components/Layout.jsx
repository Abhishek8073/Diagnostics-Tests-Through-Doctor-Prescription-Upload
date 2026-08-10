import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { label: 'Login', to: '/' },
  { label: 'Patient', to: '/patient' },
  { label: 'Lab', to: '/lab' },
  { label: 'Admin', to: '/admin' }
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">Diagnostic Care</h1>
            <p className="text-sm text-slate-500">Modern diagnostics workflow</p>
          </div>

          <nav className="flex gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
