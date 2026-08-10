import axiosClient from '../lib/axiosClient'

export const getUsers = () => axiosClient.get('/api/admin/users')
export const getUser = (userId) => axiosClient.get(`/api/admin/users/${userId}`)
export const getUserOrders = (userId) => axiosClient.get(`/api/admin/users/${userId}/orders`)
export const createUser = (payload) => axiosClient.post('/api/admin/users', payload)
export const deleteUser = (userId) => axiosClient.delete(`/api/admin/users/${userId}`)
export const assignLab = (userId, labId) => axiosClient.put(`/api/admin/users/${userId}/lab`, { labId })

export const getAllLabs = () => axiosClient.get('/api/admin/labs')
export const getLab = (labId) => axiosClient.get(`/api/admin/labs/${labId}`)
export const getLabOrders = (labId) => axiosClient.get(`/api/admin/labs/${labId}/orders`)
export const createLab = (payload) => axiosClient.post('/api/admin/labs', payload)
export const deleteLab = (labId) => axiosClient.delete(`/api/admin/labs/${labId}`)

export const getAllOrders = () => axiosClient.get('/api/admin/orders')
export const getOrder = (orderId) => axiosClient.get(`/api/admin/orders/${orderId}`)
