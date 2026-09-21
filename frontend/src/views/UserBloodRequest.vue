<template>
  <div class="panel">
    <div class="panel-header">
      <div>
        <h5>Request blood / inquiry</h5>
        <p class="text-muted small mb-0">Choose the exact blood group and tell the organising team where help is needed.</p>
      </div>
    </div>
    <div class="panel-body">
      <form @submit.prevent="submitRequest" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Full name</label>
          <input v-model="form.requester_name" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label class="form-label">Contact mobile</label>
          <input v-model="form.contact_mobile" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Blood group needed</label>
          <select v-model="form.blood_group" class="form-select" required>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          <small class="text-muted">{{ selectedStock }} active donor record(s) currently match this group.</small>
        </div>
        <div class="col-md-4">
          <label class="form-label">Units needed</label>
          <input v-model.number="form.units_needed" type="number" min="1" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Urgency</label>
          <select v-model="form.urgency" class="form-select">
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Hospital / place</label>
          <input v-model="form.hospital_name" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Location</label>
          <input v-model="form.location" class="form-control" />
        </div>
        <div class="col-12">
          <label class="form-label">Details</label>
          <textarea v-model="form.details" class="form-control" rows="4" placeholder="Explain the requirement and any notes"></textarea>
        </div>
        <div class="col-12 d-flex justify-content-end">
          <button class="btn btn-primary" type="submit" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            {{ submitting ? 'Submitting...' : 'Submit Inquiry' }}
          </button>
        </div>
      </form>
      <div class="mt-4 pt-4 border-top">
        <h6>Your submitted requests</h6>
        <div v-if="requests.length === 0" class="text-muted small">No requests submitted yet.</div>
        <div v-for="request in requests" :key="request.id" class="request-row">
          <span><strong>{{ request.blood_group }}</strong> · {{ request.units_needed }} unit(s) · {{ request.urgency }}</span>
          <span class="badge" :class="statusClass(request.status)">{{ request.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Swal from 'sweetalert2'
import api from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const submitting = ref(false)
const stock = ref({})
const form = reactive({
  requester_name: '',
  contact_mobile: '',
  blood_group: 'O+',
  units_needed: 1,
  urgency: 'Moderate',
  hospital_name: '',
  location: '',
  details: ''
})
const requests = ref([])
const selectedStock = computed(() => Number(stock.value[form.blood_group] || 0))

const loadData = async () => {
  try {
    const [requestResponse, stockResponse] = await Promise.all([
      api.get('/blood-requests/list'),
      api.get('/public/blood-stock')
    ])
    requests.value = requestResponse.data?.data?.requests || []
    stock.value = stockResponse.data?.data?.blood_stock || {}
  } catch (error) {
    requests.value = []
  }
}

const fillProfile = () => {
  form.requester_name = authStore.user?.name || ''
  form.contact_mobile = authStore.user?.mobile || ''
}

const submitRequest = async () => {
  submitting.value = true
  try {
    const response = await api.post('/blood-requests/create', form)
    if (response.data.success) {
      Swal.fire('Success', 'Your blood inquiry has been submitted.', 'success')
      Object.assign(form, {
        requester_name: '',
        contact_mobile: '',
        blood_group: 'O+',
        units_needed: 1,
        urgency: 'Moderate',
        hospital_name: '',
        location: '',
        details: ''
      })
      await loadData()
    } else {
      Swal.fire('Error', response.data.message || 'Unable to submit request.', 'error')
    }
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Unable to submit request.', 'error')
  } finally {
    submitting.value = false
  }
}

const statusClass = (status) => ({
  Open: 'bg-warning-subtle text-warning',
  Matched: 'bg-success-subtle text-success',
  Closed: 'bg-secondary'
}[status] || 'bg-secondary')

onMounted(async () => {
  fillProfile()
  await loadData()
})
</script>

<style scoped>
.panel { background: white; border-radius: 18px; box-shadow: 0 10px 30px rgba(15,23,42,.05); }
.panel-header { padding: 18px 20px; border-bottom: 1px solid #e5e7eb; }
.panel-header h5 { margin: 0; }
.panel-body { padding: 20px; }
.request-row { display: flex; justify-content: space-between; gap: 1rem; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
.panel-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
</style>
