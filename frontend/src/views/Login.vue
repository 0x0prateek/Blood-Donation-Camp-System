<template>
  <div class="login-page">
    <div class="container h-100">
      <div class="row h-100 align-items-center justify-content-center">
        <div class="col-12 col-md-8 col-lg-5">
          <div class="card shadow-sm border-0">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <div class="mb-3">
                  <i class="fas fa-tint text-danger fa-3x"></i>
                </div>
                <h4 class="fw-bold">Blood Donation Camp System</h4>
                <p class="text-muted">Sign in to your account</p>
              </div>

              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label class="form-label">Email address</label>
                  <input v-model="email" type="email" class="form-control" required />
                </div>
                <div class="mb-4">
                  <label class="form-label">Password</label>
                  <input v-model="password" type="password" class="form-control" required />
                </div>
                
                <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

                <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push(route.query.redirect || '/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  background-color: #f8f9fa;
}
</style>
