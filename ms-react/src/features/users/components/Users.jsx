import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { notyfError } from '../../../shared/utils/notyf.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useUserManagmentStore } from '../store/useUserManagmentStore.js';
import { AuthInput } from '../../../shared/components/auth/AuthInput.jsx';
import '../../../styles/users.css';
 
/* ── Helpers — INTACTOS ── */
const normalizeRole = (role) => (role||'').toString().trim().toUpperCase();
const getRoleLabel  = (role) => {
  const n = normalizeRole(role);
  if (n==='PLATFORM_ADMIN')   return 'Admin Plataforma';
  if (n==='RESTAURANT_ADMIN') return 'Admin Restaurante';
  if (n==='CLIENT')           return 'Cliente';
  return role||'Sin rol';
};
const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-GT', { year:'numeric', month:'short', day:'2-digit' }).format(date);
};
 
export const Users = () => {
  const {
    users, loading, error, fetchUsers, fetchUserById, updateUserRole,
    createUser, creatingUser, setSearch, setRoleFilter, setPage,
    filters, page, pageSize, getFilteredUsers,
  } = useUserManagmentStore();
 
  const currentUser   = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id || currentUser?.Id || currentUser?._id || '';
 
  const [selectedUserToConfirm, setSelectedUserToConfirm] = useState(null);
  const [pendingRole,   setPendingRole]   = useState('');
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [isCreateOpen,  setIsCreateOpen]  = useState(false);
 
  const { register, handleSubmit, watch, reset, formState:{ errors } } = useForm({
    mode:'onTouched',
    defaultValues: { name:'', surname:'', username:'', email:'', phone:'', password:'', passwordConfirm:'', role:'CLIENT' },
  });
  const passwordToConfirm = watch('password','');
  const getUserId = (u) => u?.id||u?.Id||u?._id||'';
 
  /* ── Handlers — INTACTOS ── */
  const handleCloseModal = () => { setSelectedUserToConfirm(null); setPendingRole(''); };
 
  const handleRoleSelect = async (user, selectedRole) => {
    const roleValue   = (selectedRole||'').toString().trim().toUpperCase();
    const currentRole = (user?.role||'').toString().trim().toUpperCase();
    if (!user || !roleValue || roleValue===currentRole) return;
    const userId = getUserId(user);
    if (!userId) { toast.error('No se pudo identificar el usuario'); return; }
    const response = await fetchUserById(userId);
    if (!response.success) { toast.error(response.error); return; }
    setSelectedUserToConfirm(response.user||user);
    setPendingRole(roleValue);
  };
 
  const handleConfirmRoleChange = async () => {
    if (!selectedUserToConfirm || !pendingRole) return;
    setIsSubmitting(true);
    const userId = getUserId(selectedUserToConfirm);
    const response = await updateUserRole(userId, pendingRole);
    if (response.success) {
      toast.success('Rol actualizado correctamente');
      await fetchUsers(undefined,{ force:true });
      handleCloseModal();
    } else { toast.error(response.error); }
    setIsSubmitting(false);
  };
 
  const handleCreateUserSubmit = async (formData) => {
    const payload = {
      name: formData.name.trim(), surname: formData.surname.trim(),
      username: formData.username.trim(), email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(), password: formData.password,
    };
    const response = await createUser(payload, formData.role||'CLIENT');
    if (response.success) {
      toast.success(response.message||'Usuario creado correctamente');
      reset(); setIsCreateOpen(false); setPage(1);
      await fetchUsers(undefined,{ force:true });
    } else { toast.error(response.error); }
  };
 
  useEffect(() => { fetchUsers(undefined,{ force:true }); }, [fetchUsers]);
  useEffect(() => { if (error) notyfError(error); }, [error]);
 
  const { filteredUsers, paginatedUsers, totalPages, currentPage } = useMemo(() => {
    const r = getFilteredUsers();
    return { filteredUsers:r.filteredUsers, paginatedUsers:r.paginatedUsers, totalPages:r.totalPages, currentPage:r.currentPage };
  }, [getFilteredUsers, users, filters, page, pageSize]);
 
  if (loading && users.length===0) {
    return <div className="us-loading"><div className="us-table-spinner" />Cargando usuarios...</div>;
  }
 
  return (
    <div className="us-root">
 
      {/* HEADER */}
      <div className="us-header">
        <div>
          <div className="us-header-badge"><i className="ti ti-users" aria-hidden="true" />Gestión de usuarios</div>
          <h1 className="us-header-title">Usuarios</h1>
          <p className="us-header-sub">Administra el listado de usuarios registrados.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="us-btn-new">
          <i className="ti ti-plus" aria-hidden="true" />
          + Crear usuario
        </button>
      </div>
 
      {/* FILTROS */}
      <div className="us-filters">
        <div className="us-filter-group" style={{flex:2}}>
          <span className="us-filter-label">Buscar usuarios</span>
          <div className="us-filter-wrap">
            <i className="ti ti-search us-filter-icon" aria-hidden="true" />
            <input
              value={filters.search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, username o email..."
              className="us-filter-input"
            />
          </div>
        </div>
        <div className="us-filter-group">
          <span className="us-filter-label">Filtrar por rol</span>
          <div className="us-filter-wrap">
            <i className="ti ti-shield us-filter-icon" aria-hidden="true" />
            <select value={filters.role} onChange={e => setRoleFilter(e.target.value)} className="us-filter-select">
              <option value="ALL">Todos los roles</option>
              <option value="PLATFORM_ADMIN">Admin Plataforma</option>
              <option value="RESTAURANT_ADMIN">Admin Restaurante</option>
              <option value="CLIENT">Cliente</option>
            </select>
          </div>
        </div>
      </div>
 
      {/* TABLA */}
      <div className="us-section">
        <div className="us-section-header">
          <span className="us-section-title">Lista de usuarios</span>
          <span style={{fontSize:11,color:'var(--us-text-tertiary)',background:'rgba(255,255,255,.04)',border:'.5px solid rgba(255,255,255,.07)',borderRadius:6,padding:'3px 8px'}}>{filteredUsers.length} usuarios</span>
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="us-table">
            <thead>
              <tr>
                <th style={{width:'22%'}}>Nombre</th>
                <th style={{width:'26%'}}>Email</th>
                <th style={{width:'22%'}}>Rol actual</th>
                <th style={{width:'16%'}}>Fecha creación</th>
                <th style={{width:'14%'}}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr><td colSpan="5" style={{padding:0}}>
                  <div className="us-table-empty">
                    <i className="ti ti-user-off" aria-hidden="true" />
                    No hay usuarios para mostrar.
                  </div>
                </td></tr>
              ) : (
                paginatedUsers.map((user, idx) => {
                  const currentRole        = normalizeRole(user.role);
                  const isPlatformAdmin    = currentRole==='PLATFORM_ADMIN';
                  const userId             = getUserId(user);
                  const isDisabled         = isPlatformAdmin && userId!==currentUserId;
                  return (
                    <tr key={userId||user.email||idx} style={{animationDelay:`${idx*.03}s`}}>
                      <td className="us-td-main">{[user.name,user.surname].filter(Boolean).join(' ')||'-'}</td>
                      <td>{user.email||'-'}</td>
                      <td>
                        <div style={{display:'flex',flexDirection:'column',gap:4}}>
                          <select
                            value={currentRole||'CLIENT'}
                            onChange={e => handleRoleSelect(user,e.target.value)}
                            disabled={isDisabled}
                            title={isDisabled?'Solo el propio Admin Global puede cambiar su rol':''}
                            className="us-role-select"
                          >
                            <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
                            <option value="RESTAURANT_ADMIN">RESTAURANT_ADMIN</option>
                            <option value="CLIENT">CLIENT</option>
                          </select>
                          {isDisabled && <span className="us-role-hint">Solo el propio Admin Global puede cambiar su rol</span>}
                        </div>
                      </td>
                      <td style={{fontSize:11,color:'rgba(245,237,224,.35)'}}>{formatDate(user.createdAt)}</td>
                      <td>
                        <span className={`us-chip ${user.status?'us-chip--active':'us-chip--inactive'}`}>
                          <i className={`ti ${user.status?'ti-check':'ti-x'}`} style={{fontSize:9}} aria-hidden="true" />
                          {user.status?'Activo':'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* PAGINACIÓN */}
      <div className="us-pagination">
        <span className="us-pagination-info">
          Mostrando {(currentPage-1)*pageSize+(paginatedUsers.length?1:0)} – {(currentPage-1)*pageSize+paginatedUsers.length} de {filteredUsers.length}
        </span>
        <div className="us-pagination-btns">
          <button onClick={() => setPage(v => Math.max(1,v-1))} disabled={currentPage===1} className="us-page-btn">
            <i className="ti ti-chevron-left" style={{fontSize:13}} aria-hidden="true" /> Anterior
          </button>
          <span className="us-page-info">{currentPage} / {totalPages}</span>
          <button onClick={() => setPage(v => Math.min(totalPages,v+1))} disabled={currentPage===totalPages} className="us-page-btn">
            Siguiente <i className="ti ti-chevron-right" style={{fontSize:13}} aria-hidden="true" />
          </button>
        </div>
      </div>
 
      {/* MODAL CONFIRMAR ROL */}
      {!!selectedUserToConfirm && (
        <div className="us-overlay">
          <div className="us-modal">
            <div className="us-modal-header">
              <div className="us-modal-header-left">
                <div className="us-modal-icon"><i className="ti ti-shield" aria-hidden="true" /></div>
                <div>
                  <div className="us-modal-title">Confirmar cambio de rol</div>
                  <div className="us-modal-sub">Esta acción puede afectar el acceso del usuario</div>
                </div>
              </div>
              <button onClick={handleCloseModal} className="us-modal-close" aria-label="Cerrar"><i className="ti ti-x" aria-hidden="true" /></button>
            </div>
            <div className="us-modal-body">
              <p style={{fontSize:12,color:'var(--us-text-secondary)',marginBottom:14}}>
                ¿Cambiar el rol de <strong style={{color:'var(--us-text-primary)'}}>{[selectedUserToConfirm?.name,selectedUserToConfirm?.surname].filter(Boolean).join(' ')||selectedUserToConfirm?.email||'usuario'}</strong>{' '}de <strong style={{color:'var(--us-gold)'}}>{normalizeRole(selectedUserToConfirm?.role)}</strong> a <strong style={{color:'var(--us-gold)'}}>{pendingRole}</strong>?
              </p>
              <div className="us-info-box">
                <div className="us-info-row"><span className="us-info-key">Email</span><span className="us-info-val">{selectedUserToConfirm?.email||'-'}</span></div>
                <div className="us-info-row"><span className="us-info-key">Estado</span><span className="us-info-val">{selectedUserToConfirm?.status?'Activo':'Inactivo'}</span></div>
              </div>
            </div>
            <div className="us-modal-footer">
              <button onClick={handleCloseModal} className="us-btn us-btn-ghost">Cancelar</button>
              <button onClick={handleConfirmRoleChange} disabled={isSubmitting} className="us-btn us-btn-primary">
                {isSubmitting ? <><span className="us-btn-spinner" />Guardando...</> : <><i className="ti ti-check" aria-hidden="true" />Confirmar cambio</>}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* MODAL CREAR USUARIO */}
      {isCreateOpen && (
        <div className="us-overlay">
          <div className="us-modal us-modal--lg">
            <div className="us-modal-header">
              <div className="us-modal-header-left">
                <div className="us-modal-icon"><i className="ti ti-user-plus" aria-hidden="true" /></div>
                <div>
                  <div className="us-modal-title">Crear nuevo usuario</div>
                  <div className="us-modal-sub">Completa todos los campos requeridos</div>
                </div>
              </div>
              <button onClick={() => { setIsCreateOpen(false); reset(); }} className="us-modal-close" aria-label="Cerrar"><i className="ti ti-x" aria-hidden="true" /></button>
            </div>
            <div className="us-modal-body">
              <form id="create-user-form" onSubmit={handleSubmit(handleCreateUserSubmit)}>
                <div className="us-form">
                  <div className="us-form-row">
                    <div className="us-form-field">
                      <label className="us-form-label">Nombre <span className="us-form-label-req">*</span></label>
                      <input {...register('name',{required:'El nombre es obligatorio',minLength:{value:2,message:'Mínimo 2 caracteres'}})} placeholder="Nombre" className={`us-form-input${errors.name?' us-form-input--error':''}`} />
                      {errors.name && <span className="us-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.name.message}</span>}
                    </div>
                    <div className="us-form-field">
                      <label className="us-form-label">Apellido <span className="us-form-label-req">*</span></label>
                      <input {...register('surname',{required:'El apellido es obligatorio',minLength:{value:2,message:'Mínimo 2 caracteres'}})} placeholder="Apellido" className={`us-form-input${errors.surname?' us-form-input--error':''}`} />
                      {errors.surname && <span className="us-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.surname.message}</span>}
                    </div>
                  </div>
                  <div className="us-form-row">
                    <div className="us-form-field">
                      <label className="us-form-label">Usuario <span className="us-form-label-req">*</span></label>
                      <input {...register('username',{required:'El usuario es obligatorio',minLength:{value:3,message:'Mínimo 3 caracteres'}})} placeholder="usuario123" className={`us-form-input${errors.username?' us-form-input--error':''}`} autoComplete="username" />
                      {errors.username && <span className="us-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.username.message}</span>}
                    </div>
                    <div className="us-form-field">
                      <label className="us-form-label">Email <span className="us-form-label-req">*</span></label>
                      <input type="email" {...register('email',{required:'El email es obligatorio',pattern:{value:/^\S+@\S+\.\S+$/,message:'Email inválido'}})} placeholder="correo@ejemplo.com" className={`us-form-input${errors.email?' us-form-input--error':''}`} autoComplete="email" />
                      {errors.email && <span className="us-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.email.message}</span>}
                    </div>
                  </div>
                  <div className="us-form-row">
                    <div className="us-form-field">
                      <label className="us-form-label">Teléfono <span className="us-form-label-req">*</span></label>
                      <input {...register('phone',{required:'El teléfono es obligatorio',pattern:{value:/^[0-9]{8}$/,message:'Debe tener 8 dígitos'}})} placeholder="22345678" className={`us-form-input${errors.phone?' us-form-input--error':''}`} autoComplete="tel" />
                      {errors.phone && <span className="us-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.phone.message}</span>}
                    </div>
                    <div className="us-form-field">
                      <label className="us-form-label">Rol</label>
                      <select {...register('role')} className="us-form-select">
                        <option value="CLIENT">CLIENT</option>
                        <option value="RESTAURANT_ADMIN">RESTAURANT_ADMIN</option>
                        <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
                      </select>
                    </div>
                  </div>
                  <div className="us-form-row">
                    <div className="us-form-field">
                      <label className="us-form-label">Contraseña <span className="us-form-label-req">*</span></label>
                      <input type="password" {...register('password',{required:'La contraseña es obligatoria',minLength:{value:8,message:'Mínimo 8 caracteres'}})} placeholder="••••••••" className={`us-form-input${errors.password?' us-form-input--error':''}`} autoComplete="new-password" />
                      {errors.password && <span className="us-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.password.message}</span>}
                    </div>
                    <div className="us-form-field">
                      <label className="us-form-label">Confirmar contraseña <span className="us-form-label-req">*</span></label>
                      <input type="password" {...register('passwordConfirm',{required:'Confirma la contraseña',validate:v => v===passwordToConfirm||'Las contraseñas no coinciden'})} placeholder="••••••••" className={`us-form-input${errors.passwordConfirm?' us-form-input--error':''}`} autoComplete="new-password" />
                      {errors.passwordConfirm && <span className="us-form-error"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.passwordConfirm.message}</span>}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="us-modal-footer">
              <button onClick={() => { setIsCreateOpen(false); reset(); }} className="us-btn us-btn-ghost">Cancelar</button>
              <button type="submit" form="create-user-form" disabled={creatingUser} className="us-btn us-btn-primary">
                {creatingUser ? <><span className="us-btn-spinner" />Creando...</> : <><i className="ti ti-user-plus" aria-hidden="true" />Crear usuario</>}
              </button>
            </div>
          </div>
        </div>
      )}
 
    </div>
  );
};