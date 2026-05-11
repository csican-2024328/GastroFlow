import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  getOrders,
  checkOrderStock,
  createOrder,
  payOrder,
  cancelOrder,
  deleteOrderPermanent
} from '../../../shared/api/orderService.js';
import { getDishes } from '../../../shared/api/dishService.js';
import { getRestaurants } from '../../../shared/api/restaurantService.js';
import { getMesas } from '../../../shared/api/mesaService.js';
import StatusBadge from '../../../shared/components/ui/StatusBadge.jsx';
import Modal from '../../../shared/components/ui/Modal.jsx';

const generateGNumber = () => `G${Math.floor(10000 + Math.random() * 90000)}`;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Selected order state
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // API Data States
  const [availableRestaurants, setAvailableRestaurants] = useState([]);
  const [availableMesas, setAvailableMesas] = useState([]);
  const [availableDishes, setAvailableDishes] = useState([]);

  // Forms state
  const [createForm, setCreateForm] = useState({
    restaurantId: '',
    mesaId: '',
    items: []
  });

  const [payForm, setPayForm] = useState({
    metodo_pago: 'credit_card',
    propina: 0,
    cargos_extra: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resRestaurants, resDishes] = await Promise.all([
        getRestaurants(),
        getDishes()
      ]);
      setAvailableRestaurants(resRestaurants?.data?.data || resRestaurants?.data || []);
      setAvailableDishes(resDishes?.data?.data || resDishes?.data || []);
    } catch (e) {
      toast.error('Error al cargar datos inicales');
    }
  };

  const handleRestaurantChange = async (e) => {
    const restaurantId = e.target.value;
    setCreateForm({ ...createForm, restaurantId, mesaId: '' });
    if (!restaurantId) return setAvailableMesas([]);
    try {
      const res = await getMesas({ restaurantID: restaurantId });
      setAvailableMesas(res?.data?.data || res?.data || []);
    } catch (error) {
      toast.error('Error al cargar mesas del restaurante');
      setAvailableMesas([]);
    }
  };

  const addItemToOrder = () => {
    setCreateForm({
      ...createForm,
      items: [...createForm.items, { id: '', tipo: 'PLATO', quantity: 1, name: '' }]
    });
  };

  const removeItem = (index) => {
    const newItems = [...createForm.items];
    newItems.splice(index, 1);
    setCreateForm({ ...createForm, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...createForm.items];
    if (field === 'id') {
      const selectedDish = availableDishes.find(d => d.id === value || d._id === value);
      newItems[index][field] = value;
      newItems[index].name = selectedDish?.name || selectedDish?.nombre || '';
    } else {
      newItems[index][field] = value;
    }
    setCreateForm({ ...createForm, items: newItems });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      setOrders(res?.data?.orders || res?.data || []);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStock = async () => {
    if (!createForm.restaurantId) {
       return toast.error('Seleccione un restaurante primero');
    }
    if (!createForm.mesaId) {
       return toast.error('Seleccione una mesa');
    }
    if (createForm.items.length === 0) {
       return toast.error('Añada al menos un plato');
    }

    try {
      const itemsPayload = createForm.items.map(item => ({
        plato: item.tipo === 'PLATO' ? (item.id || item.platoId) : undefined,
        menu: item.tipo === 'MENU' ? (item.id || item.menuId) : undefined,
        tipo: item.tipo,
        cantidad: Number(item.quantity)
      }));

      await checkOrderStock({
        restaurantId: createForm.restaurantId,
        mesaID: createForm.mesaId,
        tipoPedido: 'EN_MESA',
        clienteNombre: 'Cliente Genérico',
        items: itemsPayload
      });
      toast.success('Stock verificado correctamente');
    } catch (error) {
      console.error("Detalle del error:", error.response?.data);
      const errorsList = error?.response?.data?.errors;
      const apiMessage = error?.response?.data?.message || (errorsList && errorsList[0]?.msg);
      if (error?.response?.status === 409) {
          toast.error('No hay ingredientes para hacerlo');
      } else {
          toast.error(apiMessage || 'Stock insuficiente o error en la verificación');
      }
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!createForm.mesaId) {
       return toast.error('Seleccione una mesa primero');
    }
    
    try {
      const itemsPayloadStock = createForm.items.map(item => ({
        plato: item.tipo === 'PLATO' ? (item.id || item.platoId) : undefined,
        menu: item.tipo === 'MENU' ? (item.id || item.menuId) : undefined,
        tipo: item.tipo,
        cantidad: Number(item.quantity)
      }));

      await checkOrderStock({
        restaurantId: createForm.restaurantId,
        mesaID: createForm.mesaId,
        tipoPedido: 'EN_MESA',
        clienteNombre: 'Cliente Genérico',
        items: itemsPayloadStock
      });
      
      const itemsPayload = createForm.items.map(item => ({
        plato: item.tipo === 'PLATO' ? (item.id || item.platoId) : undefined,
        menu: item.tipo === 'MENU' ? (item.id || item.menuId) : undefined,
        tipo: item.tipo,
        cantidad: Number(item.quantity)
      }));

      await createOrder({
        restaurantId: createForm.restaurantId,
        mesaID: createForm.mesaId,
        tipoPedido: 'EN_MESA',
        clienteNombre: 'Cliente Genérico',
        items: itemsPayload
      });

      toast.success('Pedido creado exitosamente');
      setIsCreateModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error de stock o al crear el pedido');
    }
  };

  const handlePayOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    
    try {
      await payOrder(selectedOrderId, {
        metodo_pago: payForm.metodo_pago,
        propina: Number(payForm.propina),
        cargos_extra: Number(payForm.cargos_extra)
      });
      toast.success('Pago registrado');
      setIsPayModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al procesar pago');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Está seguro de cancelar este pedido?')) return;
    try {
      await cancelOrder(orderId);
      toast.success('Pedido cancelado');
      fetchOrders();
    } catch (error) {
      toast.error('Error al cancelar el pedido');
    }
  };

  const handleDeletePermanent = async (orderId) => {
    if (!window.confirm('¿Está seguro de eliminar PERMANENTEMENTE este pedido? Esta acción no se puede deshacer.')) return;
    try {
      await deleteOrderPermanent(orderId);
      toast.success('Pedido borrado permanentemente');
      fetchOrders();
    } catch (error) {
      toast.error('Error al borrar el pedido');
    }
  };

  const subtotal = createForm.items.reduce((acc, item) => {
    const dish = availableDishes.find(d => d.id === item.id || d._id === item.id);
    return acc + (dish?.price || dish?.precio || 0) * (item.quantity || 1);
  }, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <div className="p-6 min-h-screen bg-[#FDFBF7]">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FAF9F6]">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
              </svg>
              Filtrar
            </button>
          </div>
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
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <tr key={order.id || order.order_number || order._id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{order.order_number || generateGNumber()}</td>
                    <td className="px-6 py-4">{order.restaurant_name || order.restaurantId}</td>
                    <td className="px-6 py-4">{order.mesaId || order.mesa_number || '-'}</td>
                    <td className="px-6 py-4">{order.client_name || order.user_id || 'Cliente General'}</td>
                    <td className="px-6 py-4">${Number(order.total || 0).toFixed(2)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status || order.estado} /></td>
                    <td className="px-6 py-4">{new Date(order.created_at || order.fecha).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                         <button 
                           onClick={() => { setSelectedOrderId(order.id); setIsDetailModalOpen(true); }}
                           className="p-1.5 text-gray-500 hover:text-blue-600 border border-gray-200 rounded transition"
                           title="Ver detalles de factura"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                         </button>
                         <button 
                           onClick={() => { setSelectedOrderId(order.id); setIsPayModalOpen(true); }}
                           className="p-1.5 text-gray-500 hover:text-gray-700 border border-gray-200 rounded"
                           title="Pagar"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                         </button>
                         
                         <div className="relative group">
                            <button className="p-1.5 text-gray-500 hover:text-gray-700 border border-gray-200 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>
                            </button>
                            <div className="absolute right-0 w-40 bg-white border border-gray-200 shadow-lg rounded-md mt-1 hidden group-hover:block z-10">
                              <button onClick={() => handleCancelOrder(order.id)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cancelar</button>
                              <button onClick={() => handleDeletePermanent(order.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Eliminar Permanente</button>
                            </div>
                         </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Cargando pedidos...' : 'No hay pedidos disponibles'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-[#FAF9F6]">
          <span>Mostrando 1 a 10 de {orders.length}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Registros por página</span>
              <select className="border border-gray-300 rounded px-2 py-1 bg-white">
                <option>10</option>
                <option>20</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* MODALS */}
      
      {/* NOTA: Modal de Creación de Pedido deshabilitado en Admin General
          La funcionalidad está disponible en el módulo de Admin Restaurantes
          Métodos reutilizables: handleVerifyStock(), handleCreateOrder() */}

      <Modal 
        isOpen={isPayModalOpen} 
        onClose={() => setIsPayModalOpen(false)} 
        title={`Pagar Pedido #${selectedOrderId?.substring(0,4)}`}
      >
        <form onSubmit={handlePayOrder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
            <select 
              value={payForm.metodo_pago}
              onChange={(e) => setPayForm({...payForm, metodo_pago: e.target.value})}
              className="mt-1 w-full border border-gray-300 rounded-md p-2" 
            >
              <option value="credit_card">Tarjeta de Crédito</option>
              <option value="debit_card">Tarjeta de Débito</option>
              <option value="cash">Efectivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Propina ($)</label>
            <input 
              type="number" step="0.01" min="0"
              value={payForm.propina}
              onChange={(e) => setPayForm({...payForm, propina: e.target.value})}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cargos Extra ($)</label>
            <input 
              type="number" step="0.01" min="0"
              value={payForm.cargos_extra}
              onChange={(e) => setPayForm({...payForm, cargos_extra: e.target.value})}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsPayModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-[#2D4F4F] text-white rounded hover:bg-[#3A6B6B]">Procesar Pago</button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalles de Factura"
        maxWidth="max-w-2xl"
      >
        {(() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (!order) return <p className="text-gray-500">Pedido no encontrado</p>;
          
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Restaurante</p>
                    <p className="text-lg font-semibold text-gray-800">{order.restaurant_name || order.restaurantId || 'N/A'}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Mesa</p>
                    <p className="text-lg font-semibold text-gray-800">{order.mesaId || order.mesa_number || '-'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Cliente</p>
                    <p className="text-lg font-semibold text-gray-800">{order.client_name || order.user_id || 'Cliente General'}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Número de Pedido</p>
                    <p className="text-lg font-semibold text-gray-800">{order.order_number || generateGNumber()}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Estado Actual</p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={order.status || order.estado} />
                  <span className="text-sm text-gray-600">{new Date(order.created_at || order.fecha).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Desglose de Factura</p>
                <div className="space-y-2 bg-gray-50 p-4 rounded">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${Number(order.subtotal || order.total || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600">Impuesto (18%)</span>
                    <span className="font-medium">${Number((order.total || 0) * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cargos Extra</span>
                    <span className="font-medium">${Number(order.cargos_extra || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Propina</span>
                    <span className="font-medium">${Number(order.propina || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-base">
                    <span>TOTAL</span>
                    <span className="text-[#2D4F4F]">${Number(order.total || 0).toFixed(2)}</span>
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
          );
        })()}
      </Modal>

    </div>
  );
};

export default OrderManagement;
