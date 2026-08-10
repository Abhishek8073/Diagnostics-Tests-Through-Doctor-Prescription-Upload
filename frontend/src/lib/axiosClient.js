import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'http://localhost:8085',
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

export default axiosClient
