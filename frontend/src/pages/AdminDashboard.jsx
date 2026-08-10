import { useEffect, useState } from 'react'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmModal'
import {
  getUsers,
  getUser,
  getUserOrders,
  createUser,
  deleteUser,
  assignLab,
  getAllLabs,
  getLab,
  getLabOrders,
  createLab,
  deleteLab,
  getAllOrders,
  getOrder
} from '../services/userApi'

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-slate-200 text-slate-600'
}

function normalizeStatus(order) {
  const raw = order?.status || order?.orderStatus || 'PENDING'
  return String(raw).trim().toUpperCase()
}

function patientLabel(order) {
  return order?.patient?.name || 'Patient Deleted'
}

function labLabel(order) {
  return order?.laboratory?.labName || 'Lab Deleted'
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB')
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB')
}

function formatAmount(value) {
  if (value === null || value === undefined) return '—'
  return `₹${Number(value).toFixed(2)}`
}

function StatusBadge({ order }) {
  const status = normalizeStatus(order)
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  )
}

function OrderHistoryList({ orders }) {
  if (!orders || orders.length === 0) {
    return <p className="text-sm text-slate-500">No order activity yet.</p>
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => {
        const orderId = order.orderId || order.id
        return (
          <div key={orderId} className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Order #{orderId}</p>
              <StatusBadge order={order} />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Lab: {labLabel(order)} Patient: {patientLabel(order)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Booked: {formatDate(order.bookingDate)} {order.bookingTime || ''}
            </p>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------- Patients Section ---------------- */

function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mb-4 w-full rounded-xl border px-4 py-2 text-sm"
    />
  )
}

function PatientsSection() {
  const showToast = useToast()
  const confirm = useConfirm()

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [selectedId, setSelectedId] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await getUsers()
        setPatients(response.data.filter((user) => user.role === 'PATIENT'))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPatients()
  }, [])

  const handleSelect = async (id) => {
    setSelectedId(id)
    setSelectedPatient(null)
    setDetailsError('')
    setDetailsLoading(true)
    setShowHistory(false)
    setHistory([])
    setHistoryError('')

    try {
      const response = await getUser(id)
      setSelectedPatient(response.data)
    } catch (err) {
      setDetailsError(err.message)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return

    const ok = await confirm({
      title: 'Delete patient?',
      message: `Delete patient #${selectedId} — ${selectedPatient?.name}? This cannot be undone.`,
      confirmLabel: 'Delete'
    })
    if (!ok) return

    setDeleting(true)
    setDetailsError('')

    try {
      await deleteUser(selectedId)
      setPatients((current) => current.filter((patient) => patient.userId !== selectedId))
      setSelectedId(null)
      setSelectedPatient(null)
      showToast('Patient deleted.', 'success')
    } catch (err) {
      setDetailsError(err.message)
      showToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleHistory = async () => {
    const next = !showHistory
    setShowHistory(next)

    if (next && history.length === 0) {
      setHistoryLoading(true)
      setHistoryError('')
      try {
        const response = await getUserOrders(selectedId)
        setHistory(response.data)
      } catch (err) {
        setHistoryError(err.message)
      } finally {
        setHistoryLoading(false)
      }
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      String(patient.userId).includes(term) ||
      (patient.name || '').toLowerCase().includes(term) ||
      (patient.email || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">All Patients</h3>

        <SearchInput value={search} onChange={setSearch} placeholder="Search by patient name or ID..." />

        {loading ? <p className="text-slate-500">Loading patients...</p> : null}
        {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && filteredPatients.length === 0 ? <p className="text-slate-500">No patients found.</p> : null}

        <div className="space-y-3">
          {filteredPatients.map((patient) => {
            const isSelected = selectedId === patient.userId
            return (
              <button
                key={patient.userId}
                onClick={() => handleSelect(patient.userId)}
                className={`w-full rounded-2xl border p-4 text-left transition hover:border-brand-400 hover:shadow-soft ${
                  isSelected ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
                }`}
              >
                <p className="font-semibold">#{patient.userId} — {patient.name}</p>
                <p className="mt-1 text-sm text-slate-600">{patient.address || '—'}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">Patient Details</h3>

        {!selectedId ? <p className="text-slate-500">Select a patient from the list to see their details here.</p> : null}
        {detailsLoading ? <p className="text-slate-500">Loading patient details...</p> : null}
        {detailsError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{detailsError}</p> : null}

        {selectedPatient ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Name</p>
                <p className="mt-1 font-medium">{selectedPatient.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Email</p>
                <p className="mt-1 font-medium">{selectedPatient.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Phone</p>
                <p className="mt-1 font-medium">{selectedPatient.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Address</p>
                <p className="mt-1 font-medium">{selectedPatient.address || '—'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <button
                onClick={handleToggleHistory}
                className="text-sm font-semibold text-brand-600"
              >
                {showHistory ? 'Hide History ▲' : 'History (activities & orders) ▼'}
              </button>

              {showHistory ? (
                <div className="mt-4">
                  {historyLoading ? <p className="text-sm text-slate-500">Loading history...</p> : null}
                  {historyError ? (
                    <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{historyError}</p>
                  ) : null}
                  {!historyLoading && !historyError ? <OrderHistoryList orders={history} /> : null}
                </div>
              ) : null}
            </div>

            {detailsError ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{detailsError}</p>
            ) : null}

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ---------------- Lab Users Section ---------------- */

function LabUsersSection() {
  const showToast = useToast()
  const confirm = useConfirm()

  const [labUsers, setLabUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [selectedId, setSelectedId] = useState(null)
  const [selectedLabUser, setSelectedLabUser] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const [deleting, setDeleting] = useState(false)

  const [allLabs, setAllLabs] = useState([])
  const [labIdToAssign, setLabIdToAssign] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [assignMessage, setAssignMessage] = useState('')

  useEffect(() => {
    getAllLabs()
      .then((response) => setAllLabs(response.data))
      .catch(() => setAllLabs([]))
  }, [])

  useEffect(() => {
    async function loadLabUsers() {
      try {
        const response = await getUsers()
        setLabUsers(response.data.filter((user) => user.role === 'LAB'))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadLabUsers()
  }, [])

  const handleSelect = async (id) => {
    setSelectedId(id)
    setSelectedLabUser(null)
    setDetailsError('')
    setDetailsLoading(true)
    setShowHistory(false)
    setHistory([])
    setHistoryError('')
    setAssignMessage('')
    setLabIdToAssign('')

    try {
      const response = await getUser(id)
      setSelectedLabUser(response.data)
      setLabIdToAssign(response.data.lab?.labId ? String(response.data.lab.labId) : '')
    } catch (err) {
      setDetailsError(err.message)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleAssignLab = async () => {
    if (!selectedId) return

    setAssigning(true)
    setDetailsError('')
    setAssignMessage('')

    try {
      const response = await assignLab(selectedId, labIdToAssign ? Number(labIdToAssign) : null)
      setSelectedLabUser(response.data)
      setAssignMessage('Lab assignment updated.')
      setShowHistory(false)
      setHistory([])
      showToast('Lab assignment updated.', 'success')
    } catch (err) {
      setDetailsError(err.message)
      showToast(err.message, 'error')
    } finally {
      setAssigning(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return

    const ok = await confirm({
      title: 'Delete lab user?',
      message: `Delete lab user #${selectedId} — ${selectedLabUser?.name}? This cannot be undone.`,
      confirmLabel: 'Delete'
    })
    if (!ok) return

    setDeleting(true)
    setDetailsError('')

    try {
      await deleteUser(selectedId)
      setLabUsers((current) => current.filter((labUser) => labUser.userId !== selectedId))
      setSelectedId(null)
      setSelectedLabUser(null)
      showToast('Lab user deleted.', 'success')
    } catch (err) {
      setDetailsError(err.message)
      showToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleHistory = async () => {
    const next = !showHistory
    setShowHistory(next)

    if (next && history.length === 0) {
      setHistoryLoading(true)
      setHistoryError('')
      try {
        const response = await getUserOrders(selectedId)
        setHistory(response.data)
      } catch (err) {
        setHistoryError(err.message)
      } finally {
        setHistoryLoading(false)
      }
    }
  }

  const filteredLabUsers = labUsers.filter((labUser) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      String(labUser.userId).includes(term) ||
      (labUser.name || '').toLowerCase().includes(term) ||
      (labUser.email || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">All Lab Users</h3>

        <SearchInput value={search} onChange={setSearch} placeholder="Search by lab user name or ID..." />

        {loading ? <p className="text-slate-500">Loading lab users...</p> : null}
        {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && filteredLabUsers.length === 0 ? <p className="text-slate-500">No lab users found.</p> : null}

        <div className="space-y-3">
          {filteredLabUsers.map((labUser) => {
            const isSelected = selectedId === labUser.userId
            return (
              <button
                key={labUser.userId}
                onClick={() => handleSelect(labUser.userId)}
                className={`w-full rounded-2xl border p-4 text-left transition hover:border-brand-400 hover:shadow-soft ${
                  isSelected ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
                }`}
              >
                <p className="font-semibold">#{labUser.userId} — {labUser.name}</p>
                <p className="mt-1 text-sm text-slate-600">{labUser.address || '—'}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">Lab User Details</h3>

        {!selectedId ? <p className="text-slate-500">Select a lab user from the list to see their details here.</p> : null}
        {detailsLoading ? <p className="text-slate-500">Loading lab user details...</p> : null}
        {detailsError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{detailsError}</p> : null}

        {selectedLabUser ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Name</p>
                <p className="mt-1 font-medium">{selectedLabUser.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Email</p>
                <p className="mt-1 font-medium">{selectedLabUser.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Phone</p>
                <p className="mt-1 font-medium">{selectedLabUser.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Address</p>
                <p className="mt-1 font-medium">{selectedLabUser.address || '—'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold">Lab Assignment</p>
              <p className="mt-1 text-sm text-slate-500">
                Currently: {selectedLabUser.lab?.labName || 'Not assigned'}
              </p>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={labIdToAssign}
                  onChange={(event) => setLabIdToAssign(event.target.value)}
                  className="w-full rounded-xl border px-4 py-2 text-sm sm:w-auto"
                >
                  <option value="">Not assigned</option>
                  {allLabs.map((lab) => (
                    <option key={lab.labId} value={lab.labId}>
                      {lab.labName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignLab}
                  disabled={assigning}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {assigning ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>

              {assignMessage ? (
                <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{assignMessage}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <button
                onClick={handleToggleHistory}
                className="text-sm font-semibold text-brand-600"
              >
                {showHistory ? 'Hide History ▲' : 'History (activities) ▼'}
              </button>

              {showHistory ? (
                <div className="mt-4">
                  {historyLoading ? <p className="text-sm text-slate-500">Loading history...</p> : null}
                  {historyError ? (
                    <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{historyError}</p>
                  ) : null}
                  {!historyLoading && !historyError ? <OrderHistoryList orders={history} /> : null}
                </div>
              ) : null}
            </div>

            {detailsError ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{detailsError}</p>
            ) : null}

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete Lab User'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ---------------- Labs Section ---------------- */

function LabsSection() {
  const showToast = useToast()
  const confirm = useConfirm()

  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [selectedId, setSelectedId] = useState(null)
  const [selectedLab, setSelectedLab] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const [deleting, setDeleting] = useState(false)

  const loadLabs = async () => {
    setLoading(true)
    try {
      const response = await getAllLabs()
      setLabs(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLabs()
  }, [])

  const handleSelect = async (id) => {
    setSelectedId(id)
    setSelectedLab(null)
    setDetailsError('')
    setDetailsLoading(true)
    setShowHistory(false)
    setHistory([])
    setHistoryError('')

    try {
      const response = await getLab(id)
      setSelectedLab(response.data)
    } catch (err) {
      setDetailsError(err.message)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleToggleHistory = async () => {
    const next = !showHistory
    setShowHistory(next)

    if (next && history.length === 0) {
      setHistoryLoading(true)
      setHistoryError('')
      try {
        const response = await getLabOrders(selectedId)
        setHistory(response.data)
      } catch (err) {
        setHistoryError(err.message)
      } finally {
        setHistoryLoading(false)
      }
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return

    const ok = await confirm({
      title: 'Delete lab?',
      message: `Delete lab #${selectedId} — ${selectedLab?.labName}? This cannot be undone.`,
      confirmLabel: 'Delete'
    })
    if (!ok) return

    setDeleting(true)
    setDetailsError('')

    try {
      await deleteLab(selectedId)
      setLabs((current) => current.filter((lab) => lab.labId !== selectedId))
      setSelectedId(null)
      setSelectedLab(null)
      showToast('Lab deleted.', 'success')
    } catch (err) {
      setDetailsError(err.message)
      showToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const filteredLabs = labs.filter((lab) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      String(lab.labId).includes(term) ||
      (lab.labName || '').toLowerCase().includes(term) ||
      (lab.city || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">All Labs</h3>

        <SearchInput value={search} onChange={setSearch} placeholder="Search by lab name or ID..." />

        {loading ? <p className="text-slate-500">Loading labs...</p> : null}
        {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && filteredLabs.length === 0 ? <p className="text-slate-500">No labs found.</p> : null}

        <div className="space-y-3">
          {filteredLabs.map((lab) => {
            const isSelected = selectedId === lab.labId
            return (
              <button
                key={lab.labId}
                onClick={() => handleSelect(lab.labId)}
                className={`w-full rounded-2xl border p-4 text-left transition hover:border-brand-400 hover:shadow-soft ${
                  isSelected ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
                }`}
              >
                <p className="font-semibold">#{lab.labId} — {lab.labName}</p>
                <p className="mt-1 text-sm text-slate-600">{lab.city || lab.address || '—'}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">Lab Details</h3>

        {!selectedId ? <p className="text-slate-500">Select a lab from the list to see its details here.</p> : null}
        {detailsLoading ? <p className="text-slate-500">Loading lab details...</p> : null}
        {detailsError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{detailsError}</p> : null}

        {selectedLab ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Lab name</p>
                <p className="mt-1 font-medium">{selectedLab.labName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Email</p>
                <p className="mt-1 font-medium">{selectedLab.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Phone</p>
                <p className="mt-1 font-medium">{selectedLab.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">City</p>
                <p className="mt-1 font-medium">{selectedLab.city || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Address</p>
                <p className="mt-1 font-medium">{selectedLab.address || '—'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <button
                onClick={handleToggleHistory}
                className="text-sm font-semibold text-brand-600"
              >
                {showHistory ? 'Hide History ▲' : 'History (activities & orders) ▼'}
              </button>

              {showHistory ? (
                <div className="mt-4">
                  {historyLoading ? <p className="text-sm text-slate-500">Loading history...</p> : null}
                  {historyError ? (
                    <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{historyError}</p>
                  ) : null}
                  {!historyLoading && !historyError ? <OrderHistoryList orders={history} /> : null}
                </div>
              ) : null}
            </div>

            {detailsError ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{detailsError}</p>
            ) : null}

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete Lab'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ---------------- Add Lab Section ---------------- */

function AddLabSection({ onLabAdded }) {
  const showToast = useToast()
  const [form, setForm] = useState({ labName: '', address: '', city: '', phone: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.labName.trim()) {
      setError('Lab name is required.')
      return
    }
    if (!form.city.trim()) {
      setError('City is required.')
      return
    }
    if (!form.address.trim()) {
      setError('Address is required.')
      return
    }
    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError('Phone number must be exactly 10 digits.')
      return
    }
    if (!form.email.trim()) {
      setError('Email is required.')
      return
    }

    setSaving(true)
    try {
      await createLab({
        ...form,
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim()
      })
      setMessage('Lab added successfully.')
      setForm({ labName: '', address: '', city: '', phone: '', email: '' })
      onLabAdded?.()
      showToast('Lab added successfully.', 'success')
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl rounded-3xl bg-white p-6 shadow-soft">
      <h3 className="mb-4 text-lg font-semibold">Add New Lab</h3>

      {message ? <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={form.labName}
          onChange={handleChange('labName')}
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Lab name"
          required
        />
        <input
          value={form.city}
          onChange={handleChange('city')}
          className="w-full rounded-xl border px-4 py-3"
          placeholder="City"
          required
        />
        <input
          value={form.address}
          onChange={handleChange('address')}
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Address"
          required
        />
        <input
          value={form.phone}
          onChange={handleChange('phone')}
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Phone (10 digits)"
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

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Adding...' : 'Add Lab'}
        </button>
      </form>
    </div>
  )
}

/* ---------------- Add User Section ---------------- */

function AddUserSection({ onUserAdded }) {
  const showToast = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'PATIENT'
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

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
    setMessage('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    try {
      await createUser({
        ...form,
        address: form.address.trim()
      })
      setMessage(
        form.role === 'LAB'
          ? 'User added successfully. Assign them to a lab from the All Lab Users tab.'
          : 'User added successfully.'
      )
      setForm({ name: '', email: '', password: '', phone: '', address: '', role: 'PATIENT' })
      onUserAdded?.()
      showToast('User added successfully.', 'success')
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl rounded-3xl bg-white p-6 shadow-soft">
      <h3 className="mb-4 text-lg font-semibold">Add New User</h3>

      {message ? <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Address"
          required
        />
        <select
          value={form.role}
          onChange={handleChange('role')}
          className="w-full rounded-xl border px-4 py-3 text-slate-700"
        >
          <option value="PATIENT">Patient</option>
          <option value="LAB">Lab</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Adding...' : 'Add User'}
        </button>
      </form>
    </div>
  )
}

/* ---------------- Orders Section ---------------- */

function OrdersSection() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [selectedId, setSelectedId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await getAllOrders()
        setOrders(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handleSelect = async (id) => {
    setSelectedId(id)
    setSelectedOrder(null)
    setDetailsError('')
    setDetailsLoading(true)

    try {
      const response = await getOrder(id)
      setSelectedOrder(response.data)
    } catch (err) {
      setDetailsError(err.message)
    } finally {
      setDetailsLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    const orderId = order.orderId || order.id
    return (
      String(orderId).includes(term) ||
      (order.patient?.name || '').toLowerCase().includes(term) ||
      (order.laboratory?.labName || '').toLowerCase().includes(term) ||
      normalizeStatus(order).toLowerCase().includes(term)
    )
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">All Orders</h3>

        <SearchInput value={search} onChange={setSearch} placeholder="Search by patient or lab name, or order ID..." />

        {loading ? <p className="text-slate-500">Loading orders...</p> : null}
        {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && filteredOrders.length === 0 ? <p className="text-slate-500">No orders found.</p> : null}

        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const orderId = order.orderId || order.id
            const isSelected = selectedId === orderId

            return (
              <button
                key={orderId}
                onClick={() => handleSelect(orderId)}
                className={`w-full rounded-2xl border p-4 text-left transition hover:border-brand-400 hover:shadow-soft ${
                  isSelected ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">Order #{orderId}</p>
                  <StatusBadge order={order} />
                </div>
                <p className="mt-2 text-sm text-slate-600">Patient: {patientLabel(order)}</p>
                <p className="text-sm text-slate-600">Lab: {labLabel(order)}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">Order Details &amp; Activity</h3>

        {!selectedId ? <p className="text-slate-500">Select an order from the list to see its details here.</p> : null}
        {detailsLoading ? <p className="text-slate-500">Loading order details...</p> : null}
        {detailsError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{detailsError}</p> : null}

        {selectedOrder ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-semibold">Order #{selectedOrder.orderId}</p>
              <StatusBadge order={selectedOrder} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Patient</p>
                <p className="mt-1 font-medium">{patientLabel(selectedOrder)}</p>
                <p className="text-sm text-slate-500">{selectedOrder.patient?.phone || ''}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Lab</p>
                <p className="mt-1 font-medium">{labLabel(selectedOrder)}</p>
                <p className="text-sm text-slate-500">{selectedOrder.laboratory?.city || ''}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Collection type</p>
                <p className="mt-1 font-medium">
                  {selectedOrder.collectionType === 'LAB_VISIT'
                    ? 'Lab Visit'
                    : selectedOrder.collectionType === 'HOME'
                    ? 'Home Collection'
                    : '—'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Booking date</p>
                <p className="mt-1 font-medium">{formatDate(selectedOrder.bookingDate)}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Booking time</p>
                <p className="mt-1 font-medium">{selectedOrder.bookingTime || '—'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Address</p>
                <p className="mt-1 font-medium">{selectedOrder.address || '—'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Total amount</p>
                <p className="mt-1 font-medium">{formatAmount(selectedOrder.totalAmount)}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Placed on</p>
                <p className="mt-1 font-medium">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>

              {selectedOrder.prescription ? (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Prescription</p>
                  <p className="mt-1 font-medium">#{selectedOrder.prescription.prescriptionId || selectedOrder.prescription.id}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="mb-2 text-sm font-semibold">Activity Timeline</p>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>Placed on {formatDateTime(selectedOrder.createdAt)}</li>
                <li>Current status: {normalizeStatus(selectedOrder)}</li>
                {selectedOrder.bookingDate ? (
                  <li>Scheduled for {formatDate(selectedOrder.bookingDate)} {selectedOrder.bookingTime || ''}</li>
                ) : null}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ---------------- Main Admin Dashboard ---------------- */

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'patients', label: 'All Patients' },
  { id: 'lab-users', label: 'All Lab Users' },
  { id: 'labs', label: 'All Labs' },
  { id: 'add-lab', label: 'Add Lab' },
  { id: 'add-user', label: 'Add User' },
  { id: 'orders', label: 'All Orders' }
]

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [labs, setLabs] = useState([])
  const [labsRefreshKey, setLabsRefreshKey] = useState(0)
  const [usersRefreshKey, setUsersRefreshKey] = useState(0)

  useEffect(() => {
    async function loadOverview() {
      try {
        const [usersResponse, labsResponse] = await Promise.all([
          getUsers(),
          getAllLabs()
        ])

        setUsers(usersResponse.data)
        setLabs(labsResponse.data)
      } catch (error) {
        console.error(error)
      }
    }

    loadOverview()
  }, [labsRefreshKey, usersRefreshKey])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-soft"><h3 className="text-lg font-semibold">Users</h3><p className="mt-2 text-3xl font-bold text-brand-600">{users.length}</p></div>
        <div className="rounded-3xl bg-white p-6 shadow-soft"><h3 className="text-lg font-semibold">Labs</h3><p className="mt-2 text-3xl font-bold text-brand-600">{labs.length}</p></div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-3xl bg-white p-2 shadow-soft">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <div className="rounded-3xl bg-white p-6 shadow-soft text-slate-500">
          Use the tabs above to manage patients, labs, and orders.
        </div>
      ) : null}

      {activeTab === 'patients' ? <PatientsSection key={usersRefreshKey} /> : null}
      {activeTab === 'lab-users' ? <LabUsersSection key={usersRefreshKey} /> : null}
      {activeTab === 'labs' ? <LabsSection key={labsRefreshKey} /> : null}
      {activeTab === 'add-lab' ? (
        <AddLabSection onLabAdded={() => setLabsRefreshKey((key) => key + 1)} />
      ) : null}
      {activeTab === 'add-user' ? (
        <AddUserSection onUserAdded={() => setUsersRefreshKey((key) => key + 1)} />
      ) : null}
      {activeTab === 'orders' ? <OrdersSection /> : null}
    </div>
  )
}
