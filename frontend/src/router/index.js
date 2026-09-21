import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../layouts/AppLayout.vue'
import UserLayout from '../views/UserLayout.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/Landing.vue'),
    meta: { requiresAuth: false, title: 'DotLife - Connect Donors, Save Lives' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { requiresAuth: false, title: 'About DotLife' }
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('../views/Gallery.vue'),
    meta: { requiresAuth: false, title: 'Donation Gallery' }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue'),
    meta: { requiresAuth: false, title: 'Contact DotLife' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false, title: 'Login' }
  },
  {
    path: '/admin/login',
    redirect: { name: 'Login', query: { mode: 'admin' } }
  },
  {
    path: '/donor/login',
    redirect: { name: 'Login', query: { mode: 'user' } }
  },
  {
    path: '/donor/register',
    redirect: { name: 'Login', query: { mode: 'user', signup: '1' } }
  },
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/user/dashboard' },
      { path: 'dashboard', name: 'UserDashboard', component: () => import('../views/UserDashboard.vue'), meta: { title: 'Donor Dashboard' } },
      { path: 'available-blood', name: 'UserAvailableBlood', component: () => import('../views/UserAvailableBlood.vue'), meta: { title: 'Available Blood' } },
      { path: 'camp-registration', name: 'UserCampRegistration', component: () => import('../views/UserCampRegistration.vue'), meta: { title: 'Camp Registration' } },
      { path: 'blood-request', name: 'UserBloodRequest', component: () => import('../views/UserBloodRequest.vue'), meta: { title: 'Blood Inquiry' } },
      { path: 'profile', name: 'UserProfile', component: () => import('../views/UserProfile.vue'), meta: { title: 'My Profile' } }
    ]
  },
  {
    path: '/admin',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: 'Dashboard' } },
      
      { path: 'donors', name: 'Donors', component: () => import('../views/Donors/List.vue'), meta: { title: 'Donors' } },
      { path: 'donors/add', name: 'DonorAdd', component: () => import('../views/Donors/Add.vue'), meta: { title: 'Add Donor' } },
      { path: 'donors/:id/edit', name: 'DonorEdit', component: () => import('../views/Donors/Edit.vue'), meta: { title: 'Edit Donor' } },
      
      { path: 'staff', name: 'Staff', component: () => import('../views/Staff.vue'), meta: { title: 'Staff Management' } },
      
      { path: 'camps', name: 'Camps', component: () => import('../views/Camps/List.vue'), meta: { title: 'Blood Camps' } },
      { path: 'camp-register', name: 'CampRegister', component: () => import('../views/Camps/Register.vue'), meta: { title: 'Camp Register' } },
      { path: 'camp-finance', name: 'CampFinance', component: () => import('../views/Camps/Finance.vue'), meta: { title: 'Budget & Donations' } },
      
      { path: 'messages', name: 'Messages', component: () => import('../views/Communication/Messages.vue'), meta: { title: 'Messages' } },
      { path: 'templates', name: 'Templates', component: () => import('../views/Communication/Templates.vue'), meta: { title: 'Templates' } },
      { path: 'emergency', name: 'Emergency', component: () => import('../views/Communication/Emergency.vue'), meta: { title: 'Emergency Notifications' } },
      { path: 'blood-requests', name: 'BloodRequests', component: () => import('../views/BloodRequests.vue'), meta: { title: 'Blood Requests' } },
      
      { path: 'reports', name: 'Reports', component: () => import('../views/Reports.vue'), meta: { title: 'Reports' } },
      
      { path: 'settings', name: 'Settings', component: () => import('../views/Settings.vue'), meta: { title: 'Settings' } },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    try {
      await authStore.checkAuth()
      next()
    } catch {
      const targetRole = to.path.startsWith('/admin') ? 'admin' : 'user'
      next({ name: 'Login', query: { mode: targetRole } })
    }
  } else {
    next()
  }
})

router.afterEach((to) => {
  document.title = (to.meta.title || 'DotLife') + ' - DotLife'
})

export default router
