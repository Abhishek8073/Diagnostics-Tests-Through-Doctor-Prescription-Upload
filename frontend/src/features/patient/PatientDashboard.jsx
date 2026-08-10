import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../lib/axiosClient'

const DEFAULT_PATIENT_ID = 1

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function formatAmount(value) {
  if (value === null || value === undefined) return '—'
  return `₹${Number(value).toFixed(2)}`
}

export default function PatientDashboard() {
  const [labs, setLabs] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      try {
        const [labsResponse, ordersResponse] = await Promise.all([
          axiosClient.get('/api/patient/labs'),
          axiosClient.get(`/api/patient/allOrders/${DEFAULT_PATIENT_ID}`)
        ])

        setLabs(labsResponse.data)
        setOrders(ordersResponse.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 shadow-soft">Loading patient dashboard...</div>
  }

  const handleSelectLab = (lab) => {
    const labId = lab.labId || lab.id
    navigate('/place-order', {
      state: {
        labId,
        labName: lab.labName || lab.name || 'Selected Lab'
      }
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">Patient dashboard</h2>
        <p className="text-slate-500">Browse labs, place orders, and review diagnostics through the backend reference model.</p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">Available labs</h3>

          <div className="space-y-3">
            {labs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No labs available yet.
              </div>
            ) : (
              labs.map((lab) => (
                <div key={lab.labId || lab.id} className="rounded-2xl border border-slate-200 p-4">
                  <div
                key={lab.labId || lab.id}
                onClick={() => handleSelectLab(lab)}
                className="rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                <p className="font-semibold">{lab.labName || 'Lab'}</p>
                <p className="text-sm text-slate-500">{lab.city || lab.address || 'Location unavailable'}</p>
                <p className="mt-2 text-xs text-slate-500">{lab.address || 'Address not provided'}</p>
                <p className="text-xs text-slate-500">{lab.phone || 'Phone not provided'}</p>
                <div className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Book this lab
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">My orders</h3>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No orders found for this patient.
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.orderId || order.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">Order #{order.orderId || order.id}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{order.status || order.orderStatus || 'PENDING'}</span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <p>Collection type: {order.collectionType || '—'}</p>
                    <p>Booking date: {formatDate(order.bookingDate)}</p>
                    <p>Booking time: {order.bookingTime || '—'}</p>
                    <p>Total amount: {formatAmount(order.totalAmount)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
