<template>
  <div class="landing-page">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-transparent fixed-top px-4 py-3">
      <a class="navbar-brand fw-bold fs-3 text-white" href="#">
        <i class="bi bi-droplet-fill text-danger me-2"></i>DotLife
      </a>
      <div class="ms-auto">
        <router-link to="/login" class="btn btn-outline-light rounded-pill px-4">Admin Login</router-link>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="hero-section d-flex align-items-center">
      <!-- Floating Cells Background -->
      <div class="cells-container">
        <div class="cell cell-1"></div>
        <div class="cell cell-2"></div>
        <div class="cell cell-3"></div>
        <div class="cell cell-4"></div>
        <div class="cell cell-5"></div>
        <div class="cell cell-6"></div>
        <div class="cell cell-7"></div>
      </div>

      <div class="container text-center text-white position-relative z-index-1">
        <h1 class="display-1 fw-bolder mb-4 hero-title">Give Blood. Give Life.</h1>
        <p class="lead mb-5 hero-subtitle">Join the DotLife community and become a lifesaver. Modern blood donation camp management, built for the future.</p>
        <router-link to="/login" class="btn btn-danger btn-lg rounded-pill px-5 py-3 shadow-lg fw-bold pulse-btn">
          Join the Cause <i class="bi bi-arrow-right ms-2"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow: hidden;
  position: relative;
  font-family: 'Poppins', sans-serif;
}

.hero-section {
  min-height: 100vh;
  position: relative;
}

.z-index-1 {
  z-index: 10;
}

.hero-title {
  text-shadow: 2px 4px 10px rgba(0,0,0,0.5);
  background: -webkit-linear-gradient(45deg, #ff4b4b, #ff8f8f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInDown 1s ease-out;
}

.hero-subtitle {
  font-weight: 300;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
  animation: fadeInUp 1s ease-out 0.3s both;
}

.pulse-btn {
  background: linear-gradient(45deg, #e63946, #ff4d4d);
  border: none;
  animation: fadeInUp 1s ease-out 0.6s both, pulse 2s infinite 2s;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.pulse-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 20px rgba(230, 57, 70, 0.4) !important;
}

/* Floating Cells Animation */
.cells-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.cell {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ff6b6b, #c0392b);
  box-shadow: inset -5px -5px 10px rgba(0,0,0,0.3), 0 10px 20px rgba(230, 57, 70, 0.2);
  opacity: 0.6;
  animation: float linear infinite;
}

/* Make them look like biconcave discs (RBCs) */
.cell::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(192, 57, 43, 0.8) 0%, transparent 70%);
  box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
}

.cell-1 { width: 80px; height: 80px; left: 10%; bottom: -100px; animation-duration: 15s; }
.cell-2 { width: 120px; height: 120px; left: 30%; bottom: -150px; animation-duration: 25s; animation-delay: 2s; }
.cell-3 { width: 60px; height: 60px; left: 50%; bottom: -80px; animation-duration: 12s; animation-delay: 5s; }
.cell-4 { width: 90px; height: 90px; left: 70%; bottom: -120px; animation-duration: 18s; animation-delay: 1s; }
.cell-5 { width: 150px; height: 150px; left: 85%; bottom: -200px; animation-duration: 30s; animation-delay: 4s; }
.cell-6 { width: 70px; height: 70px; left: 20%; bottom: -90px; animation-duration: 14s; animation-delay: 8s; }
.cell-7 { width: 110px; height: 110px; left: 60%; bottom: -130px; animation-duration: 22s; animation-delay: 6s; }

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  50% {
    transform: translateY(-50vh) rotate(180deg) scale(1.1);
  }
  100% {
    transform: translateY(-120vh) rotate(360deg) scale(1);
  }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(230, 57, 70, 0); }
  100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0); }
}
</style>
