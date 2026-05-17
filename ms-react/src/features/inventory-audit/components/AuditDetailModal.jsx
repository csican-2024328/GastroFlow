import React from 'react';
import { useInventoryAuditStore } from '../store/useInventoryAuditStore.js';

export const AuditDetailModal = () => {
  const { selectedMovement, clearDetail, detailLoading } = useInventoryAuditStore();

  if (!selectedMovement && !detailLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <button 
          onClick={clearDetail}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-bold text-[#2D4F4F] mb-4">Detalle del Movimiento</h3>

        {detailLoading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-[#2D4F4F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">Insumo</p>
                <p className="font-semibold text-gray-800">
                  {selectedMovement.inventoryId?.nombre || 'Desconocido'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Restaurante</p>
                <p className="font-semibold text-gray-800">
                  {selectedMovement.restaurantId?.nombre || selectedMovement.restaurantId?.name || 'Desconocido'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Unidad</p>
                <p className="font-semibold text-gray-800">
                  {selectedMovement.inventoryId?.unidadMedida || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Tipo</p>
                <p className="font-semibold text-gray-800">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    selectedMovement.tipo === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedMovement.tipo}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Cantidad</p>
                <p className="font-semibold text-gray-800">
                  {selectedMovement.cantidad}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Motivo</p>
                <p className="font-semibold text-gray-800">
                  {selectedMovement.motivo || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Fecha</p>
                <p className="font-semibold text-gray-800">
                  {selectedMovement.createdAt ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(selectedMovement.createdAt)) : 'N/A'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500 font-medium">Usuario que registró</p>
                <p className="font-semibold text-gray-800 truncate">
                  {selectedMovement.userId || 'Sistema'}
                </p>
              </div>
              {selectedMovement.orderId && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 font-medium">Orden Relacionada</p>
                  <p className="font-semibold text-blue-600">
                    {selectedMovement.orderId.numeroOrden} ({selectedMovement.orderId.estado})
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={clearDetail}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
