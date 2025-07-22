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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  
  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // 用户未认证，重定向到登录页面
      next({ path: '/login' })
    } else {
      // 用户已认证，检查是否有特定角色要求
      const user = JSON.parse(localStorage.getItem('user'))
      const requiredRole = to.matched.find(record => record.meta.role)?.meta.role
      
      if (requiredRole && user.role !== requiredRole) {
        // 用户没有所需角色，重定向到拒绝访问页面
        next({ path: '/access-denied' })
      } else {
        // 用户有权访问
        next()
      }
    }
  } else {
    // 路由不需要认证
    next()
  }
})

export default router
