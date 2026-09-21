<template>
  <section>
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h3 mb-1">Blood Requests</h1>
        <p class="text-muted mb-0">Review blood-group inquiries submitted through the donor portal.</p>
      </div>
      <button class="btn btn-outline-primary" type="button" @click="loadRequests" :disabled="loading">
        <i class="fas fa-rotate me-1"></i> Refresh
      </button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body border-bottom">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Blood group</label>
            <select v-model="filters.blood_group" class="form-select" @change="loadRequests">
              <option value="">All groups</option>
              <option v-for="group in bloodGroups" :key="group" :value="group">{{ group }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Status</label>
            <select v-model="filters.status" class="form-select" @change="loadRequests">
              <option value="">All statuses</option>
              <option value="Open">Open</option>
              <option value="Matched">Matched</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger m-3 mb-0">{{ error }}</div>
      <div v-if="loading" class="p-4 text-center text-muted">Loading requests...</div>
      <div v-else-if="requests.length === 0" class="p-5 text-center text-muted">No blood requests found.</div>
      <div v-else class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>Requester</th>
              <th>Blood group</th>
              <th>Units</th>
              <th>Urgency</th>
              <th>Hospital / location</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in requests" :key="request.id">
              <td>
                <strong>{{ request.requester_name }}</strong>
                <small class="d-block text-muted">{{ request.contact_mobile }}</small>
                <small v-if="request.username" class="d-block text-muted">@{{ request.username }}</small>
              </td>
              <td><span class="badge bg-danger-subtle text-danger fs-6">{{ request.blood_group }}</span></td>
              <td>{{ request.units_needed }}</td>
              <td><span class="badge" :class="urgencyClass(request.urgency)">{{ request.urgency }}</span></td>
              <td>{{ request.hospital_name || '-' }}<small class="d-block text-muted">{{ request.location || '' }}</small></td>
              <td>
                <select class="form-select form-select-sm" :value="request.status" @change="updateStatus(request, $event.target.value)">
                  <option value="Open">Open</option>
                  <option value="Matched">Matched</option>
                  <option value="Closed">Closed</option>
                </select>
              </td>
              <td class="text-nowrap">{{ formatDate(request.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '@/plugins/axios'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const requests = ref([])
const loading = ref(false)
const error = ref('')
const filters = reactive({ blood_group: '', status: '' })

const loadRequests = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/blood-requests/admin/list', { params: filters })
    requests.value = response.data?.data?.requests || []
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'Unable to load blood requests.'
  } finally {
    loading.value = false
  }
}

const updateStatus = async (request, status) => {
  try {
    await api.patch(`/blood-requests/admin/${request.id}/status`, { status })
    request.status = status
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'Unable to update request status.'
  }
}

const urgencyClass = (urgency) => ({
  Low: 'bg-success-subtle text-success',
  Moderate: 'bg-warning-subtle text-warning',
  High: 'bg-orange-subtle text-orange',
  Critical: 'bg-danger text-white'
}[urgency] || 'bg-secondary')

const formatDate = (value) => value ? new Date(value).toLocaleString() : '-'

onMounted(loadRequests)
</script>

<style scoped>
.bg-orange-subtle { background: #ffedd5; }
.text-orange { color: #c2410c; }
</style>