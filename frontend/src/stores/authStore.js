import { defineStore } from 'pinia'
import api from '@/axios/api'
import router from '@/router'

export const useAuthStore = defineStore('auth-store', {
  state: () => ({
    user: null,
    loading: false,
    errors: {}
  }),
    getters: {
        isAuthenticated: (state) => !!state.user,
    },

  actions: {
    async login(credentials) {
        this.loading = true
        this.errors = {}

        try {
            // Important: call Sanctum CSRF cookie first
            await api.get('/sanctum/csrf-cookie')

            // Then login (Laravel will set session cookie automatically)
            const response = await api.post('/auth/login', credentials)
           const { data } = await api.get('/api/user'); // protected route 
           this.user = data;
            
            return { success: true, data: response.data }
        } catch (error) {
            if (error.response?.status === 422) {
            this.errors = error.response.data.errors
            } else {
            this.errors = { general: 'Login failed. Try again.' }
            }
            return { success: false, errors: this.errors, status: error.response?.status }
        } finally {
            this.loading = false
        }
    },

    async logout() {
        try {
            await api.post('/logout') // backend clears cookie
        } finally {
            this.user = null
            router.push({ name: 'login' })
        }
    },

    async fetchUser() {
        try {
            const response = await api.get('/api/user')
            this.user = response.data
        } catch {
            this.user = null
        }
    }
  }
})
