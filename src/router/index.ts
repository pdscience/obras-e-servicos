import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/AuthPage.vue'),
    props: { mode: 'login' },
  },
  {
    path: '/cadastro',
    name: 'register',
    component: () => import('@/pages/AuthPage.vue'),
    props: { mode: 'register' },
  },
  {
    path: '/cadastro-profissional',
    name: 'register-professional',
    component: () => import('@/pages/AuthPage.vue'),
    props: { mode: 'register-professional' },
  },
  {
    path: '/perfil/:id',
    name: 'profile',
    component: () => import('@/pages/ProfilePage.vue'),
    props: true,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true, role: 'profissional' },
  },
  {
    path: '/meu-dashboard',
    name: 'cliente-dashboard',
    component: () => import('@/pages/ClienteDashboard.vue'),
    meta: { requiresAuth: true, role: 'cliente' },
  },
  {
    path: '/loja-dashboard',
    name: 'lojista-dashboard',
    component: () => import('@/pages/LojistaDashboard.vue'),
    meta: { requiresAuth: true, role: 'lojista' },
  },
  {
    path: '/categorias',
    name: 'categories',
    component: () => import('@/pages/CategoriesPage.vue'),
  },
  {
    path: '/categorias/:slug',
    name: 'category-detail',
    component: () => import('@/pages/CategoryDetailPage.vue'),
    props: true,
  },
  {
    path: '/lojas',
    name: 'stores',
    component: () => import('@/pages/StoresPage.vue'),
  },
  {
    path: '/loja/:id',
    name: 'lojista',
    component: () => import('@/pages/LojistaPage.vue'),
    props: true,
  },
  {
    path: '/servicos',
    name: 'quadro-servicos',
    component: () => import('@/pages/QuadroServicos.vue'),
    beforeEnter: async () => {
      const { useAuthStore } = await import('@/stores/auth')
      const auth = useAuthStore()
      if (auth.currentMode === 'cliente') return { name: 'home' }
    },
  },
  {
    path: '/como-funciona',
    name: 'how-it-works',
    component: () => import('@/pages/HowItWorksPage.vue'),
  },
  {
    path: '/planos',
    name: 'planos',
    component: () => import('@/pages/PlanosPage.vue'),
  },
  {
    path: '/perguntas-frequentes',
    name: 'faq',
    component: () => import('@/pages/FaqPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach(async (to, _from, next) => {
  if (to.meta.requiresAuth) {
    const { useAuthStore } = await import('@/stores/auth')
    const auth = useAuthStore()
    await auth.ensureInitialized()

    if (!auth.isLoggedIn) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    const requiredRole = to.meta.role as string | undefined
    if (requiredRole && !auth.user?.tipos.includes(requiredRole)) {
      if (auth.user?.tipos.includes('profissional')) return next({ name: 'dashboard' })
      if (auth.user?.tipos.includes('lojista')) return next({ name: 'lojista-dashboard' })
      return next({ name: 'cliente-dashboard' })
    }
  }

  next()
})

export default router
