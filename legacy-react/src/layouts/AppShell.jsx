import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import BottomTabBar from '../components/BottomTabBar.jsx'

// Mobile-style column; on desktop it is centred at max 480px on a neutral background.
export default function AppShell({ tabs, navLabel }) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = `${document.querySelector('h1')?.textContent ?? 'Home'} – SAS Connect`
  }, [pathname])

  const skip = (e) => { e.preventDefault(); document.getElementById('main').focus() }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-paper md:border-x-2 md:border-ink/20 md:shadow-xl">
      <a href="#main" onClick={skip} className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-xl focus:border-2 focus:border-ink focus:bg-white focus:px-4 focus:py-3 focus:font-bold">Skip to content</a>
      <AppHeader />
      <main id="main" tabIndex={-1} key={pathname} className="flex-1 animate-fade p-3.5 outline-none">
        <Outlet />
        <p className="mt-6 text-center text-sm text-muted">Images and resident information are for demonstration purposes only.</p>
      </main>
      <BottomTabBar tabs={tabs} label={navLabel} />
    </div>
  )
}
