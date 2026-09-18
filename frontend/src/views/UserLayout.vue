<template>
  <div class="user-layout">
    <aside class="user-sidebar">
      <div class="brand-box">
        <div class="brand-mark"><i class="fas fa-heartbeat"></i></div>
        <div>
          <div class="brand-name">DotLife</div>
          <small>Donor Portal</small>
        </div>
      </div>

      <nav class="nav-menu">
        <router-link to="/user/dashboard" class="nav-item" active-class="active">
          <i class="fas fa-chart-line"></i> Dashboard
        </router-link>
        <router-link to="/user/blood-request" class="nav-item" active-class="active">
          <i class="fas fa-droplet"></i> Blood Inquiry
        </router-link>
        <router-link to="/user/profile" class="nav-item" active-class="active">
          <i class="fas fa-user"></i> Profile
        </router-link>
        <button class="nav-item logout" @click="logout"><i class="fas fa-sign-out-alt"></i> Logout</button>
      </nav>
    </aside>

    <main class="user-main">
      <header class="user-topbar">
        <div>
          <div class="topbar-title">{{ $route.meta.title || 'Dashboard' }}</div>
        </div>
        <div class="user-badge">
          <span class="avatar"><i class="fas fa-user"></i></span>
          {{ authStore.user?.name || 'Donor' }}
        </div>
      </header>
      <div class="content-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.user-layout {
  display: flex; min-height: 100vh; background: #f5f7ff;
}
.user-sidebar {
  width: 260px; background: linear-gradient(180deg, #1d4ed8 0%, #0f172a 100%); color: white; padding: 24px 18px;
}
.brand-box { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
.brand-mark {
  width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,.12); display: grid; place-items: center; font-size: 20px;
}
.brand-name { font-weight: 800; font-size: 1.2rem; }
.nav-menu { display: flex; flex-direction: column; gap: 8px; }
.nav-item {
  display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,.8); text-decoration: none; padding: 12px 14px; border-radius: 12px; background: transparent; border: none; width: 100%; text-align: left;
}
.nav-item.active, .nav-item:hover { background: rgba(255,255,255,.12); color: white; }
.nav-item.logout { margin-top: 12px; }
.user-main { flex: 1; display: flex; flex-direction: column; }
.user-topbar {
  display: flex; justify-content: space-between; align-items: center; padding: 18px 26px; background: white; border-bottom: 1px solid #e5e7eb;
}
.topbar-title { font-size: 1.4rem; font-weight: 700; }
.user-badge { display: flex; align-items: center; gap: 8px; background: #eef2ff; padding: 8px 12px; border-radius: 999px; }
.avatar { width: 30px; height: 30px; display: inline-grid; place-items: center; border-radius: 50%; background: #dbeafe; }
.content-body { padding: 24px; }
</style>
