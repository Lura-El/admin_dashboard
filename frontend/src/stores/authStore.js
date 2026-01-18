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
           localStorage.setItem('user', JSON.stringify(data)); // Persist to localStorage
            
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
            localStorage.removeItem('user'); // Clear from localStorage
            router.push({ name: 'login' })
        }
    },

    async fetchUser() {
        try {
            const response = await api.get('/api/user')
            this.user = response.data
            localStorage.setItem('user', JSON.stringify(response.data)); // Persist on successful fetch
        } catch {
            this.user = null
            localStorage.removeItem('user'); // Clear if fetch fails (session expired)
        }
    },

    restoreUser() {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                this.user = JSON.parse(stored);
            } catch {
                localStorage.removeItem('user');
            }
        }
    }
  }
})