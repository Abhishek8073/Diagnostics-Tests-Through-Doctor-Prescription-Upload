import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaFlask } from 'react-icons/fa'
import { getMyLab, getLabOrders, getLabOrderById } from '../services/orderApi'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-slate-200 text-slate-600'
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB')
}

function formatAmount(value) {
  if (value === null || value === undefined) return '—'
  return `₹${Number(value).toFixed(2)}`
}

function normalizeStatus(order) {
  const raw = order?.status || order?.orderStatus || 'PENDING'
  return String(raw).trim().toUpperCase()
}

function patientLabel(order) {
  return order?.patient?.name || 'Patient Deleted'
}

const TABS = [
  { id: 'labs', label: 'All Labs' },
  { id: 'my-orders', label: 'My Orders' }
]

export default function LabDashboardPage() {
  const [activeTab, setActiveTab] = useState('labs')

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-5 bg-gradient-to-r from-brand-700 to-brand-500 p-6 text-white">
          <div><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><FaFlask /></div><h2 className="text-2xl font-bold">Lab workspace</h2><p className="mt-1 text-sm text-white/75">View your lab details and keep every order moving.</p></div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/25"><FaArrowLeft size={13} /> Back to landing page</Link>
        </div>
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

      {activeTab === 'labs' ? <AllLabsSection /> : null}
      {activeTab === 'my-orders' ? <MyOrdersSection /> : null}
    </div>
  )
}

/* ---------------- All Labs Section ---------------- */
/* A lab account only ever has access to the single lab it's assigned to. */

function AllLabsSection() {
  const navigate = useNavigate()

  const [lab, setLab] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getMyLab()
      .then((response) => setLab(response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const term = search.trim().toLowerCase()
  const matchesSearch =
    !term ||
    String(lab?.labId || lab?.id || '').includes(term) ||
    (lab?.labName || '').toLowerCase().includes(term) ||
    (lab?.city || '').toLowerCase().includes(term)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">All Labs</h3>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by lab name or ID..."
          className="mb-4 w-full rounded-xl border px-4 py-2 text-sm"
        />

        {loading ? <Spinner label="Loading..." className="py-2" /> : null}
        {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}

        {!loading && !error && lab && matchesSearch ? (
          <button
            onClick={() => setSelected(true)}
            className={`w-full rounded-2xl border p-4 text-left transition hover:border-brand-400 hover:shadow-soft ${
              selected ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
            }`}
          >
            <p className="font-semibold">#{lab.labId} — {lab.labName}</p>
            <p className="mt-1 text-sm text-slate-600">{lab.city || '—'}</p>
          </button>
        ) : null}

        {!loading && !error && lab && !matchesSearch ? (
          <EmptyState icon="🔍" title="No labs match your search" />
        ) : null}

        {!loading && !error && !lab ? (
          <EmptyState icon="🏥" title="No lab found" body="Contact an admin to get assigned to a lab." />
        ) : null}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">Lab Details</h3>

        {!selected ? <p className="text-slate-500">Select the lab from the list to see its details here.</p> : null}

        {selected && lab ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Lab Name</p>
                <p className="mt-1 font-medium">{lab.labName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">City</p>
                <p className="mt-1 font-medium">{lab.city || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Address</p>
                <p className="mt-1 font-medium">{lab.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Phone</p>
                <p className="mt-1 font-medium">{lab.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Email</p>
                <p className="mt-1 font-medium">{lab.email || '—'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold">Orders</p>
              <p className="mt-1 text-sm text-slate-500">View and manage every order placed with this lab.</p>
              <button
                onClick={() => navigate('/lab-dashboard/orders')}
                className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              >
                View Orders
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ---------------- My Orders Section (read-only) ---------------- */

function MyOrdersSection() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await getLabOrders()
        setOrders(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handleSelectOrder = async (orderId) => {
    setSelectedOrderId(orderId)
    setSelectedOrder(null)
    setDetailsError('')
    setDetailsLoading(true)

    try {
      const response = await getLabOrderById(orderId)
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
      normalizeStatus(order).toLowerCase().includes(term)
    )
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">My Orders</h3>
        <p className="mb-4 text-sm text-slate-500">A read-only view of every order for your lab.</p>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by patient name or order ID..."
          className="mb-4 w-full rounded-xl border px-4 py-2 text-sm"
        />

        {loading ? <Spinner label="Loading orders..." className="py-2" /> : null}
        {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && filteredOrders.length === 0 ? (
          <EmptyState icon="🧪" title="No orders found" />
        ) : null}

        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const orderId = order.orderId || order.id
            const isSelected = selectedOrderId === orderId
            const status = normalizeStatus(order)

            return (
              <button
                key={orderId}
                onClick={() => handleSelectOrder(orderId)}
                className={`w-full rounded-2xl border p-4 text-left transition hover:border-brand-400 hover:shadow-soft ${
                  isSelected ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">Order #{orderId}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status] || 'bg-slate-100 text-slate-700'}`}>
                    {status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Patient: {patientLabel(order)}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">Order Details</h3>

        {!selectedOrderId ? (
          <p className="text-slate-500">Select an order from the list to see its details here.</p>
        ) : null}

        {detailsLoading ? <Spinner label="Loading order details..." className="py-2" /> : null}
        {detailsError ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{detailsError}</p>
        ) : null}

        {selectedOrder ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-semibold">Order #{selectedOrder.orderId}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[normalizeStatus(selectedOrder)] || 'bg-slate-100 text-slate-700'}`}>
                {normalizeStatus(selectedOrder)}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Patient</p>
                <p className="mt-1 font-medium">{patientLabel(selectedOrder)}</p>
                <p className="text-sm text-slate-500">{selectedOrder.patient?.phone || ''}</p>
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
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
