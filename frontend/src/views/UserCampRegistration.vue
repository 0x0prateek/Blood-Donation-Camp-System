<template>
  <div class="page-shell">
    <div class="page-header mb-4">
      <div>
        <p class="eyebrow">Upcoming events</p>
        <h3 class="mb-0">Blood donation camp registration</h3>
      </div>
      <span class="badge-pill">{{ upcomingCamps.length }} camps</span>
    </div>

    <div v-if="loading" class="panel text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 mb-0 text-muted">Loading upcoming camps...</p>
    </div>

    <div v-else-if="upcomingCamps.length === 0" class="panel empty-state">
      <h5>No upcoming camps</h5>
      <p class="mb-0 text-muted">There are no scheduled blood donation camps yet. Please check back later.</p>
    </div>

    <div v-else class="row g-4">
      <div v-for="camp in upcomingCamps" :key="camp.id" class="col-lg-6">
        <div class="panel camp-card">
          <div class="camp-top">
            <div>
              <h5>{{ camp.title }}</h5>
              <p class="mb-1 text-muted">{{ camp.camp_date }}</p>
            </div>
            <span class="status-badge">{{ camp.status || 'Upcoming' }}</span>
          </div>

          <div class="camp-meta">
            <span><i class="fas fa-location-dot"></i> {{ camp.location }}</span>
            <span v-if="camp.start_time"><i class="fas fa-clock"></i> {{ camp.start_time }}</span>
          </div>

          <p class="camp-description" v-if="camp.description">{{ camp.description }}</p>

          <button class="btn btn-primary mt-3" @click="registerForCamp(camp)">Register for this camp</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import api from '@/plugins/axios'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const loading = ref(true)
const upcomingCamps = ref([])

const loadCamps = async () => {
  try {
    const response = await api.post('/camps/list', { draw: 1, start: 0, length: 20, filter: 'upcoming' })
    upcomingCamps.value = response.data?.data || []
  } catch (error) {
    console.error('Unable to load camp list', error)
  } finally {
    loading.value = false
  }
}

const registerForCamp = async (camp) => {
  Swal.fire({
    title: 'Camp registration',
    text: `Register as a donor for ${camp.title}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, register me',
    cancelButtonText: 'Cancel'
  }).then(async (result) => {
    if (!result.isConfirmed) return

    try {
      const payload = {
        camp_id: camp.id,
        mobile: authStore.user?.mobile || '',
        donor_name: authStore.user?.name || '',
        blood_group: authStore.user?.blood_group || '',
        status: 'Registered'
      }

      const response = await api.post('/registrations/save', payload)
      if (response.data.success) {
        Swal.fire('Success', `You are registered for ${camp.title}.`, 'success')
      } else {
        Swal.fire('Notice', response.data.message || 'Unable to register for this camp.', 'info')
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Unable to register for the camp.', 'error')
    }
  })
}

onMounted(loadCamps)
</script>

<style scoped>
.page-shell { padding: 4px 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.eyebrow { margin: 0 0 6px; color: #4f46e5; text-transform: uppercase; letter-spacing: .12em; font-size: .72rem; font-weight: 700; }
.badge-pill { background: #eef2ff; color: #3730a3; border-radius: 999px; padding: 8px 12px; font-weight: 700; }
.panel { background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(15, 23, 42, .06); border: 1px solid #edf2ff; }
.empty-state { padding: 32px 24px; text-align: center; }
.camp-card { padding: 22px; }
.camp-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.camp-top h5 { margin: 0 0 6px; }
.status-badge { background: #ecfdf5; color: #166534; border-radius: 999px; padding: 6px 10px; font-size: .74rem; font-weight: 700; }
.camp-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 14px; color: #475569; font-size: .9rem; }
.camp-meta i { margin-right: 6px; color: #4f46e5; }
.camp-description { margin-top: 12px; color: #475569; }
</style>
