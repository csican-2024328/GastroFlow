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
        {label: "Usuarios", to: "/dashboard/users", adminOnly: true},
        {label: "Cupones", to: "/dashboard/cupones"},
        {label: "Pedidos", to: "/dashboard/pedidos"},
        {label: "Reservas", to: "/dashboard/reservas"},
        {label: "Eventos", to: "/dashboard/eventos"},
        {label: "Reportes", to: "/dashboard/reportes"},
    ]
  return (
        <aside className='w-60 bg-[#1A1A1A] min-h-[calc(100vh-4rem)] p-4'>
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
                           className={`block px-4 py-2 rounded-lg font-medium transition-colors text-[#F8F5F0] ${active ? '' : 'hover:bg-[#2C4035] hover:text-[#F8F5F0]'}`}
                            style={active ? {fontWeight: 700, backgroundColor: '#2C4035', color: '#F8F5F0'} : {}}
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