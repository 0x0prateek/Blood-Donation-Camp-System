<template>
  <div class="panel">
    <div class="panel-header">
      <h5>My profile</h5>
    </div>
    <div class="panel-body">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Full name</label>
          <input v-model="profile.name" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Username</label>
          <input v-model="profile.username" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Email</label>
          <input v-model="profile.email" class="form-control" type="email" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Mobile</label>
          <input v-model="profile.mobile" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Blood group</label>
          <select v-model="profile.blood_group" class="form-select">
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        <div class="col-12 d-flex justify-content-end">
          <button class="btn btn-primary" @click="saveProfile">Save Profile</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import Swal from 'sweetalert2'
import api from '@/plugins/axios'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const profile = reactive({
  name: authStore.user?.name || '',
  username: authStore.user?.username || '',
  email: authStore.user?.email || '',
  mobile: authStore.user?.mobile || '',
  blood_group: authStore.user?.blood_group || 'O+'
})

const saveProfile = async () => {
  try {
    const response = await api.post('/auth/account-save', {
      name: profile.name,
      email: profile.email,
      current_password: ''
    })
    if (response.data.success) {
      Swal.fire('Saved', 'Your profile has been updated.', 'success')
    }
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Unable to save profile.', 'error')
  }
}
</script>

<style scoped>
.panel { background: white; border-radius: 18px; box-shadow: 0 10px 30px rgba(15,23,42,.05); }
.panel-header { padding: 18px 20px; border-bottom: 1px solid #e5e7eb; }
.panel-header h5 { margin: 0; }
.panel-body { padding: 20px; }
</style>
