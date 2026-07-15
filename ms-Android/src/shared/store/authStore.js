import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Hermes no expone atob/Buffer globalmente, así que el payload del JWT
// (base64url) se decodifica a mano en vez de depender de esas APIs.
const base64UrlDecode = (input) => {
  let bits = 0;
  let buffer = 0;
  let output = '';

  for (const char of input.replace(/-/g, '+').replace(/_/g, '/')) {
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;

    buffer = (buffer << 6) | value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return decodeURIComponent(
    output
      .split('')
      .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
};

const decodeToken = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
};

const resolveExpiryMs = (token, expiresAt) => {
  const decoded = decodeToken(token);
  if (decoded?.exp) return decoded.exp * 1000;

  if (expiresAt) {
    const fallbackMs = new Date(expiresAt).getTime();
    return Number.isNaN(fallbackMs) ? null : fallbackMs;
  }

  return null;
};

// El refresh de token del backend solo devuelve un token nuevo, sin
// userDetails, así que estos claims son la única forma de mantener
// email/nombre/rol al día en el estado tras un refresh silencioso.
const mergeUserFromToken = (currentUser, token) => {
  const decoded = decodeToken(token);
  if (!decoded) return currentUser;

  return {
    ...currentUser,
    id: currentUser?.id ?? decoded.sub,
    email: decoded.email ?? currentUser?.email,
    name: decoded.name ?? currentUser?.name,
    role: decoded.role ?? currentUser?.role,
  };
};

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
        const expiryMs = resolveExpiryMs(token, expiresAt);
        set({
          token,
          user: mergeUserFromToken(userDetails, token),
          expiresAt: expiryMs ? new Date(expiryMs).toISOString() : expiresAt,
          isAuthenticated: true,
        });
      },

      setToken: (token, expiresAt) => {
        const expiryMs = resolveExpiryMs(token, expiresAt);
        set({
          token,
          expiresAt: expiryMs ? new Date(expiryMs).toISOString() : (expiresAt ?? get().expiresAt),
          user: mergeUserFromToken(get().user, token),
        });
      },

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
