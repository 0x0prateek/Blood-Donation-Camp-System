<template>
  <div class="login-page d-flex min-vh-100">
    <div class="d-none d-lg-flex col-lg-6 bg-brand align-items-center justify-content-center position-relative overflow-hidden">
      <div class="grid-bg"></div>
      <div class="floating-icons">
        <div class="icon-flyer icon-1">❤️</div>
        <div class="icon-flyer icon-2">🩸</div>
        <div class="icon-flyer icon-3">⭐</div>
      </div>
      <div class="z-2 text-center text-white p-5">
        <h1 class="display-3 fw-black mb-3 text-shadow-sm">DotLife</h1>
        <p class="lead fw-medium opacity-75">Secure portal for donors and administrators.</p>
      </div>
    </div>

    <div class="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center bg-white position-relative">
      <router-link to="/" class="back-btn btn btn-light rounded-pill px-4 py-2 position-absolute top-0 start-0 m-4 fw-bold shadow-sm d-flex align-items-center gap-2 transition-all">
        <i class="bi bi-arrow-left"></i> Back to Home
      </router-link>

      <div class="w-100 px-4" style="max-width: 500px;">
        <div class="d-lg-none text-center mb-5">
          <div class="d-inline-flex align-items-center justify-content-center bg-danger text-white rounded-circle mb-3 shadow-sm" style="width: 60px; height: 60px;">
            <i class="bi bi-droplet-fill fs-3"></i>
          </div>
          <h2 class="fw-bold text-dark">DotLife Access</h2>
        </div>

        <div class="text-center mb-4 d-none d-lg-block">
          <h2 class="fw-bold text-dark mb-2">{{ role === 'admin' ? 'Organiser Login' : (isSignup ? 'Donor Registration' : 'Donor Login') }}</h2>
          <p class="text-muted">{{ role === 'admin' ? 'Manage donors, camps and reports.' : 'Access your donor portal and blood inquiries.' }}</p>
        </div>

        <div v-if="!isDedicatedRoute" class="role-switch mb-4">
          <button type="button" class="role-pill" :class="{ active: role === 'admin' }" @click="role = 'admin'">Admin</button>
          <button type="button" class="role-pill" :class="{ active: role === 'user' }" @click="role = 'user'">Normal User</button>
        </div>

        <div v-if="!isSignup">
          <form @submit.prevent="handleLogin" class="needs-validation fade-in-up">
            <div class="mb-4 form-floating">
              <input v-model="email" type="text" class="form-control bg-light border-0 custom-input" id="floatingEmail" :placeholder="role === 'admin' ? 'name@example.com' : 'email or username'" autocomplete="username" required />
              <label for="floatingEmail" class="text-muted">{{ role === 'admin' ? 'Email address' : 'Email or username' }}</label>
            </div>
            <div class="mb-4 form-floating">
              <input v-model="password" type="password" class="form-control bg-light border-0 custom-input" id="floatingPassword" placeholder="Password" autocomplete="current-password" required />
              <label for="floatingPassword" class="text-muted">Password</label>
            </div>
            <div v-if="error" class="alert alert-danger py-2 rounded-3 border-0 shadow-sm animate-shake">
              <i class="bi bi-exclamation-circle-fill me-2"></i> {{ error }}
            </div>
            <button type="submit" class="btn btn-primary w-100 py-3 mt-2 rounded-4 fw-bold fs-5 btn-login transition-all" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <span v-else>Sign In <i class="bi bi-arrow-right-short ms-1 fs-4"></i></span>
            </button>
          </form>
          <div class="text-center mt-4">
            <button v-if="role === 'user'" class="btn btn-link text-decoration-none" @click="router.push('/donor/register')">Create a donor account</button>
            <router-link v-if="role === 'admin' && !isDedicatedRoute" to="/donor/login" class="btn btn-link text-decoration-none">Donor login</router-link>
            <router-link v-if="role === 'user' && isDedicatedRoute" to="/donor/register" class="btn btn-link text-decoration-none">New donor registration</router-link>
          </div>
        </div>

        <div v-else class="fade-in-up">
          <form @submit.prevent="handleSignup" class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Full name</label>
              <input v-model="form.name" class="form-control custom-input" autocomplete="name" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Username</label>
              <input v-model="form.username" class="form-control custom-input" autocomplete="username" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-control custom-input" autocomplete="email" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Mobile</label>
              <input v-model="form.mobile" class="form-control custom-input" autocomplete="tel" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Blood group</label>
              <select v-model="form.blood_group" class="form-select custom-input" required>
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
            <div class="col-md-6">
              <label class="form-label">Password</label>
              <input v-model="form.password" type="password" class="form-control custom-input" autocomplete="new-password" required />
            </div>
            <div class="col-12">
              <label class="form-label">Confirm password</label>
              <input v-model="form.confirm_password" type="password" class="form-control custom-input" autocomplete="new-password" required />
            </div>
            <div v-if="error" class="col-12 alert alert-danger py-2 rounded-3 border-0 shadow-sm animate-shake">
              <i class="bi bi-exclamation-circle-fill me-2"></i> {{ error }}
            </div>
            <div class="col-12 d-flex gap-2 justify-content-end">
              <button type="button" class="btn btn-outline-secondary" @click="router.push('/donor/login')">Back to login</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">Create Account</button>
            </div>
          </form>
        </div>

        <div class="text-center mt-5 text-muted small fade-in-up" style="animation-delay: 0.2s;">
          Protected by DotLife Security Systems
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isDedicatedRoute = computed(() => ['/admin/login', '/donor/login', '/donor/register'].includes(route.path))
const role = ref(route.path === '/donor/login' || route.path === '/donor/register' ? 'user' : 'admin')
const isSignup = ref(route.path === '/donor/register')

watch(() => route.path, (path) => {
  role.value = path === '/donor/login' || path === '/donor/register' ? 'user' : 'admin'
  isSignup.value = path === '/donor/register'
  error.value = ''
})

const form = reactive({
  name: '',
  username: '',
  email: '',
  mobile: '',
  blood_group: 'O+',
  password: '',
  confirm_password: ''
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login({ role: role.value, email: email.value, password: password.value })
    const redirect = role.value === 'admin' ? '/admin/dashboard' : '/user/dashboard'
    router.push(route.query.redirect || redirect)
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

const handleSignup = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await authStore.signup({ ...form })
    if (response.success) {
      isSignup.value = false
      email.value = form.email
      password.value = form.password
      role.value = 'user'
      await authStore.login({ role: 'user', email: form.email, password: form.password })
      router.push('/user/dashboard')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to create your account.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
.bg-brand { background: linear-gradient(135deg, #4b6bfb 0%, #1e3a8a 100%); }
.grid-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 40px 40px; }
.fw-black { font-weight: 900; letter-spacing: -2px; }
.text-shadow-sm { text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
.custom-input { border-radius: 12px; transition: all 0.3s ease; }
.custom-input:focus { box-shadow: 0 0 0 4px rgba(75, 107, 251, 0.15); background-color: #fff !important; }
.btn-login { background-color: #4b6bfb; border: none; box-shadow: 0 8px 20px rgba(75, 107, 251, 0.3); display: flex; align-items: center; justify-content: center; }
.btn-login:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(75, 107, 251, 0.4); background-color: #3b5bdb; }
.back-btn { color: #495057; border: 1px solid #dee2e6; }
.back-btn:hover { background: #f8f9fa; transform: translateX(-3px); color: #111; border-color: #adb5bd; }
.transition-all { transition: all 0.3s ease; }
.role-switch { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.role-pill { border: 1px solid #dbe2f1; border-radius: 999px; background: #f8faff; padding: 12px; font-weight: 600; }
.role-pill.active { background: linear-gradient(135deg, #4b6bfb, #1d4ed8); color: white; border-color: transparent; }
.fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
.floating-icons { position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; z-index: 1; }
.icon-flyer { position: absolute; font-size: 3rem; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); animation: float-icon 6s ease-in-out infinite; }
.icon-1 { top: 20%; left: 20%; animation-delay: 0s; }
.icon-2 { top: 60%; right: 25%; animation-delay: 1.5s; font-size: 4rem; }
.icon-3 { top: 75%; left: 30%; animation-delay: 3s; font-size: 2.5rem; }
@keyframes float-icon { 0% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } 100% { transform: translateY(0) rotate(0deg); } }
</style>
