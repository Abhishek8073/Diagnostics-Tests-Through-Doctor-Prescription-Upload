import { useEffect, useState } from 'react'
import axiosClient from '../../lib/axiosClient'

export default function LabDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await axiosClient.get('/api/lab/orders')
        setOrders(response.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <div className="rounded-2xl bg-white p-8 shadow-soft">Loading lab dashboard...</div>

  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft">
      <h2 className="text-2xl font-semibold">Lab dashboard</h2>
      <p className="mb-6 text-slate-500">Review incoming orders and update their reporting status.</p>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-sm text-slate-500">Status: {order.orderStatus || 'Pending'}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">Lab</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
