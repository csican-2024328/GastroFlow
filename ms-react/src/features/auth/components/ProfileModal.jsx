import React, { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/authStore.js'
import { ProfilePanel } from './ProfilePanel.jsx'

export const ProfileModal = () => {
  const show = useAuthStore((s) => s.showProfileModal)
  const close = useAuthStore((s) => s.closeProfileModal)
  const initialEdit = useAuthStore((s) => s.profileModalEdit)
  const user = useAuthStore((s) => s.user)
  const modalRef = useRef(null)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!show) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [show, close])

  // prevent background scroll when modal is open
  useEffect(() => {
    if (show) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [show])

  useEffect(() => {
    // reset to profile tab when opening
    if (show) setActiveTab('profile')
  }, [show])

  // debug: log when modal is shown
  useEffect(() => {
    if (show) console.debug('[ProfileModal] opened')
  }, [show])

  if (!show) return null

  const isAdmin = (user?.role || '').toUpperCase().includes('ADMIN') || (user?.role || '').toUpperCase().includes('PLATFORM')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
      role="dialog"
      aria-modal="true"
    >
      <div ref={modalRef} className="bg-[#E2D4B7] rounded-md w-[80%] max-w-xl p-5 shadow-2xl border border-[#d8c8a6]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">Detalles de perfil</h3>
          <button onClick={close} aria-label="Cerrar" className="text-[#2C4035] hover:text-gray-900">✕</button>
        </div>

        <div className="border-b border-[#d8c8a6] mb-4">
          <nav className="flex gap-4">
            <button onClick={() => setActiveTab('profile')} className={`px-3 py-2 ${activeTab === 'profile' ? 'border-b-2 border-[#2C4035] font-semibold text-[#2C4035]' : 'text-[#2C4035]'}`}>Perfil</button>
            {isAdmin && (
              <button onClick={() => setActiveTab('admin')} className={`px-3 py-2 ${activeTab === 'admin' ? 'border-b-2 border-[#2C4035] font-semibold text-[#2C4035]' : 'text-[#2C4035]'}`}>Admin</button>
            )}
          </nav>
        </div>

        <div className="">
          {activeTab === 'profile' && (
            <div>
              <ProfilePanel onClose={close} initialEdit={initialEdit} />
            </div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <div className="p-2">
              <h4 className="font-semibold mb-2">Panel de administrador</h4>
              <p className="text-sm text-gray-600">Acciones rápidas:</p>
              <ul className="list-disc ml-5 mt-2 text-sm">
                <li>Ver usuarios</li>
                <li>Gestionar roles</li>
                <li>Ver logs (placeholder)</li>
              </ul>
              <p className="mt-3 text-xs text-gray-500">(Panel administrativo básico — dime si quieres funcionalidades concretas aquí)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
