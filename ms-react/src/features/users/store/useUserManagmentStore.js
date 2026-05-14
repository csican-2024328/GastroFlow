import { create } from 'zustand';
import { getUsers } from '../../../shared/api/users.js';

const normalizeRole = (role) => (role || '').toString().trim().toUpperCase();

export const useUserManagmentStore = create((set, get) => ({
    users: [],
    loading: false,
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
