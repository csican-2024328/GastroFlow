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
  { label: 'Reseñas', to: '/restaurant-dashboard/resenas' }
];

export const RestaurantSidebar = () => {
  const location = useLocation();

  return (
    <aside className="min-h-[calc(100vh-4rem)] w-64 border-r border-[#c88c28]/10 bg-[#0d0d0b] p-4 text-white overflow-y-auto custom-scrollbar">
      <div className="mb-6 rounded-2xl border border-[#c88c28]/10 bg-[#c88c28]/5 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c88c28]/80 mb-1">Tu Restaurante</p>
        <p className="text-[11px] text-[#f5ede0]/40 leading-relaxed">Gestión operativa local</p>
      </div>

      <ul className="space-y-1.5">
        {items.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active 
                    ? 'bg-gradient-to-r from-[#c88c28] to-[#9a6a18] text-[#0a0a08] shadow-lg shadow-[#c88c28]/10' 
                    : 'text-[#f5ede0]/60 hover:text-[#f5ede0] hover:bg-[#c88c28]/10'
                }`}
              >
                <span className="flex-1">{item.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a08]" />}
                {!active && <span className="w-1 h-1 rounded-full bg-[#c88c28]/0 group-hover:bg-[#c88c28]/40 transition-colors" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
