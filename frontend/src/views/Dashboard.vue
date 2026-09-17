<template>
  <div>
    <h1 class="h3 mb-4">Dashboard</h1>

    <!-- ── Stats Row ──────────────────────────────────────── -->
    <div class="row g-3 mb-4">
      <!-- Total Donors -->
      <div class="col-6 col-md-4 col-xl-3">
        <div class="stat-card bg-total">
          <i class="fas fa-users stat-icon"></i>
          <div class="stat-value">{{ dashboardData.total_donors }}</div>
          <div class="stat-label">Total Donors</div>
        </div>
      </div>

      <div class="col-6 col-md-4 col-xl-3" v-for="group in bloodGroupKeys" :key="group.label">
        <div class="stat-card" :class="group.class">
          <i class="fas fa-tint stat-icon"></i>
          <div class="stat-value">{{ dashboardData.blood_groups[group.label] || 0 }}</div>
          <div class="stat-label">{{ group.label }} Donors</div>
        </div>
      </div>
    </div>

    <!-- ── Widgets Row ────────────────────────────────────── -->
    <div class="row g-3 mb-4">
      <!-- Eligible Donors -->
      <div class="col-md-4">
        <div class="stat-card bg-eligible">
          <i class="fas fa-heartbeat stat-icon"></i>
          <div class="stat-value">{{ dashboardData.eligible_donors || 0 }}</div>
          <div class="stat-label">Eligible Donors</div>
        </div>
      </div>
      <!-- Messages Sent Today -->
      <div class="col-md-4">
        <div class="stat-card bg-messages">
          <i class="fas fa-paper-plane stat-icon"></i>
          <div class="stat-value">{{ dashboardData.messages_today || 0 }}</div>
          <div class="stat-label">Messages Today</div>
        </div>
      </div>
      <!-- Upcoming Camp -->
      <div class="col-md-4">
        <div class="info-card card h-100">
          <div class="card-header">
            <i class="fas fa-campground"></i>
            <span>Upcoming Blood Camp</span>
          </div>
          <div class="card-body">
            <template v-if="nextCamp">
              <h6 class="mb-2 fw-bold">{{ nextCamp.title }}</h6>
              <p class="mb-1 text-secondary">
                <i class="fas fa-calendar-alt me-1"></i> {{ nextCamp.camp_date }}
              </p>
              <p class="mb-1 text-secondary" v-if="nextCamp.start_time && nextCamp.end_time">
                <i class="fas fa-clock me-1"></i> {{ nextCamp.start_time }} — {{ nextCamp.end_time }}
              </p>
              <p class="mb-0 text-secondary">
                <i class="fas fa-map-marker-alt me-1"></i> {{ nextCamp.location }}
              </p>
            </template>
            <template v-else>
              <div class="empty-state py-3">
                <i class="fas fa-calendar-times d-block mb-2" style="font-size:1.5rem;"></i>
                <p class="mb-0">No upcoming camps scheduled</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Charts Row ─────────────────────────────────────── -->
    <div class="row g-3 mb-4">
      <!-- Blood Group Distribution -->
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header">
            <i class="fas fa-chart-pie me-2 text-primary"></i> Blood Group Distribution
          </div>
          <div class="card-body">
            <div class="chart-container" style="position: relative; height: 300px;">
              <Doughnut v-if="chartData.datasets[0].data.length > 0" :data="chartData" :options="chartOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header">
            <i class="fas fa-history me-2 text-primary"></i> Recent Messages
          </div>
          <div class="card-body p-0">
            <div v-if="!dashboardData.recent_messages || dashboardData.recent_messages.length === 0" class="empty-state py-4">
              <i class="fas fa-inbox d-block mb-2"></i>
              <p class="mb-0">No messages sent yet</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-borderless mb-0">
                <tbody>
                  <tr v-for="(log, idx) in dashboardData.recent_messages" :key="idx">
                    <td class="ps-3">
                      <span class="badge" :class="log.message_type === 'WhatsApp' ? 'bg-success' : 'bg-primary'">
                        <i :class="log.message_type === 'WhatsApp' ? 'fab fa-whatsapp' : 'fas fa-sms'" class="me-1"></i>
                        {{ log.message_type }}
                      </span>
                    </td>
                    <td>
                      <span class="fw-medium">{{ log.donor_name || 'Unknown' }}</span>
                      <br><small class="text-muted">{{ log.mobile }}</small>
                    </td>
                    <td>
                      <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>
                        {{ log.sent_at }}
                      </small>
                    </td>
                    <td>
                      <span class="badge" :class="log.status === 'Sent' ? 'bg-success-subtle text-success' : (log.status === 'Failed' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning')">
                        {{ log.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/plugins/axios'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import Swal from 'sweetalert2'

ChartJS.register(ArcElement, Tooltip, Legend)

const dashboardData = ref({
  total_donors: 0,
  blood_groups: {},
  recent_camps: [],
  eligible_donors: 0,
  messages_today: 0,
  recent_messages: []
})

const bloodGroupKeys = [
  { label: 'A+', class: 'bg-a-pos', color: '#ef4444' },
  { label: 'A-', class: 'bg-a-neg', color: '#dc2626' },
  { label: 'B+', class: 'bg-b-pos', color: '#3b82f6' },
  { label: 'B-', class: 'bg-b-neg', color: '#2563eb' },
  { label: 'AB+', class: 'bg-ab-pos', color: '#a855f7' },
  { label: 'AB-', class: 'bg-ab-neg', color: '#9333ea' },
  { label: 'O+', class: 'bg-o-pos', color: '#22c55e' },
  { label: 'O-', class: 'bg-o-neg', color: '#16a34a' }
]

const nextCamp = computed(() => {
  return dashboardData.value.recent_camps && dashboardData.value.recent_camps.length > 0 
    ? dashboardData.value.recent_camps[0] 
    : null
})

const chartData = computed(() => {
  const data = bloodGroupKeys.map(bg => dashboardData.value.blood_groups[bg.label] || 0)
  const bgColors = bloodGroupKeys.map(bg => bg.color)

  return {
    labels: bloodGroupKeys.map(bg => bg.label),
    datasets: [
      {
        data: data,
        backgroundColor: bgColors,
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 16,
        font: {
          family: 'Inter',
          size: 12,
          weight: '500'
        }
      }
    }
  }
}

const fetchDashboardData = async () => {
  try {
    const response = await api.get('/reports/dashboard')
    if (response.data.success) {
      dashboardData.value = {
        ...dashboardData.value,
        ...response.data.data
      }
    } else {
      Swal.fire('Error', response.data.message || 'Failed to fetch dashboard data', 'error')
    }
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Unable to fetch dashboard data.', 'error')
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
</style>
