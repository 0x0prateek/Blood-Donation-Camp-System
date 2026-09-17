import { defineStore } from 'pinia'
import api from '../plugins/axios'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    appName: 'Blood Donation Camp System',
    theme: 'light',
    // ... other settings
  }),
  actions: {
    async fetchSettings() {
      try {
        const response = await api.get('/settings')
        if (response.data.appName) {
          this.appName = response.data.appName
        }
      } catch (error) {
        console.error('Failed to fetch settings', error)
      }
    }
  }
})
