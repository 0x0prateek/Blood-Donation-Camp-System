<template>
  <div class="app-layout">
    <!-- ═══════════════ SIDEBAR ═══════════════ -->
    <aside class="sidebar" id="sidebar" :class="{ 'show': isSidebarOpen }">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="fas fa-tint"></i>
          <span class="sidebar-brand">{{ settingsStore.appName }}</span>
        </div>
        <button class="sidebar-close d-lg-none" @click="toggleSidebar">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-title">Main</span>
          <router-link to="/dashboard" class="nav-link" active-class="active">
            <i class="fas fa-chart-pie"></i>
            <span>Dashboard</span>
          </router-link>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">Management</span>
          <router-link to="/donors" class="nav-link" active-class="active" :class="{ 'active': $route.path.startsWith('/donors') }">
            <i class="fas fa-users"></i>
            <span>Donors</span>
          </router-link>
          <router-link to="/staff" class="nav-link" active-class="active">
            <i class="fas fa-users-gear"></i>
            <span>Staff</span>
          </router-link>
          <router-link to="/camps" class="nav-link" active-class="active" :class="{ 'active': $route.path === '/camps' }">
            <i class="fas fa-campground"></i>
            <span>Blood Camps</span>
          </router-link>
          <router-link to="/camp-register" class="nav-link" active-class="active">
            <i class="fas fa-clipboard-list"></i>
            <span>Camp Register</span>
          </router-link>
          <router-link to="/camp-finance" class="nav-link" active-class="active">
            <i class="fas fa-hand-holding-heart"></i>
            <span>Budget &amp; Donations</span>
          </router-link>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">Communication</span>
          <router-link to="/messages" class="nav-link" active-class="active">
            <i class="fas fa-paper-plane"></i>
            <span>Messages</span>
          </router-link>
          <router-link to="/templates" class="nav-link" active-class="active">
            <i class="fas fa-file-alt"></i>
            <span>Templates</span>
          </router-link>
          <router-link to="/emergency" class="nav-link" active-class="active">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Emergency</span>
          </router-link>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">Analytics</span>
          <router-link to="/reports" class="nav-link" active-class="active">
            <i class="fas fa-chart-bar"></i>
            <span>Reports</span>
          </router-link>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">System</span>
          <router-link to="/settings" class="nav-link" active-class="active">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- ═══════════════ MAIN CONTENT ═══════════════ -->
    <div class="main-content" id="mainContent">
      <!-- Top Navbar -->
      <header class="top-navbar">
        <div class="d-flex align-items-center">
          <button class="btn btn-link sidebar-toggle me-3" @click="toggleSidebar">
            <i class="fas fa-bars fa-lg"></i>
          </button>
          <h1 class="page-title mb-0">{{ route.meta.title || 'Dashboard' }}</h1>
        </div>
        <div class="d-flex align-items-center gap-3">
          <div class="admin-info d-none d-md-flex align-items-center gap-2">
            <div class="admin-avatar">
              <i class="fas fa-user-shield"></i>
            </div>
            <div>
              <div class="admin-name">{{ authStore.user?.name || 'Administrator' }}</div>
              <div class="admin-role">Administrator</div>
            </div>
          </div>
          <button @click="logout" class="btn btn-outline-danger btn-sm" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
            <span class="d-none d-md-inline ms-1">Logout</span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSettingsStore } from '../stores/settings'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
