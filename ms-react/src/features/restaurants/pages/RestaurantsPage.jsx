import { useEffect, useState } from 'react';
import { useRestaurantStore } from '../store/useRestaurantStore.js';
import { RestaurantModal } from '../components/RestaurantModal.jsx';
import { notyfSuccess, notyfError } from '../../../shared/utils/notyf.js';

export const RestaurantsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const restaurants = useRestaurantStore((s) => s.restaurants);
  const loading = useRestaurantStore((s) => s.loading);
  const pagination = useRestaurantStore((s) => s.pagination);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);
  const deleteRestaurantAction = useRestaurantStore((s) => s.deleteRestaurantAction);

  // Load restaurants on mount
  useEffect(() => {
    fetchRestaurants(currentPage, 10);
  }, [currentPage, fetchRestaurants]);

  const handleCreateRestaurant = () => {
    setSelectedRestaurant(null);
    setIsModalOpen(true);
  };

  const handleEditRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este restaurante?')) {
      return;
    }

    const result = await deleteRestaurantAction(id);
    if (result.success) {
      notyfSuccess('Restaurante eliminado correctamente');
    } else {
      notyfError(result.error || 'Error al eliminar restaurante');
    }
  };

  

  if (loading && restaurants.length === 0) {
    return (
      <div className="p-6">
        <p className="text-[#2C4035]">Cargando restaurantes...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Restaurantes</h1>
        <button
          onClick={handleCreateRestaurant}
          className="px-4 py-2 rounded bg-[#2C4035] hover:opacity-90 text-white font-medium"
        >
          + Nuevo Restaurante
        </button>
      </div>

      {/* Grid de restaurantes */}
      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white border border-[#E2D4B7] rounded-lg overflow-hidden hover:border-[#2C4035] transition-colors shadow-sm"
            >
              {/* Imagen del restaurante */}
              <div className="relative h-40 bg-[#F8F5F0] overflow-hidden">
                {restaurant.photos && restaurant.photos.length > 0 ? (
                  <img
                    src={restaurant.photos[0]}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#2C4035]">
                    Sin imagen
                  </div>
                )}
                {/* Badge de estado */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      restaurant.isActive
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {restaurant.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                  {restaurant.name}
                </h3>

                <div className="space-y-1 text-sm text-[#2C4035] mb-4">
                  <p>
                    <span className="font-semibold">Dirección:</span> {restaurant.address}
                  </p>
                  <p>
                    <span className="font-semibold">Ciudad:</span> {restaurant.city}
                  </p>
                  <p>
                    <span className="font-semibold">Teléfono:</span> {restaurant.phone}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {restaurant.email}
                  </p>
                  {restaurant.category && (
                    <p>
                      <span className="font-semibold">Categoría:</span> {restaurant.category}
                    </p>
                  )}
                  {restaurant.openingHours && (
                    <p>
                      <span className="font-semibold">Horario:</span> {restaurant.openingHours}
                    </p>
                  )}
                  {restaurant.aforoMaximo && (
                    <p>
                      <span className="font-semibold">Aforo máximo:</span> {restaurant.aforoMaximo}
                    </p>
                  )}
                  {restaurant.averagePrice && (
                    <p>
                      <span className="font-semibold">Precio promedio:</span> Q{restaurant.averagePrice.toFixed(2)}
                    </p>
                  )}
                </div>

                {restaurant.description && (
                  <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>
                )}

                {/* Acciones */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleEditRestaurant(restaurant)}
                    className="flex-1 px-3 py-2 rounded bg-[#2C4035] hover:opacity-90 text-white text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteRestaurant(restaurant._id)}
                    className="flex-1 px-3 py-2 rounded bg-[#C87A55] hover:opacity-90 text-white text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[#2C4035] text-lg mb-4">No hay restaurantes registrados</p>
          <button
            onClick={handleCreateRestaurant}
            className="px-4 py-2 rounded bg-[#2C4035] hover:opacity-90 text-white font-medium"
          >
            Crear primer restaurante
          </button>
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded ${
                currentPage === page
                  ? 'bg-[#2C4035] text-white'
                  : 'bg-white border border-[#E2D4B7] text-[#2C4035] hover:bg-[#F8F5F0]'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      <RestaurantModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        restaurant={selectedRestaurant}
      />
    </div>
  );
};
