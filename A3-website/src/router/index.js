import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import AuthHome from '../views/AuthHome.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import TeenagerCentre from '../views/TeenagerCentre.vue'
import WorkerCentre from '../views/WorkerCentre.vue'
import AdminCentre from '../views/AdminCentre.vue'
import About from '../views/About.vue'
import AccessDenied from '../views/AccessDenied.vue'

// Dynamic import of module components
const TeenagerArticles = () => import('../components/TeenagerArticles.vue')
const WorkerArticles = () => import('../components/WorkerArticles.vue')
const GeoLocation = () => import('../components/GeoLocation.vue')
const OfflineManager = () => import('../components/OfflineManager.vue')

const routes = [
  { path: '/', component: Home },
  { path: '/auth', component: AuthHome },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/access-denied', component: AccessDenied },
  {
    path: '/about',
    component: About,
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
      if (isAuthenticated) {
        next()
      } else {
        next('/access-denied')
      }
    }
  },
  {
    path: '/teenager-centre',
    component: TeenagerCentre,
    meta: { requiresAuth: true, role: 'teenager' },
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user?.role === 'teenager') next()
      else next('/access-denied')
    }
  },
  {
    path: '/worker-centre',
    component: WorkerCentre,
    meta: { requiresAuth: true, role: 'worker' },
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user?.role === 'worker') next()
      else next('/access-denied')
    }
  },
  {
    path: '/admin-centre',
    component: AdminCentre,
    meta: { requiresAuth: true, role: 'admin' },
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user?.role === 'admin') next()
      else next('/access-denied')
    }
  },
  {
    path: '/offline-manager',
    component: OfflineManager,
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
      if (isAuthenticated) {
        next()
      } else {
        next('/access-denied')
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global route guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // User not authenticated, redirect to login page
      next({ path: '/login' })
    } else {
      // User authenticated, check for specific role requirements
      const user = JSON.parse(localStorage.getItem('user'))
      const requiredRole = to.matched.find(record => record.meta.role)?.meta.role
      
      if (requiredRole && user.role !== requiredRole) {
        // User doesn't have required role, redirect to access denied page
        next({ path: '/access-denied' })
      } else {
        // User has access permission
        next()
      }
    }
  } else {
    // Route doesn't require authentication
    next()
  }
})

export default router
