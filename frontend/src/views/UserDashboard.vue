<template>
  <div>
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="stat-card bg-primary">
          <i class="fas fa-heart stat-icon"></i>
          <div class="stat-value">{{ donorStatus.isEligible ? 'Eligible' : 'Check-up' }}</div>
          <div class="stat-label">Donation Status</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card bg-success">
          <i class="fas fa-calendar-check stat-icon"></i>
          <div class="stat-value">{{ upcomingCamps.length }}</div>
          <div class="stat-label">Upcoming Camps</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card bg-warning">
          <i class="fas fa-bell stat-icon"></i>
          <div class="stat-value">{{ bloodRequests.length }}</div>
          <div class="stat-label">Open Requests</div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-7">
        <div class="panel">
          <div class="panel-header">
            <h5>Upcoming blood camps</h5>
          </div>
          <div class="panel-body">
            <div v-if="upcomingCamps.length === 0" class="empty-state">No camps scheduled yet.</div>
            <div v-for="camp in upcomingCamps" :key="camp.id" class="camp-item">
              <div>
                <strong>{{ camp.title }}</strong>
                <div class="text-muted small">{{ camp.camp_date }} • {{ camp.location }}</div>
              </div>
              <span class="badge bg-primary-subtle text-primary">{{ camp.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="panel">
          <div class="panel-header">
            <h5>Personal info</h5>
          </div>
          <div class="panel-body user-info">
            <p><strong>Name:</strong> {{ authStore.user?.name || 'N/A' }}</p>
            <p><strong>Email:</strong> {{ authStore.user?.email || 'N/A' }}</p>
            <p><strong>Blood group:</strong> {{ authStore.user?.blood_group || 'Unknown' }}</p>
            <p><strong>Mobile:</strong> {{ authStore.user?.mobile || 'N/A' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/plugins/axios'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const upcomingCamps = ref([])
const bloodRequests = ref([])

const donorStatus = computed(() => ({
  isEligible: true
}))

const fetchData = async () => {
  try {
    const [camps, requests] = await Promise.all([
      api.get('/camps/list', { data: { draw: 1, start: 0, length: 5, filter: 'upcoming' } }),
      api.get('/blood-requests/list')
    ])
    upcomingCamps.value = camps.data?.data || []
    bloodRequests.value = requests.data?.data?.requests || []
  } catch (error) {
    console.error('Unable to load user dashboard', error)
  }
}

onMounted(fetchData)
</script>

<style scoped>
.stat-card { border-radius: 18px; padding: 20px; color: white; min-height: 120px; }
.bg-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
.bg-success { background: linear-gradient(135deg, #16a34a, #15803d); }
.bg-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-icon { font-size: 1.8rem; opacity: .8; margin-bottom: 12px; }
.stat-value { font-size: 1.6rem; font-weight: 800; }
.stat-label { opacity: .9; }
.panel { background: white; border-radius: 18px; box-shadow: 0 10px 30px rgba(15,23,42,.05); }
.panel-header { padding: 18px 20px; border-bottom: 1px solid #e5e7eb; }
.panel-header h5 { margin: 0; }
.panel-body { padding: 18px 20px; }
.camp-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.camp-item:last-child { border-bottom: 0; }
.user-info p { margin: 0 0 10px; }
.empty-state { color: #64748b; }
</style>
