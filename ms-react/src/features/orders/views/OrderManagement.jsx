import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { NoRestaurantAssigned } from '../../../shared/components/layout/NoRestaurantAssigned.jsx';
import {
  getOrders,
  updateOrderStatus,
  cancelOrder
} from '../../../shared/api/orderService.js';
import { getRestaurants } from '../../../shared/api/restaurantService.js';
import StatusBadge from '../../../shared/components/ui/StatusBadge.jsx';
import Modal from '../../../shared/components/ui/Modal.jsx';

const OrderManagement = () => {
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchRestaurants();
  }, [restaurantId]);

  if (isRestaurantAdmin && !hasRestaurantAssigned) {
    return <NoRestaurantAssigned />;
  }

  const fetchRestaurants = async () => {
    if (restaurantId) {
      return;
    }

    try {
      const res = await getRestaurants();
      const list = res?.data?.data || res?.data || [];
      setRestaurants(list);
    } catch (_) {}
  };

  // Busca el nombre del restaurante por su _id
  const getRestaurantName = (restaurantID) => {
    if (!restaurantID) return '-';
    // Si ya viene populado con nombre
    if (restaurantID?.nombre) return restaurantID.nombre;
    if (restaurantID?.name)   return restaurantID.name;
    // Si solo viene el _id, buscar en la lista local
    const id = restaurantID?._id || restaurantID;
    const found = restaurants.find(r => (r._id || r.id) === id);
    return found?.nombre || found?.name || '-';
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders({ restaurantID: restaurantId || undefined, restaurantId: restaurantId || undefined });
      setOrders(res?.data?.data || res?.data || []);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      setStatusLoading(true);
      await updateOrderStatus(selectedOrder._id, newStatus);
      toast.success('Estado actualizado correctamente');
      setIsStatusModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Está seguro de cancelar este pedido?')) return;
    try {
      await cancelOrder(orderId);
      toast.success('Pedido cancelado');
      fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cancelar el pedido');
    }
  };

  const formatFecha = (val) => {
    const d = new Date(val);
    return isNaN(d) ? '-' : d.toLocaleString('es-ES');
  };

  const VALID_TRANSITIONS = {
    // PENDIENTE puede ir a EN_PREPARACION o CANCELADO
    'PENDIENTE': ['EN_PREPARACION', 'CANCELADO'],
    
    // EN_PREPARACION depende del tipo de pedido
    'EN_PREPARACION': (tipoPedido) => {
      if (tipoPedido === 'A_DOMICILIO') {
        return ['ENTREGADO_AL_REPARTIDOR', 'CANCELADO'];
      }
      // EN_MESA y PARA_LLEVAR
      return ['LISTO', 'CANCELADO'];
    },
    
    // LISTO solo para EN_MESA y PARA_LLEVAR - no editable después
    'LISTO': [],
    
    // ENTREGADO_AL_REPARTIDOR solo para A_DOMICILIO
    'ENTREGADO_AL_REPARTIDOR': ['ENTREGADO', 'CANCELADO'],
    
    // ENTREGADO - no editable
    'ENTREGADO': [],
    
    // CANCELADO - no editable
    'CANCELADO': []
  };

  const getStatusOptions = (estadoActual, tipoPedido) => {
    const transitions = VALID_TRANSITIONS[estadoActual];
    if (!transitions) return [];
    if (typeof transitions === 'function') {
      return transitions(tipoPedido) || [];
    }
    return transitions;
  };

  const statusLabel = {
    'PENDIENTE': 'Pendiente',
    'EN_PREPARACION': 'En Preparación',
    'LISTO': 'Listo',
    'ENTREGADO_AL_REPARTIDOR': 'Entregado al Repartidor',
    'ENTREGADO': 'Entregado',
    'CANCELADO': 'Cancelado'
  };

  return (
    <div className="p-6 min-h-screen bg-[#FDFBF7]">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FAF9F6]">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
          {!(isRestaurantAdmin && hasRestaurantAssigned) ? (
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
              </svg>
              Filtrar
            </button>
          ) : null}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#FAF9F6] text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Número</th>
                <th className="px-6 py-4">Restaurante</th>
                <th className="px-6 py-4">Mesa</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">Cargando pedidos...</td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order, index) => {
                  const estado = order.estado;
                  const isCompleted = estado === 'ENTREGADO' || estado === 'CANCELADO';
                  const mesaNumero = order.mesaID?.numero ?? order.mesaID?.number ?? '-';

                  return (
                    <tr key={order._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{order.numeroOrden || '-'}</td>
                      <td className="px-6 py-4">{getRestaurantName(order.restaurantID)}</td>
                      <td className="px-6 py-4">{mesaNumero}</td>
                      <td className="px-6 py-4">{order.clienteNombre || 'Cliente General'}</td>
                      <td className="px-6 py-4">${Number(order.total || 0).toFixed(2)}</td>
                      <td className="px-6 py-4"><StatusBadge status={estado} /></td>
                      <td className="px-6 py-4">{formatFecha(order.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">

                          {/* Ver factura */}
                          <button
                            onClick={() => { setSelectedOrder(order); setIsDetailModalOpen(true); }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 border border-gray-200 rounded transition"
                            title="Ver detalles de factura"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                          </button>

                          {/* Editar estado */}
                          <button
                            onClick={() => {
                              const opciones = getStatusOptions(estado, order.tipoPedido);
                              setSelectedOrder(order);
                              setNewStatus(opciones[0] || '');
                              setIsStatusModalOpen(true);
                            }}
                            disabled={isCompleted || getStatusOptions(estado, order.tipoPedido).length === 0}
                            className={`p-1.5 border border-gray-200 rounded transition ${isCompleted || getStatusOptions(estado, order.tipoPedido).length === 0 ? 'opacity-40 cursor-not-allowed text-gray-300' : 'text-gray-500 hover:text-[#2D4F4F]'}`}
                            title={isCompleted ? 'No se puede cambiar estado' : 'Cambiar estado'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5h-2.25A2.25 2.25 0 0 0 13.5 6.75v10.5m0 0H6a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 6 4.5h2.25A2.25 2.25 0 0 1 10.5 6.75v10.5" />
                            </svg>
                          </button>

                          {/* Cancelar */}
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={isCompleted}
                            className={`p-1.5 border border-gray-200 rounded transition ${isCompleted ? 'opacity-40 cursor-not-allowed text-gray-300' : 'text-gray-500 hover:text-red-600'}`}
                            title={isCompleted ? 'No se puede cancelar' : 'Cancelar pedido'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">No hay pedidos disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-[#FAF9F6]">
          <span>Mostrando 1 a {Math.min(10, orders.length)} de {orders.length} pedidos</span>
          <div className="flex items-center gap-2">
            <span>Registros por página</span>
            <select className="border border-gray-300 rounded px-2 py-1 bg-white">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modal: Ver Factura */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalle de Factura"
        maxWidth="max-w-2xl"
      >
        {selectedOrder ? (
          <div className="space-y-6">

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Número de Pedido</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedOrder.numeroOrden || '-'}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Restaurante</p>
                  <p className="text-lg font-semibold text-gray-800">{getRestaurantName(selectedOrder.restaurantID)}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Mesa</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedOrder.mesaID?.numero ?? selectedOrder.mesaID?.number ?? '-'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Cliente</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedOrder.clienteNombre || 'Cliente General'}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Tipo de Pedido</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedOrder.tipoPedido === 'EN_MESA' && '🍽️ En Mesa'}
                    {selectedOrder.tipoPedido === 'A_DOMICILIO' && '🏠 A Domicilio'}
                    {selectedOrder.tipoPedido === 'PARA_LLEVAR' && '📦 Para Llevar'}
                  </p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha</p>
                  <p className="text-lg font-semibold text-gray-800">{formatFecha(selectedOrder.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estado</p>
                <StatusBadge status={selectedOrder.estado} />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Método de Pago</p>
                <p className="text-sm font-medium text-gray-700">{selectedOrder.metodoPago || 'PENDIENTE'}</p>
              </div>
            </div>

            {selectedOrder.items?.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Ítems del Pedido</p>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-700 font-semibold">Plato</th>
                      <th className="px-3 py-2 text-center text-gray-700 font-semibold">Cant.</th>
                      <th className="px-3 py-2 text-right text-gray-700 font-semibold">P. Unit.</th>
                      <th className="px-3 py-2 text-right text-gray-700 font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => {
                      const nombre = item.nombre
                        || item.plato?.nombre || item.plato?.name
                        || item.menu?.nombre  || item.menu?.name
                        || 'N/A';
                      const precioUnit = item.precioUnitario || 0;
                      const cantidad = item.cantidad || 1;
                      const subtotalItem = item.subtotal || (precioUnit * cantidad);
                      return (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="px-3 py-2 text-gray-800">{nombre}</td>
                          <td className="px-3 py-2 text-center text-gray-800">{cantidad}</td>
                          <td className="px-3 py-2 text-right text-gray-800">${Number(precioUnit).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-800">${Number(subtotalItem).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Desglose de Factura</p>
              <div className="space-y-2 bg-gray-50 p-4 rounded">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Impuesto</span>
                  <span className="font-medium">${Number(selectedOrder.impuesto || 0).toFixed(2)}</span>
                </div>
                {Number(selectedOrder.descuento) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descuento</span>
                    <span className="font-medium text-green-600">-${Number(selectedOrder.descuento).toFixed(2)}</span>
                  </div>
                )}
                {Number(selectedOrder.descuentoPorCoupon) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cupón {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}</span>
                    <span className="font-medium text-green-600">-${Number(selectedOrder.descuentoPorCoupon).toFixed(2)}</span>
                  </div>
                )}
                {Number(selectedOrder.descuentoPorEvento) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descuento por Evento</span>
                    <span className="font-medium text-green-600">-${Number(selectedOrder.descuentoPorEvento).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Propina</span>
                  <span className="font-medium">${Number(selectedOrder.propina || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cargos Extra</span>
                  <span className="font-medium">${Number(selectedOrder.cargosExtra || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-base">
                  <span>TOTAL</span>
                  <span className="text-[#2D4F4F]">${Number(selectedOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2 bg-[#2D4F4F] text-white rounded-md hover:bg-[#3A6B6B] transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Pedido no encontrado</p>
        )}
      </Modal>

      {/* Modal: Cambiar Estado */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Editar Estado del Pedido - Pedido #${selectedOrder?.numeroOrden}`}
        maxWidth="max-w-2xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            
            {/* 1. RESUMEN DEL PEDIDO */}
            <div className="border-l-4 border-[#2D4F4F] pl-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">1. Resumen del Pedido</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pedido:</p>
                  <p className="font-semibold text-gray-800">#{selectedOrder.numeroOrden}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tipo de Pedido:</p>
                  <p className="font-semibold text-gray-800">
                    {selectedOrder.tipoPedido === 'EN_MESA' && '🍽️ EN_MESA'}
                    {selectedOrder.tipoPedido === 'A_DOMICILIO' && '🏠 A_DOMICILIO'}
                    {selectedOrder.tipoPedido === 'PARA_LLEVAR' && '📦 PARA_LLEVAR'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Restaurante:</p>
                  <p className="font-semibold text-gray-800">{getRestaurantName(selectedOrder.restaurantID)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ubicación:</p>
                  <p className="font-semibold text-gray-800">
                    {selectedOrder.mesaID?.numero ?? selectedOrder.mesaID?.number ?? 'Mesa ' + (selectedOrder.mesaID?.numero || '-')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cliente:</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.clienteNombre || 'Cliente General'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total:</p>
                  <p className="font-semibold text-gray-800">${Number(selectedOrder.total || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Resumen de items */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Productos:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedOrder.items?.map((item, idx) => {
                    const nombre = item.nombre || item.plato?.nombre || item.plato?.name || item.menu?.nombre || item.menu?.name || 'N/A';
                    const cantidad = item.cantidad || 1;
                    return (
                      <p key={idx} className="text-xs text-gray-700">
                        {idx + 1}. {nombre} x{cantidad}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. PROGRESIÓN DE ESTADO */}
            <div className="border-l-4 border-orange-400 pl-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">2. Progresión de Estado ({selectedOrder.tipoPedido})</p>
              
              {selectedOrder.tipoPedido === 'EN_MESA' && (
                <div className="flex items-center justify-start gap-4">
                  <div className={`flex flex-col items-center ${selectedOrder.estado === 'PENDIENTE' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-lg">📋</div>
                    <p className="text-xs mt-1 font-semibold">PENDIENTE</p>
                    <p className="text-xs text-gray-500">Estado actual</p>
                  </div>
                  <div className="flex-1 h-1 bg-gradient-to-r from-orange-400 to-gray-300"></div>
                  <div className={`flex flex-col items-center ${selectedOrder.estado === 'EN_PREPARACION' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-lg">🍳</div>
                    <p className="text-xs mt-1 font-semibold">EN_PREPARACION</p>
                    <p className="text-xs text-gray-500">Siguiente estado</p>
                  </div>
                  <div className={`flex-1 h-1 ${selectedOrder.estado === 'LISTO' || selectedOrder.estado === 'EN_PREPARACION' ? 'bg-gradient-to-r from-orange-400 to-gray-300' : 'bg-gray-300'}`}></div>
                  <div className={`flex flex-col items-center ${selectedOrder.estado === 'LISTO' ? 'text-green-500 font-bold' : 'text-gray-400'}`}>
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-lg">✅</div>
                    <p className="text-xs mt-1 font-semibold">LISTO</p>
                    <p className="text-xs text-gray-500">Estado final</p>
                  </div>
                </div>
              )}

              {selectedOrder.tipoPedido === 'A_DOMICILIO' && (
                <div className="flex items-center justify-start gap-4">
                  <div className={`flex flex-col items-center ${selectedOrder.estado === 'PENDIENTE' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-lg">📋</div>
                    <p className="text-xs mt-1 font-semibold">PENDIENTE</p>
                  </div>
                  <div className="flex-1 h-1 bg-gradient-to-r from-orange-400 to-gray-300"></div>
                  <div className={`flex flex-col items-center ${selectedOrder.estado === 'EN_PREPARACION' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-lg">🍳</div>
                    <p className="text-xs mt-1 font-semibold">EN_PREPARACION</p>
                  </div>
                  <div className={`flex-1 h-1 ${selectedOrder.estado === 'ENTREGADO_AL_REPARTIDOR' || selectedOrder.estado === 'EN_PREPARACION' ? 'bg-gradient-to-r from-orange-400 to-gray-300' : 'bg-gray-300'}`}></div>
                  <div className={`flex flex-col items-center ${selectedOrder.estado === 'ENTREGADO_AL_REPARTIDOR' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-lg">🚚</div>
                    <p className="text-xs mt-1 font-semibold">ENTREGADO_AL_REPARTIDOR</p>
                  </div>
                  <div className={`flex-1 h-1 ${selectedOrder.estado === 'ENTREGADO' ? 'bg-gradient-to-r from-blue-400 to-gray-300' : 'bg-gray-300'}`}></div>
                  <div className={`flex flex-col items-center ${selectedOrder.estado === 'ENTREGADO' ? 'text-green-500 font-bold' : 'text-gray-400'}`}>
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-lg">✅</div>
                    <p className="text-xs mt-1 font-semibold">ENTREGADO</p>
                  </div>
                </div>
              )}

              {selectedOrder.tipoPedido === 'PARA_LLEVAR' && (
                <div className="flex items-center justify-start gap-4">
                  <div className={`flex flex-col items-center ${selectedOrder.estado === 'PENDIENTE' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-lg">📋</div>
                    <p className="text-xs mt-1 font-semibold">PENDIENTE</p>
                  </div>
                  <div className="flex-1 h-1 bg-gradient-to-r from-orange-400 to-gray-300"></div>
                  <div className={`flex flex-col items-center ${selectedOrder.estado === 'EN_PREPARACION' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-lg">🍳</div>
                    <p className="text-xs mt-1 font-semibold">EN_PREPARACION</p>
                  </div>
                  <div className={`flex-1 h-1 ${selectedOrder.estado === 'LISTO' || selectedOrder.estado === 'EN_PREPARACION' ? 'bg-gradient-to-r from-orange-400 to-gray-300' : 'bg-gray-300'}`}></div>
                  <div className={`flex flex-col items-center ${selectedOrder.estado === 'LISTO' ? 'text-green-500 font-bold' : 'text-gray-400'}`}>
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-lg">✅</div>
                    <p className="text-xs mt-1 font-semibold">LISTO</p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. CAMBIAR ESTADO */}
            {getStatusOptions(selectedOrder?.estado, selectedOrder?.tipoPedido).length > 0 && (
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">3. Cambiar Estado</p>
                <p className="text-xs text-gray-600 mb-3">Selecciona el nuevo estado para este pedido:</p>
                <div className="space-y-2">
                  {getStatusOptions(selectedOrder?.estado, selectedOrder?.tipoPedido).map((status) => (
                    <label key={status} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition">
                      <input
                        type="radio"
                        name="newStatus"
                        value={status}
                        checked={newStatus === status}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-4 h-4 text-blue-500 accent-blue-500"
                      />
                      <span className="ml-3 font-semibold text-gray-800">{statusLabel[status] || status}</span>
                      <div className="ml-auto text-lg">
                        {status === 'EN_PREPARACION' && '🍳'}
                        {status === 'LISTO' && '✅'}
                        {status === 'ENTREGADO_AL_REPARTIDOR' && '🚚'}
                        {status === 'ENTREGADO' && '✅'}
                        {status === 'CANCELADO' && '❌'}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 4. NOTAS ADICIONALES */}
            <div className="border-l-4 border-green-400 pl-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">4. Notas Adicionales (Opcional)</p>
              <textarea
                placeholder="El cliente espera cambio de mesa, orden es especial, etc."
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                rows="3"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-6 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition font-medium"
              >
                Cancelar Pedido
              </button>
              {getStatusOptions(selectedOrder?.estado, selectedOrder?.tipoPedido).length > 0 && (
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={statusLoading}
                  className="px-6 py-2 bg-[#2D4F4F] text-white rounded-md hover:bg-[#3A6B6B] disabled:opacity-50 transition font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {statusLoading ? 'Guardando...' : 'Actualizar Estado'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default OrderManagement;