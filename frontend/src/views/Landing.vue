<template>
  <div class="campaign-page">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-transparent fixed-top px-4 py-3 z-3">
      <router-link to="/" class="navbar-brand fw-bold fs-3 text-white">
        <i class="bi bi-droplet-fill text-danger me-2"></i>DotLife
      </router-link>
      <div class="ms-auto">
        <router-link to="/login" class="btn btn-outline-light rounded-pill px-4">Admin Login</router-link>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section position-relative d-flex align-items-center justify-content-center text-center">
      <div class="bg-glow"></div>
      
      <!-- Floating cells -->
      <div class="cells-container">
        <div class="cell cell-1"></div>
        <div class="cell cell-2"></div>
        <div class="cell cell-3"></div>
      </div>

      <div class="container position-relative z-2">
        <div class="badge bg-danger rounded-pill px-3 py-2 mb-4 fs-6 fw-bold border border-light animate-fade-in-up">
          🌟 DOTLIFE GLOBAL INITIATIVE
        </div>
        <h1 class="display-1 fw-black text-white title-glow mb-2 animate-fade-in-up delay-1" style="font-weight: 900;">
          1 MILLION <br/> DONOR TARGET
        </h1>
        <p class="lead text-light opacity-75 mb-5 mx-auto animate-fade-in-up delay-2" style="max-width: 700px; font-size: 1.3rem;">
          Join the ultimate mission to save lives. Every drop counts as we march towards one million registered blood donors worldwide. Be a hero, make an impact.
        </p>
        
        <div class="d-flex justify-content-center gap-4 animate-fade-in-up delay-3">
          <button class="btn btn-danger btn-lg rounded-pill px-5 py-3 fw-bold fs-5 btn-glow" @click="registerDonation">
            Join the Mission <i class="bi bi-arrow-right-circle-fill ms-2"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Progress Section -->
    <section class="progress-section py-5 position-relative">
      <div class="container text-center text-white z-2 position-relative">
        <h2 class="display-4 fw-bold mb-5">Campaign Progress</h2>
        
        <div class="row justify-content-center mb-5">
          <div class="col-md-8">
            <div class="glass-card p-4 rounded-4 text-start">
              <div class="d-flex justify-content-between mb-2">
                <span class="fs-4 fw-bold">Target: 1,000,000 Donors</span>
                <span class="fs-4 fw-bold text-danger">45% Reached</span>
              </div>
              <div class="progress" style="height: 30px; background: rgba(255,255,255,0.1); border-radius: 15px;">
                <div class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" style="width: 45%; border-radius: 15px;" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <div class="mt-4 text-center">
                <h3 class="fw-bold mb-0">450,231</h3>
                <p class="text-white-50">Heroes have already joined</p>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 mt-4 mb-5 pb-5">
          <div class="col-md-4">
            <div class="glass-card h-100 p-4 rounded-4 text-center hover-lift">
              <i class="bi bi-heart-pulse text-danger display-4 mb-3 d-block"></i>
              <h3 class="fw-bold">Save 3 Lives</h3>
              <p class="text-white-50">A single donation can save up to three lives. Your contribution has a massive ripple effect.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="glass-card h-100 p-4 rounded-4 text-center hover-lift border-danger">
              <i class="bi bi-trophy text-warning display-4 mb-3 d-block"></i>
              <h3 class="fw-bold">Earn Badges</h3>
              <p class="text-white-50">Unlock exclusive community badges and digital certificates for hitting donation milestones.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="glass-card h-100 p-4 rounded-4 text-center hover-lift">
              <i class="bi bi-geo-alt text-info display-4 mb-3 d-block"></i>
              <h3 class="fw-bold">Global Reach</h3>
              <p class="text-white-50">Participate in blood camps near you or organize your own through the DotLife platform.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'

const registerDonation = () => {
  Swal.fire({
    title: 'Join the 1 Million Target!',
    text: 'Please contact your local blood camp to officially register as a donor.',
    icon: 'info',
    confirmButtonText: 'Understood',
    confirmButtonColor: '#dc3545',
    background: '#16213e',
    color: '#fff'
  })
}
</script>

<style scoped>
.campaign-page {
  background: #0f172a;
  min-height: 100vh;
  font-family: 'Inter', 'Poppins', sans-serif;
  overflow-x: hidden;
}

.hero-section {
  min-height: 100vh;
  padding-top: 80px;
}

.bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(220, 53, 69, 0.15) 0%, transparent 70%);
  z-index: 1;
  pointer-events: none;
}

.title-glow {
  text-shadow: 0 0 20px rgba(220, 53, 69, 0.6), 0 0 40px rgba(220, 53, 69, 0.4);
  letter-spacing: -2px;
  line-height: 1.1;
}

.btn-glow {
  box-shadow: 0 0 20px rgba(220, 53, 69, 0.5);
  transition: all 0.3s ease;
}
.btn-glow:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 0 30px rgba(220, 53, 69, 0.8);
}

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.border-danger {
  border-color: rgba(220, 53, 69, 0.5) !important;
  box-shadow: inset 0 0 20px rgba(220, 53, 69, 0.1);
}

.hover-lift {
  transition: transform 0.3s ease;
}
.hover-lift:hover {
  transform: translateY(-10px);
}

.cells-container {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  overflow: hidden; z-index: 0; pointer-events: none;
}
.cell {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ff4d4d, #c0392b);
  box-shadow: inset -5px -5px 10px rgba(0,0,0,0.3), 0 10px 20px rgba(220, 53, 69, 0.2);
  opacity: 0.4;
  animation: float 20s linear infinite;
}
.cell::after {
  content: ''; position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 60%; height: 60%; border-radius: 50%;
  background: radial-gradient(circle, rgba(192, 57, 43, 0.8) 0%, transparent 70%);
  box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
}
.cell-1 { width: 150px; height: 150px; left: 10%; bottom: 10%; animation-duration: 25s; }
.cell-2 { width: 80px; height: 80px; left: 80%; top: 20%; animation-duration: 18s; animation-delay: 2s; }
.cell-3 { width: 110px; height: 110px; left: 50%; bottom: 30%; animation-duration: 22s; animation-delay: 5s; }

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -50px) rotate(120deg); }
  66% { transform: translate(-20px, -100px) rotate(240deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
