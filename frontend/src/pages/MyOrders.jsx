import { useEffect, useState } from 'react'
import { getPatientOrders, getOrderById, cancelOrder, downloadReportForOrder } from '../services/orderApi'
import { getProfile } from '../services/authApi'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmModal'
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

function filenameFromDisposition(disposition, fallback) {
  if (!disposition) return fallback
  const match = disposition.match(/filename="?([^"]+)"?/)
  return match?.[1] || fallback
}

function normalizeStatus(order) {
  const raw = order?.status || order?.orderStatus || 'PENDING'
  return String(raw).trim().toUpperCase()
}

function labLabel(order) {
  return order?.laboratory?.labName || 'Lab Deleted'
}

export default function MyOrdersPage() {
  const showToast = useToast()
  const confirm = useConfirm()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadOrders() {
      try {
        const profileResponse = await getProfile()
        const patientId = profileResponse.data.userId

        const response = await getPatientOrders(patientId)
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
      const response = await getOrderById(orderId)
      setSelectedOrder(response.data)
    } catch (err) {
      setDetailsError(err.message)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return

    const ok = await confirm({
      title: 'Cancel this order?',
      message: `Order #${selectedOrderId} will be cancelled. This cannot be undone.`,
      confirmLabel: 'Cancel order'
    })
    if (!ok) return

    setCancelling(true)
    setDetailsError('')
    try {
      const response = await cancelOrder(selectedOrderId)
      setSelectedOrder(response.data)
      setOrders((current) =>
        current.map((order) =>
          (order.orderId || order.id) === selectedOrderId ? { ...order, status: response.data.status } : order
        )
      )
      showToast('Order cancelled.', 'success')
    } catch (err) {
      setDetailsError(err.message)
      showToast(err.message, 'error')
    } finally {
      setCancelling(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!selectedOrderId) return

    setDownloading(true)
    setDetailsError('')
    try {
      const response = await downloadReportForOrder(selectedOrderId)
      const filename = filenameFromDisposition(
        response.headers?.['content-disposition'],
        `report-order-${selectedOrderId}`
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showToast('Report downloaded.', 'success')
    } catch (err) {
      setDetailsError(err.message)
      showToast(err.message, 'error')
    } finally {
      setDownloading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    const orderId = order.orderId || order.id
    const status = order.status || order.orderStatus || 'PENDING'
    return (
      String(orderId).includes(term) ||
      (order.laboratory?.labName || '').toLowerCase().includes(term) ||
      status.toLowerCase().includes(term)
    )
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">My Orders</h2>
        <p className="mb-6 text-slate-500">Select an order to view its details.</p>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by lab name or order ID..."
          className="mb-4 w-full rounded-xl border px-4 py-2 text-sm"
        />

        {loading ? <Spinner label="Loading orders..." className="py-4" /> : null}
        {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && filteredOrders.length === 0 ? (
          <EmptyState icon="🧪" title="No orders yet" body="Book a test from the Labs page to see it here." />
        ) : null}

        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const orderId = order.orderId || order.id
            const isSelected = selectedOrderId === orderId

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
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{order.status || order.orderStatus || 'PENDING'}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Collection: {order.collectionType || '—'}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">Order Details</h2>

        {!selectedOrderId ? (
          <p className="mt-4 text-slate-500">Select an order from the list to see its details here.</p>
        ) : null}

        {detailsLoading ? <Spinner label="Loading order details..." className="mt-4" /> : null}
        {detailsError ? (
          <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{detailsError}</p>
        ) : null}

        {selectedOrder ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-semibold">Order #{selectedOrder.orderId}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[normalizeStatus(selectedOrder)] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {normalizeStatus(selectedOrder)}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                <p className="mt-1 font-medium">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-GB') : '—'}</p>
              </div>

              {selectedOrder.prescription ? (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Prescription</p>
                  <p className="mt-1 font-medium">#{selectedOrder.prescription.prescriptionId || selectedOrder.prescription.id}</p>
                </div>
              ) : null}
            </div>

            {detailsError ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{detailsError}</p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {normalizeStatus(selectedOrder) === 'PENDING' ? (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-60"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              ) : null}

              {normalizeStatus(selectedOrder) === 'COMPLETED' ? (
                <button
                  onClick={handleDownloadReport}
                  disabled={downloading}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {downloading ? 'Downloading...' : 'Download Report'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
