import { Link, useLocation } from 'react-router-dom';

const items = [
  { label: 'Dashboard', to: '/restaurant-dashboard' },
  { label: 'Pedidos', to: '/restaurant-dashboard/pedidos' },
  { label: 'Reservaciones', to: '/restaurant-dashboard/reservaciones' },
  { label: 'Mesas', to: '/restaurant-dashboard/mesas' },
  { label: 'Ingredientes', to: '/restaurant-dashboard/ingredientes' },
  { label: 'Inventario', to: '/restaurant-dashboard/inventario' },
  { label: 'Platos', to: '/restaurant-dashboard/platos' },
  { label: 'Menús', to: '/restaurant-dashboard/menus' },
  { label: 'Reportes', to: '/restaurant-dashboard/reportes' },
  { label: 'Cupones', to: '/restaurant-dashboard/cupones' },
  { label: 'Eventos', to: '/restaurant-dashboard/eventos' },
  { label: 'Facturas', to: '/restaurant-dashboard/facturas' },
];

export const RestaurantSidebar = () => {
  const location = useLocation();

  return (
    <aside className="min-h-[calc(100vh-4rem)] w-64 border-r border-[#1F3D3D] bg-[#234141] p-4 text-white">
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Panel restaurante</p>
        <p className="mt-1 text-sm text-white/90">Solo datos de tu restaurante asignado</p>
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition ${active ? 'bg-[#1A3A3A] text-white shadow-sm' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
