import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add CSRF token if we are retrieving it from meta tags or cookies
// In this setup, we rely on the backend setting an HTTP-only cookie and handling CORS.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname || '/'
      const mode = currentPath.startsWith('/admin') ? 'admin' : 'user'
      window.location.href = `/login?mode=${mode}`
    }
    return Promise.reject(error)
  }
)

export default api
