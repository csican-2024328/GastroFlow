import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: ({ token, userDetails, expiresAt }) => {
        set({
          token,
          user: userDetails,
          expiresAt,
          isAuthenticated: true,
        });
      },

      setToken: (token, expiresAt) => set({ token, expiresAt: expiresAt ?? get().expiresAt }),

      setUser: (user) => set({ user }),

      logout: () => {
        set({
          token: null,
          user: null,
          expiresAt: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
