import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import defaultAvatar from '../../../assets/img/Icono.png'
import { updateProfile, updateProfileAvatar } from '../../../shared/api/profile.js'
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js'
 
export const ProfilePanel = ({ initialEdit = false, onClose }) => {
  const user    = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()
 
  /* ── Lógica intacta ── */
  const profileImage = [user?.profilePicture, user?.profileImage].find(
    (value) => typeof value === 'string' && value.trim() !== '',
  )
  const avatarSrcDefault = profileImage || defaultAvatar
 
  const [editMode,   setEditMode]   = useState(!!initialEdit)
  const [name,       setName]       = useState(user?.name || '')
  const [surname,    setSurname]    = useState(user?.surname || '')
  const [phone,      setPhone]      = useState(user?.phone || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview,    setPreview]    = useState(avatarSrcDefault)
  const [saving,     setSaving]     = useState(false)
 
  const normalizedRole = (user?.role || '').toString().trim().toUpperCase()
  const isAdmin = normalizedRole === 'PLATFORM_ADMIN' || normalizedRole === 'RESTAURANT_ADMIN'
 
  const onAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }
 
  const onSave = async () => {
    try {
      setSaving(true)
      const payload = { name, surname, phone }
      const resProfile = await updateProfile(payload)
      if (resProfile?.data?.success && resProfile.data.data) {
        if (resProfile.data.data.id === user?.id) {
          setUser(resProfile.data.data)
        } else {
          console.debug('[ProfilePanel] profile updated for a different user (not overwriting auth store)')
        }
        console.debug('[ProfilePanel] profile updated:', resProfile.data.data)
      }
 
      if (avatarFile) {
        const resAvatar = await updateProfileAvatar(avatarFile)
        if (resAvatar?.data?.success && resAvatar.data.data) {
          if (resAvatar.data.data.id === user?.id) {
            setUser(resAvatar.data.data)
          } else {
            console.debug('[ProfilePanel] avatar updated for a different user (not overwriting auth store)')
          }
          console.debug('[ProfilePanel] avatar updated:', resAvatar.data.data)
          setPreview(resAvatar.data.data.profileImage || preview)
        }
      }
 
      setEditMode(false)
      notyfSuccess('Perfil actualizado')
    } catch (err) {
      console.error('Error saving profile', err)
      const detailed = err?.message || err?.toString()
      notyfError(detailed || 'Error al guardar perfil')
      if (err?.cause) console.debug('Error cause:', err.cause)
    } finally {
      setSaving(false)
    }
  }
 
  /* ── Botón Volver — lógica intacta ── */
  const handleBack = () => {
    if (typeof onClose === 'function') { onClose(); return }
    const role = (user?.role || '').toString().trim().toUpperCase()
    if (role === 'PLATFORM_ADMIN') navigate('/dashboard')
    else if (role === 'RESTAURANT_ADMIN') navigate('/restaurant-dashboard')
    else navigate('/cliente')
  }
 
  /* ════════════════════════════════════════
     MODO LECTURA
  ════════════════════════════════════════ */
  if (!editMode) {
    return (
      <div className="pm-view">
 
        {/* Avatar */}
        <div className="pm-avatar-wrap">
          <img src={preview} alt="avatar" className="pm-avatar" />
          <div className="pm-avatar-ring" />
        </div>
 
        {/* Info */}
        <div className="pm-info">
          <h4 className="pm-info-name">{user?.name} {user?.surname}</h4>
          <span className="pm-role-badge">
            <i className="ti ti-shield-check" style={{ fontSize: 10 }} aria-hidden="true" />
            {user?.role || 'Usuario'}
          </span>
 
          <div className="pm-fields">
            <div className="pm-field-row">
              <div className="pm-field-label">Usuario</div>
              <div className="pm-field-value">{user?.username || '-'}</div>
            </div>
            <div className="pm-field-row">
              <div className="pm-field-label">Email</div>
              <div className="pm-field-value">{user?.email || '-'}</div>
            </div>
            <div className="pm-field-row">
              <div className="pm-field-label">Teléfono</div>
              <div className={`pm-field-value${!user?.phone ? ' pm-field-value--muted' : ''}`}>
                {user?.phone || 'Sin teléfono registrado'}
              </div>
            </div>
          </div>
 
          <div className="pm-actions">
            <button onClick={() => setEditMode(true)} className="pm-btn pm-btn-primary">
              <i className="ti ti-edit" aria-hidden="true" />
              Editar perfil
            </button>
            <button onClick={handleBack} className="pm-btn pm-btn-ghost">
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Volver
            </button>
          </div>
 
          {isAdmin && (
            <div className="pm-admin-box">
              <p className="pm-admin-box-title">Acciones Admin</p>
              <ul className="pm-admin-list">
                <li>Ver usuarios</li>
                <li>Gestionar roles</li>
              </ul>
            </div>
          )}
        </div>
 
      </div>
    )
  }
 
  /* ════════════════════════════════════════
     MODO EDICIÓN
  ════════════════════════════════════════ */
  return (
    <div className="pm-edit">
 
      {/* Avatar + cambiar */}
      <div className="pm-edit-avatar-row">
        <div className="pm-avatar-wrap">
          <img src={preview} alt="avatar" className="pm-avatar" />
          <div className="pm-avatar-ring" />
        </div>
        <label className="pm-avatar-change-btn">
          <i className="ti ti-camera" aria-hidden="true" />
          Cambiar avatar
          <input type="file" accept="image/*" onChange={onAvatarChange} style={{ display: 'none' }} />
        </label>
      </div>
 
      {/* Formulario */}
      <div className="pm-form">
        <div className="pm-form-field">
          <label className="pm-form-label">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pm-form-input"
            placeholder="Tu nombre"
          />
        </div>
 
        <div className="pm-form-field">
          <label className="pm-form-label">Apellido</label>
          <input
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="pm-form-input"
            placeholder="Tu apellido"
          />
        </div>
 
        <div className="pm-form-field">
          <label className="pm-form-label">Teléfono</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pm-form-input"
            placeholder="22345678"
          />
        </div>
 
        <div className="pm-form-actions">
          <button onClick={onSave} disabled={saving} className="pm-btn pm-btn-save">
            <span className="pm-btn-shimmer" />
            {saving
              ? <><span className="pm-spinner" />Guardando...</>
              : <><i className="ti ti-device-floppy" aria-hidden="true" />Guardar</>}
          </button>
          <button onClick={() => setEditMode(false)} className="pm-btn pm-btn-ghost">
            Cancelar
          </button>
        </div>
      </div>
 
    </div>
  )
}
 
export default ProfilePanel
 