import { Navbar } from "./Navbar.jsx"
import { Sidebar } from "./Sidebar.jsx"
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getUsers } from '../../../shared/api/users.js'
import { ProfileModal } from '../../../features/auth/components/ProfileModal.jsx'

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

  const [userPage, setUserPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const usersPerPage = 10

  const filteredUsers = users.filter((u) => {
    const matchSearch = (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const indexOfLastUser = userPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage)

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col text-[#1A1A1A]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 bg-[#F8F5F0]">
          {showWelcome ? (
            <div className="w-full h-full">
              <section className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#E2D4B7] p-4 rounded border border-[#d8c8a6]">
                    <p className="text-xs text-[#1A1A1A]">Restaurantes</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">12</p>
                    <p className="text-sm text-[#2C4035]">2 este mes</p>
                  </div>
                  <div className="bg-[#E2D4B7] p-4 rounded border border-[#d8c8a6]">
                    <p className="text-xs text-[#1A1A1A]">Pedidos hoy</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">348</p>
                    <p className="text-sm text-[#2C4035]">+18% vs ayer</p>
                  </div>
                  <div className="bg-[#E2D4B7] p-4 rounded border border-[#d8c8a6]">
                    <p className="text-xs text-[#1A1A1A]">Mesas activas</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">87</p>
                    <p className="text-sm text-[#2C4035]">de 124 totales</p>
                  </div>
                  <div className="bg-[#E2D4B7] p-4 rounded border border-[#d8c8a6]">
                    <p className="text-xs text-[#1A1A1A]">Ingresos hoy</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">Q 14,280</p>
                    <p className="text-sm text-[#C87A55]">-4% vs ayer</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-[#E2D4B7] rounded p-4 border border-[#d8c8a6]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-[#1A1A1A]">Pedidos recientes</h3>
                      <button className="text-sm text-[#F8F5F0] bg-[#2C4035] px-3 py-1 rounded hover:bg-[#24362d]">Ver todos</button>
                    </div>
                    <table className="w-full text-sm text-left text-[#1A1A1A]">
                      <thead>
                        <tr className="text-[#1A1A1A]">
                          <th className="py-2">#</th>
                          <th>Restaurante</th>
                          <th>Mesa</th>
                          <th>Total</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody className="text-[#1A1A1A]">
                        <tr className="border-t border-[#d8c8a6]">
                          <td className="py-2">#4821</td>
                          <td>El Rincón</td>
                          <td>Mesa 4</td>
                          <td>Q 280</td>
                          <td><span className="px-2 py-1 bg-[#2C4035] text-[#F8F5F0] rounded text-xs">Entregado</span></td>
                        </tr>
                        <tr className="border-t border-[#d8c8a6]">
                          <td className="py-2">#4820</td>
                          <td>La Fogata</td>
                          <td>Mesa 7</td>
                          <td>Q 145</td>
                          <td><span className="px-2 py-1 bg-[#C87A55] text-[#F8F5F0] rounded text-xs">En cocina</span></td>
                        </tr>
                        <tr className="border-t border-[#d8c8a6]">
                          <td className="py-2">#4819</td>
                          <td>Sabor GT</td>
                          <td>Mesa 2</td>
                          <td>Q 390</td>
                          <td><span className="px-2 py-1 bg-[#2C4035] text-[#F8F5F0] rounded text-xs">Entregado</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-span-1 space-y-4">
                    <div className="bg-[#E2D4B7] rounded p-4 border border-[#d8c8a6]">
                      <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">Ocupación por restaurante</h4>
                      <ul className="text-sm text-[#1A1A1A] space-y-2">
                        <li className="flex justify-between"><span>El Rincón</span><span className="text-[#2C4035]">88%</span></li>
                        <li className="flex justify-between"><span>La Fogata</span><span className="text-[#2C4035]">72%</span></li>
                        <li className="flex justify-between"><span>Sabor GT</span><span className="text-[#2C4035]">55%</span></li>
                      </ul>
                    </div>

                    <div className="bg-[#E2D4B7] rounded p-4 border border-[#d8c8a6]">
                      <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">Actividad reciente</h4>
                      <ul className="text-sm text-[#1A1A1A] space-y-2">
                        <li>• Nueva reserva confirmada — El Rincón (hace 3 min)</li>
                        <li>• Cupón PROMO10 aplicado — La Fogata (hace 11 min)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-[#E2D4B7] rounded p-4 border border-[#d8c8a6]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <h3 className="text-base font-bold text-[#1A1A1A]">Usuarios registrados</h3>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-[#2C4035] opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Buscar usuario o email..." 
                          className="w-full pl-9 pr-4 py-2 bg-white border border-[#d8c8a6] rounded-lg text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C4035] focus:border-transparent transition-all shadow-sm"
                          value={searchTerm}
                          onChange={(e) => { setSearchTerm(e.target.value); setUserPage(1); }}
                        />
                      </div>
                      
                      <div className="relative w-full sm:w-48">
                        <select 
                          className="w-full appearance-none pl-4 pr-10 py-2 bg-white border border-[#d8c8a6] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2C4035] focus:border-transparent transition-all shadow-sm cursor-pointer"
                          value={roleFilter}
                          onChange={(e) => { setRoleFilter(e.target.value); setUserPage(1); }}
                        >
                          <option value="ALL">Todos los roles</option>
                          <option value="PLATFORM_ADMIN">Platform Admin</option>
                          <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
                          <option value="CLIENT">Client</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-4 w-4 text-[#2C4035] opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <table className="w-full text-sm text-left text-[#1A1A1A]">
                    <thead>
                      <tr className="text-[#1A1A1A]">
                        <th className="py-2">Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#1A1A1A]">
                      {currentUsers && currentUsers.length > 0 ? (
                        currentUsers.map((u) => (
                          <tr key={u.id} className="border-t border-[#d8c8a6]">
                            <td className="py-2">{u.username}</td>
                            <td>{u.email}</td>
                            <td><span className="text-[#2C4035]">{u.role}</span></td>
                            <td>{u.status ? <span className="px-2 py-1 bg-[#2C4035] text-[#F8F5F0] rounded text-xs">Activo</span> : <span className="px-2 py-1 bg-[#C87A55] text-[#F8F5F0] rounded text-xs">Inactivo</span>}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t border-[#d8c8a6]">
                          <td colSpan="4" className="py-4 text-[#4b4b4b]">{loadingUsers ? 'Cargando usuarios...' : 'No hay usuarios registrados aún.'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {totalUserPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                      {Array.from({ length: totalUserPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setUserPage(page)}
                          className={`px-3 py-1 rounded text-sm ${userPage === page ? 'bg-[#2C4035] text-white' : 'bg-white text-[#2C4035] border border-[#d8c8a6] hover:bg-[#F8F5F0]'}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  )}

                  {!loadingUsers && filteredUsers.length === 0 && users.length > 0 && (
                    <p className="text-[#4b4b4b] text-xs mt-2 text-center">No hay resultados para la búsqueda actual.</p>
                  )}
                  {!loadingUsers && users.length === 0 && (
                    <p className="text-[#4b4b4b] text-xs mt-2">Los nuevos usuarios aparecerán aquí automáticamente</p>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <ProfileModal />
    </div>
  )
}
