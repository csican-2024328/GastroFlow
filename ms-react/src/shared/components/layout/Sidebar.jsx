import {Link, useLocation} from 'react-router-dom';

export const Sidebar = () => {
    const location = useLocation();

    const items = [
        {label: "Mesas", to: "/dashboard/mesas"},
        {label: "Restaurantes", to: "/dashboard/restaurantes"},
        {label: "Ingredientes", to: "/dashboard/ingredientes"},
        {label: "Platos", to: "/dashboard/platos"},
        {label: "Cupones", to: "/dashboard/cupones"},
        {label: "Pedidos", to: "/dashboard/pedidos"},
        {label: "Reservas", to: "/dashboard/reservas"},
        {label: "Eventos", to: "/dashboard/eventos"},
        {label: "Reportes", to: "/dashboard/reportes"},
        {label: "Usuarios", to: "/dashboard/Usuarios"},
    ]
  return (
        <aside className='w-60 bg-[#2D4F4F] min-h-[calc(100vh-4rem)] p-4'>
        <ul className='space-y-2'>
            {items.map((item) => {
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
