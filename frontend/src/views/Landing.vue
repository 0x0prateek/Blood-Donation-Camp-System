<template>
  <div class="campaign-page">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg bg-white px-4 py-3 fixed-top z-3 border-bottom border-light">
      <router-link to="/" class="navbar-brand fw-bold fs-4 text-dark d-flex align-items-center">
        <div class="logo-icon me-2"><i class="bi bi-droplet-fill text-danger"></i></div>
        DotLife
      </router-link>
      <div class="ms-auto d-flex align-items-center">
        <router-link to="/login" class="btn btn-outline-dark rounded-pill px-4">Admin Login</router-link>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section position-relative d-flex flex-column align-items-center text-center">
      <!-- Grid Background -->
      <div class="grid-bg"></div>
      
      <!-- Floating Icons -->
      <div class="floating-icons">
        <div class="icon-flyer icon-1">❤️</div>
        <div class="icon-flyer icon-2">🩸</div>
        <div class="icon-flyer icon-3">⭐</div>
        <div class="icon-flyer icon-4">⚡</div>
        <div class="icon-flyer icon-5">✚</div>
        <div class="icon-flyer icon-6">🩺</div>
      </div>

      <div class="container position-relative z-2 hero-content">
        <!-- Top Countdown Banner -->
        <div class="countdown-banner mb-5 mx-auto d-flex align-items-center justify-content-center gap-2">
          <i class="bi bi-megaphone-fill text-warning"></i>
          <span class="fw-medium text-dark" style="font-size: 0.9rem;">This Campaign Ends In : <span class="fw-bold">13d 4h 4m 18s</span></span>
        </div>

        <h2 class="h5 fw-bold text-dark mb-1">
          Global Blood Drive <span class="text-primary mx-2">·</span> <span class="text-primary">Save up to 3 lives per donation!</span>
        </h2>
        
        <h1 class="target-number mb-4">
          1,000,000
        </h1>
        
        <div class="d-flex justify-content-center mb-5">
          <button class="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 main-action-btn" @click="registerDonation">
            <span class="bg-white rounded px-2 py-1 text-primary shadow-sm" style="font-size: 0.8rem;">🩸</span> 
            Register & Claim Your Donor Badge
          </button>
        </div>

        <!-- Center Image Area (like the chest) -->
        <div class="center-stage mt-4 position-relative mx-auto">
          <!-- A big playful element to replace the chest -->
          <div class="main-display-box rounded-4 p-4 shadow-lg bg-white border mx-auto d-flex flex-column align-items-center justify-content-center position-relative">
            <div class="progress-display bg-dark text-white rounded p-3 w-100 mb-3 border border-4 border-secondary position-relative">
              <div class="small text-uppercase text-white-50 mb-1 fw-bold" style="letter-spacing: 1px;">Current Donors</div>
              <div class="fs-1 fw-black text-white font-monospace">450,231</div>
              <div class="status-indicator bg-success"></div>
            </div>
            
            <div class="d-flex justify-content-around w-100 mt-2 gap-3">
              <div class="reward-prop shadow-sm bg-light rounded p-2 fs-3 border">🏆</div>
              <div class="reward-prop shadow-sm bg-light rounded p-2 fs-3 border">🏥</div>
              <div class="reward-prop shadow-sm bg-light rounded p-2 fs-3 border">❤️</div>
            </div>
            
            <!-- Table Base -->
            <div class="table-base w-100 mt-4 rounded"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <section class="milestone-section py-5 bg-white text-center border-top">
      <div class="container py-5">
        <h2 class="display-6 fw-bold text-dark mb-3">Donation Milestones Rewards</h2>
        <p class="text-muted mb-5 max-w-700 mx-auto">Complete eligible donations to unlock digital badges and community rewards. The more you donate, the higher the tier - and the bigger the impact.</p>
        
        <div class="row g-4 max-w-900 mx-auto">
          <div class="col-md-4">
            <div class="p-4 border rounded-4 bg-light h-100">
              <div class="fs-1 mb-3">🥉</div>
              <h4 class="fw-bold">Bronze Donor</h4>
              <p class="text-muted small">1st Donation. Receive your starter digital badge.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-4 border rounded-4 bg-light h-100 position-relative shadow-sm" style="transform: scale(1.05); z-index: 2; border-color: #0d6efd !important;">
              <div class="fs-1 mb-3">🥇</div>
              <h4 class="fw-bold">Gold Lifesaver</h4>
              <p class="text-muted small">5 Donations. Exclusive community recognition.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-4 border rounded-4 bg-light h-100">
              <div class="fs-1 mb-3">💎</div>
              <h4 class="fw-bold">Diamond Hero</h4>
              <p class="text-muted small">10+ Donations. Hall of Fame status.</p>
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
    title: 'Join the Mission!',
    text: 'Please log in as an administrator to manage donors, or visit your nearest hospital to donate.',
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#0d6efd'
  })
}
</script>

<style scoped>
.campaign-page {
  background: #fdfdfd;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1a1a1a;
  overflow-x: hidden;
}

.hero-section {
  min-height: 100vh;
  padding-top: 120px;
  padding-bottom: 50px;
}

.grid-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 0;
  pointer-events: none;
}

.countdown-banner {
  background: rgba(255, 245, 235, 0.9);
  border: 1px solid #ffe4c4;
  border-radius: 50px;
  padding: 8px 24px;
  display: inline-flex;
  box-shadow: 0 4px 15px rgba(255, 165, 0, 0.1);
}

.target-number {
  font-size: 8rem;
  font-weight: 900;
  color: #111;
  line-height: 1;
  letter-spacing: -2px;
  text-shadow: 4px 4px 0 rgba(0,0,0,0.1);
  /* Optional: make it look slightly blocky */
  font-family: 'Impact', 'Arial Black', sans-serif;
  transform: scaleY(1.1);
}

.main-action-btn {
  background-color: #4b6bfb;
  border: none;
  box-shadow: 0 8px 20px rgba(75, 107, 251, 0.3), inset 0 -3px 0 rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.main-action-btn:hover {
  transform: translateY(-2px);
  background-color: #3b5bdb;
}

/* Center Box (Mimicking the chest setup) */
.main-display-box {
  width: 400px;
  background: #ff4d4f; /* Red body like the chest */
  border: 3px solid #cf1322 !important;
  border-radius: 20px !important;
  box-shadow: 0 20px 40px rgba(207, 19, 34, 0.2), inset 0 10px 0 rgba(255,255,255,0.2) !important;
  z-index: 2;
}

.progress-display {
  background-color: #1f1f1f;
  border: 4px solid #444 !important;
  box-shadow: inset 0 0 15px rgba(0,0,0,0.8);
}

.status-indicator {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 10px #198754;
  animation: blink 2s infinite;
}

.reward-prop {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white !important;
  border: 2px solid #eee !important;
}

.table-base {
  height: 30px;
  background: #e8d5c4;
  border: 2px solid #d4b89e;
  border-radius: 8px;
  position: absolute;
  bottom: -40px;
  width: 120%;
  left: -10%;
  z-index: -1;
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

/* Floating Icons */
.floating-icons {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0; left: 0;
  pointer-events: none;
  z-index: 1;
}

.icon-flyer {
  position: absolute;
  font-size: 2.5rem;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
  animation: float-icon 6s ease-in-out infinite;
}

.icon-1 { top: 30%; left: 15%; animation-delay: 0s; font-size: 3rem; }
.icon-2 { top: 20%; right: 20%; animation-delay: 1s; font-size: 2rem; }
.icon-3 { top: 45%; left: 25%; animation-delay: 2s; font-size: 2.5rem; }
.icon-4 { top: 35%; right: 28%; animation-delay: 0.5s; font-size: 3rem; }
.icon-5 { top: 60%; left: 18%; animation-delay: 1.5s; font-size: 2rem; color: #dc3545;}
.icon-6 { top: 65%; right: 15%; animation-delay: 2.5s; font-size: 2.5rem; }

@keyframes float-icon {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.max-w-700 { max-width: 700px; }
.max-w-900 { max-width: 900px; }

@media (max-width: 768px) {
  .target-number { font-size: 4rem; }
  .main-display-box { width: 90%; }
}
</style>
