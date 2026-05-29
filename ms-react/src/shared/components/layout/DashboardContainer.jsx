import { Navbar } from "./Navbar.jsx"
import { Sidebar } from "./Sidebar.jsx"
import { Outlet, useLocation } from 'react-router-dom'
import { ProfileModal } from '../../../features/auth/components/ProfileModal.jsx'
import { LiveAdminDashboard } from './LiveAdminDashboard.jsx'

export const DashboardContainer = () => {
  const location = useLocation()
  const showWelcome = location.pathname === '/dashboard' || location.pathname === '/restaurant-dashboard'
  const isMenusRoute = location.pathname.startsWith('/dashboard/menus') || location.pathname.startsWith('/restaurant-dashboard/menus')
  const isReportsRoute = location.pathname.includes('/reportes') || location.pathname.includes('/reports')
  const isReviewsRoute = location.pathname.includes('/resenas')
  const useDarkContent = showWelcome || isMenusRoute || isReportsRoute || isReviewsRoute

  return (
    <div className="min-h-screen bg-[#0b0a08] flex flex-col text-[#f5ede0]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className={`pl-0 md:pl-64 relative z-20 flex-1 overflow-y-auto bg-[#0a0a08] text-[#f5ede0] flex justify-center`}>
          <div className={`w-full max-w-[1200px] md:pl-6 ${useDarkContent ? 'p-0' : 'p-6 bg-[#F8F5F0] text-[#1A1A1A]'}`}>
            {showWelcome ? (
              <LiveAdminDashboard />
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
      <ProfileModal />
    </div>
  )
}
