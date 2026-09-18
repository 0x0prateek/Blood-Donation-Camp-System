<template>
  <div class="panel">
    <div class="panel-header">
      <h5>Request blood / inquiry</h5>
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
          <button class="btn btn-primary" type="submit">Submit Inquiry</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import Swal from 'sweetalert2'
import api from '@/plugins/axios'

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

const submitRequest = async () => {
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
    } else {
      Swal.fire('Error', response.data.message || 'Unable to submit request.', 'error')
    }
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Unable to submit request.', 'error')
  }
}
</script>

<style scoped>
.panel { background: white; border-radius: 18px; box-shadow: 0 10px 30px rgba(15,23,42,.05); }
.panel-header { padding: 18px 20px; border-bottom: 1px solid #e5e7eb; }
.panel-header h5 { margin: 0; }
.panel-body { padding: 20px; }
</style>
