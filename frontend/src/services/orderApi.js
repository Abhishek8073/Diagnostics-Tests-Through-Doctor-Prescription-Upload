import axiosClient from '../lib/axiosClient'

export const getPatientLabs = () => axiosClient.get('/api/patient/labs')
export const getPatientOrders = (patientId) => axiosClient.get(`/api/patient/allOrders/${patientId}`)
export const getOrderById = (orderId) => axiosClient.get(`/api/patient/orders/${orderId}`)
export const cancelOrder = (orderId) => axiosClient.put(`/api/patient/orders/${orderId}/cancel`)
export const downloadReportForOrder = (orderId) =>
  axiosClient.get(`/api/patient/orders/${orderId}/report`, { responseType: 'blob' })
export const createOrder = (payload) => axiosClient.post('/api/patient/orders', payload)
export const uploadPrescription = (formData) =>
  axiosClient.post('/api/patient/prescriptions', formData, {
    headers: {
      'Content-Type': undefined
    }
  })
export const getMyLab = () => axiosClient.get('/api/lab/mylab')
export const getLabOrders = () => axiosClient.get('/api/lab/orders')
export const getLabOrderById = (orderId) => axiosClient.get(`/api/lab/orders/${orderId}`)
export const updateLabOrderStatus = (orderId, payload) => axiosClient.put(`/api/lab/orders/${orderId}/status`, payload)
export const downloadPrescriptionForLab = (prescriptionId) =>
  axiosClient.get(`/api/lab/prescriptions/${prescriptionId}`, { responseType: 'blob' })
export const uploadReport = (formData) =>
  axiosClient.post('/api/lab/reports/upload', formData, {
    headers: {
      'Content-Type': undefined
    }
  })
