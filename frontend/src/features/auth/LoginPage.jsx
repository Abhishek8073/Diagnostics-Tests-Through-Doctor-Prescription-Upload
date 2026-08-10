import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../lib/axiosClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const loginResponse = await axiosClient.post('/auth/login', form)
      const token = loginResponse.data.token

      localStorage.setItem('token', token)

      const profileResponse = await axiosClient.get('/api/users/profile')
      const matchedUser = profileResponse.data.find(
        (user) => user.email?.toLowerCase() === form.email.toLowerCase()
      )

      const backendRole = matchedUser?.role || 'PATIENT'
      localStorage.setItem('currentRole', backendRole)
      localStorage.setItem('selectedRole', backendRole)

      if (backendRole === 'ADMIN') navigate('/admin')
      else if (backendRole === 'LAB') navigate('/lab')
      else navigate('/patient')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft">
        <div className="mb-8">
          <p className="text-sm font-semibold text-brand-600">Diagnostic platform</p>
          <h2 className="mt-2 text-3xl font-bold">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in with your clinic credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-0 transition focus:border-brand-500"
              placeholder="admin@diagnostic.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
              placeholder="••••••••"
              required
            />
          </label>

          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
