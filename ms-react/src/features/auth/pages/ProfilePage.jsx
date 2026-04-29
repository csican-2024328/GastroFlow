import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { getProfile, updateProfile, updateProfileAvatar } from '../../../shared/api/profile.js'
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js'

export const ProfilePage = () => {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      name: user?.name || '',
      surname: user?.surname || '',
      phone: user?.phone || '',
    },
  })
  const [preview, setPreview] = useState(user?.profileImage || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfile()
        if (res?.data?.success && res.data.data) {
          const profileData = res.data.data
          setUser(profileData)
          setValue('name', profileData.name || '')
          setValue('surname', profileData.surname || '')
          setValue('phone', profileData.phone || '')
          setPreview(profileData.profileImage || '')
        }
      } catch (err) {
        const status = err?.response?.status
        if (status === 401 || status === 403) {
          navigate('/')
        }
      }
    }

    loadProfile()
  }, [setValue, setUser, navigate])

  const startEdit = () => setEditMode(true)
  const cancelEdit = () => {
    setEditMode(false)
    setAvatarFile(null)
    setPreview(user?.profileImage || '')
  }

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const payload = {
        name: data.name,
        surname: data.surname,
        phone: data.phone,
      }

      const profileRes = await updateProfile(payload)
      if (profileRes?.data?.success && profileRes.data.data) {
        setUser(profileRes.data.data)
      }

      if (avatarFile) {
        const avatarRes = await updateProfileAvatar(avatarFile)
        if (avatarRes?.data?.success && avatarRes.data.data) {
          setUser(avatarRes.data.data)
          setPreview(avatarRes.data.data.profileImage || preview)
        }
      }

      notyfSuccess('Perfil actualizado')
      setEditMode(false)
      setAvatarFile(null)
    } catch (err) {
      notyfError(err?.response?.data?.message || err.message || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-[#C4A882]">Cargando perfil...</p>
      </div>
    )
  }

  const displayName = user?.name || 'Nombre'
  const displaySurname = user?.surname || ''
  const displayUsername = user?.username || ''
  const displayEmail = user?.email || ''
  const displayPhone = user?.phone || '-'

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Detalles de perfil</h2>

      <div className="bg-[#0F452A] p-6 rounded border border-[#113a26]">
        <div className="flex gap-6 items-start">
          <div className="flex-shrink-0">
            <img src={preview || '/'} alt="avatar" className="w-24 h-24 rounded-full object-cover border-2 border-[#3B5E45]" />
            {editMode && (
              <div className="mt-2">
                <label className="text-xs text-[#C4A882] cursor-pointer hover:underline">
                  Cambiar avatar (cualquier imagen)
                  <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
                </label>
              </div>
            )}
          </div>

          <div className="flex-1">
            {!editMode ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-[#C4A882]">Nombre</p>
                  <p className="text-lg font-medium">{displayName} {displaySurname}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-[#C4A882]">Usuario</p>
                  <p className="text-lg">{displayUsername}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-[#C4A882]">Email</p>
                  <p className="text-lg">{displayEmail}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-[#C4A882]">Teléfono</p>
                  <p className="text-lg">{displayPhone}</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={startEdit} className="px-4 py-2 rounded bg-[#1A3D25] hover:bg-[#0F452A]">Editar perfil</button>
                  <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded bg-gray-700">Volver</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3">
                <label className="text-sm text-[#C4A882]">Nombre</label>
                <input className="p-2 rounded bg-[#112D1C] text-[#F0EDE8]" {...register('name')} />

                <label className="text-sm text-[#C4A882]">Apellido</label>
                <input className="p-2 rounded bg-[#112D1C] text-[#F0EDE8]" {...register('surname')} />

                <label className="text-sm text-[#C4A882]">Teléfono</label>
                <input className="p-2 rounded bg-[#112D1C] text-[#F0EDE8]" {...register('phone')} />

                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-[#1A3D25] hover:bg-[#0F452A]">{loading ? 'Guardando...' : 'Guardar cambios'}</button>
                  <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded bg-gray-700">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
