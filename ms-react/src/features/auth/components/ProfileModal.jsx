import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/authStore.js'
import { ProfilePanel } from './ProfilePanel.jsx'
import '../../../styles/detalles-perfil.css'
 
export const ProfileModal = () => {
  const show         = useAuthStore((s) => s.showProfileModal)
  const close        = useAuthStore((s) => s.closeProfileModal)
  const initialEdit  = useAuthStore((s) => s.profileModalEdit)
  const user         = useAuthStore((s) => s.user)
  const modalRef     = useRef(null)
 
  /* ── Lógica intacta ── */
  useEffect(() => {
    if (!show) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [show, close])
 
  useEffect(() => {
    if (show) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = original }
    }
  }, [show])
 
  useEffect(() => {
    if (show) console.debug('[ProfileModal] opened')
  }, [show])
 
  if (!show) return null
 
  return (
    <ProfileModalContent
      close={close}
      initialEdit={initialEdit}
      modalRef={modalRef}
      user={user}
    />
  )
}
 
const ProfileModalContent = ({ close, initialEdit, modalRef, user }) => {
  const [activeTab, setActiveTab] = useState('profile')
 
  const normalizedRole = (user?.role || '').toString().trim().toUpperCase()
  const isAdmin = normalizedRole === 'PLATFORM_ADMIN' || normalizedRole === 'RESTAURANT_ADMIN'
 
  return (
    <div
      className="pm-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
      role="dialog"
      aria-modal="true"
      aria-label="Detalles de perfil"
    >
      <div ref={modalRef} className="pm-modal">
 
        {/* Header */}
        <div className="pm-modal-header">
          <h3 className="pm-modal-title">Mi Perfil GastroFlow</h3>
          <button onClick={close} aria-label="Cerrar" className="pm-close-btn">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
 
        {/* Tabs */}
        <div className="pm-tabs">
          <button
            className={`pm-tab${activeTab === 'profile' ? ' active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Perfil
          </button>
          {isAdmin && (
            <button
              className={`pm-tab${activeTab === 'admin' ? ' active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              Admin
            </button>
          )}
        </div>
 
        {/* Body */}
        <div className="pm-modal-body">
          {activeTab === 'profile' && (
            <ProfilePanel onClose={close} initialEdit={initialEdit} />
          )}
 
          {activeTab === 'admin' && isAdmin && (
            <div className="pm-admin-tab">
              <h4 className="pm-admin-tab-title">Panel de administrador</h4>
              <p className="pm-admin-tab-sub">Acciones rápidas disponibles para tu rol</p>
              <div className="pm-admin-action-list">
                <div className="pm-admin-action-item">
                  <i className="ti ti-users" aria-hidden="true" />
                  Ver usuarios
                </div>
                <div className="pm-admin-action-item">
                  <i className="ti ti-shield-check" aria-hidden="true" />
                  Gestionar roles
                </div>
                <div className="pm-admin-action-item">
                  <i className="ti ti-file-analytics" aria-hidden="true" />
                  Ver logs (placeholder)
                </div>
              </div>
            </div>
          )}
        </div>
 
      </div>
    </div>
  )
}
 