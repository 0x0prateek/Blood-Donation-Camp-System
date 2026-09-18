<template>
  <div class="page-shell">
    <div class="page-header mb-4">
      <div>
        <p class="eyebrow">Donor access</p>
        <h3 class="mb-0">Available blood</h3>
      </div>
      <span class="badge-pill">Live donor pool</span>
    </div>

    <div v-if="loading" class="panel text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 mb-0 text-muted">Loading current blood availability...</p>
    </div>

    <div v-else class="row g-4">
      <div class="col-12">
        <div class="panel summary-panel">
          <div class="summary-label">Registered donors</div>
          <div class="summary-total">{{ totalRegistered }}</div>
          <div class="text-muted small">Active blood donor records in the system</div>
        </div>
      </div>

      <div v-for="group in bloodGroups" :key="group" class="col-6 col-md-3">
        <div class="panel stock-card" :class="{ 'low-stock': getCount(group) < 5 }">
          <div class="stock-group">{{ group }}</div>
          <div class="stock-count">{{ getCount(group) }}</div>
          <div class="stock-caption">{{ getCount(group) > 0 ? 'Available donors' : 'No donors on record' }}</div>
        </div>
      </div>
      <div class="col-12 text-center">
        <router-link to="/user/blood-request" class="btn btn-primary rounded-pill px-4">
          <i class="fas fa-hospital me-2"></i> Request a specific blood group
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '@/plugins/axios'

const loading = ref(true)
const stock = ref({})
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const totalRegistered = computed(() => Object.values(stock.value).reduce((sum, value) => sum + Number(value || 0), 0))

const getCount = (group) => Number(stock.value[group] || 0)

const fetchStock = async () => {
  try {
    const response = await api.get('/public/blood-stock')
    stock.value = response.data?.data?.blood_stock || {}
  } catch (error) {
    console.error('Unable to load blood stock', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchStock)
</script>

<style scoped>
.page-shell { padding: 4px 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.eyebrow { margin: 0 0 6px; color: #4f46e5; text-transform: uppercase; letter-spacing: .12em; font-size: .72rem; font-weight: 700; }
.badge-pill { background: #eef2ff; color: #3730a3; border-radius: 999px; padding: 8px 12px; font-weight: 700; }
.panel { background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(15, 23, 42, .06); border: 1px solid #edf2ff; }
.summary-panel { padding: 24px; }
.summary-label { color: #64748b; font-size: .8rem; text-transform: uppercase; letter-spacing: .08em; }
.summary-total { font-size: 2.3rem; font-weight: 800; margin: 8px 0; color: #111827; }
.stock-card { padding: 20px; min-height: 180px; display: flex; flex-direction: column; justify-content: center; }
.stock-card.low-stock { border-color: rgba(239, 68, 68, .28); background: linear-gradient(180deg, #fff7f7 0%, #fff 100%); }
.stock-group { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.stock-count { font-size: 2.3rem; font-weight: 900; color: #ef4444; margin: 10px 0 6px; }
.stock-caption { color: #64748b; font-size: .88rem; }
</style>
