import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, getProfile } from '../services/authApi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { FaArrowLeft, FaFlask, FaLock, FaEnvelope } from 'react-icons/fa'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const showToast = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await loginUser(form)
      const token = data.token

      localStorage.setItem('token', token)

      const profileResponse = await getProfile()
      const role = profileResponse.data?.role || 'PATIENT'

      login({ accessToken: token, userRole: role })

      showToast('Welcome back!', 'success')

      if (role === 'ADMIN') navigate('/admin-dashboard')
      else if (role === 'LAB') navigate('/lab-dashboard')
      else navigate('/dashboard')
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[78vh] items-center justify-center py-8">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white bg-white shadow-soft">
        <div className="bg-gradient-to-br from-brand-700 to-brand-500 px-8 pb-8 pt-7 text-white">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"><FaArrowLeft /> Back to landing page</Link>
          <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><FaFlask size={22} /></div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-white/75">Sign in to manage your diagnostic care.</p>
        </div>
        <div className="p-8">

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Email address<div className="relative mt-1.5"><FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} /><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border py-3 pl-10 pr-4" placeholder="you@example.com" type="email" required /></div></label>
          <label className="block text-sm font-semibold text-slate-700">Password<div className="relative mt-1.5"><FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} /><input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border py-3 pl-10 pr-4" placeholder="Enter your password" type="password" required /></div></label>
          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white shadow-md shadow-brand-600/20 hover:-translate-y-0.5 hover:bg-brand-700 disabled:transform-none disabled:opacity-60">{loading ? 'Signing in...' : 'Login to your account'}</button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600">
            Register
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}
