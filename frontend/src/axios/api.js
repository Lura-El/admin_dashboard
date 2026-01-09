import axios from 'axios'
import router from '@/router'


const BASE = 'http://localhost:8000' // no /api here if you use Sanctum

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // critical: send cookies with requests
  headers:{
    "X-Requested-With": "XMLHttpRequest",
  },
})

// Request interceptor (optional: add CSRF header if needed)
api.interceptors.request.use(config => {
  // Get the CSRF token from cookies and add to headers
  const token = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }

  return config
})

// Response interceptor
api.interceptors.response.use(
  res => res,
  async err => {
    // If session expired, you can redirect to login
    if (err.response?.status === 401) {
       router.push({ name: 'login' })
    }
    return Promise.reject(err)
  }
)

export default api
