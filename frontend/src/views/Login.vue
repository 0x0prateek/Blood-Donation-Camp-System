<template>
  <div class="login-page d-flex min-vh-100">
    <!-- Left Side: Gamified Branding -->
    <div class="d-none d-lg-flex col-lg-6 bg-brand align-items-center justify-content-center position-relative overflow-hidden">
      <!-- Animated Background Grid -->
      <div class="grid-bg"></div>
      
      <!-- Floating Elements -->
      <div class="floating-icons">
        <div class="icon-flyer icon-1">❤️</div>
        <div class="icon-flyer icon-2">🩸</div>
        <div class="icon-flyer icon-3">⭐</div>
      </div>

      <div class="z-2 text-center text-white p-5">
        <h1 class="display-3 fw-black mb-3 text-shadow-sm">DotLife</h1>
        <p class="lead fw-medium opacity-75">Secure Admin Portal to manage the 1 Million Donor Campaign.</p>
      </div>
    </div>

    <!-- Right Side: Login Form -->
    <div class="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center bg-white position-relative">
      
      <!-- Back to Home Button -->
      <router-link to="/" class="back-btn btn btn-light rounded-pill px-4 py-2 position-absolute top-0 start-0 m-4 fw-bold shadow-sm d-flex align-items-center gap-2 transition-all">
        <i class="bi bi-arrow-left"></i> Back to Home
      </router-link>

      <div class="w-100 px-4" style="max-width: 450px;">
        <!-- Mobile Header (Only visible on small screens) -->
        <div class="d-lg-none text-center mb-5">
          <div class="d-inline-flex align-items-center justify-content-center bg-danger text-white rounded-circle mb-3 shadow-sm" style="width: 60px; height: 60px;">
            <i class="bi bi-droplet-fill fs-3"></i>
          </div>
          <h2 class="fw-bold text-dark">DotLife Admin</h2>
        </div>

        <div class="text-center mb-5 d-none d-lg-block">
          <h2 class="fw-bold text-dark mb-2">Welcome Back</h2>
          <p class="text-muted">Enter your credentials to access the dashboard.</p>
        </div>

        <form @submit.prevent="handleLogin" class="needs-validation fade-in-up">
          <div class="mb-4 form-floating">
            <input v-model="email" type="email" class="form-control bg-light border-0 custom-input" id="floatingEmail" placeholder="name@example.com" required />
            <label for="floatingEmail" class="text-muted">Email address</label>
          </div>
          
          <div class="mb-4 form-floating">
            <input v-model="password" type="password" class="form-control bg-light border-0 custom-input" id="floatingPassword" placeholder="Password" required />
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

        <div class="text-center mt-5 text-muted small fade-in-up" style="animation-delay: 0.2s;">
          Protected by DotLife Security Systems
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
    router.push(route.query.redirect || '/admin/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.bg-brand {
  background: linear-gradient(135deg, #4b6bfb 0%, #1e3a8a 100%);
}

.grid-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

.fw-black {
  font-weight: 900;
  letter-spacing: -2px;
}
.text-shadow-sm {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.custom-input {
  border-radius: 12px;
  transition: all 0.3s ease;
}
.custom-input:focus {
  box-shadow: 0 0 0 4px rgba(75, 107, 251, 0.15);
  background-color: #fff !important;
}

.btn-login {
  background-color: #4b6bfb;
  border: none;
  box-shadow: 0 8px 20px rgba(75, 107, 251, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(75, 107, 251, 0.4);
  background-color: #3b5bdb;
}

.back-btn {
  color: #495057;
  border: 1px solid #dee2e6;
}
.back-btn:hover {
  background: #f8f9fa;
  transform: translateX(-3px);
  color: #111;
  border-color: #adb5bd;
}

.transition-all {
  transition: all 0.3s ease;
}

/* Animations */
.fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Floating Icons for Brand Side */
.floating-icons {
  position: absolute;
  width: 100%; height: 100%; top: 0; left: 0;
  pointer-events: none; z-index: 1;
}
.icon-flyer {
  position: absolute; font-size: 3rem;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
  animation: float-icon 6s ease-in-out infinite;
}
.icon-1 { top: 20%; left: 20%; animation-delay: 0s; }
.icon-2 { top: 60%; right: 25%; animation-delay: 1.5s; font-size: 4rem; }
.icon-3 { top: 75%; left: 30%; animation-delay: 3s; font-size: 2.5rem; }

@keyframes float-icon {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
  100% { transform: translateY(0) rotate(0deg); }
}
</style>
