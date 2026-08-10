import axiosClient from '../lib/axiosClient'

export const loginUser = (payload) => axiosClient.post('/auth/login', payload)
export const registerUser = (payload) => axiosClient.post('/auth/register', payload)
export const getProfile = () => axiosClient.get('/api/users/profile')
export const updateProfile = (payload) => axiosClient.put('/api/users/profile', payload)
