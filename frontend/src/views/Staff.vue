<template>
  <div class="staff-list">
    <!-- Action Bar -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-0 d-inline-block me-3">Staff</h2>
        <button class="btn btn-primary" @click="openAddModal">
          <i class="fas fa-plus me-1"></i> Add Staff
        </button>
      </div>

      <ul class="nav nav-pills">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: filters.status === 'Active' }" href="#" @click.prevent="setStatus('Active')">Active</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: filters.status === 'Inactive' }" href="#" @click.prevent="setStatus('Inactive')">Inactive</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: filters.status === '' }" href="#" @click.prevent="setStatus('')">All</a>
        </li>
      </ul>
    </div>

    <!-- Staff Table -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="4" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div> Loading...
                </td>
              </tr>
              <tr v-else-if="staffList.length === 0">
                <td colspan="4" class="text-center py-4 text-muted">No staff found.</td>
              </tr>
              <tr v-for="staff in staffList" :key="staff.id" v-else>
                <td>{{ staff.name }}</td>
                <td>{{ staff.mobile }}</td>
                <td>
                  <span :class="['badge', staff.status === 'Active' ? 'bg-success' : 'bg-secondary']">
                    {{ staff.status }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="openEditModal(staff)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="deleteStaff(staff.id)" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination -->
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

    <!-- Staff Modal -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-users-gear me-2 text-primary"></i>
              {{ isEditing ? 'Edit Staff' : 'Add Staff' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveStaff">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Name <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control" required placeholder="e.g., K. Perera">
                  <div class="invalid-feedback d-block" v-if="errors.name">{{ errors.name[0] }}</div>
                </div>

                <div class="col-md-7">
                  <label class="form-label">Mobile <span class="text-danger">*</span></label>
                  <input v-model="form.mobile" type="text" class="form-control" required placeholder="07XXXXXXXX">
                  <div class="invalid-feedback d-block" v-if="errors.mobile">{{ errors.mobile[0] }}</div>
                  <div class="form-text">
                      Any format is accepted - 070 000 0000 and +94700000000 are stored the same way.
                  </div>
                </div>

                <div class="col-md-5">
                  <label class="form-label">Status</label>
                  <select v-model="form.status" class="form-select">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div class="form-text">Only Active staff receive messages.</div>
                  <div class="invalid-feedback d-block" v-if="errors.status">{{ errors.status[0] }}</div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <i class="fas fa-spinner fa-spin me-1" v-if="saving"></i>
                <i class="fas fa-save me-1" v-else></i> Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/plugins/axios'
import Swal from 'sweetalert2'

const staffList = ref([])
const loading = ref(false)

const filters = ref({
  status: 'Active'
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

const fetchStaff = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      status: filters.value.status
    }
    const response = await api.get('/staff', { params })
    
    const data = response.data.data ? response.data.data : (response.data.data || response.data)
    const meta = response.data.meta ? response.data.meta : response.data
    
    if (Array.isArray(data)) {
      staffList.value = data
    } else if (response.data.data && Array.isArray(response.data.data.data)) {
      staffList.value = response.data.data.data
    } else {
      staffList.value = []
    }

    pagination.value = {
      current_page: meta.current_page || 1,
      last_page: meta.last_page || 1,
      total: meta.total || 0,
      from: meta.from || 0,
      to: meta.to || 0
    }
  } catch (error) {
    console.error('Error fetching staff:', error)
    Swal.fire('Error', 'Failed to load staff list.', 'error')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > pagination.value.last_page) return
  fetchStaff(page)
}

const setStatus = (status) => {
  filters.value.status = status
  fetchStaff(1)
}

// Modal State
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const errors = ref({})

const form = ref({
  id: null,
  name: '',
  mobile: '',
  status: 'Active'
})

const openAddModal = () => {
  isEditing.value = false
  errors.value = {}
  form.value = {
    id: null,
    name: '',
    mobile: '',
    status: 'Active'
  }
  showModal.value = true
}

const openEditModal = (staff) => {
  isEditing.value = true
  errors.value = {}
  form.value = {
    id: staff.id,
    name: staff.name,
    mobile: staff.mobile,
    status: staff.status
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveStaff = async () => {
  saving.value = true
  errors.value = {}
  try {
    if (isEditing.value) {
      await api.put(`/staff/${form.value.id}`, form.value)
      Swal.fire('Success', 'Staff updated successfully.', 'success')
    } else {
      await api.post('/staff', form.value)
      Swal.fire('Success', 'Staff added successfully.', 'success')
    }
    closeModal()
    fetchStaff(pagination.value.current_page)
  } catch (error) {
    console.error('Error saving staff:', error)
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors || {}
      Swal.fire('Validation Error', 'Please check the form fields.', 'error')
    } else {
      Swal.fire('Error', 'Failed to save staff.', 'error')
    }
  } finally {
    saving.value = false
  }
}

const deleteStaff = async (id) => {
  const result = await Swal.fire({
    title: 'Delete Staff Member?',
    text: "Messages already sent to them stay in the log.",
    icon: 'error',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/staff/${id}`)
      Swal.fire('Deleted!', 'Staff member has been deleted.', 'success')
      fetchStaff(pagination.value.current_page)
    } catch (error) {
      console.error('Error deleting staff:', error)
      Swal.fire('Error', 'Failed to delete staff.', 'error')
    }
  }
}

onMounted(() => {
  fetchStaff()
})
</script>
