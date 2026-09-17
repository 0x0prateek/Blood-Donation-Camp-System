<template>
  <div class="templates-page">
    <div class="action-bar mb-3 d-flex gap-2">
      <button class="btn btn-primary" @click="openModal()">
        <i class="fas fa-plus me-1"></i> Add Template
      </button>
      <button class="btn btn-outline-success" @click="checkMeta" :disabled="syncing">
        <i class="fab fa-whatsapp me-1"></i> {{ syncing ? 'Checking...' : 'Check Approved Templates at Meta' }}
      </button>
    </div>

    <!-- Meta Templates Box -->
    <div class="card mb-3" v-if="showMetaBox">
      <div class="card-header d-flex align-items-center justify-content-between">
        <span><i class="fab fa-whatsapp me-2 text-success"></i> Approved at Meta</span>
        <button class="btn-close" @click="showMetaBox = false"></button>
      </div>
      <div class="card-body">
        <div v-if="metaTemplates.length === 0" class="alert alert-warning mb-0">
          <i class="fas fa-triangle-exclamation me-1"></i>
          No templates exist at Meta yet. Until you create and get one approved in WhatsApp Manager, WhatsApp will reject every message to donors who have not written to you in the last 24 hours.
        </div>
        <div v-else>
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Variables</th>
                  <th>Body</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(t, i) in metaTemplates" :key="i">
                  <td><code>{{ t.name }}</code></td>
                  <td>{{ t.language }}</td>
                  <td>
                    <span class="badge" :class="(t.status || '').toUpperCase() === 'APPROVED' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'">
                      {{ t.status }}
                    </span>
                  </td>
                  <td>{{ t.variable_count || 0 }}</td>
                  <td><small>{{ (t.body || '').substring(0, 90) }}</small></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="form-text mt-2">
            Only <strong>APPROVED</strong> templates can be sent. The name and language here must match exactly what you enter on a template below. Note <code>hello_world</code> only works from Meta's public test numbers, not your own.
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Body</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tpl in templates" :key="tpl.id">
                <td>{{ tpl.template_name }}</td>
                <td>{{ tpl.template_type }}</td>
                <td><span class="text-truncate-2" style="max-width: 300px; display: inline-block;">{{ tpl.template_body }}</span></td>
                <td>{{ tpl.created_at }}</td>
                <td>
                  <div class="d-flex gap-1">
                    <button class="btn btn-icon btn-outline-primary" @click="openModal(tpl)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-icon btn-outline-danger" @click="deleteTemplate(tpl.id)" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="templates.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">No templates found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Template Modal (using Vue conditionally, could also use Bootstrap Vue if installed, but let's stick to standard classes and conditional rendering for the backdrop, or native dialog) -->
    <div class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);" v-if="isModalOpen">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-file-alt me-2 text-primary"></i> {{ form.id ? 'Edit Template' : 'Add Template' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveTemplate">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-7">
                  <label class="form-label">Template Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="form.template_name" required>
                </div>
                <div class="col-md-5">
                  <label class="form-label">Type</label>
                  <select class="form-select" v-model="form.template_type">
                    <option value="General">General</option>
                    <option value="Camp Notification">Camp Notification</option>
                    <option value="Emergency Request">Emergency Request</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label">Template Body <span class="text-danger">*</span></label>
                  <textarea class="form-control" v-model="form.template_body" rows="8" required></textarea>
                  <div class="form-text">Supported placeholders: {NAME}, {DATE}, {LOCATION}, {BLOOD_GROUP}, {MESSAGE}</div>
                </div>

                <div class="col-12">
                  <div class="alert alert-info py-2 small mb-3 mt-3">
                    <i class="fab fa-whatsapp me-1"></i>
                    <strong>WhatsApp delivery.</strong> To message donors who have not written to you in the last 24 hours, WhatsApp requires a template approved in <em>WhatsApp Manager &rarr; Message Templates</em>. Enter its details below so this template can be sent. Leave blank to use this template for SMS only.
                  </div>
                </div>

                <div class="col-md-5">
                  <label class="form-label">WhatsApp Template Name</label>
                  <input type="text" class="form-control" v-model="form.whatsapp_template_name" placeholder="blood_camp_notification">
                  <div class="form-text">Exactly as approved by Meta (lowercase, underscores).</div>
                </div>

                <div class="col-md-3">
                  <label class="form-label">Language Code</label>
                  <input type="text" class="form-control" v-model="form.whatsapp_language" placeholder="en">
                  <div class="form-text">e.g. en, en_US, si</div>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Variable Order</label>
                  <input type="text" class="form-control" v-model="form.whatsapp_variables" placeholder="NAME,DATE,LOCATION">
                  <div class="form-text">Feeds Meta's {{1}}, {{2}}, {{3}} in order.</div>
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
import { ref, reactive, onMounted } from 'vue'
import api from '@/plugins/axios'

const templates = ref([])

const showMetaBox = ref(false)
const metaTemplates = ref([])
const syncing = ref(false)

const isModalOpen = ref(false)
const saving = ref(false)

const form = reactive({
  id: 0,
  template_name: '',
  template_type: 'General',
  template_body: '',
  whatsapp_template_name: '',
  whatsapp_language: 'en',
  whatsapp_variables: ''
})

onMounted(() => {
  fetchTemplates()
})

async function fetchTemplates() {
  try {
    const res = await api.post('/templates/list')
    templates.value = res.data.data || []
  } catch (err) {
    console.error('Failed to load templates:', err)
  }
}

async function checkMeta() {
  syncing.value = true
  try {
    const res = await api.post('/templates/sync')
    if (res.data.success) {
      metaTemplates.value = res.data.data?.templates || []
      showMetaBox.value = true
      alert(res.data.message || 'Synced successfully')
    } else {
      alert(res.data.message || 'Sync failed')
    }
  } catch (err) {
    alert('Could not reach Meta. Check your token in Settings.')
  } finally {
    syncing.value = false
  }
}

function openModal(tpl = null) {
  if (tpl) {
    form.id = tpl.id
    form.template_name = tpl.template_name
    form.template_type = tpl.template_type
    form.template_body = tpl.template_body
    form.whatsapp_template_name = tpl.whatsapp_template_name || ''
    form.whatsapp_language = tpl.whatsapp_language || 'en'
    form.whatsapp_variables = tpl.whatsapp_variables || ''
  } else {
    form.id = 0
    form.template_name = ''
    form.template_type = 'General'
    form.template_body = ''
    form.whatsapp_template_name = ''
    form.whatsapp_language = 'en'
    form.whatsapp_variables = ''
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function saveTemplate() {
  saving.value = true
  try {
    const res = await api.post('/templates/save', form)
    if (res.data.success) {
      alert(res.data.message || 'Template saved successfully')
      closeModal()
      fetchTemplates()
    } else {
      alert(res.data.message || 'Failed to save template')
    }
  } catch (err) {
    alert('Error saving template.')
  } finally {
    saving.value = false
  }
}

async function deleteTemplate(id) {
  if (confirm('Delete Template? This template will be removed.')) {
    try {
      const res = await api.post('/templates/delete', { id })
      if (res.data.success) {
        alert(res.data.message || 'Template deleted')
        fetchTemplates()
      } else {
        alert(res.data.message || 'Failed to delete template')
      }
    } catch (err) {
      alert('Error deleting template')
    }
  }
}
</script>
