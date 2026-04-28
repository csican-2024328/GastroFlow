import {Link, useLocation} from 'react-router-dom';

export const Sidebar = () => {
    const location = useLocation();

    const items = [
        {label: "Mesas", to: "/dashboard/mesas"},
        {label: "Restaurantes", to: "/dashboard/restaurantes"},
        {label: "Cupones", to: "/dashboard/cupones"},
        {label: "Pedidos", to: "/dashboard/pedidos"},
        {label: "Reservas", to: "/dashboard/reservas"},
        {label: "Eventos", to: "/dashboard/eventos"},
        {label: "Reportes", to: "/dashboard/reportes"},
    ]
  return (
    <aside className='w-60 bg-[#0D2818] min-h-[calc(100vh-4rem)] p-4'>
        <ul className='space-y-2'>
            {items.map((item) => {
                const active = location.pathname === item.to

                return (
                    <li key={item.to}>
                        <Link
                            to={item.to}
                           className={`block px-4 py-2 rounded-lg font-medium transition-colors text-[#C4A882] ${active ? '' : 'hover:bg-[#112D1C] hover:text-[#F0EDE8]'}`}
                            style={active ? {fontWeight: 700, backgroundColor: '#112D1C', color: '#F0EDE8'} : {}}
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
