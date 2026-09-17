<template>
  <div>
    <h1 class="h3 mb-4">Reports</h1>

    <div class="card mb-4">
      <div class="card-body">
        <form @submit.prevent="loadReports" class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label">From Date</label>
            <input type="date" class="form-control" v-model="filters.start_date">
          </div>
          <div class="col-md-3">
            <label class="form-label">To Date</label>
            <input type="date" class="form-control" v-model="filters.end_date">
          </div>
          <div class="col-md-3">
            <label class="form-label">Blood Group</label>
            <select class="form-select" v-model="filters.blood_group">
              <option value="">All Blood Groups</option>
              <option v-for="group in bloodGroups" :key="group" :value="group">{{ group }}</option>
            </select>
          </div>
          <div class="col-md-3 d-flex gap-2">
            <button type="submit" class="btn btn-primary flex-fill">
              <i class="fas fa-filter me-1"></i> Apply
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="resetFilters">
              <i class="fas fa-rotate-left"></i>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="stat-card bg-total">
          <i class="fas fa-users stat-icon"></i>
          <div class="stat-value">{{ reportData.summary.total_donors }}</div>
          <div class="stat-label">Total Donors</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="stat-card bg-eligible">
          <i class="fas fa-heartbeat stat-icon"></i>
          <div class="stat-value">{{ reportData.summary.eligible_donors }}</div>
          <div class="stat-label">Eligible Donors</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="stat-card bg-messages">
          <i class="fas fa-paper-plane stat-icon"></i>
          <div class="stat-value">{{ reportData.summary.messages_sent }}</div>
          <div class="stat-label">Messages Sent</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="stat-card bg-b-pos">
          <i class="fas fa-campground stat-icon"></i>
          <div class="stat-value">{{ reportData.summary.upcoming_camps }}</div>
          <div class="stat-label">Upcoming Camps</div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="fas fa-chart-column me-2 text-primary"></i>Blood Group Distribution</span>
            <a class="btn btn-sm btn-outline-primary" :href="getExportUrl('blood_groups')" target="_blank">
              <i class="fas fa-download me-1"></i> Export
            </a>
          </div>
          <div class="card-body">
            <div class="chart-container" style="position: relative; height: 300px;">
              <Bar v-if="bloodChartData.datasets.length" :data="bloodChartData" :options="bloodChartOptions" />
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="fas fa-chart-line me-2 text-primary"></i>Messages Over Time</span>
            <a class="btn btn-sm btn-outline-primary" :href="getExportUrl('messages')" target="_blank">
              <i class="fas fa-download me-1"></i> Export
            </a>
          </div>
          <div class="card-body">
            <div class="chart-container" style="position: relative; height: 300px;">
              <Line v-if="trendChartData.datasets.length" :data="trendChartData" :options="trendChartOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-xl-6">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="fas fa-user-check me-2 text-success"></i>Eligible Donors</span>
            <a class="btn btn-sm btn-outline-primary" :href="getExportUrl('eligible')" target="_blank">
              <i class="fas fa-download me-1"></i> Export
            </a>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th class="ps-3">Name</th>
                    <th>Mobile</th>
                    <th>Blood</th>
                    <th>Last Donation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="reportData.eligible_donors.length === 0">
                    <td colspan="4" class="text-center text-muted py-4">No eligible donors found.</td>
                  </tr>
                  <tr v-for="(donor, idx) in reportData.eligible_donors" :key="idx">
                    <td class="ps-3">{{ donor.donor_name }}</td>
                    <td>{{ donor.mobile }}</td>
                    <td>
                      <span v-if="donor.blood_group" class="badge-blood" :data-blood="donor.blood_group">{{ donor.blood_group }}</span>
                      <span v-else class="text-secondary">&mdash;</span>
                    </td>
                    <td>{{ donor.last_donation_date || 'Never' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-6">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="fas fa-clock-rotate-left me-2 text-primary"></i>Recently Contacted</span>
            <a class="btn btn-sm btn-outline-primary" :href="getExportUrl('summary')" target="_blank">
              <i class="fas fa-download me-1"></i> Summary
            </a>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th class="ps-3">Date</th>
                    <th>Donor</th>
                    <th>Channel</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="reportData.recent_messages.length === 0">
                    <td colspan="4" class="text-center text-muted py-4">No message history found.</td>
                  </tr>
                  <tr v-for="(msg, idx) in reportData.recent_messages" :key="idx">
                    <td class="ps-3">{{ msg.sent_at }}</td>
                    <td>{{ msg.donor_name }}</td>
                    <td>{{ msg.message_type }}</td>
                    <td>
                      <span class="badge" :class="msg.status === 'Sent' ? 'bg-success-subtle text-success' : (msg.status === 'Failed' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning')">
                        {{ msg.status }}
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
import Swal from 'sweetalert2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const bloodColors = ['#ef4444', '#dc2626', '#3b82f6', '#2563eb', '#a855f7', '#9333ea', '#22c55e', '#16a34a']

const filters = ref({
  start_date: '',
  end_date: '',
  blood_group: ''
})

const reportData = ref({
  summary: {
    total_donors: 0,
    eligible_donors: 0,
    messages_sent: 0,
    upcoming_camps: 0
  },
  blood_groups: [],
  message_trend: [],
  eligible_donors: [],
  recent_messages: []
})

const loadReports = async () => {
  try {
    // If exact endpoint doesn't exist yet, we catch error gracefully
    // Usually we would use api.get('/reports/data', { params: filters.value })
    // Since original PHP used POST to `/ajax/report-data.php`, we might assume GET `/reports/data` for REST
    const response = await api.get('/reports/data', { params: filters.value })
    if (response.data && response.data.success) {
      reportData.value = {
        summary: response.data.data.summary || { total_donors: 0, eligible_donors: 0, messages_sent: 0, upcoming_camps: 0 },
        blood_groups: response.data.data.blood_groups || [],
        message_trend: response.data.data.message_trend || [],
        eligible_donors: response.data.data.eligible_donors || [],
        recent_messages: response.data.data.recent_messages || []
      }
    } else {
      console.warn(response.data.message || 'No data returned')
    }
  } catch (error) {
    console.error('Error fetching reports data:', error)
    // Silently ignore 404 to avoid sweetalert spam if backend not implemented
  }
}

const resetFilters = () => {
  filters.value = {
    start_date: '',
    end_date: '',
    blood_group: ''
  }
  loadReports()
}

const getExportUrl = (reportType) => {
  const query = new URLSearchParams({
    ...filters.value,
    report: reportType,
    format: 'xlsx'
  }).toString()
  return `/api/reports/export?${query}`
}

const bloodChartData = computed(() => {
  if (!reportData.value.blood_groups.length) return { datasets: [] }
  return {
    labels: reportData.value.blood_groups.map(i => i.blood_group),
    datasets: [{
      label: 'Active Donors',
      data: reportData.value.blood_groups.map(i => Number(i.total)),
      backgroundColor: bloodColors.slice(0, reportData.value.blood_groups.length),
      borderRadius: 8
    }]
  }
})

const bloodChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
}

const trendChartData = computed(() => {
  if (!reportData.value.message_trend.length) return { datasets: [] }
  return {
    labels: reportData.value.message_trend.map(i => i.report_date),
    datasets: [{
      label: 'Messages',
      data: reportData.value.message_trend.map(i => Number(i.total)),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      fill: true,
      tension: 0.35
    }]
  }
})

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
}

onMounted(() => {
  loadReports()
})
</script>

<style scoped>
</style>
