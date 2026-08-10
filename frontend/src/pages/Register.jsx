import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authApi'
import { useToast } from '../components/Toast'
import { FaArrowLeft, FaFlask } from 'react-icons/fa'

const initialForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  role: 'PATIENT'
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value })
  }

  const validate = () => {
    if (!form.name.trim()) {
      return 'Name is required.'
    }
    if (!form.email.trim()) {
      return 'Email is required.'
    }
    if (form.password.length < 6 || form.password.length > 20) {
      return 'Password must be between 6 and 20 characters.'
    }
    if (!/^[0-9]{10}$/.test(form.phone)) {
      return 'Phone number must be exactly 10 digits.'
    }
    if (!form.address.trim()) {
      return 'Address is required.'
    }
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      await registerUser(form)
      setSuccess(true)
      showToast('Account created successfully!', 'success')
      setTimeout(() => navigate('/login'), 1500)
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
        <div className="bg-gradient-to-br from-brand-700 to-brand-500 px-8 pb-7 pt-7 text-white">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"><FaArrowLeft /> Back to landing page</Link>
          <div className="mt-7 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><FaFlask /></span><div><h2 className="text-2xl font-bold tracking-tight">Create your account</h2><p className="mt-1 text-sm text-white/75">Better diagnostics, one secure place.</p></div></div>
        </div>
        <div className="p-8">

        {success ? (
          <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Account created! Redirecting you to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              value={form.name}
              onChange={handleChange('name')}
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Full name"
              required
            />
            <input
              value={form.email}
              onChange={handleChange('email')}
              type="email"
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Email"
              required
            />
            <input
              value={form.password}
              onChange={handleChange('password')}
              type="password"
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Password (6-20 characters)"
              required
            />
            <input
              value={form.phone}
              onChange={handleChange('phone')}
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Phone number (10 digits)"
              required
            />
            <input
              value={form.address}
              onChange={handleChange('address')}
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Address / City"
              required
            />
            <select
              value={form.role}
              onChange={handleChange('role')}
              className="w-full rounded-xl border bg-white px-4 py-3 text-slate-700"
            >
              <option value="PATIENT">Patient</option>
              <option value="LAB">Lab</option>
              <option value="ADMIN">Admin</option>
            </select>

            {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white shadow-md shadow-brand-600/20 hover:-translate-y-0.5 hover:bg-brand-700 disabled:transform-none disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600">
            Log in
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}
