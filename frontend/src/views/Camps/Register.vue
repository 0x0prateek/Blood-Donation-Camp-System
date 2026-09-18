<template>
  <div>
    <!-- Camp Selector -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-7">
            <label class="form-label fw-semibold">
              <i class="fas fa-campground me-1 text-primary"></i> Select Camp
            </label>
            <select class="form-select form-select-lg" v-model="selectedCampId" @change="onCampChange">
              <option v-if="!camps.length" value="0">No camps created yet</option>
              <option v-for="camp in camps" :key="camp.id" :value="camp.id">
                {{ camp.title }} — {{ formatDate(camp.camp_date) }} ({{ camp.status }})
              </option>
            </select>
          </div>
          <div class="col-md-5">
            <div class="d-flex gap-2 justify-content-md-end">
              <router-link to="/admin/camps" class="btn btn-outline-secondary">
                <i class="fas fa-campground me-1"></i> Manage Camps
              </router-link>
              <div class="btn-group">
                <button class="btn btn-outline-success dropdown-toggle" data-bs-toggle="dropdown"
                        :disabled="!camps.length">
                  <i class="fas fa-file-export me-1"></i> Export
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="exportRegister('xlsx')">
                      <i class="fas fa-file-excel me-2 text-success"></i> Excel (.xlsx)
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="exportRegister('csv')">
                      <i class="fas fa-file-csv me-2 text-primary"></i> CSV
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!camps.length" class="card">
      <div class="card-body">
        <div class="empty-state py-5 text-center">
          <i class="fas fa-campground d-block mb-3" style="font-size:2.5rem;"></i>
          <h5>No blood camps yet</h5>
          <p class="text-secondary mb-3">Create a camp first, then you can start marking donors in.</p>
          <router-link to="/admin/camps" class="btn btn-primary">
            <i class="fas fa-plus me-1"></i> Create a Camp
          </router-link>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- Summary Cards -->
      <div class="row g-3 mb-3">
        <div class="col-6 col-lg-3">
          <div class="stat-card bg-total">
            <i class="fas fa-clipboard-list stat-icon"></i>
            <div class="stat-value">{{ summary.total }}</div>
            <div class="stat-label">Total on Register</div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="stat-card bg-eligible">
            <i class="fas fa-tint stat-icon"></i>
            <div class="stat-value">{{ summary.donated }}</div>
            <div class="stat-label">Donated</div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="stat-card bg-messages">
            <i class="fas fa-user-check stat-icon"></i>
            <div class="stat-value">{{ summary.registered }}</div>
            <div class="stat-label">Registered</div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="stat-card bg-a-neg">
            <i class="fas fa-user-times stat-icon"></i>
            <div class="stat-value">{{ summary.rejected }}</div>
            <div class="stat-label">Rejected / No Show</div>
          </div>
        </div>
      </div>

      <!-- Mark In -->
      <div class="card mb-3">
        <div class="card-header">
          <i class="fas fa-user-plus me-2 text-primary"></i> Mark In a Donor
        </div>
        <div class="card-body">
          <div class="row g-2 align-items-end">
            <div class="col-md-6">
              <label class="form-label fw-semibold">T.P. Number</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text"><i class="fas fa-phone"></i></span>
                <input type="text" class="form-control" v-model="tpInput" @keypress.enter="doLookup"
                       inputmode="numeric" placeholder="0771234567" autocomplete="off" autofocus>
                <button class="btn btn-primary" @click="doLookup" :disabled="lookupLoading">
                  <i class="fas fa-search me-1"></i> Look Up
                </button>
              </div>
              <div class="form-text">Type the number and press Enter.</div>
            </div>
            <div class="col-md-6">
              <div v-html="lookupStatusHtml"></div>
            </div>
          </div>

          <!-- Entry Form -->
          <div v-if="entryPanelVisible" id="entryPanel" class="mt-3">
            <div class="divider mb-3"></div>
            <form @submit.prevent="saveEntry">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="form.donor_name" required ref="nameInputRef">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Blood Group</label>
                  <select class="form-select" v-model="form.blood_group">
                    <option value="">Select</option>
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
                <div class="col-md-3">
                  <label class="form-label">Gender</label>
                  <select class="form-select" v-model="form.gender">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Address</label>
                  <input type="text" class="form-control" v-model="form.address">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Date of Birth</label>
                  <input type="date" class="form-control" v-model="form.date_of_birth">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="form.status">
                    <option value="Registered">Registered</option>
                    <option value="Donated">Donated</option>
                    <option value="Rejected">Rejected</option>
                    <option value="No Show">No Show</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label">Remarks</label>
                  <input type="text" class="form-control" v-model="form.remarks"
                         placeholder="Optional note (e.g. low haemoglobin)">
                </div>
              </div>
              <div class="d-flex gap-2 justify-content-end mt-3">
                <button type="button" class="btn btn-outline-secondary" @click="cancelEntry">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <i :class="['fas', form.id ? 'fa-save' : 'fa-check', 'me-1']"></i>
                  {{ form.id ? 'Update Entry' : 'Add to Register' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Register Table -->
      <div class="card">
        <div class="card-header d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <span><i class="fas fa-list-ol me-2 text-primary"></i> Register</span>
          <div class="d-flex gap-2">
            <select class="form-select form-select-sm" v-model="filterStatus" @change="fetchList" style="width:auto">
              <option value="">All statuses</option>
              <option value="Registered">Registered</option>
              <option value="Donated">Donated</option>
              <option value="Rejected">Rejected</option>
              <option value="No Show">No Show</option>
            </select>
            <select class="form-select form-select-sm" v-model="filterBloodGroup" @change="fetchList" style="width:auto">
              <option value="">All blood groups</option>
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
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover" style="width:100%">
              <thead>
                <tr>
                  <th style="width:60px">No</th>
                  <th>Name</th>
                  <th>T.P. No</th>
                  <th>Blood Group</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th style="width:100px">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingList"><td colspan="7" class="text-center">Loading...</td></tr>
                <tr v-else-if="!registerList.length"><td colspan="7" class="text-center">Nobody has been marked in at this camp yet.</td></tr>
                <tr v-for="item in registerList" :key="item.id">
                  <td>{{ item.serial_no || '—' }}</td>
                  <td>
                    <span class="fw-medium">{{ item.donor_name }}</span>
                    <br v-if="item.address">
                    <small v-if="item.address" class="text-muted">{{ item.address }}</small>
                  </td>
                  <td>{{ item.mobile }}</td>
                  <td>
                    <span v-if="item.blood_group" class="badge bg-danger-subtle text-danger fw-semibold">{{ item.blood_group }}</span>
                    <span v-else>—</span>
                  </td>
                  <td>
                    <span :class="['badge', statusClass(item.status)]">{{ item.status }}</span>
                  </td>
                  <td>{{ formatTime(item.registered_at) }}</td>
                  <td>
                    <div class="d-flex gap-1">
                      <button class="btn btn-icon btn-outline-primary" @click="editEntry(item)" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-icon btn-outline-danger" @click="deleteEntry(item.id)" title="Remove">
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/plugins/axios'
import Swal from 'sweetalert2'

const route = useRoute()
const camps = ref([])
const selectedCampId = ref(0)

const tpInput = ref('')
const lookupStatusHtml = ref('')
const lookupLoading = ref(false)
const entryPanelVisible = ref(false)
const saving = ref(false)
const loadingList = ref(false)
const nameInputRef = ref(null)

const filterStatus = ref('')
const filterBloodGroup = ref('')

const summary = reactive({
  total: 0,
  donated: 0,
  registered: 0,
  rejected: 0
})

const registerList = ref([])

const form = reactive({
  id: 0,
  camp_id: 0,
  mobile: '',
  donor_name: '',
  blood_group: '',
  gender: '',
  address: '',
  date_of_birth: '',
  status: 'Registered',
  remarks: ''
})

onMounted(async () => {
  await fetchCamps()
  if (camps.value.length > 0) {
    const queryCampId = parseInt(route.query.camp_id)
    if (queryCampId && camps.value.some(c => c.id === queryCampId)) {
      selectedCampId.value = queryCampId
    } else {
      selectedCampId.value = camps.value[0].id
    }
    fetchList()
  }
})

const fetchCamps = async () => {
  try {
    const res = await api.post('/camps/list', {
      draw: 1, start: 0, length: 1000, order: [{ column: 1, dir: 'desc' }]
    })
    camps.value = res.data.data
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch camps', 'error')
  }
}

const onCampChange = () => {
  entryPanelVisible.value = false
  lookupStatusHtml.value = ''
  fetchList()
}

const fetchList = async () => {
  if (!selectedCampId.value) return
  loadingList.value = true
  try {
    const res = await api.post('/registrations/list', {
      draw: 1,
      start: 0,
      length: 1000,
      camp_id: selectedCampId.value,
      status: filterStatus.value,
      blood_group: filterBloodGroup.value
    })
    
    registerList.value = res.data.data
    
    const s = res.data.summary || {}
    summary.total = res.data.recordsTotal || 0
    summary.registered = s.Registered || 0
    summary.donated = s.Donated || 0
    summary.rejected = (s.Rejected || 0) + (s['No Show'] || 0)
    
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch register', 'error')
  } finally {
    loadingList.value = false
  }
}

const doLookup = async () => {
  const mobile = tpInput.value.trim()
  if (!mobile) {
    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Enter a T.P. number first.', showConfirmButton: false, timer: 3000 })
    return
  }
  if (!selectedCampId.value) {
    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Select a camp first.', showConfirmButton: false, timer: 3000 })
    return
  }
  
  lookupLoading.value = true
  try {
    const res = await api.post('/registrations/lookup', {
      camp_id: selectedCampId.value,
      mobile: mobile
    })
    
    if (!res.data.success) {
      lookupStatusHtml.value = `<div class="alert alert-danger py-2 mb-0">${escapeHtml(res.data.message)}</div>`
      return
    }
    
    const d = res.data.data
    
    if (d.state === 'already_registered') {
      const r = d.registration
      lookupStatusHtml.value = `<div class="alert alert-warning py-2 mb-0"><i class="fas fa-exclamation-triangle me-1"></i> <strong>${escapeHtml(r.donor_name)}</strong> is already on this register (No. ${r.serial_no || '—'}, ${r.status}).</div>`
      entryPanelVisible.value = false
      tpInput.value = ''
      return
    }
    
    if (d.state === 'known_donor') {
      const donor = d.donor
      const donCount = d.donation_count ? ` · ${d.donation_count} previous donation(s)` : ''
      lookupStatusHtml.value = `<div class="alert alert-success py-2 mb-0"><i class="fas fa-user-check me-1"></i> Existing donor — <strong>${escapeHtml(donor.donor_name)}</strong>${donCount}</div>`
      fillForm({
        mobile: d.mobile,
        donor_name: donor.donor_name,
        address: donor.address || '',
        blood_group: donor.blood_group || '',
        gender: donor.gender || '',
        date_of_birth: donor.date_of_birth || ''
      })
      return
    }
    
    // New walk-in
    lookupStatusHtml.value = `<div class="alert alert-info py-2 mb-0"><i class="fas fa-user-plus me-1"></i> New donor — fill in the details below.</div>`
    fillForm({ mobile: d.mobile, donor_name: '', address: '', blood_group: '', gender: '', date_of_birth: '' })
    
  } catch (error) {
    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Lookup failed.', showConfirmButton: false, timer: 3000 })
  } finally {
    lookupLoading.value = false
  }
}

const fillForm = (data) => {
  Object.assign(form, {
    id: 0,
    camp_id: selectedCampId.value,
    mobile: data.mobile,
    donor_name: data.donor_name,
    address: data.address,
    blood_group: data.blood_group,
    gender: data.gender,
    date_of_birth: data.date_of_birth,
    status: 'Registered',
    remarks: ''
  })
  entryPanelVisible.value = true
  nextTick(() => {
    if (nameInputRef.value) nameInputRef.value.focus()
  })
}

const cancelEntry = () => {
  entryPanelVisible.value = false
  lookupStatusHtml.value = ''
  tpInput.value = ''
}

const saveEntry = async () => {
  saving.value = true
  try {
    const res = await api.post('/registrations/save', form)
    if (res.data.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 3000 })
      cancelEntry()
      fetchList()
    } else {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: res.data.message, showConfirmButton: false, timer: 3000 })
    }
  } catch (error) {
    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Could not save.', showConfirmButton: false, timer: 3000 })
  } finally {
    saving.value = false
  }
}

const editEntry = (item) => {
  Object.assign(form, {
    id: item.id,
    camp_id: item.camp_id,
    mobile: item.mobile,
    donor_name: item.donor_name,
    address: item.address || '',
    blood_group: item.blood_group || '',
    gender: item.gender || '',
    date_of_birth: item.date_of_birth || '',
    status: item.status,
    remarks: item.remarks || ''
  })
  
  lookupStatusHtml.value = `<div class="alert alert-primary py-2 mb-0"><i class="fas fa-edit me-1"></i> Editing register entry No. ${item.serial_no || '—'} — ${escapeHtml(item.donor_name)}</div>`
  entryPanelVisible.value = true
  
  nextTick(() => {
    document.getElementById('entryPanel').scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

const deleteEntry = async (id) => {
  const result = await Swal.fire({
    title: 'Remove from register?',
    text: 'The donor record itself will be kept.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove',
    confirmButtonColor: '#dc3545'
  })
  
  if (result.isConfirmed) {
    try {
      const res = await api.post('/registrations/delete', { id })
      if (res.data.success) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 3000 })
        fetchList()
      } else {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: res.data.message, showConfirmButton: false, timer: 3000 })
      }
    } catch (error) {
      Swal.fire('Error', 'Could not delete entry', 'error')
    }
  }
}

const exportRegister = (format) => {
  if (!selectedCampId.value) {
    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Select a camp first.', showConfirmButton: false, timer: 3000 })
    return
  }
  const params = new URLSearchParams({
    camp_id: selectedCampId.value,
    format: format,
    status: filterStatus.value
  })
  window.location.href = `/api/registrations/export?${params.toString()}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr.replace(' ', 'T'))
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const statusClass = (status) => {
  const map = {
    'Donated': 'bg-success-subtle text-success',
    'Registered': 'bg-primary-subtle text-primary',
    'Rejected': 'bg-danger-subtle text-danger',
    'No Show': 'bg-warning-subtle text-warning'
  }
  return map[status] || 'bg-secondary-subtle text-secondary'
}

const escapeHtml = (text) => {
  if (!text) return ''
  const div = document.createElement('div')
  div.innerText = text
  return div.innerHTML
}
</script>
