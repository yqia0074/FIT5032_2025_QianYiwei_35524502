import { createRouter, createWebHistory } from 'vue-router'
import LoginRegister from '../views/LoginRegister.vue'
import TeenagerDashboard from '../views/TeenagerDashboard.vue'
import WorkerDashboard from '../views/WorkerDashboard.vue'

const routes = [
  { path: '/', component: LoginRegister },
  {
    path: '/teenager',
    component: TeenagerDashboard,
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user?.role === 'teenager') next()
      else next('/')
    }
  },
  {
    path: '/worker',
    component: WorkerDashboard,
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user?.role === 'worker') next()
      else next('/')
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
