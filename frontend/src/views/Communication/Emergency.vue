<template>
  <div class="emergency-page">
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="sendEmergency">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Required Blood Group <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="form.blood_group" required @change="updateMessage">
                    <option value="">Select blood group</option>
                    <option v-for="(count, group) in bloodGroups" :key="group" :value="group">
                      {{ group }} - {{ count }} active donors
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Channel</label>
                  <select class="form-select" v-model="form.channel" @change="updateChannel">
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Hospital / Location <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="form.location" required placeholder="e.g., National Hospital, Colombo" @input="updateMessage">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Contact Number</label>
                  <input type="text" class="form-control" v-model="form.contact_number" placeholder="Optional emergency contact" @input="updateMessage">
                </div>

                <div class="col-12" v-if="isWhatsApp">
                  <label class="form-label">WhatsApp Template <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="form.template_id" required>
                    <option value="">Select an approved template</option>
                    <option v-for="tpl in emergencyTemplates" :key="tpl.id" :value="tpl.id">
                      {{ tpl.template_name }}
                    </option>
                  </select>
                  <div class="form-text mt-1" v-if="templateInfo" v-html="templateInfo"></div>
                  <div class="form-text" v-else>
                    WhatsApp will not deliver free text to donors who have not messaged you in the last 24 hours, so an emergency callout must use an approved template.
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label">Message <span class="text-danger">*</span></label>
                  <textarea class="form-control" v-model="form.message" rows="8" required></textarea>
                  <div class="form-text" v-if="isWhatsApp">Wording comes from the approved template. This box is a preview and is not sent.</div>
                </div>
              </div>

              <div class="d-flex align-items-center justify-content-between mt-4">
                <div class="alert alert-warning py-2 px-3 mb-0">
                  <i class="fas fa-users me-1"></i>
                  <span>{{ matchingDonorsCount }}</span> matching active donors
                </div>
                <button type="submit" class="btn btn-danger" :disabled="sending">
                  <i class="fas fa-triangle-exclamation me-1"></i>
                  <span v-if="sending">Sending {{ progress.processed }} / {{ progress.total }}</span>
                  <span v-else>Send Emergency Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">
              <i class="fas fa-eye me-2 text-danger"></i>Preview
            </h5>
            <div class="alert alert-light border" style="white-space: pre-wrap; min-height: 220px;">{{ form.message }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/plugins/axios'

const bloodGroups = ref({})
const emergencyTemplates = ref([])

const form = reactive({
  recipient_type: 'blood_group',
  blood_group: '',
  channel: 'whatsapp',
  location: '',
  contact_number: '',
  template_id: '',
  message: ''
})

const sending = ref(false)
const progress = reactive({ processed: 0, total: 0 })

const isWhatsApp = computed(() => form.channel === 'whatsapp')

const matchingDonorsCount = computed(() => {
  return bloodGroups.value[form.blood_group] || 0
})

const selectedTemplate = computed(() => {
  return emergencyTemplates.value.find(t => t.id === form.template_id)
})

const templateInfo = computed(() => {
  if (!isWhatsApp.value || !form.template_id) return ''
  const tpl = selectedTemplate.value
  if (!tpl) return ''
  if (!tpl.whatsapp_template_name) {
    return `<span class="text-danger"><i class="fas fa-circle-exclamation me-1"></i>This template has no WhatsApp template name — it cannot be sent. Set it on the Templates page.</span>`
  }
  return `<span class="text-success"><i class="fas fa-check me-1"></i>Meta template: <code>${tpl.whatsapp_template_name}</code>${tpl.whatsapp_variables ? ` · variables: <code>${tpl.whatsapp_variables}</code>` : ''}</span>`
})

onMounted(async () => {
  try {
    const [countsRes, tplRes] = await Promise.all([
      api.get('/donors/blood-group-counts').catch(() => ({ data: { data: {} } })),
      api.get('/templates?type=Emergency+Request').catch(() => ({ data: { data: [] } }))
    ])
    
    // Ensure we have 0 for empty ones
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    const dataCounts = countsRes.data.data || {}
    const countsMap = {}
    groups.forEach(g => {
      countsMap[g] = dataCounts[g] || 0
    })
    
    bloodGroups.value = countsMap
    emergencyTemplates.value = tplRes.data.data || []
  } catch (err) {
    console.error('Failed to load initial data:', err)
  }
  updateMessage()
})

function updateMessage() {
  const current = form.message
  if (!current || current.startsWith('Urgent Blood Request')) {
    const group = form.blood_group || '[BLOOD GROUP]'
    const loc = form.location || '[LOCATION]'
    const contact = form.contact_number
    let msg = `Urgent Blood Request\n\nBlood Group: ${group}\nLocation: ${loc}\n\nPlease contact us immediately if you can donate.`
    if (contact) {
      msg += `\nContact: ${contact}`
    }
    msg += '\n\nThank you.'
    form.message = msg
  }
}

function updateChannel() {
  if (!isWhatsApp.value) {
    form.template_id = ''
  }
}

function newCampaignId() {
  const bytes = new Uint8Array(16)
  window.crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Ported chunked campaign sending logic from app.js
 */
function sendCampaign(url, payload) {
  return new Promise((resolve, reject) => {
    const campaignId = newCampaignId()
    const totals = { sent: 0, pending: 0, failed: 0, skipped: 0 }
    
    function step(offset) {
      const currentPayload = { ...payload, campaign_id: campaignId, offset }
      api.post(url, currentPayload).then(res => {
        const data = res.data
        if (!data.success) {
          reject(new Error(data.message || 'Error occurred during sending.'))
          return
        }
        
        const d = data.data || {}
        totals.sent += d.sent || 0
        totals.pending += d.pending || 0
        totals.failed += d.failed || 0
        totals.skipped += d.skipped || 0
        
        progress.processed = d.processed || 0
        progress.total = d.total || 0
        
        if (d.done || d.next_offset == null) {
          resolve(totals)
          return
        }
        
        step(d.next_offset)
      }).catch(err => {
        reject(new Error(`Sending stopped at recipient ${offset}. Nothing already sent will be sent twice if you try again.`))
      })
    }
    
    step(0)
  })
}

function campaignSummary(totals, total) {
  const parts = [`${totals.sent} sent`]
  if (totals.failed) parts.push(`${totals.failed} failed`)
  if (totals.pending) parts.push(`${totals.pending} pending`)
  if (totals.skipped) parts.push(`${totals.skipped} already sent`)
  return parts.join(', ') + ' of ' + total + '.'
}

async function sendEmergency() {
  if (isWhatsApp.value) {
    if (!form.template_id) {
      alert('Choose a WhatsApp template. Meta rejects free text for donors who have not messaged you.')
      return
    }
    if (!selectedTemplate.value?.whatsapp_template_name) {
      alert('That template has no WhatsApp template name. Set it on the Templates page first.')
      return
    }
  }

  if (!confirm('Send Emergency Request? This will contact all matching active donors.')) {
    return
  }

  const url = isWhatsApp.value ? '/messages/send-whatsapp' : '/messages/send-sms'
  
  // Tell the sender which mode to use; SMS ignores it.
  const payload = { ...form, send_mode: isWhatsApp.value ? 'template' : 'text' }
  
  sending.value = true
  progress.processed = 0
  progress.total = 0

  try {
    const totals = await sendCampaign(url, payload)
    alert(campaignSummary(totals, progress.total))
  } catch (err) {
    alert(err.message)
  } finally {
    sending.value = false
  }
}
</script>
