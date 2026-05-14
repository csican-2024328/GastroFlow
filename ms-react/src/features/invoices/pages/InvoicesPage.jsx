import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createInvoice, deleteInvoice, getInvoiceById, getInvoices, updateInvoiceStatus } from '../../../shared/api/invoiceService.js';

const STATUS_OPTIONS = [
  { value: 'PENDIENTE', label: 'Pendiente', badge: 'bg-[#E2B14C] text-[#5F3A0D]' },
  { value: 'PAGADA', label: 'Pagada', badge: 'bg-[#69A77F] text-[#133C24]' },
  { value: 'CANCELADA', label: 'Cancelada', badge: 'bg-[#D1574F] text-[#641B16]' }
];

const formatDate = (value) => {
  if (!value) return 'No especificada';
  return new Date(value).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadge = (status) => {
  return STATUS_OPTIONS.find((option) => option.value === status)?.badge || 'bg-[#D1D5DB] text-[#374151]';
};

const getInvoiceLabel = (invoice) => {
  if (!invoice) return '';
  return invoice._id?.slice(-8).toUpperCase() || invoice._id || '-';
};

const getOrderLabel = (invoice) => {
  return invoice.orderID?.numeroOrden || invoice.orderID?._id?.slice(-6).toUpperCase() || '-';
};

const getItemName = (item) => {
  return item.nombre || item.plato?.nombre || item.menu?.nombre || 'Item sin nombre';
};

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrderId, setNewOrderId] = useState('');
  const [creating, setCreating] = useState(false);

  const loadedInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return invoices;

    return invoices.filter((invoice) => {
      const invoiceId = invoice._id?.toLowerCase() || '';
      const orderNumber = invoice.orderID?.numeroOrden?.toLowerCase() || invoice.orderID?._id?.toLowerCase() || '';
      return invoiceId.includes(query) || orderNumber.includes(query);
    });
  }, [invoices, search]);

  const loadInvoices = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      setFetchError('');
      const response = await getInvoices({ page: pageToLoad, limit });
      setInvoices(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setPage(response.data.pagination?.currentPage || pageToLoad);
    } catch (err) {
      setFetchError(err?.response?.data?.message || 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices(1);
  }, []);

  const handleSelectInvoice = async (invoice) => {
    if (!invoice?._id) return;
    setLoading(true);
    try {
      const response = await getInvoiceById(invoice._id);
      setSelectedInvoice(response.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo cargar la factura');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!newOrderId.trim()) {
      toast.error('Ingresa el ID del pedido');
      return;
    }

    try {
      setCreating(true);
      await createInvoice({ orderID: newOrderId.trim() });
      toast.success('Factura creada');
      setNewOrderId('');
      setIsCreateOpen(false);
      await loadInvoices(1);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al crear la factura');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedInvoice?._id) return;
    try {
      setLoading(true);
      const response = await updateInvoiceStatus(selectedInvoice._id, { estado: newStatus });
      setSelectedInvoice(response.data.data);
      setInvoices((current) => current.map((invoice) => (invoice._id === response.data.data._id ? response.data.data : invoice)));
      toast.success('Estado actualizado');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!invoiceId) return;
    const confirmed = window.confirm('¿Eliminar esta factura? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteInvoice(invoiceId);
      toast.success('Factura eliminada');
      if (selectedInvoice?._id === invoiceId) {
        setSelectedInvoice(null);
      }
      await loadInvoices(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al eliminar factura');
    } finally {
      setLoading(false);
    }
  };

  const dueDate = (invoice) => {
    if (!invoice?.fechaEmision) return 'No aplica';
    const date = new Date(invoice.fechaEmision);
    date.setDate(date.getDate() + 15);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const selectedImage = selectedInvoice?.orderID?.restaurantID?.fotos?.[0] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';

  return (
    <div className="min-h-screen bg-[#F4EFE7] text-[#1A1A1A]">
      <div className="mx-auto max-w-[1460px] px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#7B5D27]">Gestión de Facturas</p>
            <h1 className="mt-3 text-4xl font-semibold">Facturas</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#5A5146]">Lista, filtro y detalle rápido de cada factura creada a partir de pedidos.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1F3D3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#253f3f]"
          >
            + Crear Nueva Factura
          </button>
        </div>

        {isCreateOpen && (
          <div className="mb-6 rounded-3xl border border-[#E2D4B7] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#1A1A1A]">Crear factura desde pedido</p>
                <p className="text-sm text-[#5A5146]">Ingresa el ID del pedido existente para generar su factura automáticamente.</p>
              </div>
              <div className="grid w-full max-w-xl gap-4 md:grid-cols-[1fr_auto]">
                <input
                  value={newOrderId}
                  onChange={(e) => setNewOrderId(e.target.value)}
                  placeholder="ID del pedido"
                  className="w-full rounded-2xl border border-[#D9C7AC] bg-[#FCF8F2] px-4 py-3 text-sm outline-none"
                />
                <button
                  onClick={handleCreateInvoice}
                  disabled={creating}
                  className="rounded-2xl bg-[#2C4035] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#213132] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? 'Creando...' : 'Generar factura'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.8fr_1.2fr]">
          <section className="rounded-[2rem] border border-[#E2D4B7] bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative max-w-md flex-1">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por número de factura o ID de pedido..."
                  className="w-full rounded-2xl border border-[#D9C7AC] bg-[#FCF8F2] py-3 pl-12 pr-4 text-sm outline-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8F77]">🔎</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-[#E8D9C4]">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-[#FAF7F2] text-[#5A5146]">
                  <tr>
                    <th className="px-4 py-4 font-medium">ID Factura</th>
                    <th className="px-4 py-4 font-medium">Número de Orden</th>
                    <th className="px-4 py-4 font-medium">Estado</th>
                    <th className="px-4 py-4 font-medium">Fecha de Creación</th>
                    <th className="px-4 py-4 font-medium">Monto Total</th>
                    <th className="px-4 py-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-[#7B5D27]">Cargando facturas...</td>
                    </tr>
                  ) : fetchError ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-red-600">{fetchError}</td>
                    </tr>
                  ) : loadedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-[#8A7A63]">No hay facturas que coincidan con la búsqueda.</td>
                    </tr>
                  ) : (
                    loadedInvoices.map((invoice) => (
                      <tr
                        key={invoice._id}
                        className={`border-t border-[#EFF1EB] transition hover:bg-[#FCF8F2] ${selectedInvoice?._id === invoice._id ? 'bg-[#F4F0E8]' : ''}`}
                      >
                        <td className="cursor-pointer px-4 py-4" onClick={() => handleSelectInvoice(invoice)}>{getInvoiceLabel(invoice)}</td>
                        <td className="cursor-pointer px-4 py-4" onClick={() => handleSelectInvoice(invoice)}>{getOrderLabel(invoice)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(invoice.estado)}`}>
                            {STATUS_OPTIONS.find((option) => option.value === invoice.estado)?.label || invoice.estado}
                          </span>
                        </td>
                        <td className="px-4 py-4">{formatDate(invoice.fechaEmision)}</td>
                        <td className="px-4 py-4">Q {Number(invoice.total ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleSelectInvoice(invoice)}
                            className="mr-2 rounded-2xl border border-[#D9C7AC] bg-white px-3 py-2 text-xs font-semibold text-[#2C4035] hover:bg-[#F4F0E8]"
                          >
                            Ver Detalle
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice._id)}
                            className="rounded-2xl bg-[#D1574F] px-3 py-2 text-xs font-semibold text-white hover:bg-[#9D3A35]"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#5A5146]">
              <span>Mostrando {loadedInvoices.length} de {invoices.length} facturas</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadInvoices(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="rounded-full border border-[#D9C7AC] bg-white px-4 py-2 text-sm font-semibold text-[#2C4035] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ←
                </button>
                {[...Array(totalPages).keys()].map((index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => loadInvoices(pageNumber)}
                      className={`h-10 w-10 rounded-full ${pageNumber === page ? 'bg-[#2C4035] text-white' : 'bg-white text-[#2C4035]'} border border-[#D9C7AC] font-semibold`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => loadInvoices(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className="rounded-full border border-[#D9C7AC] bg-white px-4 py-2 text-sm font-semibold text-[#2C4035] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  →
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-6 rounded-[2rem] border border-[#E2D4B7] bg-[#FEFBF6] p-6 shadow-sm">
            {selectedInvoice ? (
              <div className="space-y-6">
                <div className="rounded-[2rem] overflow-hidden bg-[#1A2E2E] text-white shadow-inner">
                  <div
                    className="h-56 bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedImage})` }}
                  />
                  <div className="space-y-2 border-t border-white/10 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-[#C6E4DF]">Factura</p>
                        <h2 className="text-2xl font-semibold">{getInvoiceLabel(selectedInvoice)}</h2>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(selectedInvoice.estado)}`}>
                        {STATUS_OPTIONS.find((option) => option.value === selectedInvoice.estado)?.label || selectedInvoice.estado}
                      </span>
                    </div>
                    <p className="text-sm text-[#E3E7E3]">Orden {getOrderLabel(selectedInvoice)}</p>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-[#E2D4B7] bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">Detalle de Factura</h3>
                      <p className="text-sm text-[#5A5146]">Actualiza el estado o revisa los valores.</p>
                    </div>
                    <button
                      onClick={handleDeleteInvoice}
                      className="rounded-2xl bg-[#D1574F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9D3A35]"
                    >Eliminar</button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 rounded-3xl bg-[#FCF8F2] p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A63]">ID de Factura</p>
                      <p className="font-semibold text-[#1A1A1A]">{selectedInvoice._id}</p>
                    </div>
                    <div className="space-y-2 rounded-3xl bg-[#FCF8F2] p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A63]">ID de Orden</p>
                      <p className="font-semibold text-[#1A1A1A]">{selectedInvoice.orderID?._id || '-'}</p>
                    </div>
                    <div className="space-y-2 rounded-3xl bg-[#FCF8F2] p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A63]">Fecha de Creación</p>
                      <p className="font-semibold text-[#1A1A1A]">{formatDate(selectedInvoice.fechaEmision)}</p>
                    </div>
                    <div className="space-y-2 rounded-3xl bg-[#FCF8F2] p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A63]">Fecha de Vencimiento</p>
                      <p className="font-semibold text-[#1A1A1A]">{dueDate(selectedInvoice)}</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.75rem] border border-[#E8D9C4] bg-[#FCF8F2] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#1A1A1A]">Estado Actual</p>
                      <select
                        value={selectedInvoice.estado}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="rounded-2xl border border-[#D9C7AC] bg-white px-4 py-3 text-sm outline-none"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-4 text-sm sm:grid-cols-2">
                      <div className="space-y-1">
                        <span className="text-[#7B5D27]">Subtotal</span>
                        <p className="font-semibold">Q {Number(selectedInvoice.subtotal ?? 0).toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[#7B5D27]">Impuesto</span>
                        <p className="font-semibold">Q {Number(selectedInvoice.impuesto ?? 0).toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[#7B5D27]">Descuento</span>
                        <p className="font-semibold">Q {Number(selectedInvoice.descuento ?? 0).toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[#7B5D27]">Propina</span>
                        <p className="font-semibold">Q {Number(selectedInvoice.propina ?? 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.75rem] border border-[#E8D9C4] bg-[#FBF8F2] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">Items</h4>
                        <p className="text-sm text-[#5A5146]">Detalle de la orden vinculada.</p>
                      </div>
                      <p className="text-sm font-semibold text-[#2C4035]">Total: Q {Number(selectedInvoice.total ?? 0).toFixed(2)}</p>
                    </div>
                    <div className="space-y-4">
                      {selectedInvoice.orderID?.items?.length > 0 ? (
                        selectedInvoice.orderID.items.map((item, idx) => (
                          <div key={`${item.nombre}-${idx}`} className="flex items-center justify-between rounded-3xl border border-[#E2D4B7] bg-white p-4">
                            <div>
                              <p className="font-semibold">{getItemName(item)}</p>
                              <p className="text-sm text-[#5A5146]">Q {Number(item.precioUnitario ?? 0).toFixed(2)} x {item.cantidad}</p>
                            </div>
                            <p className="font-semibold">Q {Number(item.subtotal ?? (item.precioUnitario * item.cantidad) ?? 0).toFixed(2)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[#8A7A63]">No hay items disponibles para esta factura.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.75rem] border border-[#E2D4B7] bg-white p-5">
                    <h4 className="mb-4 text-lg font-semibold">Información del Cliente</h4>
                    <div className="space-y-3 text-sm text-[#5A5146]">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <span className="block text-xs uppercase tracking-[0.2em] text-[#8A7A63]">Nombre</span>
                          <p className="font-semibold text-[#1A1A1A]">{selectedInvoice.orderID?.clienteNombre || selectedInvoice.userID || 'No disponible'}</p>
                        </div>
                        <div>
                          <span className="block text-xs uppercase tracking-[0.2em] text-[#8A7A63]">Teléfono</span>
                          <p className="font-semibold text-[#1A1A1A]">{selectedInvoice.orderID?.clienteTelefono || 'No disponible'}</p>
                        </div>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-[0.2em] text-[#8A7A63]">Restaurante</span>
                        <p className="font-semibold text-[#1A1A1A]">{selectedInvoice.orderID?.restaurantID?.nombre || 'No especificado'}</p>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-[0.2em] text-[#8A7A63]">Método de Pago</span>
                        <p className="font-semibold text-[#1A1A1A]">{selectedInvoice.metodoPago || 'PENDIENTE'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-[#D9C7AC] bg-[#F8F3EA] p-8 text-center text-[#5A5146]">
                <p className="text-lg font-semibold text-[#1A1A1A]">Selecciona una factura</p>
                <p className="mt-3 text-sm">Haz clic en una fila para ver su detalle y cambiar su estado.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
