import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

export const Sidebar = () => {
    const location = useLocation();
    const userRole = useAuthStore((state) => (state.user?.role || '').toString().trim().toUpperCase());

    const items = [
        {label: "Mesas", to: "/dashboard/mesas"},
        {label: "Restaurantes", to: "/dashboard/restaurantes"},
        {label: "Ingredientes", to: "/dashboard/ingredientes"},
        {label: "Platos", to: "/dashboard/platos"},
        {label: "Pedidos", to: "/dashboard/pedidos"},
        {label: "Reservas", to: "/dashboard/reservas"},
        {label: "Facturas", to: "/dashboard/facturas"},
        {label: "Cupones", to: "/dashboard/cupones"},
        {label: "Eventos", to: "/dashboard/eventos"},
        {label: "Reseñas", to: "/dashboard/resenas"},
        {label: "Usuarios", to: "/dashboard/Usuarios"},
        {label: "Asignacion", to: "/dashboard/asignacion"},
    ]
  return (
        <aside className='w-60 bg-[#2D4F4F] min-h-[calc(100vh-4rem)] p-4'>
        <ul className='space-y-2'>
            {items.map((item) => {
                if (item.adminOnly && userRole !== 'PLATFORM_ADMIN') {
                    return null;
                }
                const active = location.pathname === item.to

                return (
                    <li key={item.to}>
                        <Link
                            to={item.to}
                           className={`block px-4 py-2 rounded-lg font-medium transition-colors text-white ${active ? 'bg-[#1A3A3A]' : 'hover:bg-[#3A6B6B]'}`}
                            >
                                {item.label}
                        </Link>
                    </li>
                )
            })}
        </ul>
    </aside>
  )
}