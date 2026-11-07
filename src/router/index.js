import { createRouter, createWebHistory } from 'vue-router'
import { useUiStore } from '../stores/ui'

// meta.role decides which shell (caregiver or staff) a page belongs to; meta.titleKey is its i18n title.
const notFound = () => import('../views/NotFoundView.vue')
const view = (name) => () => import(`../views/caregiver/${name}.vue`)
const accountView = () => import('../views/AccountView.vue')
const staffView = (name) => () => import(`../views/staff/${name}.vue`)
const caregiver = { role: 'caregiver' }
const staff = { role: 'staff' }

export const routes = [
  { path: '/', name: 'home', component: view('HomeView'), meta: { ...caregiver, titleKey: 'pages.home' } },
  { path: '/moments', name: 'moments', component: view('MomentsView'), meta: { ...caregiver, titleKey: 'pages.moments' } },
  { path: '/visits', name: 'visits', component: view('VisitsView'), meta: { ...caregiver, titleKey: 'pages.visits' } },
  { path: '/visits/book', name: 'book-visit', component: view('BookVisitView'), meta: { ...caregiver, titleKey: 'pages.bookVisit' } },
  { path: '/community', name: 'community', component: view('CommunityView'), meta: { ...caregiver, titleKey: 'pages.community' } },
  { path: '/account', name: 'account', component: accountView, meta: { ...caregiver, titleKey: 'pages.account' } },
  { path: '/staff', name: 'staff-dashboard', component: staffView('DashboardView'), meta: { ...staff, titleKey: 'pages.staffDashboard' } },
  { path: '/staff/updates', name: 'staff-updates', component: staffView('UpdatesView'), meta: { ...staff, titleKey: 'pages.staffUpdates' } },
  { path: '/staff/moment', name: 'staff-moment', component: staffView('PostMomentView'), meta: { ...staff, titleKey: 'pages.staffMoment' } },
  { path: '/staff/inquiries', name: 'staff-inquiries', component: staffView('InquiriesView'), meta: { ...staff, titleKey: 'pages.staffInquiries' } },
  { path: '/staff/visits-events', name: 'staff-visits-events', component: staffView('VisitsEventsView'), meta: { ...staff, titleKey: 'pages.staffVisitsEvents' } },
  { path: '/staff/account', name: 'staff-account', component: accountView, meta: { ...staff, titleKey: 'pages.staffAccount' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: notFound, meta: { titleKey: 'pages.notFound' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved ?? (to.path === from.path ? false : { top: 0 }),
})

// The role is derived from the route, so deep links and the role switch are the same mechanism.
router.beforeEach((to) => {
  // The 404 keeps the current shell, except that a mistyped /staff/... address shows the staff one.
  const role = to.meta.role ?? (to.name === 'not-found' && to.path.startsWith('/staff') ? 'staff' : null)
  if (role) useUiStore().setRole(role)
})

export default router
