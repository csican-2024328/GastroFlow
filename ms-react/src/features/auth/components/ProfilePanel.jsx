import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import defaultAvatar from '../../../assets/img/Icono.png'
import { updateProfile, updateProfileAvatar } from '../../../shared/api/profile.js'
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js'

export const ProfilePanel = ({ onClose, initialEdit=false }) => {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  const avatarSrcDefault = (user?.profilePicture || user?.profileImage) && (user?.profilePicture || user?.profileImage).trim() !== ''
    ? (user?.profilePicture || user?.profileImage)
    : defaultAvatar

  const [editMode, setEditMode] = useState(!!initialEdit)
  const [name, setName] = useState(user?.name || '')
  const [surname, setSurname] = useState(user?.surname || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview] = useState(avatarSrcDefault)
  const [saving, setSaving] = useState(false)

  const isAdmin = (user?.role || '').toUpperCase().includes('ADMIN') || (user?.role || '').toUpperCase().includes('PLATFORM')

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  // reset fields when user changes or when modal opens
  React.useEffect(() => {
    setName(user?.name || '')
    setSurname(user?.surname || '')
    setPhone(user?.phone || '')
    setPreview((user?.profilePicture || user?.profileImage) && (user?.profilePicture || user?.profileImage).trim() !== '' ? (user?.profilePicture || user?.profileImage) : defaultAvatar)
    setEditMode(!!initialEdit)
  }, [user, initialEdit])

  const onSave = async () => {
    try {
      setSaving(true)
      const payload = { name, surname, phone }
      const resProfile = await updateProfile(payload)
      if (resProfile?.data?.success && resProfile.data.data) {
        // Only update global auth store if the returned user is the same as the logged-in user
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
          // Only update global auth store if the returned user matches logged-in user
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
      notyfError(err?.response?.data?.message || err.message || 'Error al guardar perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 bg-[#E2D4B7] rounded-md border border-[#d8c8a6]">
      {!editMode ? (
        <div className="flex gap-6 items-start">
          <img src={preview} alt="avatar" className="w-28 h-28 rounded-full object-cover border-4 border-[#2C4035] p-1 bg-white shadow-sm" />
          <div className="flex-1">
            <p className="text-sm text-[#2C4035]">Nombre</p>
            <p className="text-xl font-semibold text-[#1A1A1A]">{user?.name} {user?.surname}</p>

            <div className="mt-4">
              <p className="text-sm text-[#2C4035]">Usuario</p>
              <p className="text-[#1A1A1A]">{user?.username}</p>
            </div>

            <div className="mt-3">
              <p className="text-sm text-[#2C4035]">Email</p>
              <p className="truncate">{user?.email}</p>
            </div>

            <div className="mt-3">
              <p className="text-sm text-[#2C4035]">Teléfono</p>
              <p className="text-[#1A1A1A]">{user?.phone || '-'}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setEditMode(true)} className="px-4 py-2 rounded bg-[#1A3D25] text-white">Editar perfil</button>
              <button onClick={() => onClose && onClose()} className="px-4 py-2 rounded bg-[#C97B60] text-white">Volver</button>
            </div>

            {isAdmin && (
              <div className="mt-4 p-2 bg-white/50 rounded">
                <p className="text-sm font-semibold">Acciones Admin</p>
                <ul className="text-sm list-disc ml-5 mt-2 text-[#1A1A1A]">
                  <li>Ver usuarios</li>
                  <li>Gestionar roles</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <div className="flex gap-4 items-center">
            <img src={preview} alt="avatar" className="w-28 h-28 rounded-full object-cover border-4 border-[#2C4035] p-1 bg-white shadow-sm" />
            <label className="cursor-pointer inline-block px-3 py-2 bg-[#E2D4B7] rounded">
              Cambiar avatar
              <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="text-sm text-[#2C4035]">Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded bg-white" />
          </div>

          <div>
            <label className="text-sm text-[#2C4035]">Apellido</label>
            <input value={surname} onChange={(e) => setSurname(e.target.value)} className="w-full p-2 rounded bg-white" />
          </div>

          <div>
            <label className="text-sm text-[#2C4035]">Teléfono</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 rounded bg-white" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded bg-[#1A3D25] text-white">{saving ? 'Guardando...' : 'Guardar'}</button>
            <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded bg-gray-200">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePanel
