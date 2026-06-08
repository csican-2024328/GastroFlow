import { useEffect, useMemo, useState, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { useOrderStore } from '../../features/orders/store/useOrderStore.js';
import { useRestaurantStore } from '../../features/restaurants/store/useRestaurantStore.js';
import { ProfileModal } from '../../features/auth/components/ProfileModal.jsx';
import defaultAvatar from '../../assets/img/Icono.png';
import { io } from 'socket.io-client';
import { axiosClient } from '../../shared/api/api.js';

export const ClientPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const openProfileModal = useAuthStore((state) => state.openProfileModal);

  const orders = useOrderStore((s) => s.orders);
  const fetchClientOrders = useOrderStore((s) => s.fetchClientOrders);
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchClientOrders(1, 8);
  }, [token, fetchClientOrders]);

  useEffect(() => {
    fetchRestaurants(1, 12);
  }, [fetchRestaurants]);

  // Socket for client notifications
  useEffect(() => {
    if (!user || !token) return undefined;

    const socket = io(getSocketUrl(), { transports: ['websocket'], withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      try {
        const clientId = user._id || user.id || user.sub;
        if (clientId) socket.emit('join-client', clientId);
      } catch (err) {
        // ignore
      }
    });

    const handleIncoming = (payload) => {
      const notif = {
        _id: `evt-${Date.now()}`,
        type: payload.type || 'EVENT',
        message: payload.message || 'Notificación',
        data: payload.data || {},
        isRead: false,
        createdAt: payload.timestamp || new Date().toISOString(),
      };
      setNotifications((cur) => [notif, ...cur].slice(0, 20));
      setUnreadCount((c) => c + 1);
    };

    socket.on('cambio-estado-pedido', handleIncoming);
    socket.on('cambio-estado-reserva', handleIncoming);

    // initial fetch
    fetchNotifications();

    return () => {
      try {
        socket.off('cambio-estado-pedido', handleIncoming);
        socket.off('cambio-estado-reserva', handleIncoming);
        socket.disconnect();
      } catch (err) {
        // ignore
      }
    };
  }, [user, token]);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Buenos dias' : currentHour < 19 ? 'Buenas tardes' : 'Buenas noches';

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter((order) =>
      ['EN_PREPARACION', 'LISTO'].includes(order.estado)
    ).length;

    return {
      totalOrders,
      activeOrders,
      favoritos: Math.max(1, Math.min(restaurants.length, 8)),
      rating: 4.9,
    };
  }, [orders, restaurants.length]);

  const filteredRestaurants = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return restaurants;

    return restaurants.filter((restaurant) => {
      const name = String(restaurant.name || '').toLowerCase();
      const category = String(restaurant.category || '').toLowerCase();
      return name.includes(term) || category.includes(term);
    });
  }, [restaurants, search]);

  const navItems = [
    {
      group: 'Principal',
      items: [
        { label: 'Inicio', icon: '🏠', path: '/cliente' },
        { label: 'Hacer pedido', icon: '🍽️', path: '/cliente/pedidos/hacer' },
        {
          label: 'Mis pedidos',
          icon: '📦',
          path: '/cliente/pedidos/mis',
          badge: stats.activeOrders > 0 ? String(stats.activeOrders) : null,
        },
        { label: 'Mis reseñas', icon: '⭐', path: '/cliente/resenas' },
        { label: 'Reservaciones', icon: '🪑', path: '/cliente/reservaciones' },
          { label: 'Cupones', icon: '🏷️', path: '/cliente/cupones' },
        { label: 'Ofertas y Eventos', icon: '🎉', path: '/cliente/eventos' },
      ],
    },
  ];

  const currentTitle = useMemo(() => {
    if (location.pathname.includes('/hacer')) return 'Hacer pedido';
    if (location.pathname.includes('/mis')) return 'Mis pedidos';
    if (location.pathname.includes('/resenas')) return 'Mis reseñas';
    if (location.pathname.includes('/cupones')) return 'Cupones';
    return 'Inicio';
  }, [location.pathname]);

  const isClientHome = location.pathname === '/cliente' || location.pathname === '/cliente/';

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const avatarSrc = [user?.profilePicture, user?.profileImage].find(
    (value) => typeof value === 'string' && value.trim() !== ''
  ) || defaultAvatar;

  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const getSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3006/api/v1';
    return import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/v1\/?$/, '');
  };

  const fetchNotifications = async () => {
    try {
      const res = await axiosClient.get('/notifications', { params: { page: 1, limit: 8 } });
      if (res?.data?.success) {
        setNotifications(res.data.data || []);
        const unread = (res.data.data || []).filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      // silent
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosClient.patch(`/notifications/${id}/read`);
      setNotifications((cur) => cur.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date() } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await axiosClient.patch('/notifications/read-all');
      setNotifications((cur) => cur.map((n) => ({ ...n, isRead: true, readAt: new Date() })));
      setUnreadCount(0);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0a08] text-[#f5ede0]">
      <aside className="border-r border-[#2f2218] bg-[#111009] md:fixed md:inset-y-0 md:w-[220px]">
        <div className="flex h-full flex-col px-4 py-5">
          <div className="pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#f5ede0]">GastroFlow</h1>
          </div>

          <div className="space-y-5">
            {navItems.map((group) => (
              <section key={group.group}>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[#c9a66a]">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                          isActive
                            ? 'bg-gradient-to-r from-[#c88c28] to-[#9a6a18] text-[#0a0a08] shadow-[0_8px_18px_rgba(0,0,0,0.35)]'
                            : 'text-[#cbb9a1] hover:bg-[#1a1a14] hover:text-[#f5ede0]'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        {item.badge && (
                          <span className="rounded-full bg-[#c88c28] px-2 py-[2px] text-[10px] font-bold text-[#0a0a08]">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-auto rounded-2xl border border-[#2f2218] bg-[#0e0d0a] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3">
              <img
                src={avatarSrc}
                alt="Perfil"
                className="h-12 w-12 rounded-full border-2 border-[#c88c28] bg-[#111009] object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = defaultAvatar;
                }}
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#f5ede0]">{user?.name || 'Cliente'}</p>
                <p className="truncate text-xs text-[#b8a48a]">@{user?.username || 'usuario'}</p>
              </div>
            </div>
            <button
              onClick={() => openProfileModal(true)}
              className="mt-3 w-full rounded-xl border border-[#c88c28] bg-[#111009] px-3 py-2 text-sm font-semibold text-[#f5ede0] hover:bg-[#1a1a14]"
            >
              Editar perfil
            </button>
            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-xl border border-[#2f2218] px-3 py-2 text-sm font-semibold text-[#cbb9a1] hover:bg-[#1a1a14] hover:text-[#f5ede0]"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </aside>

      <main className="space-y-5 px-4 py-5 md:ml-[220px] md:px-7 md:py-7">
        <section className="flex flex-col gap-3 rounded-2xl border border-[#2f2218] bg-[#111009] px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.28)] md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-[#f5ede0]">{currentTitle}</h2>
          <div className="relative flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar restaurantes..."
              className="w-56 rounded-xl border border-[#2f2218] bg-[#0e0d0a] px-3 py-2 text-sm text-[#f5ede0] outline-none placeholder:text-[#8e7a63] focus:border-[#c88c28]"
            />
            <button
              onClick={() => {
                setShowNotifications((s) => !s);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative rounded-xl border border-[#2f2218] bg-[#0e0d0a] px-3 py-2 text-lg"
            >
              🔔
              <span className="absolute -right-1 -top-1 rounded-full bg-[#c88c28] px-[6px] text-[10px] font-bold text-[#0a0a08]">
                {unreadCount || stats.activeOrders}
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-[#2f2218] bg-[#111009] p-3 shadow-[0_16px_30px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between mb-2">
                  <strong>Notificaciones</strong>
                  <button onClick={markAllRead} className="text-xs text-[#c9a66a]">Marcar todas como leídas</button>
                </div>
                <div className="max-h-64 overflow-auto">
                  {notifications.length === 0 && (
                    <p className="text-sm text-[#b8a48a]">No hay notificaciones</p>
                  )}
                  {notifications.map((n) => (
                    <div key={n._id} className={`mb-2 flex items-start gap-2 rounded p-2 ${n.isRead ? 'bg-[#0e0d0a]' : 'bg-[#1a1a14]'}`}>
                      <div className="flex-1">
                        <div className="text-sm text-[#f5ede0]">{n.message}</div>
                        <div className="text-xs text-[#8e7a63]">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n._id)} className="text-xs text-[#c9a66a]">Marcar</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {isClientHome ? (
          <>
            <section className="rounded-2xl border border-[#2f2218] bg-[#111009] p-5 shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
              <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
                <div>
                  <p className="text-sm font-semibold text-[#c9a66a]">{greeting}</p>
                  <h3 className="mt-1 text-2xl font-bold text-[#f5ede0]">{user?.name || 'Cliente'}</h3>
                  <div className="mt-3 space-y-1 text-sm text-[#b8a48a]">
                    <p>✉️ {user?.email || 'sin email'}</p>
                    <p>👤 {user?.username || 'sin username'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-[#2f2218] bg-[#0e0d0a] p-3">
                    <p className="text-[11px] uppercase tracking-wide text-[#c9a66a]">Pedidos</p>
                    <p className="mt-1 text-xl font-bold text-[#f5ede0]">{stats.totalOrders}</p>
                  </div>
                  <div className="rounded-xl border border-[#2f2218] bg-[#0e0d0a] p-3">
                    <p className="text-[11px] uppercase tracking-wide text-[#c9a66a]">Favoritos</p>
                    <p className="mt-1 text-xl font-bold text-[#f5ede0]">{stats.favoritos}</p>
                  </div>
                  <div className="rounded-xl border border-[#2f2218] bg-[#0e0d0a] p-3">
                    <p className="text-[11px] uppercase tracking-wide text-[#c9a66a]">Rating</p>
                    <p className="mt-1 text-xl font-bold text-[#f5ede0]">{stats.rating}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#2f2218] bg-[#111009] px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
              {stats.activeOrders > 0 ? (
                <div className="rounded-xl border border-[#2f2218] bg-[#1a1a14] px-4 py-3 text-sm font-medium text-[#f5ede0]">
                  Pedido activo en curso: {stats.activeOrders} pedido(s) en preparacion.
                </div>
              ) : (
                <div className="rounded-xl border border-[#2f2218] bg-[#0e0d0a] px-4 py-3 text-sm text-[#b8a48a]">
                  No tienes pedidos activos en este momento.
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-3 text-lg font-semibold text-[#f5ede0]">Restaurantes destacados</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredRestaurants.slice(0, 9).map((restaurant) => (
                  <article
                    key={restaurant._id}
                    className="overflow-hidden rounded-2xl border border-[#2f2218] bg-[#111009] transition hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.4)]"
                  >
                    <div className="h-36 bg-[#0e0d0a]">
                      {restaurant.photos && restaurant.photos.length > 0 ? (
                        <img
                          src={restaurant.photos[0]}
                          alt={restaurant.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl">🍽️</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="truncate font-semibold text-[#f5ede0]">{restaurant.name}</h4>
                      <p className="mt-1 text-sm text-[#b8a48a]">{restaurant.category || 'Cocina de autor'}</p>
                      <p className="mt-2 truncate text-xs text-[#c9a66a]">📍 {restaurant.address || 'Dirección no disponible'}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-[#b8a48a]">
                        <span>⏱️ 25-35 min</span>
                        <span>⭐ 4.8</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="space-y-5">
            <Outlet />
          </div>
        )}
      </main>

      <ProfileModal />
    </div>
  );
};
