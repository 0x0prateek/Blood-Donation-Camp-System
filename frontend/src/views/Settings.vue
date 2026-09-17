<template>
  <div>
    <h1 class="h3 mb-4">Settings</h1>

    <form @submit.prevent="saveSettings" id="settingsForm">
      <div class="row g-4">
        <!-- General Settings -->
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header">
              <i class="fas fa-sliders me-2 text-primary"></i> General
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">App Name</label>
                <input type="text" class="form-control" v-model="settings.app_name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Organization Name</label>
                <input type="text" class="form-control" v-model="settings.organization_name">
              </div>
              <div class="mb-3">
                <label class="form-label">Default Country Code</label>
                <input type="text" class="form-control" v-model="settings.country_code" required placeholder="+94">
                <div class="form-text">Used to format local phone numbers for WhatsApp and SMS.</div>
              </div>
              <div class="mb-0">
                <label class="form-label">Currency Symbol</label>
                <input type="text" class="form-control" v-model="settings.currency_symbol" placeholder="Rs.">
                <div class="form-text">Shown on camp budgets, donations and expense reports.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- WhatsApp Cloud API -->
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header">
              <i class="fab fa-whatsapp me-2 text-success"></i> WhatsApp Cloud API
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">API Token</label>
                <input type="password" class="form-control" v-model="settings.whatsapp_api_token"
                       autocomplete="off"
                       :placeholder="hasSavedWhatsappToken ? 'Saved — leave blank to keep it' : 'Paste your permanent token (starts EAA…)'">
                <div class="form-text">
                  <template v-if="hasSavedWhatsappToken">
                    <i class="fas fa-check text-success me-1"></i>
                    A token is saved. Leave this blank to keep it, or paste a new one to replace it.
                  </template>
                  <template v-else>
                    No token saved yet.
                  </template>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Phone Number ID</label>
                <input type="text" class="form-control" v-model="settings.whatsapp_phone_number_id">
              </div>
              <div class="mb-3">
                <label class="form-label">WhatsApp Business Account ID</label>
                <input type="text" class="form-control" v-model="settings.whatsapp_business_account_id">
                <div class="form-text">Shown above your phone number on Meta's WhatsApp setup screen. Used to read your approved templates.</div>
              </div>
              <div class="mb-0">
                <label class="form-label">API Version</label>
                <input type="text" class="form-control" v-model="settings.whatsapp_api_version" placeholder="v23.0">
              </div>
            </div>
          </div>
        </div>

        <!-- SMS Gateway -->
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header">
              <i class="fas fa-sms me-2 text-primary"></i> SMS Gateway
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Gateway</label>
                <select class="form-select" v-model="settings.sms_gateway">
                  <option value="notify">Notify.lk</option>
                  <option value="twilio">Twilio</option>
                  <option value="dialog">Dialog</option>
                  <option value="mobitel">Mobitel</option>
                </select>
                <div class="form-text">Notify.lk and Twilio are wired for live API calls; Dialog and Mobitel are stored for provider setup.</div>
              </div>
              <div class="mb-3">
                <label class="form-label">User ID / Account SID</label>
                <input type="text" class="form-control" v-model="settings.sms_api_key">
                <div class="form-text">Notify.lk: your numeric API User ID. Twilio: the Account SID.</div>
              </div>
              <div class="mb-3">
                <label class="form-label">API Key / Auth Token</label>
                <input type="password" class="form-control" v-model="settings.sms_api_secret"
                       autocomplete="off"
                       :placeholder="hasSavedSmsSecret ? 'Saved — leave blank to keep it' : ''">
                <div v-if="hasSavedSmsSecret" class="form-text">
                  <i class="fas fa-check text-success me-1"></i>
                  A secret is saved. Leave blank to keep it.
                </div>
              </div>
              <div class="mb-0">
                <label class="form-label">Sender ID / From Number</label>
                <input type="text" class="form-control" v-model="settings.sms_sender_id" placeholder="NotifyDEMO">
                <div class="form-text">Notify.lk: an approved sender <em>name</em> such as NotifyDEMO - not a phone number. Twilio: the From number.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Test Message -->
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header">
              <i class="fas fa-vial me-2 text-primary"></i> Test Message
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Recipient Phone</label>
                <input type="text" class="form-control" v-model="testData.phone" placeholder="0771234567 or +94771234567">
              </div>
              <div class="mb-3">
                <label class="form-label">WhatsApp Test Template</label>
                <select class="form-select" v-model="testData.wa_template">
                  <option value="hello_world|en_US">hello_world (Meta test numbers only)</option>
                  <option v-for="t in waTemplates" :key="t.whatsapp_template_name" :value="`${t.whatsapp_template_name}|${t.whatsapp_language}`">
                    {{ t.whatsapp_template_name }} ({{ t.whatsapp_language }})
                  </option>
                </select>
                <div class="form-text">
                  Once you register your own number, <code>hello_world</code> stops working —
                  Meta only allows it from their public test numbers. Pick one of your own
                  approved templates instead.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">SMS Test Template</label>
                <select class="form-select" v-model="testData.sms_template_id" @change="onSmsTemplateChange">
                  <option value="">Custom message (type your own below)</option>
                  <option v-for="t in smsTemplates" :key="t.id" :value="t.id">
                    {{ t.template_name }}
                  </option>
                </select>
                <div class="form-text">
                  Fills the box below with that template, sample values already
                  substituted, so the test reads exactly like a real message.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Message <span class="text-muted small">(SMS only)</span></label>
                <textarea class="form-control" v-model="testData.message" rows="4"></textarea>
                <div class="form-text" :class="{'text-danger': testMessageOverLimit}">
                  {{ testMessageMeta }}
                </div>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-outline-success" @click="testWhatsApp" :disabled="isTesting">
                  <i class="fab fa-whatsapp me-1"></i> Test WhatsApp
                </button>
                <button type="button" class="btn btn-outline-primary" @click="testSMS" :disabled="isTesting">
                  <i class="fas fa-sms me-1"></i> Test SMS
                </button>
              </div>
              <div class="form-text mt-3">Save settings before sending a test message.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end mt-4">
        <button type="submit" class="btn btn-primary" :disabled="isSaving">
          <i class="fas fa-save me-1"></i> {{ isSaving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </form>

    <!-- ── Admin Account ──────────────────────────────────── -->
    <div class="divider my-4"></div>

    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <i class="fas fa-user-shield me-2 text-primary"></i> Admin Account
          </div>
          <div class="card-body">
            <div v-if="account.email === 'admin@admin.com'" class="alert alert-warning py-2 small">
              <i class="fas fa-triangle-exclamation me-1"></i>
              You are still signed in with the default account that ships with the
              installer. Anyone who has seen the setup files knows these credentials.
              Change the email and password below.
            </div>

            <form @submit.prevent="saveAccount" autocomplete="off">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Display Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="account.name" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Login Email <span class="text-danger">*</span></label>
                  <input type="email" class="form-control" v-model="account.email" required autocomplete="username">
                </div>

                <div class="col-12">
                  <div class="divider border-top my-3"></div>
                  <p class="text-secondary small mb-3">
                    Leave the two password boxes empty to keep your current password.
                  </p>
                </div>

                <div class="col-md-6">
                  <label class="form-label">New Password</label>
                  <input type="password" class="form-control" v-model="account.new_password" autocomplete="new-password">
                  <div class="form-text">At least 10 characters.</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Confirm New Password</label>
                  <input type="password" class="form-control" v-model="account.confirm_password" autocomplete="new-password">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Current Password <span class="text-danger">*</span></label>
                  <input type="password" class="form-control" v-model="account.current_password" required autocomplete="current-password">
                  <div class="form-text">Required to save any change on this card.</div>
                </div>
              </div>

              <div class="d-flex justify-content-end mt-4">
                <button type="submit" class="btn btn-primary" :disabled="isSavingAccount">
                  <i class="fas fa-user-check me-1"></i> {{ isSavingAccount ? 'Updating...' : 'Update Account' }}
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
import { ref, onMounted, computed, watch } from 'vue'
import api from '@/plugins/axios'
import Swal from 'sweetalert2'

const isSaving = ref(false)
const isSavingAccount = ref(false)
const isTesting = ref(false)

const hasSavedWhatsappToken = ref(false)
const hasSavedSmsSecret = ref(false)

const settings = ref({
  app_name: 'Blood Donation Camp System',
  organization_name: '',
  country_code: '+94',
  currency_symbol: 'Rs.',
  whatsapp_api_token: '',
  whatsapp_phone_number_id: '',
  whatsapp_business_account_id: '',
  whatsapp_api_version: 'v23.0',
  sms_gateway: 'notify',
  sms_api_key: '',
  sms_api_secret: '',
  sms_sender_id: ''
})

const testData = ref({
  phone: '',
  wa_template: 'hello_world|en_US',
  sms_template_id: '',
  message: 'This is a test message from the Blood Donor Management System.'
})

const account = ref({
  name: '',
  email: '',
  new_password: '',
  confirm_password: '',
  current_password: ''
})

const waTemplates = ref([])
const smsTemplates = ref([])

const loadSettings = async () => {
  try {
    const response = await api.get('/settings/load')
    if (response.data && response.data.success) {
      const s = response.data.data.settings
      settings.value = { ...settings.value, ...s }
      hasSavedWhatsappToken.value = !!s.whatsapp_api_token
      hasSavedSmsSecret.value = !!s.sms_api_secret
      settings.value.whatsapp_api_token = '' // clear so we don't save unchanged password fields
      settings.value.sms_api_secret = ''
    }
  } catch (error) {
    console.error('Failed to load settings', error)
  }
}

const loadAccount = async () => {
  try {
    const response = await api.get('/auth/me')
    if (response.data && response.data.success) {
      account.value.name = response.data.data.name
      account.value.email = response.data.data.email
    }
  } catch (error) {
    // optional endpoint
  }
}

const loadTemplates = async () => {
  try {
    const response = await api.post('/templates/list')
    if (response.data && response.data.success) {
      waTemplates.value = response.data.data.filter(t => t.whatsapp_template_name) || []
      smsTemplates.value = response.data.data || []
    }
  } catch (error) {
    // Ignore
  }
}

const saveSettings = async () => {
  isSaving.value = true
  try {
    // Only send tokens if they were modified
    const payload = { ...settings.value }
    if (!payload.whatsapp_api_token) delete payload.whatsapp_api_token
    if (!payload.sms_api_secret) delete payload.sms_api_secret

    const response = await api.post('/settings/save', payload)
    if (response.data && response.data.success) {
      Swal.fire('Success', response.data.message || 'Settings saved successfully', 'success')
      hasSavedWhatsappToken.value = hasSavedWhatsappToken.value || !!settings.value.whatsapp_api_token
      hasSavedSmsSecret.value = hasSavedSmsSecret.value || !!settings.value.sms_api_secret
      settings.value.whatsapp_api_token = ''
      settings.value.sms_api_secret = ''
    } else {
      Swal.fire('Error', response.data.message || 'Failed to save settings', 'error')
    }
  } catch (error) {
    Swal.fire('Error', 'An error occurred while saving settings', 'error')
  } finally {
    isSaving.value = false
  }
}

const saveAccount = async () => {
  if (account.value.new_password !== account.value.confirm_password) {
    Swal.fire('Error', 'New passwords do not match.', 'error')
    return
  }
  
  if (account.value.new_password && account.value.new_password.length < 10) {
    Swal.fire('Error', 'Password must be at least 10 characters.', 'error')
    return
  }

  isSavingAccount.value = true
  try {
    const response = await api.post('/auth/account-save', account.value)
    if (response.data.success) {
      Swal.fire('Success', response.data.message || 'Account updated', 'success')
      account.value.new_password = ''
      account.value.confirm_password = ''
      account.value.current_password = ''
    } else {
      Swal.fire('Error', response.data.message || 'Failed to update account', 'error')
    }
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'An error occurred while updating the account', 'error')
  } finally {
    isSavingAccount.value = false
  }
}

const onSmsTemplateChange = () => {
  const id = testData.value.sms_template_id
  if (!id) return
  const tmpl = smsTemplates.value.find(t => t.id === id)
  if (tmpl && tmpl.template_body) {
    let body = tmpl.template_body
    const sampleValues = {
      NAME: 'Test User',
      DATE: new Date().toLocaleDateString(),
      LOCATION: settings.value.organization_name || 'Test Location',
      BLOOD_GROUP: 'O+',
      MESSAGE: 'This is a test message.'
    }
    Object.keys(sampleValues).forEach(k => {
      body = body.split(`{${k}}`).join(sampleValues[k])
    })
    testData.value.message = body
  }
}

const testMessageMeta = ref('')
const testMessageOverLimit = ref(false)

watch(() => testData.value.message, (text) => {
  const unicode = [...text].some(ch => ch.codePointAt(0) > 127)
  const len = [...text].length
  const single = unicode ? 70 : 160
  const multi = unicode ? 67 : 153
  const segments = len === 0 ? 0 : (len <= single ? 1 : Math.ceil(len / multi))
  const maxChars = 1000 // assuming some arbitrary max
  testMessageOverLimit.value = len > maxChars

  testMessageMeta.value = `${len} characters · ${unicode ? 'Unicode (UCS-2), 70 per segment' : 'GSM-7, 160 per segment'} · ${segments} SMS segment${segments === 1 ? '' : 's'}`
}, { immediate: true })

const sendTest = async (action) => {
  if (!testData.value.phone) {
    Swal.fire('Warning', 'Enter a test phone number.', 'warning')
    return
  }
  if (action === 'test_sms' && !testData.value.message) {
    Swal.fire('Warning', 'Enter a test message.', 'warning')
    return
  }

  isTesting.value = true
  const [template, lang] = testData.value.wa_template.split('|')

  try {
    const response = await api.post('/settings/save', {
      action,
      test_phone: testData.value.phone,
      test_message: testData.value.message,
      test_template: template,
      test_language: lang || 'en'
    })
    if (response.data && response.data.success) {
      Swal.fire('Success', response.data.message || 'Test sent', 'success')
    } else {
      Swal.fire('Error', response.data.message || 'Test failed', 'error')
    }
  } catch (error) {
    Swal.fire('Error', 'An error occurred during testing', 'error')
  } finally {
    isTesting.value = false
  }
}

const testWhatsApp = () => sendTest('test_whatsapp')
const testSMS = () => sendTest('test_sms')

onMounted(() => {
  loadSettings()
  loadAccount()
  loadTemplates()
})
</script>

<style scoped>
</style>
