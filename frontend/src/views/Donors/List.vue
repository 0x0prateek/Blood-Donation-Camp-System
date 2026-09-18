<template>
  <div class="donors-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Donors</h2>
      <div class="d-flex gap-2">
        <router-link to="/admin/donors/add" class="btn btn-primary">
          <i class="fas fa-plus me-1"></i> Add Donor
        </router-link>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-white py-3">
        <div class="row g-2">
          <div class="col-md-4">
            <input v-model="filters.search" type="text" class="form-control" placeholder="Search by name, mobile, etc..." @keyup.enter="fetchDonors">
          </div>
          <div class="col-md-3">
            <select v-model="filters.blood_group" class="form-select" @change="fetchDonors">
              <option value="">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="__none__">Not recorded</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filters.status" class="form-select" @change="fetchDonors">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div class="col-md-2 d-flex gap-2">
             <button class="btn btn-outline-secondary w-100" @click="fetchDonors">Search</button>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Blood Group</th>
                <th>Gender</th>
                <th>Last Donation</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div> Loading...
                </td>
              </tr>
              <tr v-else-if="donors.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">No donors found.</td>
              </tr>
              <tr v-for="donor in donors" :key="donor.id" v-else>
                <td>{{ donor.donor_name }}</td>
                <td>{{ donor.mobile }}</td>
                <td>
                  <span v-if="donor.blood_group && donor.blood_group !== '__none__'" class="badge bg-danger">{{ donor.blood_group }}</span>
                  <span v-else class="text-secondary">—</span>
                </td>
                <td>{{ donor.gender || '—' }}</td>
                <td>{{ formatDate(donor.last_donation_date) }}</td>
                <td>
                  <span :class="['badge', donor.status === 'Active' ? 'bg-success' : 'bg-secondary']">
                    {{ donor.status || 'Active' }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <router-link :to="`/admin/donors/${donor.id}/edit`" class="btn btn-outline-primary" title="Edit">
                      <i class="fas fa-edit"></i>
                    </router-link>
                    <button class="btn btn-outline-warning" @click="toggleStatus(donor)" :title="donor.status === 'Active' ? 'Deactivate' : 'Activate'">
                      <i :class="donor.status === 'Active' ? 'fas fa-ban' : 'fas fa-check'"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="deleteDonor(donor.id)" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center bg-white" v-if="pagination.last_page > 1">
        <div class="text-muted small">
          Showing {{ pagination.from || 0 }} to {{ pagination.to || 0 }} of {{ pagination.total || 0 }} results
        </div>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page - 1)">Prev</a>
          </li>
          <li class="page-item disabled" v-if="pagination.current_page > 3">
             <span class="page-link">...</span>
          </li>
          <li v-for="page in pageNumbers" :key="page" class="page-item" :class="{ active: page === pagination.current_page }">
             <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item disabled" v-if="pagination.current_page < pagination.last_page - 2">
             <span class="page-link">...</span>
          </li>
          <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
            <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page + 1)">Next</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/plugins/axios'
import Swal from 'sweetalert2'

const donors = ref([])
const loading = ref(false)
const PER_PAGE = 25

const filters = ref({
  search: '',
  blood_group: '',
  status: ''
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0
})

const pageNumbers = computed(() => {
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  const pages = []
  for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
    pages.push(i)
  }
  return pages
})

const fetchDonors = async (page = 1) => {
  loading.value = true
  try {
    const start = (page - 1) * PER_PAGE
    const response = await api.post('/donors/list', {
      draw: 1,
      start,
      length: PER_PAGE,
      search: { value: filters.value.search },
      blood_group: filters.value.blood_group,
      status: filters.value.status,
      order: [{ column: 0, dir: 'asc' }]
    })

    donors.value = response.data.data || []

    const total = response.data.recordsFiltered || 0
    const lastPage = Math.max(1, Math.ceil(total / PER_PAGE))
    pagination.value = {
      current_page: page,
      last_page: lastPage,
      total,
      from: total === 0 ? 0 : start + 1,
      to: Math.min(start + donors.value.length, total)
    }
  } catch (error) {
    console.error('Error fetching donors:', error)
    Swal.fire('Error', 'Failed to load donors list.', 'error')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > pagination.value.last_page) return
  fetchDonors(page)
}

const toggleStatus = async (donor) => {
  const newStatus = donor.status === 'Active' ? 'Inactive' : 'Active'
  const actionText = newStatus === 'Inactive' ? 'Deactivate' : 'Activate'
  
  const result = await Swal.fire({
    title: `${actionText} Donor?`,
    text: `This donor will be marked as ${newStatus}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: `Yes, ${actionText}`
  })

  if (result.isConfirmed) {
    try {
      await api.post('/donors/status', { id: donor.id, status: newStatus })
      Swal.fire('Updated!', `Donor has been ${newStatus.toLowerCase()}.`, 'success')
      fetchDonors(pagination.value.current_page)
    } catch (error) {
      console.error('Error updating status:', error)
      Swal.fire('Error', 'Failed to update donor status.', 'error')
    }
  }
}

const deleteDonor = async (id) => {
  const result = await Swal.fire({
    title: 'Delete Donor?',
    text: "This action cannot be undone.",
    icon: 'error',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete'
  })

  if (result.isConfirmed) {
    try {
      await api.post('/donors/delete', { id })
      Swal.fire('Deleted!', 'Donor has been deleted.', 'success')
      fetchDonors(pagination.value.current_page)
    } catch (error) {
      console.error('Error deleting donor:', error)
      Swal.fire('Error', 'Failed to delete donor.', 'error')
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString || dateString === '0000-00-00') return '—'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(() => {
  fetchDonors()
})
</script>

<style scoped>
/* Optional custom styling */
</style>
