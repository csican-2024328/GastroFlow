import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { useOrderStore } from '../../features/orders/store/useOrderStore.js';
import { useRestaurantStore } from '../../features/restaurants/store/useRestaurantStore.js';
import { ProfileModal } from '../../features/auth/components/ProfileModal.jsx';

export const ClientPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

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
        { label: 'Ofertas', icon: '🔥', path: '/cliente/pedidos/hacer' },
      ],
    },
    {
      group: 'Cuenta',
      items: [
        { label: 'Favoritos', icon: '❤️', path: '/cliente' },
        { label: 'Direcciones', icon: '📍', path: '/cliente' },
        { label: 'Configuracion', icon: '⚙️', path: '/cliente' },
      ],
    },
  ];

  const currentTitle = useMemo(() => {
    if (location.pathname.includes('/hacer')) return 'Hacer pedido';
    if (location.pathname.includes('/mis')) return 'Mis pedidos';
    return 'Inicio';
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3D2C1E]">
      <aside className="border-r border-[#E8D9C4] bg-white md:fixed md:inset-y-0 md:w-[220px]">
        <div className="flex h-full flex-col px-4 py-5">
          <div className="pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#3D2C1E]">GastroFlow</h1>
            <p className="text-xs text-[#B59070]">Client Dashboard</p>
          </div>

          <div className="space-y-5">
            {navItems.map((group) => (
              <section key={group.group}>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[#B59070]">
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
                            ? 'bg-[#F5EDE0] text-[#C49A2B]'
                            : 'text-[#8A7060] hover:bg-[#F5EDE0]'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        {item.badge && (
                          <span className="rounded-full bg-[#C49A2B] px-2 py-[2px] text-[10px] font-bold text-white">
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

          <div className="mt-auto rounded-2xl border border-[#E8D9C4] bg-[#FAF7F2] p-3">
            <p className="font-semibold text-[#3D2C1E]">{user?.name || 'Cliente'}</p>
            <p className="text-xs text-[#8A7060]">@{user?.username || 'usuario'}</p>
            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-xl border border-[#E8D9C4] px-3 py-2 text-sm font-semibold text-[#8A7060] hover:bg-[#F5EDE0]"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </aside>

      <main className="space-y-5 px-4 py-5 md:ml-[220px] md:px-7 md:py-7">
        <section className="flex flex-col gap-3 rounded-2xl border border-[#E8D9C4] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-[#3D2C1E]">{currentTitle}</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar restaurantes..."
              className="w-56 rounded-xl border border-[#E8D9C4] bg-[#FAF7F2] px-3 py-2 text-sm text-[#3D2C1E] outline-none placeholder:text-[#B59070] focus:border-[#C49A2B]"
            />
            <button className="relative rounded-xl border border-[#E8D9C4] bg-[#FAF7F2] px-3 py-2 text-lg">
              🔔
              <span className="absolute -right-1 -top-1 rounded-full bg-[#C49A2B] px-[6px] text-[10px] font-bold text-white">
                {stats.activeOrders}
              </span>
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E8D9C4] bg-white p-5">
          <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="text-sm font-semibold text-[#B59070]">{greeting}</p>
              <h3 className="mt-1 text-2xl font-bold text-[#3D2C1E]">{user?.name || 'Cliente'}</h3>
              <div className="mt-3 space-y-1 text-sm text-[#8A7060]">
                <p>✉️ {user?.email || 'sin email'}</p>
                <p>👤 {user?.username || 'sin username'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-[#E8D9C4] bg-[#FAF7F2] p-3">
                <p className="text-[11px] uppercase tracking-wide text-[#B59070]">Pedidos</p>
                <p className="mt-1 text-xl font-bold text-[#3D2C1E]">{stats.totalOrders}</p>
              </div>
              <div className="rounded-xl border border-[#E8D9C4] bg-[#FAF7F2] p-3">
                <p className="text-[11px] uppercase tracking-wide text-[#B59070]">Favoritos</p>
                <p className="mt-1 text-xl font-bold text-[#3D2C1E]">{stats.favoritos}</p>
              </div>
              <div className="rounded-xl border border-[#E8D9C4] bg-[#FAF7F2] p-3">
                <p className="text-[11px] uppercase tracking-wide text-[#B59070]">Rating</p>
                <p className="mt-1 text-xl font-bold text-[#3D2C1E]">{stats.rating}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E8D9C4] bg-white px-4 py-3">
          {stats.activeOrders > 0 ? (
            <div className="rounded-xl border border-[#E8D9C4] bg-[#F5EDE0] px-4 py-3 text-sm font-medium text-[#3D2C1E]">
              Pedido activo en curso: {stats.activeOrders} pedido(s) en preparacion.
            </div>
          ) : (
            <div className="rounded-xl border border-[#E8D9C4] bg-[#FAF7F2] px-4 py-3 text-sm text-[#8A7060]">
              No tienes pedidos activos en este momento.
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-3 text-lg font-semibold text-[#3D2C1E]">Restaurantes destacados</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredRestaurants.slice(0, 9).map((restaurant) => (
              <article
                key={restaurant._id}
                className="rounded-2xl border border-[#E8D9C4] bg-white p-4 transition hover:bg-[#FBF8F3]"
              >
                <div className="mb-3 h-24 rounded-xl bg-[#F5EDE0]" />
                <h4 className="truncate font-semibold text-[#3D2C1E]">{restaurant.name}</h4>
                <p className="mt-1 text-sm text-[#8A7060]">{restaurant.category || 'Cocina de autor'}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-[#B59070]">
                  <span>⏱️ 25-35 min</span>
                  <span>⭐ 4.8</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <ProfileModal />
    </div>
  );
};
