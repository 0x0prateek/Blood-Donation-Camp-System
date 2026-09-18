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
        const response = await api.get('/settings/load')
        const settings = response.data.data?.settings
        if (settings?.app_name) {
          this.appName = settings.app_name
        }
      } catch (error) {
        console.error('Failed to fetch settings', error)
      }
    }
  }
})
