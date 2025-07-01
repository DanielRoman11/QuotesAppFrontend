import { createMemoryHistory, createRouter } from 'vue-router'
import QuotesView from '@/views/quotes/QuotesView.vue'
import HomeView from '@/views/home/HomeView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/dashboard', component: DashboardView },
  { path: '/quotes', component: QuotesView },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
