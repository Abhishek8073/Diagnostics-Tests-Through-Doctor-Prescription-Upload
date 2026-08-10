import { useEffect, useState } from 'react'
import { getPatientOrders } from '../services/orderApi'
import { getProfile } from '../services/authApi'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaClipboardList, FaClock, FaCheckCircle } from 'react-icons/fa'
import Spinner from '../components/Spinner'

export default function DashboardPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      try {
        const profileResponse = await getProfile()
        const patientId = profileResponse.data.userId

        const response = await getPatientOrders(patientId)
        setOrders(response.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const totalOrders = orders.length
  const pendingOrders = orders.filter((order) => (order.status || order.orderStatus || 'PENDING').toUpperCase() === 'PENDING').length
  const completedOrders = orders.filter((order) => (order.status || order.orderStatus || 'PENDING').toUpperCase() === 'COMPLETED').length

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl bg-white p-10 shadow-soft">
        <Spinner label="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-5 bg-gradient-to-r from-brand-700 to-brand-500 p-6 text-white">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-white/60">Your health workspace</p><h2 className="mt-2 text-2xl font-bold">Patient dashboard</h2><p className="mt-1 text-sm text-white/75">Track every booking and report in one calm, clear view.</p></div>
          <Link to="/labs" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700 shadow-sm hover:-translate-y-0.5">Book a test <FaArrowRight size={13} /></Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-soft"><FaClipboardList className="text-brand-600" /><h3 className="mt-3 text-lg font-semibold">Total Orders</h3><p className="mt-2 text-3xl font-bold text-brand-600">{totalOrders}</p></div>
        <div className="rounded-3xl bg-white p-6 shadow-soft"><FaClock className="text-amber-500" /><h3 className="mt-3 text-lg font-semibold">Pending Orders</h3><p className="mt-2 text-3xl font-bold text-brand-600">{pendingOrders}</p></div>
        <div className="rounded-3xl bg-white p-6 shadow-soft"><FaCheckCircle className="text-emerald-500" /><h3 className="mt-3 text-lg font-semibold">Completed Orders</h3><p className="mt-2 text-3xl font-bold text-brand-600">{completedOrders}</p></div>
      </section>
    </div>
  )
}
