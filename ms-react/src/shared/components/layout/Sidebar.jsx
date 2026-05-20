import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

export const Sidebar = () => {
    const location = useLocation();
    const userRole = useAuthStore((state) => (state.user?.role || '').toString().trim().toUpperCase());

    const items = [
        {label: "Mesas", to: "/dashboard/mesas"},
        {label: "Restaurantes", to: "/dashboard/restaurantes"},
        {label: "Ingredientes", to: "/dashboard/ingredientes"},
        {label: "Auditoría Inv.", to: "/dashboard/auditoria-inventario"},
        {label: "Platos", to: "/dashboard/platos"},
        {label: "Menús", to: "/dashboard/menus"},
        {label: "Pedidos", to: "/dashboard/pedidos"},
        {label: "Reservas", to: "/dashboard/reservas"},
        {label: "Facturas", to: "/dashboard/facturas"},
        {label: "Cupones", to: "/dashboard/cupones"},
        {label: "Eventos", to: "/dashboard/eventos"},
        {label: "Reseñas", to: "/dashboard/resenas"},
        {label: "Usuarios", to: "/dashboard/users", adminOnly: true},
        {label: "Asignacion", to: "/dashboard/asignacion"},
    ]
    return (
        <aside className='fixed left-0 top-16 w-64 bg-[#0d0d0b] border-r border-[#c88c28]/10 h-[calc(100vh-4rem)] p-4 overflow-y-auto custom-scrollbar z-40'>
        <div className="mb-6 px-4 py-3 rounded-2xl bg-[#c88c28]/5 border border-[#c88c28]/10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c88c28]/80 mb-1">Menú de Gestión</p>
            <p className="text-[11px] text-[#f5ede0]/40 leading-relaxed">Control centralizado del sistema GastroFlow</p>
        </div>

        <ul className='space-y-1.5'>
            {items.map((item) => {
                if (item.adminOnly && userRole !== 'PLATFORM_ADMIN') {
                    return null;
                }
                const active = location.pathname === item.to

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
                )
            })}
        </ul>
    </aside>
  )
}