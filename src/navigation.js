// Navigation items per demo role. `desktopOnly` items appear in the sidebar but not the mobile tab bar.
// Labels are i18n keys: nav.* (sidebar) and tab.* (short labels for the mobile tab bar).
export const NAV = {
  caregiver: [
    { to: '/', key: 'home', icon: 'home' },
    { to: '/moments', key: 'moments', icon: 'image' },
    { to: '/visits', key: 'visits', icon: 'calendar' },
    { to: '/community', key: 'community', icon: 'heart' },
  ],
  staff: [
    { to: '/staff', key: 'dashboard', icon: 'dashboard' },
    { to: '/staff/updates', key: 'updates', icon: 'clipboard' },
    { to: '/staff/moment', key: 'postMoment', icon: 'camera', desktopOnly: true },
    { to: '/staff/inquiries', key: 'inquiries', icon: 'inbox' },
    { to: '/staff/visits-events', key: 'visitsEvents', icon: 'calendar-check' },
  ],
}

export const ACCOUNT = { caregiver: '/account', staff: '/staff/account' }
export const HOME = { caregiver: '/', staff: '/staff' }

// Home and the staff dashboard match exactly; other items also match their sub-pages (/visits/book).
export const isOn = (to, path) => (to === '/' || to === '/staff' ? path === to : path === to || path.startsWith(`${to}/`))
