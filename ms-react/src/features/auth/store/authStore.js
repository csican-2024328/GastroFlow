import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginRequest, refreshToken as refreshTokenRequest } from '../../../shared/api/auth.js';

const REFRESH_BUFFER_MS = 60 * 1000;
let refreshTimeoutId = null;
let refreshInFlightPromise = null;

const clearRefreshTimer = () => {
  if (refreshTimeoutId) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }
};

const decodeTokenExpMs = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const parsed = JSON.parse(atob(paddedPayload));

    return parsed?.exp ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
};

const resolveExpiryMs = (token, expiresAt) => {
  const tokenExpMs = decodeTokenExpMs(token);
  if (tokenExpMs) return tokenExpMs;

  if (expiresAt) {
    const fallbackMs = new Date(expiresAt).getTime();
    return Number.isNaN(fallbackMs) ? null : fallbackMs;
  }

  return null;
};

const scheduleRefresh = () => {
  clearRefreshTimer();

  const state = useAuthStore.getState();
  const expiryMs = resolveExpiryMs(state.token, state.expiresAt);
  if (!state.token || !expiryMs) return;

  const delay = Math.max(expiryMs - Date.now() - REFRESH_BUFFER_MS, 1000);

  refreshTimeoutId = setTimeout(async () => {
    try {
      const currentToken = useAuthStore.getState().token;
      if (!currentToken) return;

      const { data } = await refreshTokenRequest(currentToken);
      const newExpiryMs = resolveExpiryMs(data?.token, null);

      useAuthStore.setState({
        token: data?.token,
        expiresAt: newExpiryMs ? new Date(newExpiryMs).toISOString() : useAuthStore.getState().expiresAt,
      });

      scheduleRefresh();
    } catch {
      useAuthStore.getState().logout();
    }
  }, delay);
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      logout: () => {
        clearRefreshTimer();
        refreshInFlightPromise = null;
        set({
          user: null,
          token: null,
          expiresAt: null,
          error: null,
          loading: false,
          isAuthenticated: false,
        });
      },

      refreshSession: async () => {
        if (refreshInFlightPromise) {
          return refreshInFlightPromise;
        }

        const currentToken = get().token;
        if (!currentToken) return null;

        refreshInFlightPromise = (async () => {
          try {
            const { data } = await refreshTokenRequest(currentToken);
            const nextToken = data?.token;
            const nextExpiryMs = resolveExpiryMs(nextToken, null);

            set({
              token: nextToken,
              expiresAt: nextExpiryMs ? new Date(nextExpiryMs).toISOString() : get().expiresAt,
            });

            scheduleRefresh();
            return nextToken;
          } catch {
            get().logout();
            return null;
          } finally {
            refreshInFlightPromise = null;
          }
        })();

        return refreshInFlightPromise;
      },

      ensureFreshToken: async () => {
        const { token, expiresAt } = get();
        if (!token) return null;

        const expiryMs = resolveExpiryMs(token, expiresAt);
        if (!expiryMs) return token;

        if (expiryMs - Date.now() <= REFRESH_BUFFER_MS) {
          return get().refreshSession();
        }

        return token;
      },

      login: async ({ emailOrUsername, password }) => {
        try {
          set({ loading: true, error: null });

          const { data } = await loginRequest({ emailOrUsername, password });

          set({
            user: data.userDetails,
            token: data.token,
            expiresAt: data.expiresAt,
            loading: false,
            isAuthenticated: true,
          });

          scheduleRefresh();

          return { success: true, data };
        } catch (error) {
          const message = error.response?.data?.message || 'Error de autenticación';

          set({
            error: message,
            loading: false,
            isAuthenticated: false,
          });

          return { success: false, error: message };
        }
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'gastroflow-auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          scheduleRefresh();
        }
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);