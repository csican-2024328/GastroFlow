import { create } from 'zustand';
import { getUsers, getUserById, updateUserRole, createUser } from '../../../shared/api/users.js';

const normalizeRole = (role) => (role || '').toString().trim().toUpperCase();

export const useUserManagmentStore = create((set, get) => ({
    users: [],
    loading: false,
    creatingUser: false,
    error: null,
    filters: {
        search: '',
        role: 'ALL',
    },
    page: 1,
    pageSize: 8,

    setSearch: (search) => set((state) => ({
        filters: { ...state.filters, search },
        page: 1
    })),
    setRoleFilter: (role) => set((state) => ({
        filters: { ...state.filters, role },
        page: 1
    })),
    setPage: (page) => set({ page }),
    setUsers: (users) => set({ users }),

    fetchUsers: async (apiFn = getUsers, options = {}) => {
        const { force = false } = options;
        const state = get();

        if (state.loading) return { success: true, users: state.users };
        if (!force && state.users.length > 0) return { success: true, users: state.users };

        set({ loading: true, error: null });

        try {
            const fetcher = typeof apiFn === 'function' ? apiFn : getUsers;
            const response = await fetcher();
            const users = response?.data?.data || [];

            set({ users, loading: false });
            return { success: true, users };
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Error al cargar usuarios';
            set({ error: message, loading: false, users: [] });
            return { success: false, error: message };
        }
    },

    fetchUserById: async (userId) => {
        try {
            const response = await getUserById(userId);
            return { success: true, user: response?.data?.data || null };
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Error al cargar usuario';
            return { success: false, error: message };
        }
    },

    updateUserRole: async (userId, role) => {
        try {
            const response = await updateUserRole(userId, role);
            const updatedUser = response?.data?.data || null;

            set((state) => ({
                users: state.users.map((user) =>
                    (user.id === userId || user.Id === userId || user._id === userId)
                        ? { ...user, role }
                        : user
                ),
            }));

            return { success: true, user: updatedUser };
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Error al actualizar el rol';
            return { success: false, error: message };
        }
    },

    createUser: async (userData, role = 'CLIENT') => {
        try {
            set({ creatingUser: true, error: null });
            const response = await createUser({ ...userData, role });
            const newUser = response?.data?.data || response?.data?.user || null;

            if (!newUser) {
                throw new Error('No se pudo crear el usuario');
            }

            set((state) => ({
                users: [newUser, ...state.users],
                creatingUser: false,
            }));

            return {
                success: true,
                user: newUser,
                message: response?.data?.message || 'Usuario creado exitosamente',
            };
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Error al crear el usuario';
            set({ creatingUser: false, error: message });
            return { success: false, error: message };
        }
    },

    getFilteredUsers: () => {
        const { users, filters, pageSize, page } = get();
        const normalizedSearch = (filters.search || '').trim().toLowerCase();
        const roleFilter = normalizeRole(filters.role);

        const filteredUsers = users.filter((user) => {
            const fullName = `${user.name || ''} ${user.surname || ''}`.trim().toLowerCase();
            const username = (user.username || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const role = normalizeRole(user.role);

            const matchesSearch =
                !normalizedSearch ||
                fullName.includes(normalizedSearch) ||
                username.includes(normalizedSearch) ||
                email.includes(normalizedSearch);

            const matchesRole = roleFilter === 'ALL' || role === roleFilter;

            return matchesSearch && matchesRole;
        });

        const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
        const currentPage = Math.min(page, totalPages);
        const start = (currentPage - 1) * pageSize;

        return {
            filteredUsers,
            paginatedUsers: filteredUsers.slice(start, start + pageSize),
            totalPages,
            currentPage,
        };
    },

}));
