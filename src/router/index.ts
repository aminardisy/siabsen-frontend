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
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/data-siswa',
      name: 'data-siswa',
      component: () => import('../views/SiswaListView.vue'),
      meta: { requiresAuth: true, role: ['ADMIN', 'GURU'] },
    },
    {
      path: '/data-guru',
      name: 'data-guru',
      component: () => import('../views/GuruListView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/data-kelas',
      name: 'data-kelas',
      component: () => import('../views/KelasListView.vue'),
      meta: { requiresAuth: true, role: ['ADMIN', 'GURU'] },
    },
    {
      path: '/catat-keterlambatan',
      name: 'catat-keterlambatan',
      component: () => import('../views/CatatKeterlambatanView.vue'),
      meta: { requiresAuth: true, role: ['GURU', 'ADMIN'] },
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import('@/views/AccountView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/role/RoleManagementView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/janji-temu',
      name: 'janji-temu-list',
      component: () => import('../views/JanjiTemuListView.vue'),
      meta: { requiresAuth: true, role: ['SEKRETARIS', 'GURU'] },
    },
    {
      path: '/janji-temu/create',
      name: 'janji-temu-create',
      component: () => import('../views/JanjiTemuCreateView.vue'),
      meta: { requiresAuth: true, role: ['SEKRETARIS'] },
    },
    {
      path: '/janji-temu/edit/:id',
      name: 'janji-temu-edit',
      component: () => import('../views/JanjiTemuEditView.vue'),
      meta: { requiresAuth: true, role: ['SEKRETARIS'] },
    },
    {
      path: '/janji-temu/:id',
      name: 'janji-temu-detail',
      component: () => import('../views/JanjiTemuDetailView.vue'),
      meta: { requiresAuth: true, role: ['SEKRETARIS', 'GURU'] },
    },
    {
      path: '/absensi',
      name: 'absensi',
      component: () => import('../views/AttendanceView.vue'),
      meta: { requiresAuth: true, role: ['ADMIN', 'GURU', 'SEKRETARIS'] },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/dispensasi',
      name: 'dispensasi',
      component: () => import('@/views/DispensasiView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/rekap',
      name: 'rekap',
      component: () => import('@/views/RekapAbsensiView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/laporan-keterlambatan',
      name: 'laporan-keterlambatan',
      component: () => import('@/views/LaporanKeterlambatanView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/attendance-stats',
      name: 'attendance-stats',
      component: () => import('@/views/AttendanceStatsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/konseling',
      name: 'konseling',
      component: () => import('@/views/KonselingView.vue'),
      meta: { requiresAuth: true, role: ['ADMIN', 'GURU', 'KESISWAAN'] },
    },
    {
      path: '/konseling/:id/hasil',
      name: 'catat-hasil-konseling',
      component: () => import('@/views/CatatHasilKonselingView.vue'),
      meta: { requiresAuth: true, role: ['KESISWAAN'] },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const userRole = authStore.user?.role

  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.role) {
    const allowedRoles = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role]
    if (allowedRoles.includes(userRole)) {
      next()
    } else {
      alert('Maaf, Anda tidak memiliki akses ke halaman ini!')
      next('/')
    }
  } else {
    next()
  }
})

export default router
