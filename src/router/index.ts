import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/data-siswa',
      name: 'data-siswa',
      component: () => import('../views/SiswaListView.vue'),
      meta: { requiresAuth: true, role: ['ADMIN', 'GURU'] }
    },
    // --- TAMBAHKAN RUTE BARU DISINI ---
    {
      path: '/data-guru',
      name: 'data-guru',
      component: () => import('../views/GuruListView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' } // Hanya Admin yang bisa kelola Guru
    },
    {
      path: '/data-kelas',
      name: 'data-kelas',
      component: () => import('../views/KelasListView.vue'),
      meta: { requiresAuth: true, role: ['ADMIN', 'GURU'] } // Keduanya bisa lihat
    },
    // ---------------------------------
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import('@/views/AccountView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/role/RoleManagementView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

// Navigation Guard (Pintu Satpam)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const userRole = authStore.user?.role // Ambil role user dari Pinia store

  // 1. Cek Login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  }
  // 2. Cek Izin Role (RBAC)
  else if (to.meta.role) {
    const allowedRoles = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role]

    if (allowedRoles.includes(userRole)) {
      next() // Role cocok, silakan masuk
    } else {
      alert('Maaf, Anda tidak memiliki akses ke halaman ini!')
      next('/') // Role tidak cocok, tendang ke Home
    }
  }
  else {
    next() // Halaman publik atau tidak butuh role khusus
  }
})

export default router
