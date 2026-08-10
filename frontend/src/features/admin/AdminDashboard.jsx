import { useEffect, useState } from 'react'
import axiosClient from '../../lib/axiosClient'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [usersResponse, ordersResponse, labsResponse] = await Promise.all([
          axiosClient.get('/api/admin/users'),
          axiosClient.get('/api/admin/orders'),
          axiosClient.get('/api/admin/labs')
        ])

        setUsers(usersResponse.data)
        setOrders(ordersResponse.data)
        setLabs(labsResponse.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <div className="rounded-2xl bg-white p-8 shadow-soft">Loading admin dashboard...</div>

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">Admin dashboard</h2>
        <p className="text-slate-500">Supervise users, labs, and diagnostic orders.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Users</h3>
          <p className="mt-2 text-3xl font-bold text-brand-600">{users.length}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Orders</h3>
          <p className="mt-2 text-3xl font-bold text-brand-600">{orders.length}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Labs</h3>
          <p className="mt-2 text-3xl font-bold text-brand-600">{labs.length}</p>
        </div>
      </section>
    </div>
  )
}
