import React from 'react';
import { useInventoryAuditStore } from '../store/useInventoryAuditStore.js';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

export const AuditTable = () => {
  const { movements, loading, pagination, setPage, fetchMovements, fetchMovementDetail, filters } = useInventoryAuditStore();
  const userRole = useAuthStore((state) => state.user?.role);
  const userRestaurantId = useAuthStore((state) => state.user?.restaurantId);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const restId = userRole === 'PLATFORM_ADMIN' ? filters.restaurantId : userRestaurantId;
    fetchMovements(restId);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando movimientos...</div>;
  }

  if (!movements || movements.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        No se encontraron movimientos en el inventario.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
              {userRole === 'PLATFORM_ADMIN' && (
                 <th className="px-6 py-4 text-sm font-semibold text-gray-600">Restaurante</th>
              )}
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Insumo</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tipo</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Cantidad</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movements.map((mov) => (
              <tr 
                key={mov._id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => fetchMovementDetail(mov._id)}
              >
                <td className="px-6 py-4 text-sm text-gray-600">
                  {mov.createdAt ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(mov.createdAt)) : 'N/A'}
                </td>
                {userRole === 'PLATFORM_ADMIN' && (
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {mov.restaurantId?.nombre || mov.restaurantId?.name || 'Desconocido'}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                  {mov.inventoryId?.nombre || 'Desconocido'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    mov.tipo === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {mov.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                  {mov.cantidad} {mov.inventoryId?.unidadMedida || ''}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[150px]" title={mov.userId}>
                  {mov.userId || 'Sistema'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Página {pagination.currentPage} de {pagination.totalPages} ({pagination.total} registros)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
