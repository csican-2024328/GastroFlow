import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button, Card, CardBody, CardHeader, Chip, Typography } from '@material-tailwind/react';
import Modal from '../../../shared/components/ui/Modal.jsx';
import { notyfError } from '../../../shared/utils/notyf.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useUserManagmentStore } from '../store/useUserManagmentStore.js';
import { AuthInput } from '../../../shared/components/auth/AuthInput.jsx';
import '../../../styles/users.css'

const normalizeRole = (role) => (role || '').toString().trim().toUpperCase();

const getRoleLabel = (role) => {
    const normalized = normalizeRole(role);
    if (normalized === 'PLATFORM_ADMIN') return 'Admin Plataforma';
    if (normalized === 'RESTAURANT_ADMIN') return 'Admin Restaurante';
    if (normalized === 'CLIENT') return 'Cliente';
    return role || 'Sin rol';
};

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('es-GT', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(date);
};

export const Users = () => {
    const {
        users,
        loading,
        error,
        fetchUsers,
        fetchUserById,
        updateUserRole,
        createUser,
        creatingUser,
        setSearch,
        setRoleFilter,
        setPage,
        filters,
        page,
        pageSize,
        getFilteredUsers,
    } = useUserManagmentStore();

    const currentUser = useAuthStore((state) => state.user);
    const currentUserId = currentUser?.id || currentUser?.Id || currentUser?._id || '';

    const [selectedUserToConfirm, setSelectedUserToConfirm] = useState(null);
    const [pendingRole, setPendingRole] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        mode: 'onTouched',
        defaultValues: {
            name: '',
            surname: '',
            username: '',
            email: '',
            phone: '',
            password: '',
            passwordConfirm: '',
            role: 'CLIENT',
        },
    });

    const passwordToConfirm = watch('password', '');

    const getUserId = (user) => user?.id || user?.Id || user?._id || '';

    const handleCloseModal = () => {
        setSelectedUserToConfirm(null);
        setPendingRole('');
    };

    const handleRoleSelect = async (user, selectedRole) => {
        const roleValue = (selectedRole || '').toString().trim().toUpperCase();
        const currentRole = (user?.role || '').toString().trim().toUpperCase();
        if (!user || !roleValue || roleValue === currentRole) return;

        const userId = getUserId(user);
        if (!userId) {
            toast.error('No se pudo identificar el usuario');
            return;
        }

        const response = await fetchUserById(userId);
        if (!response.success) {
            toast.error(response.error);
            return;
        }

        setSelectedUserToConfirm(response.user || user);
        setPendingRole(roleValue);
    };

    const handleConfirmRoleChange = async () => {
        if (!selectedUserToConfirm || !pendingRole) return;
        setIsSubmitting(true);

        const userId = getUserId(selectedUserToConfirm);
        const response = await updateUserRole(userId, pendingRole);

        if (response.success) {
            toast.success('Rol actualizado correctamente');
            await fetchUsers(undefined, { force: true });
            handleCloseModal();
        } else {
            toast.error(response.error);
        }

        setIsSubmitting(false);
    };

    const openCreateUserModal = () => {
        setIsCreateUserModalOpen(true);
    };

    const closeCreateUserModal = () => {
        setIsCreateUserModalOpen(false);
        reset();
    };

    const handleCreateUserSubmit = async (formData) => {
        const payload = {
            name: formData.name.trim(),
            surname: formData.surname.trim(),
            username: formData.username.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            password: formData.password,
        };

        const role = formData.role || 'CLIENT';

        const response = await createUser(payload, role);
        if (response.success) {
            toast.success(response.message || 'Usuario creado correctamente');
            reset();
            closeCreateUserModal();
            setPage(1);
            await fetchUsers(undefined, { force: true });
        } else {
            toast.error(response.error);
        }
    };

    useEffect(() => {
        fetchUsers(undefined, { force: true });
    }, [fetchUsers]);

    useEffect(() => {
        if (error) {
            notyfError(error);
        }
    }, [error]);

    const { filteredUsers, paginatedUsers, totalPages, currentPage } = useMemo(() => {
        const result = getFilteredUsers();
        return {
            filteredUsers: result.filteredUsers,
            paginatedUsers: result.paginatedUsers,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
        };
    }, [getFilteredUsers, users, filters, page, pageSize]);

    const roleOptions = [
        { value: 'ALL', label: 'Todos los roles' },
        { value: 'PLATFORM_ADMIN', label: 'Admin Plataforma' },
        { value: 'RESTAURANT_ADMIN', label: 'Admin Restaurante' },
        { value: 'CLIENT', label: 'Cliente' },
    ];

    if (loading && users.length === 0) {
        return (
            <div className="p-6">
                <p className="text-[#2C4035]">Cargando usuarios...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div>
                    <Typography variant="h3" className="text-[#1A1A1A]">Usuarios</Typography>
                    <Typography variant="small" className="text-[#2C4035]">
                        Administra el listado de usuarios registrados.
                    </Typography>
                </div>
                <Button
                    size="sm"
                    onClick={openCreateUserModal}
                    className="bg-[#2D4F4F] text-white rounded-md hover:bg-[#23342b] shadow-none"
                >
                    + Crear usuario
                </Button>
            </div>

            <div className="mb-6 rounded-xl border border-stone-200 bg-[#2C4035] p-5 shadow-lg">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
                    <div>
                        <Typography variant="small" className="mb-2 font-medium tracking-wide text-stone-300">
                            Buscar usuarios
                        </Typography>
                        <input
                            value={filters.search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar por nombre, username o email..."
                            className="w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 shadow-sm outline-none transition focus:border-[#2C4035] focus:ring-2 focus:ring-[#2C4035]/20"
                        />
                    </div>

                    <div>
                        <Typography variant="small" className="mb-2 font-medium tracking-wide text-stone-300">
                            Filtrar por rol
                        </Typography>
                        <select
                            value={filters.role}
                            onChange={(event) => setRoleFilter(event.target.value)}
                            className="w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 shadow-sm outline-none transition focus:border-[#2C4035] focus:ring-2 focus:ring-[#2C4035]/20"
                        >
                            <option value="ALL">Todos los roles</option>
                            {roleOptions
                                .filter((role) => role.value !== 'ALL')
                                .map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>
            </div>

            <Card className="bg-gradient-to-b from-white to-[#F8F5F0] border border-[#E2D4B7] shadow-[0_16px_34px_rgba(26,26,26,0.08)] rounded-xl overflow-hidden">
                <CardHeader floated={false} shadow={false} className="bg-transparent m-0 rounded-none border-b border-[#E2D4B7] px-5 py-4">
                    <Typography variant="h6" className="text-[#1A1A1A]">
                        Lista de usuarios
                    </Typography>
                </CardHeader>

                <CardBody className="px-0 py-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-[#1A1A1A]">
                            <thead>
                                <tr className="text-[#2C4035] uppercase tracking-wide text-xs">
                                    <th className="p-4 text-left font-semibold">Nombre</th>
                                    <th className="p-4 text-left font-semibold">Email</th>
                                    <th className="p-4 text-left font-semibold">Rol actual</th>
                                    <th className="p-4 text-left font-semibold">Fecha de creación</th>
                                    <th className="p-4 text-left font-semibold">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td className="p-6 text-center text-[#2C4035]" colSpan={5}>
                                            No hay usuarios para mostrar.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user) => {
                                        const currentRole = normalizeRole(user.role);
                                        const isPlatformAdminUser = currentRole === 'PLATFORM_ADMIN';
                                        const userId = getUserId(user);
                                        const isDisabled = isPlatformAdminUser && userId !== currentUserId;

                                        return (
                                            <tr key={userId || user.email || Math.random()} className="border-t border-[#E2D4B7] hover:bg-[#F8F5F0]/70 transition-colors duration-200">
                                                <td className="p-4">
                                                    <Typography variant="small" className="font-semibold text-[#1A1A1A]">
                                                        {[user.name, user.surname].filter(Boolean).join(' ') || '-'}
                                                    </Typography>
                                                </td>
                                                <td className="p-4 text-[#1A1A1A]">{user.email || '-'}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-2">
                                                        <select
                                                            value={currentRole || 'CLIENT'}
                                                            onChange={(event) => handleRoleSelect(user, event.target.value)}
                                                            disabled={isDisabled}
                                                            title={isDisabled ? 'Solo el propio Admin Global puede cambiar su rol' : ''}
                                                            className="w-full rounded-md border border-stone-300 bg-[#FDFBF7] px-3 py-2 text-sm text-[#2C4035] shadow-sm outline-none transition focus:border-[#2C4035] focus:ring-2 focus:ring-[#2D4F4F]/20 disabled:cursor-not-allowed disabled:bg-stone-100"
                                                        >
                                                            <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
                                                            <option value="RESTAURANT_ADMIN">RESTAURANT_ADMIN</option>
                                                            <option value="CLIENT">CLIENT</option>
                                                        </select>
                                                        {isDisabled && (
                                                            <span className="text-xs text-[#8A7A63]">Solo el propio Admin Global puede cambiar su rol</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-[#1A1A1A]">{formatDate(user.createdAt)}</td>
                                                <td className="p-4">
                                                    <Chip
                                                        value={user.status ? 'Activo' : 'Inactivo'}
                                                        className={user.status ? 'inline-flex bg-[#2C4035] text-white' : 'inline-flex bg-[#C87A55] text-white'}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>

            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                <p className="text-xs text-[#2C4035]">
                    Mostrando {(currentPage - 1) * pageSize + (paginatedUsers.length ? 1 : 0)} - {(currentPage - 1) * pageSize + paginatedUsers.length} de {filteredUsers.length}
                </p>

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                        disabled={currentPage === 1}
                        className="bg-white border border-[#E2D4B7] text-[#2C4035] rounded-md hover:bg-[#F8F5F0] transition-colors duration-200 disabled:opacity-60 shadow-none"
                    >
                        Anterior
                    </Button>

                    <span className="px-2 py-1.5 text-sm text-[#2C4035]">
                        {currentPage} / {totalPages}
                    </span>

                    <Button
                        size="sm"
                        onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-white border border-[#E2D4B7] text-[#2C4035] rounded-md hover:bg-[#F8F5F0] transition-colors duration-200 disabled:opacity-60 shadow-none"
                    >
                        Siguiente
                    </Button>
                </div>
            </div>

            <Modal
                isOpen={!!selectedUserToConfirm}
                onClose={handleCloseModal}
                title="Confirmar cambio de rol"
                maxWidth="max-w-lg"
            >
                <div className="space-y-4">
                    <p className="text-sm text-[#2C4035]">
                        ¿Cambiar el rol de <strong>{[selectedUserToConfirm?.name, selectedUserToConfirm?.surname].filter(Boolean).join(' ') || selectedUserToConfirm?.email || 'usuario'}</strong>
                        {' '}de <strong>{selectedUserToConfirm ? normalizeRole(selectedUserToConfirm.role) : ''}</strong> a <strong>{pendingRole}</strong>?
                    </p>
                    <div className="flex flex-col gap-2 rounded-lg border border-[#E2D4B7] bg-[#FBF8F2] p-4">
                        <div className="text-sm text-[#5A5146]"><span className="font-semibold text-[#2D4F4F]">Email:</span> {selectedUserToConfirm?.email || '-'}</div>
                        <div className="text-sm text-[#5A5146]"><span className="font-semibold text-[#2D4F4F]">Estado:</span> {selectedUserToConfirm?.status ? 'Activo' : 'Inactivo'}</div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-[#2C4035] hover:bg-stone-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmRoleChange}
                            disabled={isSubmitting}
                            className="rounded-md bg-[#2D4F4F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3A6B6B] transition disabled:opacity-60"
                        >
                            {isSubmitting ? 'Guardando...' : 'Confirmar cambio'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isCreateUserModalOpen}
                onClose={closeCreateUserModal}
                title="Crear nuevo usuario"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSubmit(handleCreateUserSubmit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <AuthInput
                            id="name"
                            label="Nombre"
                            type="text"
                            placeholder="Nombre"
                            register={register}
                            rules={{
                                required: 'El nombre es obligatorio',
                                minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                            }}
                            error={errors.name}
                            autoComplete="given-name"
                        />
                        <AuthInput
                            id="surname"
                            label="Apellido"
                            type="text"
                            placeholder="Apellido"
                            register={register}
                            rules={{
                                required: 'El apellido es obligatorio',
                                minLength: { value: 2, message: 'El apellido debe tener al menos 2 caracteres' },
                            }}
                            error={errors.surname}
                            autoComplete="family-name"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <AuthInput
                            id="username"
                            label="Usuario"
                            type="text"
                            placeholder="usuario123"
                            register={register}
                            rules={{
                                required: 'El usuario es obligatorio',
                                minLength: { value: 3, message: 'El usuario debe tener al menos 3 caracteres' },
                            }}
                            error={errors.username}
                            autoComplete="username"
                        />
                        <AuthInput
                            id="email"
                            label="Email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            register={register}
                            rules={{
                                required: 'El email es obligatorio',
                                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Ingresa un email válido' },
                            }}
                            error={errors.email}
                            autoComplete="email"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <AuthInput
                            id="phone"
                            label="Teléfono"
                            type="text"
                            placeholder="22345678"
                            register={register}
                            rules={{
                                required: 'El teléfono es obligatorio',
                                pattern: { value: /^[0-9]{8}$/, message: 'El teléfono debe tener 8 dígitos' },
                            }}
                            error={errors.phone}
                            autoComplete="tel"
                        />
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-[#1A1A1A] mb-1">
                                Rol
                            </label>
                            <select
                                id="role"
                                {...register('role')}
                                className="w-full px-3 py-2 text-sm text-[#1A1A1A] bg-[#F8F5F0] placeholder:text-[#6b6b6b] border border-[#c9b898] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C4035] focus:border-transparent transition-all duration-200"
                            >
                                <option value="CLIENT">CLIENT</option>
                                <option value="RESTAURANT_ADMIN">RESTAURANT_ADMIN</option>
                                <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <AuthInput
                            id="password"
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            register={register}
                            rules={{
                                required: 'La contraseña es obligatoria',
                                minLength: { value: 8, message: 'La contraseña debe tener al menos 8 caracteres' },
                            }}
                            error={errors.password}
                            autoComplete="new-password"
                        />
                        <AuthInput
                            id="passwordConfirm"
                            label="Confirmar contraseña"
                            type="password"
                            placeholder="••••••••"
                            register={register}
                            rules={{
                                required: 'Confirma la contraseña',
                                validate: (value) =>
                                    value === passwordToConfirm || 'Las contraseñas no coinciden',
                            }}
                            error={errors.passwordConfirm}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={closeCreateUserModal}
                            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-[#2C4035] hover:bg-stone-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={creatingUser}
                            className="rounded-md bg-[#2D4F4F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3A6B6B] transition disabled:opacity-60"
                        >
                            {creatingUser ? 'Creando...' : 'Crear usuario'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};