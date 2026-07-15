# ms-Android — Frontend Móvil (React Native / Expo)

Cliente móvil de GastroFlow. Consume los microservicios `gastroflow-postgres-service` (auth/users, puerto 3007) y `gastroflow-mongo-service` (dominio de negocio, puerto 3006) vía `EXPO_PUBLIC_AUTH_URL` / `EXPO_PUBLIC_API_URL`.

Stack: Expo ~55, React Native 0.83, React Navigation (native-stack + bottom-tabs), Zustand (+ persist con AsyncStorage), Axios, react-hook-form. **No usa Tailwind/NativeWind** — los estilos van con `StyleSheet.create` (a diferencia de `ms-react`, que sí usa Tailwind CSS).

> Antes de tocar APIs de Expo/React Native, revisar los docs versionados: https://docs.expo.dev/versions/v55.0.0/ (ver `AGENTS.md`).

## Arquitectura: Feature-Sliced Design (FSD)

```
src/
  features/<feature>/     # kebab-case, ej. auth, restaurants, dashboard, profile
    hooks/                # useXxx.js — lógica de datos/estado del feature
    screens/              # XxxScreen.jsx — pantallas conectadas a navegación
  navigation/              # AppNavigator, AuthStack, MainTabs (Xxx.jsx)
  shared/
    api/                  # apiClient.js (axios + interceptores), <domain>Client.js
    components/           # componentes reutilizables sin lógica de negocio
    constants/            # endpoints.js, theme.js (COLORS, SPACING, FONT_SIZE)
    hooks/                # hooks genéricos (useAppAlert, etc.)
    store/                # stores de Zustand (authStore.js, etc.)
    utils/                # funciones utilitarias puras
```

Cada feature es autocontenido (sus propios hooks/screens). `shared/` es solo para lo que usan 2+ features: cliente de Axios, componentes de UI comunes (modales, botones), utilidades.

## Nomenclatura

- **Carpetas**: inglés, minúsculas, kebab-case (`features/blood-inventory` style — ej. si se agrega un feature nuevo: `order-history`, no `OrderHistory` ni `order_history`).
- **Archivos de componentes/pantallas**: UpperCamelCase — `LoginScreen.jsx`, `DashboardScreen.jsx`, `Button.jsx`, `AppNavigator.jsx`.
- **Archivos de hooks**: excepción por convención de React — `useAuth.js`, `useRestaurants.js`, `useAppAlert.js` (camelCase con prefijo `use`, minúscula inicial). Esto es obligatorio para que el linter de reglas de hooks los reconozca; no forzar UpperCamelCase aquí.
- **Variables**: camelCase — `currentToken`, `isRefreshing`, `originalRequest`.
- **Funciones/métodos**: camelCase, iniciando con verbo — `handleLogin`, `handleRegister`, `getRestaurants`, `setToken`, `mapRestaurantToViewModel`. Prefijos usados en el código real: `get`, `set`, `handle`, `map`, `is`/`has` (booleanos: `isAuthenticated`, `isSecondary`).
- **Constantes globales**: UPPER_SNAKE_CASE — `ENDPOINTS`, `COLORS`, `QUICK_ACTIONS`.
- **Todo el código (identificadores, comentarios si los hay) en inglés**; los textos visibles al usuario (labels, mensajes de error) están en español porque la app es para usuarios hispanohablantes — mantener esa separación.

## Patrones observados en el código existente

- Los hooks de feature encapsulan `loading`/`error`/`data` + una función de acción (`useAuth`, `useRestaurants`) y devuelven un objeto plano.
- `apiClient.js` centraliza baseURL, token desde `authStore` (via `getState()`, no hooks, para uso fuera de componentes) y refresh-token con cola de reintentos (`isRefreshing`/`failedQueue`).
- Los stores de Zustand usan `persist` + `createJSONStorage(() => AsyncStorage)` y exponen un flag `_hasHydrated` para bloquear la navegación hasta hidratar el estado (ver `AppNavigator.jsx`).
- Screens que listan datos remotos: patrón `loading && !data.length ? <LoadingSpinner /> : error ? <EmptyState /> : <FlatList .../>`.
- Estilos siempre al final del archivo con `StyleSheet.create`, usando tokens de `shared/constants/theme.js` (`COLORS`, `SPACING`, `FONT_SIZE`) — nunca valores mágicos sueltos.

## Commits (Conventional Commits)

`tipo: descripción breve en minúsculas`. Prefijos: `feat`, `fix`, `perf`, `build`, `ci`, `docs`, `refactor`, `style`, `test`.
Ej.: `feat: agregar historial de pedidos a la pantalla de perfil`.
(Nota: el historial de este repo mezcla convenciones antiguas sin prefijo — para trabajo nuevo, seguir siempre el estándar Conventional Commits.)

## Flujo de PRs

Nunca push directo a `develop` o `main`. Todo feature/fix termina en un Pull Request hacia `develop` para revisión del equipo.
