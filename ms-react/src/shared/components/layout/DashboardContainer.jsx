import { Navbar } from "./Navbar.jsx"
import { Sidebar } from "./Sidebar.jsx"
import { Outlet, useLocation } from 'react-router-dom'
import { ProfileModal } from '../../../features/auth/components/ProfileModal.jsx'
import { LiveAdminDashboard } from './LiveAdminDashboard.jsx'

export const DashboardContainer = () => {
  const location = useLocation()
  const showWelcome = location.pathname === '/dashboard'

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col text-[#1A1A1A]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 bg-[#F8F5F0]">
          {showWelcome ? (
            <LiveAdminDashboard />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <ProfileModal />
    </div>
  )
}
