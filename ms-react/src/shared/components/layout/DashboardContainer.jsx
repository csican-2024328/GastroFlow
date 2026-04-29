import { Navbar } from "./Navbar.jsx"
import { Sidebar } from "./Sidebar.jsx"
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getUsers } from '../../../shared/api/users.js'

export const DashboardContainer = () => {
  const location = useLocation()
  const showWelcome = location.pathname === '/dashboard'
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true)
        setUsersError(null)
        const res = await getUsers()
        if (res?.data?.success) {
          setUsers(res.data.data || [])
        } else {
          setUsers([])
          setUsersError(res?.data?.message || 'No fue posible obtener usuarios')
        }
      } catch (err) {
        setUsers([])
        setUsersError(err?.response?.data?.message || err.message || 'Error al obtener usuarios')
      } finally {
        setLoadingUsers(false)
      }
    }

    if (showWelcome) {
      fetchUsers()
    }
  }, [showWelcome])

  return (
    <div className="min-h-screen bg-[#0D2818] flex flex-col text-[#F0EDE8]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 bg-[#112D1C]">
          {showWelcome ? (
            <div className="w-full h-full">
              <section className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#0F452A] p-4 rounded border border-[#113a26]">
                    <p className="text-xs text-[#C4A882]">Restaurantes</p>
                    <p className="text-2xl font-bold text-[#F0EDE8]">12</p>
                    <p className="text-sm text-[#7A9E85]">2 este mes</p>
                  </div>
                  <div className="bg-[#0F452A] p-4 rounded border border-[#113a26]">
                    <p className="text-xs text-[#C4A882]">Pedidos hoy</p>
                    <p className="text-2xl font-bold text-[#F0EDE8]">348</p>
                    <p className="text-sm text-[#7A9E85]">+18% vs ayer</p>
                  </div>
                  <div className="bg-[#0F452A] p-4 rounded border border-[#113a26]">
                    <p className="text-xs text-[#C4A882]">Mesas activas</p>
                    <p className="text-2xl font-bold text-[#F0EDE8]">87</p>
                    <p className="text-sm text-[#7A9E85]">de 124 totales</p>
                  </div>
                  <div className="bg-[#0F452A] p-4 rounded border border-[#113a26]">
                    <p className="text-xs text-[#C4A882]">Ingresos hoy</p>
                    <p className="text-2xl font-bold text-[#F0EDE8]">Q 14,280</p>
                    <p className="text-sm text-red-500">-4% vs ayer</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-[#0F452A] rounded p-4 border border-[#113a26]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-[#F0EDE8]">Pedidos recientes</h3>
                      <button className="text-sm text-[#C4A882] px-3 py-1 rounded hover:bg-[#112D1C]">Ver todos</button>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-[#C4A882]">
                          <th className="py-2">#</th>
                          <th>Restaurante</th>
                          <th>Mesa</th>
                          <th>Total</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody className="text-[#F0EDE8]">
                        <tr className="border-t border-[#113a26]">
                          <td className="py-2">#4821</td>
                          <td>El Rincón</td>
                          <td>Mesa 4</td>
                          <td>Q 280</td>
                          <td><span className="px-2 py-1 bg-green-700 rounded text-xs">Entregado</span></td>
                        </tr>
                        <tr className="border-t border-[#113a26]">
                          <td className="py-2">#4820</td>
                          <td>La Fogata</td>
                          <td>Mesa 7</td>
                          <td>Q 145</td>
                          <td><span className="px-2 py-1 bg-yellow-600 rounded text-xs">En cocina</span></td>
                        </tr>
                        <tr className="border-t border-[#113a26]">
                          <td className="py-2">#4819</td>
                          <td>Sabor GT</td>
                          <td>Mesa 2</td>
                          <td>Q 390</td>
                          <td><span className="px-2 py-1 bg-green-700 rounded text-xs">Entregado</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-span-1 space-y-4">
                    <div className="bg-[#0F452A] rounded p-4 border border-[#113a26]">
                      <h4 className="text-sm font-semibold text-[#F0EDE8] mb-2">Ocupación por restaurante</h4>
                      <ul className="text-sm text-[#C4A882] space-y-2">
                        <li className="flex justify-between"><span>El Rincón</span><span className="text-[#F0EDE8]">88%</span></li>
                        <li className="flex justify-between"><span>La Fogata</span><span className="text-[#F0EDE8]">72%</span></li>
                        <li className="flex justify-between"><span>Sabor GT</span><span className="text-[#F0EDE8]">55%</span></li>
                      </ul>
                    </div>

                    <div className="bg-[#0F452A] rounded p-4 border border-[#113a26]">
                      <h4 className="text-sm font-semibold text-[#F0EDE8] mb-2">Actividad reciente</h4>
                      <ul className="text-sm text-[#C4A882] space-y-2">
                        <li>• Nueva reserva confirmada — El Rincón (hace 3 min)</li>
                        <li>• Cupón PROMO10 aplicado — La Fogata (hace 11 min)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0F452A] rounded p-4 border border-[#113a26]">
                  <h3 className="text-sm font-semibold text-[#F0EDE8] mb-3">Usuarios registrados</h3>
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-[#C4A882]">
                        <th className="py-2">Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#F0EDE8]">
                      {users && users.length > 0 ? (
                        users.map((u) => (
                          <tr key={u.id} className="border-t border-[#113a26]">
                            <td className="py-2">{u.username}</td>
                            <td>{u.email}</td>
                            <td><span className="text-[#4CAF50]">{u.role}</span></td>
                            <td>{u.status ? <span className="px-2 py-1 bg-green-700 rounded text-xs">Activo</span> : <span className="px-2 py-1 bg-gray-600 rounded text-xs">Inactivo</span>}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t border-[#113a26]">
                          <td colSpan="4" className="py-4 text-[#7A9E85]">No hay usuarios registrados aún.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <p className="text-[#7A9E85] text-xs mt-2">Los nuevos usuarios aparecerán aquí automáticamente</p>
                </div>
              </section>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}
