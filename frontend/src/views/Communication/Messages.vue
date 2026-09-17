<template>
  <div class="messages-page">
    <ul class="nav nav-pills mb-4" role="tablist">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'compose' }" @click="activeTab = 'compose'" type="button">
          <i class="fas fa-pen me-1"></i> Compose
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'" type="button">
          <i class="fas fa-clock-rotate-left me-1"></i> History
        </button>
      </li>
    </ul>

    <div class="tab-content">
      <div v-if="activeTab === 'compose'" class="tab-pane fade show active">
        <div class="row g-4">
          <div class="col-lg-7">
            <div class="card">
              <div class="card-body">
                <form @submit.prevent="sendMessage">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">Channel</label>
                      <div class="btn-group w-100" role="group">
                        <input type="radio" class="btn-check" v-model="form.channel" value="whatsapp" id="channelWhatsapp">
                        <label class="btn btn-outline-success" for="channelWhatsapp">
                          <i class="fab fa-whatsapp me-1"></i> WhatsApp
                        </label>
                        <input type="radio" class="btn-check" v-model="form.channel" value="sms" id="channelSms">
                        <label class="btn btn-outline-primary" for="channelSms">
                          <i class="fas fa-sms me-1"></i> SMS
                        </label>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Recipients</label>
                      <select class="form-select" v-model="form.recipient_type">
                        <option value="all">All active donors</option>
                        <option value="blood_group">By blood group</option>
                        <option value="selected">Selected donors</option>
                        <option value="staff">Organising committee (staff)</option>
                      </select>
                    </div>

                    <div class="col-md-6" v-if="form.recipient_type === 'blood_group'">
                      <label class="form-label">Blood Group</label>
                      <select class="form-select" v-model="form.blood_group">
                        <option value="">Select blood group</option>
                        <option v-for="bg in ['A+','A-','B+','B-','AB+','AB-','O+','O-']" :key="bg" :value="bg">{{ bg }}</option>
                      </select>
                    </div>

                    <div class="col-12" v-if="form.recipient_type === 'selected'">
                      <label class="form-label">Select Donors</label>
                      <select class="form-select" v-model="form.donor_ids" multiple size="8">
                        <option v-for="donor in donors" :key="donor.id" :value="donor.id">
                          {{ donor.donor_name }} - {{ donor.blood_group }} - {{ donor.mobile }}
                        </option>
                      </select>
                      <div class="form-text">Hold Ctrl/Cmd to select multiple donors.</div>
                    </div>

                    <div class="col-12" v-if="form.channel === 'whatsapp'">
                      <label class="form-label">WhatsApp Delivery Mode</label>
                      <div class="btn-group w-100" role="group">
                        <input type="radio" class="btn-check" v-model="form.send_mode" value="template" id="modeTemplate">
                        <label class="btn btn-outline-success" for="modeTemplate">
                          <i class="fas fa-certificate me-1"></i> Approved Template
                        </label>
                        <input type="radio" class="btn-check" v-model="form.send_mode" value="text" id="modeText">
                        <label class="btn btn-outline-secondary" for="modeText">
                          <i class="fas fa-comment-dots me-1"></i> Free Text (24h reply only)
                        </label>
                      </div>
                      <div class="form-text" v-if="form.send_mode === 'template'">
                        Required for donors who have not messaged you in the last 24 hours. The wording comes from the template Meta approved.
                      </div>
                      <div class="form-text text-warning" v-else>
                        <i class="fas fa-triangle-exclamation me-1"></i> Only reaches donors who messaged you within the last 24 hours. Meta rejects the rest.
                      </div>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Template <span class="text-danger" v-if="isTemplateRequired">*</span></label>
                      <select class="form-select" v-model="form.template_id" @change="onTemplateChange">
                        <option value="">Start from blank message</option>
                        <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">
                          {{ tpl.template_name }}
                        </option>
                      </select>
                      <div class="form-text" v-if="templateWaInfo" v-html="templateWaInfo"></div>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Upcoming Camp</label>
                      <select class="form-select" v-model="selectedCampIndex" @change="onCampChange">
                        <option value="-1">No camp placeholders</option>
                        <option v-for="(camp, index) in camps" :key="index" :value="index">
                          {{ camp.title }} - {{ camp.camp_date }}
                        </option>
                      </select>
                    </div>

                    <div class="col-12">
                      <label class="form-label">Message <span class="text-danger" v-if="!isTemplateRequired">*</span></label>
                      <textarea class="form-control" v-model="form.message" rows="8" :readonly="isTemplateRequired" :class="{'bg-light': isTemplateRequired}" placeholder="Use placeholders like {NAME}, {DATE}, {LOCATION}, {BLOOD_GROUP}."></textarea>
                      <div class="form-text" v-if="isTemplateRequired">Preview of the approved template. Edits here are not sent in template mode.</div>
                      <div class="form-text" v-else>Placeholders are replaced per donor when sending.</div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-end mt-4">
                    <button type="submit" class="btn btn-primary" :disabled="sending">
                      <i class="fas fa-paper-plane me-1"></i>
                      <span v-if="sending">Sending {{ progress.processed }} / {{ progress.total }}</span>
                      <span v-else>Send Message</span>
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
                  <i class="fas fa-eye me-2 text-primary"></i>Preview
                </h5>
                <div class="alert alert-light border mb-3" style="white-space: pre-wrap; min-height: 180px;">{{ messagePreview }}</div>
                <div class="small text-muted">
                  Example values: {NAME} becomes a donor name, {BLOOD_GROUP} becomes their blood group, and camp placeholders use the selected camp.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'history'" class="tab-pane fade show active">
        <div class="card">
          <div class="card-body">
            <div class="row g-2 mb-3">
              <div class="col-md-3">
                <select class="form-select form-select-sm" v-model="historyFilter.type" @change="fetchHistory">
                  <option value="">All Channels</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select form-select-sm" v-model="historyFilter.status" @change="fetchHistory">
                  <option value="">All Statuses</option>
                  <option value="Sent">Sent</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Donor</th>
                    <th>Channel</th>
                    <th>Mobile</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in historyLogs" :key="log.id">
                    <td>{{ log.sent_at }}</td>
                    <td>{{ log.donor_name }}</td>
                    <td>{{ log.message_type }}</td>
                    <td>{{ log.mobile }}</td>
                    <td><span class="text-truncate-2">{{ log.message }}</span></td>
                    <td><span class="badge" :class="statusBadgeClass(log.status)">{{ log.status }}</span></td>
                  </tr>
                  <tr v-if="!historyLogs.length">
                    <td colspan="6" class="text-center py-4 text-muted">No message history found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/plugins/axios'

const activeTab = ref('compose')

const templates = ref([])
const donors = ref([])
const camps = ref([])
const historyLogs = ref([])

const historyFilter = reactive({
  type: '',
  status: ''
})

const form = reactive({
  channel: 'whatsapp',
  recipient_type: 'all',
  blood_group: '',
  donor_ids: [],
  send_mode: 'template',
  template_id: '',
  message: '',
  date: '',
  location: ''
})

const selectedCampIndex = ref(-1)

const sending = ref(false)
const progress = reactive({ processed: 0, total: 0 })

const isTemplateRequired = computed(() => form.channel === 'whatsapp' && form.send_mode === 'template')
const selectedTemplate = computed(() => templates.value.find(t => t.id === form.template_id))

const templateWaInfo = computed(() => {
  if (!isTemplateRequired.value || !form.template_id) return ''
  const tpl = selectedTemplate.value
  if (!tpl) return ''
  if (!tpl.whatsapp_template_name) {
    return `<span class="text-danger"><i class="fas fa-circle-exclamation me-1"></i>No WhatsApp template name set — this cannot be sent. Add it on the Templates page.</span>`
  }
  return `<span class="text-success"><i class="fas fa-check me-1"></i>Meta template: <code>${tpl.whatsapp_template_name}</code>${tpl.whatsapp_variables ? ` · variables: <code>${tpl.whatsapp_variables}</code>` : ''}</span>`
})

const messagePreview = computed(() => {
  let text = form.message || 'Your message preview will appear here.'
  const sample = {
    NAME: 'Kamal Perera',
    BLOOD_GROUP: 'O+',
    DATE: form.date,
    LOCATION: form.location
  }
  Object.keys(sample).forEach(key => {
    text = text.replaceAll('{' + key + '}', sample[key] || `[${key}]`)
  })
  return text
})

onMounted(async () => {
  try {
    const [tplRes, donRes, campRes] = await Promise.all([
      api.get('/templates').catch(() => ({ data: { data: [] } })),
      api.get('/donors?status=Active').catch(() => ({ data: { data: [] } })),
      api.get('/camps?status=Upcoming').catch(() => ({ data: { data: [] } }))
    ])
    templates.value = tplRes.data.data || []
    donors.value = donRes.data.data || []
    camps.value = campRes.data.data || []
  } catch (err) {
    console.error('Failed to load initial data:', err)
  }
  fetchHistory()
})

async function fetchHistory() {
  try {
    const res = await api.get('/messages/log', { params: historyFilter })
    historyLogs.value = res.data.data || []
  } catch (err) {
    console.error('Failed to load history:', err)
  }
}

function onTemplateChange() {
  if (selectedTemplate.value) {
    form.message = selectedTemplate.value.template_body || ''
  }
}

function onCampChange() {
  if (selectedCampIndex.value >= 0 && camps.value[selectedCampIndex.value]) {
    const camp = camps.value[selectedCampIndex.value]
    form.date = camp.camp_date || ''
    form.location = camp.location || ''
  } else {
    form.date = ''
    form.location = ''
  }
}

function statusBadgeClass(status) {
  const s = (status || '').toLowerCase()
  if (s === 'sent') return 'bg-success'
  if (s === 'pending') return 'bg-warning text-dark'
  if (s === 'failed') return 'bg-danger'
  return 'bg-secondary'
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

async function sendMessage() {
  if (isTemplateRequired.value) {
    if (!form.template_id) {
      alert('Choose a template. WhatsApp needs an approved template for donors who have not messaged you.')
      return
    }
    if (!selectedTemplate.value?.whatsapp_template_name) {
      alert('That template has no WhatsApp template name. Add it on the Templates page first.')
      return
    }
  } else if (!form.message.trim()) {
    alert('Message is required.')
    return
  }

  const url = form.channel === 'sms' ? '/messages/send-sms' : '/messages/send-whatsapp'
  sending.value = true
  progress.processed = 0
  progress.total = 0

  try {
    const totals = await sendCampaign(url, form)
    alert(campaignSummary(totals, progress.total))
    fetchHistory()
  } catch (err) {
    alert(err.message)
    fetchHistory()
  } finally {
    sending.value = false
  }
}
</script>
