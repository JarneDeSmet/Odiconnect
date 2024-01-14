import { createRouter, createWebHistory } from 'vue-router'

import type {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordNormalized
} from 'vue-router'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { useAuthStore } from '@/stores/AuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        title: 'OdiConnect'
      },
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        title: 'Login'
      },
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      meta: {
        title: 'Register'
      },
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      meta: {
        title: 'Dashboard',
        requiresAuth: true
      },
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/call',
      name: 'call',
      meta: {
        title: 'Call',
        requiresAuth: true
      },
      component: () => import('../views/CallView.vue')
    }
  ]
})

const getCurrentUser = () => {
  return new Promise((resolve, reject): void => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user: User | null): void => {
        removeListener()
        resolve(user)
      },
      reject
    )
  })
}
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ): Promise<void> => {
    if (to.matched.some((record: RouteRecordNormalized) => record.meta.requiresAuth)) {
      if (await getCurrentUser()) {
        next()
      } else {
        next('/login')
      }
    } else {
      next()
    }
  }
)
export default router
