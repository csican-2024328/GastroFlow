import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardBody, CardHeader, IconButton, Typography } from '@material-tailwind/react';
import { EventFilters } from '../components/EventFilters.jsx';
import { EventFormModal } from '../components/EventFormModal.jsx';
import { useEventStore } from '../store/useEventStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { NoRestaurantAssigned } from '../../../shared/components/layout/NoRestaurantAssigned.jsx';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';

const getEventTypeLabel = (type) => {
  const labels = {
    PROMOCION: 'Promoción',
    DESCUENTO: 'Descuento',
    COMBO: 'Combo',
    HAPPY_HOUR: 'Happy Hour',
    EVENTO_ESPECIAL: 'Evento Especial',
    OFERTA_TEMPORAL: 'Oferta Temporal',
  };
  return labels[type] || type;
};

const getDiscountLabel = (tipo, valor) => {
  return tipo === 'PORCENTAJE' ? `${valor}%` : `Q ${valor.toFixed(2)}`;
};

const getEventStatusBadge = (fechaInicio, fechaFin) => {
  const now = new Date();
  // Strip times for comparison to focus on dates only (like the expiration logic)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(fechaInicio);
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const end = new Date(fechaFin);
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  if (today < startDate) {
    return { label: 'Próximamente', class: 'bg-blue-100 text-blue-800' };
  } else if (today > endDate) {
    return { label: '✗ Expirado', class: 'bg-red-100 text-red-800' };
  } else {
    return { label: '✓ Vigente', class: 'bg-green-100 text-green-800' };
  }
};

export const EventsAdminPage = () => {
  const { restaurantId, role, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();

  const restaurants = useRestaurantStore((s) => s.restaurants);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);
  
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurantId || null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const events = useEventStore((state) => state.events);
  const loading = useEventStore((state) => state.loading);
  const fetchRestaurantEvents = useEventStore((state) => state.fetchRestaurantEvents);
  const deleteEventAction = useEventStore((state) => state.deleteEventAction);
  const activateEventAction = useEventStore((state) => state.activateEventAction);
  const deactivateEventAction = useEventStore((state) => state.deactivateEventAction);
  const clearSelectedEvent = useEventStore((state) => state.clearSelectedEvent);

  // Filtrar eventos según criterios
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      result = result.filter((event) =>
        event.nombre?.toLowerCase().includes(normalizedSearch) ||
        event.descripcion?.toLowerCase().includes(normalizedSearch)
      );
    }

    // Filtro por estado
    if (statusFilter) {
      result = result.filter((event) => event.estado === statusFilter);
    }

    // Filtro por tipo
    if (typeFilter) {
      result = result.filter((event) => event.tipo === typeFilter);
    }

    return result;
  }, [events, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    if (role === 'PLATFORM_ADMIN') {
      fetchRestaurants(1, 50);
    }
  }, [fetchRestaurants, role]);

  useEffect(() => {
    if (restaurantId) {
      setSelectedRestaurantId(restaurantId);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchRestaurantEvents(selectedRestaurantId);
    }
  }, [fetchRestaurantEvents, selectedRestaurantId]);

  if (isRestaurantAdmin && !hasRestaurantAssigned) {
    return <NoRestaurantAssigned />;
  }

  const handleCreateEvent = () => {
    clearSelectedEvent();
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    clearSelectedEvent();
  };

  const handleRequestDeleteEvent = (event) => {
    setEventToDelete(event);
  };

  const handleCloseDeleteDialog = () => {
    setEventToDelete(null);
  };

  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete?._id) {
      return;
    }

    const result = await deleteEventAction(eventToDelete._id);
    if (result.success) {
      notyfSuccess('Evento eliminado correctamente');
      handleCloseDeleteDialog();
    } else {
      notyfError(result.error || 'Error al eliminar evento');
    }
  };

  const handleToggleActive = async (event) => {
    const isCurrentlyActive = event.isActive !== false;
    const result = isCurrentlyActive
      ? await deactivateEventAction(event._id)
      : await activateEventAction(event._id);

    if (result.success) {
      notyfSuccess(isCurrentlyActive ? 'Evento desactivado' : 'Evento activado');
    } else {
      notyfError(result.error || 'Error al cambiar estado del evento');
    }
  };

  if (!selectedRestaurantId && role === 'PLATFORM_ADMIN') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-gray-800 p-6 md:p-8 fade-in">
        <div className="mb-6">
          <Typography variant="h3" className="text-gray-800">Selecciona un Restaurante</Typography>
          <Typography variant="small" className="text-[#2D4F4F]">
            Administrador, selecciona un restaurante para ver y gestionar sus eventos.
          </Typography>
        </div>

        {restaurants.length === 0 ? (
          <div className="rounded-2xl border border-[#E8D4B8] bg-white p-10 text-center">
            <p className="text-gray-600">No hay restaurantes disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant._id}
                onClick={() => setSelectedRestaurantId(restaurant._id)}
                className="overflow-hidden rounded-2xl border border-[#E8D4B8] bg-white text-left transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-32 bg-gradient-to-br from-[#F5EFEA] to-[#FDFBF7]">
                  {restaurant.fotos && restaurant.fotos.length > 0 ? (
                    <img
                      src={restaurant.fotos[0]}
                      alt={restaurant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🍽️</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-['Playfair_Display'] text-lg font-bold text-gray-800">
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-gray-600">{restaurant.category || 'Restaurante'}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading && events.length === 0) {
    return (
      <div className="p-6">
        <p className="text-[#2D4F4F]">Cargando eventos...</p>
      </div>
    );
  }

  const selectedRestaurant = restaurants.find((r) => r._id === selectedRestaurantId);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <Typography variant="h3" className="text-gray-800">
            Eventos {selectedRestaurant ? `- ${selectedRestaurant.name}` : ''}
          </Typography>
          <Typography variant="small" className="text-[#2D4F4F]">
            Gestiona eventos especiales, promociones y descuentos.
          </Typography>
        </div>
        <div className="flex gap-2">
          {role === 'PLATFORM_ADMIN' && (
            <Button
              onClick={() => setSelectedRestaurantId(null)}
              className="border border-[#2D4F4F] text-[#2D4F4F] bg-transparent rounded-lg hover:bg-[#F5EFEA] transition-all duration-200"
            >
              ← Cambiar Restaurante
            </Button>
          )}
          <Button
            onClick={handleCreateEvent}
            className="bg-[#2D4F4F] text-white rounded-lg shadow-[0_10px_22px_rgba(45,79,79,0.3)] hover:shadow-[0_14px_30px_rgba(45,79,79,0.35)] transition-all duration-200"
          >
            + Nuevo Evento
          </Button>
        </div>
      </div>

      <EventFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
      />

      {/* Tabla de eventos */}
      {filteredEvents.length > 0 ? (
        <Card className="border border-[#E8D4B8] bg-[#FDFBF7]">
          <CardHeader floated={false} shadow={false} className="m-0 rounded-none border-b border-[#E8D4B8] p-4">
            <Typography variant="small" className="text-[#2D4F4F]">
              {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
            </Typography>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8D4B8] bg-[#F5EFEA]">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D4F4F]">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D4F4F]">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D4F4F]">Descuento</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#2D4F4F]">Vigencia</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D4F4F]">Estado</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#2D4F4F]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const statusBadge = getEventStatusBadge(event.fechaInicio, event.fechaFin);
                  const isEventActive = event.isActive !== false;

                  return (
                    <tr key={event._id} className="border-b border-[#E8D4B8] hover:bg-[#F5EFEA] transition">
                      {/* Nombre */}
                      <td className="px-4 py-3">
                        <div>
                          <Typography variant="small" className="font-semibold text-gray-800">
                            {event.nombre}
                          </Typography>
                          <Typography variant="small" className="text-stone-600">
                            {event.descripcion?.substring(0, 50)}
                            {event.descripcion?.length > 50 ? '...' : ''}
                          </Typography>
                          <div className="mt-2 flex flex-col gap-1">
                            {event.platosAplicables?.length > 0 && (
                              <Typography variant="small" className="text-blue-600">
                                📍 {event.platosAplicables.length} plato{event.platosAplicables.length !== 1 ? 's' : ''}
                              </Typography>
                            )}
                            {event.menusAplicables?.length > 0 && (
                              <Typography variant="small" className="text-amber-600">
                                📍 {event.menusAplicables.length} menú{event.menusAplicables.length !== 1 ? 's' : ''}
                              </Typography>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-3 py-1 bg-[#C49A2B] text-white text-xs font-semibold rounded-full">
                          {getEventTypeLabel(event.tipo)}
                        </span>
                      </td>

                      {/* Descuento */}
                      <td className="px-4 py-3">
                        <Typography variant="small" className="font-semibold text-[#2D4F4F]">
                          {getDiscountLabel(event.descuentoTipo, event.descuentoValor)}
                        </Typography>
                      </td>

                      {/* Vigencia */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Typography variant="small" className="text-gray-800">
                            {new Date(event.fechaInicio).toLocaleDateString('es-ES')} -{' '}
                            {new Date(event.fechaFin).toLocaleDateString('es-ES')}
                          </Typography>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full w-fit ${statusBadge.class}`}
                          >
                            {statusBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Estado (Toggle) */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(event)}
                          disabled={loading}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isEventActive ? 'bg-green-500' : 'bg-gray-300'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                          title={isEventActive ? 'Desactivar' : 'Activar'}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                              isEventActive ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <IconButton
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                            disabled={loading}
                            className="bg-[#2D4F4F] shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200"
                            title="Editar evento"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </IconButton>
                          <IconButton
                            size="sm"
                            onClick={() => handleRequestDeleteEvent(event)}
                            disabled={loading}
                            className="bg-[#D97065] shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200"
                            title="Eliminar evento"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                              <path d="M3 6h18" />
                              <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6m-4-1V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2" />
                            </svg>
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      ) : (
        <div className="rounded-2xl border border-[#E8D4B8] bg-[#FDFBF7] p-10 text-center">
          <Typography variant="small" className="text-gray-600">
            {searchTerm || statusFilter || typeFilter
              ? 'No se encontraron eventos con los criterios especificados'
              : 'No hay eventos disponibles. ¡Crea el primero!'}
          </Typography>
        </div>
      )}

      {/* Modal de crear/editar */}
      <EventFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}        restaurantId={selectedRestaurantId}      />

      {/* Diálogo de confirmación de eliminación */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-gray-800">¿Eliminar evento?</h3>
            <p className="mb-4 text-sm text-gray-600">
              ¿Estás seguro de que deseas eliminar el evento "{eventToDelete.nombre}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="text"
                onClick={handleCloseDeleteDialog}
                className="text-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDeleteEvent}
                disabled={loading}
                className="bg-[#D97065] text-white"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
