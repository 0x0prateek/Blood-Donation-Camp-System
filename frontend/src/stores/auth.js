import { defineStore } from 'pinia'
import api from '../plugins/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),
  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/login', credentials)
        this.user = response.data.user
        this.isAuthenticated = true
        return response.data
      } catch (error) {
        throw error
      }
    },
    async logout() {
      try {
        await api.post('/auth/logout')
        this.user = null
        this.isAuthenticated = false
      } catch (error) {
        console.error('Logout error:', error)
      }
    },
    async checkAuth() {
      try {
        const response = await api.get('/auth/me')
        this.user = response.data.user
        this.isAuthenticated = true
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
      }
    }
  }
})
