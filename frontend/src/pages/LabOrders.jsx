import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import {
  getLabOrders,
  getLabOrderById,
  updateLabOrderStatus,
  downloadPrescriptionForLab,
  uploadReport
} from '../services/orderApi'

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

function patientLabel(order) {
  return order?.patient?.name || 'Patient Deleted'
}

export default function LabOrdersPage() {
  const showToast = useToast()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  const [downloading, setDownloading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const [reportFile, setReportFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

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
    setUploadMessage('')
    setUploadError('')
    setReportFile(null)

    try {
      const response = await getLabOrderById(orderId)
      setSelectedOrder(response.data)
    } catch (err) {
      setDetailsError(err.message)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrderId) return

    setStatusUpdating(true)
    setDetailsError('')
    try {
      const response = await updateLabOrderStatus(selectedOrderId, { status: newStatus })
      setSelectedOrder(response.data)
      setOrders((current) =>
        current.map((order) =>
          (order.orderId || order.id) === selectedOrderId ? { ...order, status: response.data.status } : order
        )
      )
      showToast(
        newStatus === 'ACCEPTED' ? 'Order accepted.' : newStatus === 'REJECTED' ? 'Order rejected.' : 'Order updated.',
        'success'
      )
    } catch (err) {
      setDetailsError(err.message)
      showToast(err.message, 'error')
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleDownloadPrescription = async () => {
    const prescriptionId = selectedOrder?.prescription?.prescriptionId || selectedOrder?.prescription?.id
    if (!prescriptionId) return

    setDownloading(true)
    try {
      const response = await downloadPrescriptionForLab(prescriptionId)
      const filename = filenameFromDisposition(
        response.headers?.['content-disposition'],
        `prescription-${prescriptionId}`
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showToast('Prescription downloaded.', 'success')
    } catch (err) {
      setDetailsError(err.message)
      showToast(err.message, 'error')
    } finally {
      setDownloading(false)
    }
  }

  const handleUploadReport = async (event) => {
    event.preventDefault()

    if (!reportFile) {
      setUploadError('Please select a report file first.')
      return
    }

    const formData = new FormData()
    formData.append('orderId', selectedOrderId)
    formData.append('file', reportFile)

    setUploading(true)
    setUploadError('')
    setUploadMessage('')

    try {
      const response = await uploadReport(formData)
      setUploadMessage('Report uploaded successfully.')
      setReportFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      showToast('Report uploaded. Order marked completed.', 'success')

      const completedOrder = response.data?.order
      if (completedOrder) {
        setSelectedOrder(completedOrder)
        setOrders((current) =>
          current.map((order) =>
            (order.orderId || order.id) === selectedOrderId ? { ...order, status: completedOrder.status } : order
          )
        )
      } else {
        const refreshed = await getLabOrderById(selectedOrderId)
        setSelectedOrder(refreshed.data)
        setOrders((current) =>
          current.map((order) =>
            (order.orderId || order.id) === selectedOrderId ? { ...order, status: refreshed.data.status } : order
          )
        )
      }
    } catch (err) {
      setUploadError(err.message)
      showToast(err.message, 'error')
    } finally {
      setUploading(false)
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
    <div className="space-y-4">
      <Link to="/lab-dashboard" className="inline-block text-sm font-semibold text-brand-600">
        ← Back to Lab Dashboard
      </Link>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">Orders</h2>
        <p className="text-slate-500">Select an order to view details, accept or reject it, download the prescription, and upload the report.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">All Orders</h3>

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

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleUpdateStatus('ACCEPTED')}
                  disabled={statusUpdating}
                  className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                >
                  {statusUpdating ? 'Updating...' : 'Accept Order'}
                </button>
                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={statusUpdating}
                  className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-60"
                >
                  {statusUpdating ? 'Updating...' : 'Reject Order'}
                </button>
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

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold">Prescription</p>
                {selectedOrder.prescription ? (
                  <button
                    onClick={handleDownloadPrescription}
                    disabled={downloading}
                    className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {downloading ? 'Downloading...' : 'Download Prescription'}
                  </button>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No prescription attached to this order.</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold">Upload Report</p>

                {normalizeStatus(selectedOrder) === 'ACCEPTED' ? (
                  <form onSubmit={handleUploadReport} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,application/pdf"
                      onChange={(event) => setReportFile(event.target.files?.[0] || null)}
                      className="text-sm text-slate-600"
                    />
                    <button
                      type="submit"
                      disabled={uploading}
                      className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {uploading ? 'Uploading...' : 'Upload Report'}
                    </button>
                  </form>
                ) : normalizeStatus(selectedOrder) === 'COMPLETED' ? (
                  <p className="mt-2 text-sm text-slate-500">Report already submitted. This order is marked completed.</p>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Accept this order before uploading a report.</p>
                )}

                {uploadMessage ? (
                  <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{uploadMessage}</p>
                ) : null}
                {uploadError ? (
                  <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{uploadError}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
