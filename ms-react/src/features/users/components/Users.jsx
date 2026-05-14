import { useEffect, useMemo } from 'react';
import { Button, Card, CardBody, CardHeader, Chip, Typography } from '@material-tailwind/react';
import { notyfError } from '../../../shared/utils/notyf.js';
import { useUserManagmentStore } from '../store/useUserManagmentStore.js';

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
        setSearch,
        setRoleFilter,
        setPage,
        filters,
        page,
        pageSize,
        getFilteredUsers,
    } = useUserManagmentStore();

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
                                    <th className="p-4 text-left font-semibold">Username</th>
                                    <th className="p-4 text-left font-semibold">Email</th>
                                    <th className="p-4 text-left font-semibold">Rol</th>
                                    <th className="p-4 text-left font-semibold">Creado</th>
                                    <th className="p-4 text-left font-semibold">Estado</th>
                                    <th className="p-4 text-left font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td className="p-6 text-center text-[#2C4035]" colSpan={7}>
                                            No hay usuarios para mostrar.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <tr key={user.id} className="border-t border-[#E2D4B7] hover:bg-[#F8F5F0]/70 transition-colors duration-200">
                                            <td className="p-4">
                                                <Typography variant="small" className="font-semibold text-[#1A1A1A]">
                                                    {[user.name, user.surname].filter(Boolean).join(' ') || '-'}
                                                </Typography>
                                            </td>
                                            <td className="p-4 text-[#1A1A1A]">{user.username || '-'}</td>
                                            <td className="p-4 text-[#1A1A1A]">{user.email || '-'}</td>
                                            <td className="p-4">
                                                <Chip
                                                    value={getRoleLabel(user.role)}
                                                    className={normalizeRole(user.role) === 'PLATFORM_ADMIN' ? 'inline-flex bg-[#2C4035] text-white' : 'inline-flex bg-[#E2D4B7] text-[#1A1A1A]'}
                                                />
                                            </td>
                                            <td className="p-4 text-[#1A1A1A]">{formatDate(user.createdAt)}</td>
                                            <td className="p-4">
                                                <Chip
                                                    value={user.status ? 'Activo' : 'Inactivo'}
                                                    className={user.status ? 'inline-flex bg-[#2C4035] text-white' : 'inline-flex bg-[#C87A55] text-white'}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    type="button"
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-[#2C4035] text-white opacity-80 cursor-default"
                                                    onClick={() => { }}
                                                    title="Próximamente"
                                                >
                                                    Editar rol
                                                </button>
                                            </td>
                                        </tr>
                                    ))
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
        </div>
    );
};