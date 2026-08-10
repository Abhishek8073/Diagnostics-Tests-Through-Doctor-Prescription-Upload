const API_BASE_URL = 'http://localhost:8085'

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || 'Request failed')
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export function setAuthToken(token) {
  localStorage.setItem('token', token)
}

export function clearAuthToken() {
  localStorage.removeItem('token')
}
