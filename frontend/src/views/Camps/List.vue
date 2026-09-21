<template>
  <div>
    <!-- Action Bar -->
    <div class="action-bar">
      <div>
        <button class="btn btn-primary" id="btnAddCamp" @click="openModal(null)">
          <i class="fas fa-plus me-1"></i> Add Camp
        </button>
      </div>
      <ul class="nav nav-pills" role="tablist">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: currentFilter === 'upcoming' }" @click="setFilter('upcoming')">Upcoming</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: currentFilter === 'past' }" @click="setFilter('past')">Past</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: currentFilter === '' }" @click="setFilter('')">All</button>
        </li>
      </ul>
    </div>

    <!-- Camps Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover" id="campsTable" style="width:100%">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center">Loading...</td>
              </tr>
              <tr v-else-if="!camps.length">
                <td colspan="6" class="text-center">No camps found.</td>
              </tr>
              <tr v-for="camp in camps" :key="camp.id">
                <td>{{ camp.title }}</td>
                <td>{{ formatDate(camp.camp_date) }}</td>
                <td>{{ formatTimeRange(camp.start_time, camp.end_time) }}</td>
                <td>
                  <span class="text-truncate-2">{{ camp.location || '—' }}</span>
                </td>
                <td>
                  <span :class="['badge-status', camp.status.toLowerCase()]">{{ camp.status }}</span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <router-link :to="{ name: 'CampRegister', query: { camp_id: camp.id } }"
                                 class="btn btn-icon btn-outline-success" title="Open register">
                      <i class="fas fa-clipboard-list"></i>
                    </router-link>
                    <router-link :to="{ name: 'CampFinance', query: { camp_id: camp.id } }"
                                 class="btn btn-icon btn-outline-warning" title="Budget & donations">
                      <i class="fas fa-hand-holding-heart"></i>
                    </router-link>
                    <button class="btn btn-icon btn-outline-primary" @click="openModal(camp)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-icon btn-outline-danger" @click="deleteCamp(camp.id)" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Camp Modal -->
    <div class="modal fade" id="campModal" tabindex="-1" ref="campModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-campground me-2 text-primary"></i> 
              {{ form.id ? 'Edit Blood Camp' : 'Add Blood Camp' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveCamp">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Title <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="form.title" required 
                         placeholder="e.g., Community Blood Donation Camp">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Camp Date <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" v-model="form.camp_date" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Start Time</label>
                  <input type="time" class="form-control" v-model="form.start_time">
                </div>
                <div class="col-md-4">
                  <label class="form-label">End Time</label>
                  <input type="time" class="form-control" v-model="form.end_time">
                </div>
                <div class="col-12">
                  <label class="form-label">Location <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="form.location" required
                         placeholder="e.g., Town Hall, Kandy">
                </div>
                <div class="col-md-8">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" v-model="form.description" rows="3" 
                            placeholder="Additional details about the camp..."></textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="form.status">
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Planned Budget</label>
                  <div class="input-group">
                    <span class="input-group-text">Rs.</span>
                    <input type="number" class="form-control" v-model="form.budget_amount"
                           step="0.01" min="0" placeholder="Optional">
                  </div>
                  <div class="form-text">Track spending against this on Budget &amp; Donations.</div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <i class="fas fa-save me-1"></i> {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import api from '@/plugins/axios'
import Swal from 'sweetalert2'

const camps = ref([])
const loading = ref(false)
const currentFilter = ref('upcoming')
const saving = ref(false)
const campModalRef = ref(null)
let modalInstance = null

const form = reactive({
  id: 0,
  title: '',
  camp_date: '',
  start_time: '',
  end_time: '',
  location: '',
  description: '',
  status: 'Upcoming',
  budget_amount: ''
})

onMounted(() => {
  if (window.bootstrap && campModalRef.value) {
    modalInstance = new window.bootstrap.Modal(campModalRef.value)
  }
  fetchCamps()
})

const fetchCamps = async () => {
  loading.value = true
  try {
    const res = await api.post('/camps/list', {
      draw: 1,
      start: 0,
      length: 1000,
      filter: currentFilter.value,
      order: [{ column: 1, dir: 'asc' }]
    })
    camps.value = res.data.data
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch camps', 'error')
  } finally {
    loading.value = false
  }
}

const setFilter = (filter) => {
  currentFilter.value = filter
  fetchCamps()
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTimeRange = (start, end) => {
  const s = start ? new Date('2000-01-01T' + start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
  const e = end ? new Date('2000-01-01T' + end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
  return s && e ? `${s} — ${e}` : (s || '—')
}

const openModal = (camp) => {
  if (camp) {
    Object.assign(form, {
      id: camp.id,
      title: camp.title,
      camp_date: camp.camp_date,
      start_time: camp.start_time || '',
      end_time: camp.end_time || '',
      location: camp.location,
      description: camp.description || '',
      status: camp.status,
      budget_amount: camp.budget_amount ?? ''
    })
  } else {
    Object.assign(form, {
      id: 0,
      title: '',
      camp_date: '',
      start_time: '',
      end_time: '',
      location: '',
      description: '',
      status: 'Upcoming',
      budget_amount: ''
    })
  }
  if (modalInstance) modalInstance.show()
}

const closeModal = () => {
  if (modalInstance) modalInstance.hide()
}

const saveCamp = async () => {
  saving.value = true
  try {
    const res = await api.post('/camps/save', form)
    if (res.data.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 3000 })
      closeModal()
      fetchCamps()
    } else {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: res.data.message, showConfirmButton: false, timer: 3000 })
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to save camp', 'error')
  } finally {
    saving.value = false
  }
}

const deleteCamp = async (id) => {
  const result = await Swal.fire({
    title: 'Delete Camp?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    confirmButtonColor: '#dc3545'
  })
  
  if (result.isConfirmed) {
    try {
      const res = await api.post('/camps/delete', { id })
      if (res.data.success) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 3000 })
        fetchCamps()
      } else {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: res.data.message, showConfirmButton: false, timer: 3000 })
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to delete camp', 'error')
    }
  }
}
</script>
