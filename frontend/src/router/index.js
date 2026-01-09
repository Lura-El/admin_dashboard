import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '@/stores/authStore'

import LoginView from '@/components/Login.vue'
import DashboardView from '@/views/Dashboard.vue'
import UsersView from "@/views/UsersView.vue"
import ReportView from "@/views/ReportView.vue";
import NotFoundView from '@/views/NotFoundView.vue'

const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginView,
        meta: { guest: true }
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: {requiresAuth: true}
    },
    {
        path: '/users',
        name: 'users',
        component: UsersView,

      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportView,

      meta: { requiresAuth: true }
    },
    {
        path: '/:catchAll(.*)',
        name: 'notfound',
        component: NotFoundView,
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Global navigation guard
router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    // If the route requires auth and the user is not authenticated, redirect to home (login)
    if (to.meta?.requiresAuth && !auth.isAuthenticated) {
        return next({ name: 'login' })
    }

    // If the route is guest-only (e.g. home/login) and user is already authenticated,
    // send them to the protected `authPage`.
    if (to.meta?.guest && auth.isAuthenticated) {
        return next({ name: 'dashboard' })
    }

    // Otherwise proceed normally
    next()
})

export default router;