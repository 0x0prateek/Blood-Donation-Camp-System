<template>
  <div class="donor-add">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header bg-white d-flex align-items-center justify-content-between py-3">
            <h5 class="mb-0"><i class="fas fa-user-plus me-2 text-primary"></i> Add New Donor</h5>
            <router-link to="/donors" class="btn btn-outline-secondary btn-sm">
              <i class="fas fa-arrow-left me-1"></i> Back
            </router-link>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveDonor">
              <div class="row g-3">
                <!-- Name -->
                <div class="col-md-6">
                  <label class="form-label">Name <span class="text-danger">*</span></label>
                  <input v-model="form.donor_name" type="text" class="form-control" required>
                  <div class="invalid-feedback d-block" v-if="errors.donor_name">{{ errors.donor_name[0] }}</div>
                </div>

                <!-- Mobile -->
                <div class="col-md-6">
                  <label class="form-label">Mobile Number <span class="text-danger">*</span></label>
                  <input v-model="form.mobile" type="text" class="form-control" required placeholder="07XXXXXXXX">
                  <div class="invalid-feedback d-block" v-if="errors.mobile">{{ errors.mobile[0] }}</div>
                </div>

                <!-- WhatsApp -->
                <div class="col-md-6">
                  <label class="form-label">WhatsApp Number</label>
                  <input v-model="form.whatsapp" type="text" class="form-control" placeholder="07XXXXXXXX">
                  <div class="invalid-feedback d-block" v-if="errors.whatsapp">{{ errors.whatsapp[0] }}</div>
                </div>

                <!-- Email -->
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input v-model="form.email" type="email" class="form-control" placeholder="email@example.com">
                  <div class="invalid-feedback d-block" v-if="errors.email">{{ errors.email[0] }}</div>
                </div>

                <!-- Blood Group -->
                <div class="col-md-4">
                  <label class="form-label">Blood Group <span class="text-danger">*</span></label>
                  <select v-model="form.blood_group" class="form-select" required>
                    <option value="" disabled>Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <div class="invalid-feedback d-block" v-if="errors.blood_group">{{ errors.blood_group[0] }}</div>
                </div>

                <!-- Gender -->
                <div class="col-md-4">
                  <label class="form-label">Gender <span class="text-danger">*</span></label>
                  <select v-model="form.gender" class="form-select" required>
                    <option value="" disabled>Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div class="invalid-feedback d-block" v-if="errors.gender">{{ errors.gender[0] }}</div>
                </div>

                <!-- Date of Birth -->
                <div class="col-md-4">
                  <label class="form-label">Date of Birth</label>
                  <input v-model="form.date_of_birth" type="date" class="form-control">
                  <div class="invalid-feedback d-block" v-if="errors.date_of_birth">{{ errors.date_of_birth[0] }}</div>
                </div>

                <!-- Address -->
                <div class="col-12">
                  <label class="form-label">Address</label>
                  <textarea v-model="form.address" class="form-control" rows="2" placeholder="Full address"></textarea>
                  <div class="invalid-feedback d-block" v-if="errors.address">{{ errors.address[0] }}</div>
                </div>

                <!-- Last Donation Date -->
                <div class="col-md-6">
                  <label class="form-label">Last Donation Date</label>
                  <input v-model="form.last_donation_date" type="date" class="form-control">
                  <div class="invalid-feedback d-block" v-if="errors.last_donation_date">{{ errors.last_donation_date[0] }}</div>
                </div>

                <!-- Status -->
                <div class="col-md-6">
                  <label class="form-label">Status</label>
                  <select v-model="form.status" class="form-select">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div class="invalid-feedback d-block" v-if="errors.status">{{ errors.status[0] }}</div>
                </div>
              </div>

              <hr class="my-4">

              <div class="d-flex gap-2 justify-content-end">
                <router-link to="/donors" class="btn btn-outline-secondary">Cancel</router-link>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <i class="fas fa-spinner fa-spin me-1" v-if="saving"></i>
                  <i class="fas fa-save me-1" v-else></i> Save Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'
import Swal from 'sweetalert2'

const router = useRouter()

const form = ref({
  donor_name: '',
  mobile: '',
  whatsapp: '',
  email: '',
  blood_group: '',
  gender: '',
  date_of_birth: '',
  address: '',
  last_donation_date: '',
  status: 'Active'
})

const saving = ref(false)
const errors = ref({})

const saveDonor = async () => {
  saving.value = true
  errors.value = {}
  try {
    await api.post('/donors/save', form.value)
    Swal.fire('Success', 'Donor saved successfully.', 'success')
    router.push('/donors')
  } catch (error) {
    console.error('Error saving donor:', error)
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors || {}
      Swal.fire('Validation Error', 'Please check the form fields.', 'error')
    } else {
      Swal.fire('Error', 'Failed to save donor.', 'error')
    }
  } finally {
    saving.value = false
  }
}
</script>
