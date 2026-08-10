import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getPatientLabs } from '../services/orderApi'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

export default function LabsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}
  const [labs, setLabs] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadLabs() {
      try {
        const response = await getPatientLabs()
        setLabs(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        setError(err.message || 'Unable to load labs right now.')
      } finally {
        setLoading(false)
      }
    }

    loadLabs()
  }, [])

  const filteredLabs = labs.filter((lab) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      String(lab.labId || lab.id || '').includes(term) ||
      (lab.labName || '').toLowerCase().includes(term) ||
      (lab.city || '').toLowerCase().includes(term) ||
      (lab.address || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6 rounded-3xl bg-white p-6 shadow-soft">
      <div className="rounded-3xl bg-gradient-to-r from-brand-700 to-brand-500 p-6 text-white shadow-soft">
        <h2 className="text-2xl font-semibold">Choose a lab</h2>
        <p className="mt-2 text-white/75">
          Select a lab for your order and upload the prescription on the next screen.
        </p>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by lab name or ID..."
        className="w-full rounded-xl border px-4 py-2 text-sm"
      />

      {error ? <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {loading ? (
        <div className="flex justify-center py-6"><Spinner label="Loading labs..." /></div>
      ) : filteredLabs.length === 0 ? (
        <EmptyState icon="🏥" title="No labs available" body="Check back soon, or adjust your search." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredLabs.map((lab) => (
            <div key={lab.labId || lab.id} className="rounded-3xl border border-slate-200 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{lab.labName || 'Lab'}</h3>
                  <p className="mt-1 text-sm text-slate-500">{lab.city || lab.address || 'Location unavailable'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                  Lab
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>{lab.address || 'Address not provided'}</p>
                <p>{lab.phone || 'Phone not provided'}</p>
              </div>

              <button
                onClick={() => navigate('/place-order', {
                  state: {
                    labId: lab.labId || lab.id,
                    labName: lab.labName || lab.name || 'Selected Lab',
                    prescriptionId: state.prescriptionId
                  }
                })}
                className="mt-4 inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Select this lab
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
