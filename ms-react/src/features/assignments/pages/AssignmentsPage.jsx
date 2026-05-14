import { useEffect, useState } from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore.js';

export const AssignmentsPage = () => {
  const { platformAdmins, restaurants, loading, fetchAllData } = useAssignmentStore();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const getAdminId = (admin) => admin?.Id || admin?.id || admin?._id || admin?.userId || '';
  const getAdminFirstName = (admin) => admin?.Name || admin?.name || admin?.firstName || admin?.username || '';
  const getAdminLastName = (admin) => admin?.Surname || admin?.surname || admin?.lastName || '';
  const getAdminEmail = (admin) => admin?.Email || admin?.email || admin?.userEmail || '';
  const getRestaurantName = (restaurant) => restaurant?.name || restaurant?.nombre || '';
  const getRestaurantCity = (restaurant) => restaurant?.city || restaurant?.ciudad || '';

  const assignments = platformAdmins.map(admin => {
    const adminId = getAdminId(admin);
    const assignedRestaurant = restaurants.find(r => r.adminId === adminId || r.adminId === admin?.Id || r.adminId === admin?.id);
    return {
      admin,
      restaurant: assignedRestaurant || null
    };
  });

  // Filtrar asignaciones
  const filteredAssignments = assignments.filter(item => {
    const adminName = `${getAdminFirstName(item.admin)} ${getAdminLastName(item.admin)}`.trim().toLowerCase();
    const restaurantName = getRestaurantName(item.restaurant).toLowerCase() || '';
    const searchTerm = filter.toLowerCase();
    return adminName.includes(searchTerm) || restaurantName.includes(searchTerm);
  });

  const assignedCount = assignments.filter(item => item.restaurant).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D4F4F] mx-auto mb-4"></div>
          <p className="text-[#5A5146]">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-[#2D4F4F]">Asignaciones de Restaurantes</h1>
          <p className="text-[#5A5146] mt-1">Control de administradores asignados a restaurantes</p>
        </div>
        <div className="text-sm text-[#5A5146]">
          Total asignaciones: {assignedCount}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre de admin o restaurante..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 border border-[#E8D4B8] rounded-lg bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-[#2D4F4F] focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E8D4B8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5EFEA] border-b border-[#E8D4B8]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D4F4F]">Administrador</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D4F4F]">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D4F4F]">Restaurante Asignado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D4F4F]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D4B8]">
              {filteredAssignments.map((item, index) => (
                <tr key={item.admin.Id || index} className="hover:bg-[#F9F7F3]">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#2D4F4F] flex items-center justify-center text-white font-semibold mr-3">
                        {item.admin.Name?.[0]}{item.admin.Surname?.[0]}
                      </div>
                      <div>
                        <div className="font-medium text-[#2D4F4F]">
                          {getAdminFirstName(item.admin) || getAdminEmail(item.admin) || getAdminId(item.admin)} {getAdminLastName(item.admin)}
                        </div>
                        <div className="text-sm text-[#5A5146]">ID: {getAdminId(item.admin)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#5A5146]">
                    {getAdminEmail(item.admin)}
                  </td>
                  <td className="px-6 py-4">
                    {item.restaurant ? (
                      <div>
                        <div className="font-medium text-[#2D4F4F]">{getRestaurantName(item.restaurant)}</div>
                        <div className="text-sm text-[#5A5146]">{getRestaurantCity(item.restaurant)}</div>
                      </div>
                    ) : (
                      <span className="text-[#D1574F] font-medium">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.restaurant
                        ? 'bg-[#69A77F] text-white'
                        : 'bg-[#FFF5E6] text-[#C87A55]'
                    }`}>
                      {item.restaurant ? 'Asignado' : 'Sin asignar'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#5A5146]">No se encontraron asignaciones</p>
          </div>
        )}
      </div>
    </div>
  );
};
