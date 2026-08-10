import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../services/authApi'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '' })

  const loadProfile = () => {
    setLoading(true)
    getProfile()
      .then((res) => {
        setProfile(res.data)
        setForm({ name: res.data.name || '', email: res.data.email || '', phone: res.data.phone || '', address: res.data.address || '', password: '' })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value })
  }

  const startEditing = () => {
    setMessage('')
    setError('')
    setForm({ name: profile.name || '', email: profile.email || '', phone: profile.phone || '', address: profile.address || '', password: '' })
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError('Phone number must be exactly 10 digits.')
      return
    }

    if (form.password && (form.password.length < 6 || form.password.length > 20)) {
      setError('New password must be between 6 and 20 characters.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address
      }

      if (form.password) {
        payload.password = form.password
      }

      const response = await updateProfile(payload)
      setProfile(response.data)
      setMessage('Profile updated successfully.')
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 mt-6">Loading profile...</div>
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-5">My Profile</h2>
        {!editing ? (
          <button
            onClick={startEditing}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Edit Profile
          </button>
        ) : null}
      </div>

      {message ? <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

      {!editing ? (
        <div className="space-y-4">
          <div>
            <label className="font-semibold">Name</label>
            <p>{profile?.name}</p>
          </div>

          <div>
            <label className="font-semibold">Email</label>
            <p>{profile?.email}</p>
          </div>

          <div>
            <label className="font-semibold">Phone</label>
            <p>{profile?.phone}</p>
          </div>

          <div>
            <label className="font-semibold">Address</label>
            <p>{profile?.address || '—'}</p>
          </div>

          <div>
            <label className="font-semibold">Role</label>
            <p>{profile?.role}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              value={form.name}
              onChange={handleChange('name')}
              className="w-full rounded-xl border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              value={form.email}
              onChange={handleChange('email')}
              type="email"
              className="w-full rounded-xl border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={handleChange('phone')}
              className="w-full rounded-xl border px-4 py-3"
              placeholder="10 digit phone number"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Address</label>
            <input
              value={form.address}
              onChange={handleChange('address')}
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Address / City"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">New Password (optional)</label>
            <input
              value={form.password}
              onChange={handleChange('password')}
              type="password"
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
