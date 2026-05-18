import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardBody, CardHeader, IconButton, Typography } from '@material-tailwind/react';
import { DishFilters } from '../components/DishFilters.jsx';
import { DishFormModal } from '../components/DishFormModal.jsx';
import { useDishStore } from '../store/useDishStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';

const getCategoryLabel = (category) => {
  const labels = {
    ENTRADA: 'Entrada',
    FUERTE: 'Plato Fuerte',
    POSTRE: 'Postre',
    BEBIDA: 'Bebida',
  };
  return labels[category] || category;
};

const getRestaurantName = (restaurantId, restaurantOptions) => {
  const normalizedId = restaurantId?._id || restaurantId;
  const restaurant = restaurantOptions.find((item) => item._id === normalizedId);
  return restaurant?.name || restaurantId?.name || 'Sin restaurante';
};

export const DishesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [dishToDelete, setDishToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const dishes = useDishStore((state) => state.dishes);
  const restaurantOptions = useDishStore((state) => state.restaurantOptions);
  const loading = useDishStore((state) => state.loading);
  const selectedRestaurantId = useDishStore((state) => state.selectedRestaurantId);
  const fetchRestaurantOptions = useDishStore((state) => state.fetchRestaurantOptions);
  const fetchDishes = useDishStore((state) => state.fetchDishes);
  const deleteDishAction = useDishStore((state) => state.deleteDishAction);
  const clearSelectedDish = useDishStore((state) => state.clearSelectedDish);

  const { restaurantId } = useRestaurantScope();

  const filteredDishes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return dishes.filter((dish) => {
      if (restaurantId) {
        const rid = dish.restaurantId?._id || dish.restaurantId;
        return rid && String(rid) === String(restaurantId);
      }
      return true;
    });

    return dishes.filter((dish) => {
      if (restaurantId) {
        const rid = dish.restaurantId?._id || dish.restaurantId;
        if (!rid || String(rid) !== String(restaurantId)) return false;
      }
      return dish.nombre?.toLowerCase().includes(normalizedSearch);
    });
  }, [dishes, searchTerm, restaurantId]);

  useEffect(() => {
    if (restaurantOptions.length === 0) {
      fetchRestaurantOptions();
    }
  }, [fetchRestaurantOptions, restaurantOptions.length]);

  useEffect(() => {
    fetchDishes(restaurantId || selectedRestaurantId);
  }, [fetchDishes, selectedRestaurantId, restaurantId]);

  const handleCreateDish = () => {
    clearSelectedDish();
    setSelectedDish(null);
    setIsModalOpen(true);
  };

  const handleEditDish = (dish) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDish(null);
    clearSelectedDish();
  };

  const handleRequestDeleteDish = (dish) => {
    setDishToDelete(dish);
  };

  const handleCloseDeleteDialog = () => {
    setDishToDelete(null);
  };

  const handleConfirmDeleteDish = async () => {
    if (!dishToDelete?._id) {
      return;
    }

    const result = await deleteDishAction(dishToDelete._id);
    if (result.success) {
      notyfSuccess('Plato eliminado correctamente');
      handleCloseDeleteDialog();
    } else {
      notyfError(result.error || 'Error al eliminar plato');
    }
  };

  if (loading && dishes.length === 0) {
    return (
      <div className="p-6">
        <p className="text-[#2D4F4F]">Cargando platos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <Typography variant="h3" className="text-gray-800">Platos</Typography>
          <Typography variant="small" className="text-[#2D4F4F]">
            Gestiona el catálogo de platos y subida de imágenes.
          </Typography>
        </div>
        <Button
          onClick={handleCreateDish}
          className="bg-[#2D4F4F] text-white rounded-lg shadow-[0_10px_22px_rgba(45,79,79,0.3)] hover:shadow-[0_14px_30px_rgba(45,79,79,0.35)] transition-all duration-200"
        >
          + Nuevo plato
        </Button>
      </div>

      <DishFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDishes.map((dish) => (
            <Card
              key={dish._id}
              className="bg-[#FDFBF7] border border-[#E8D4B8] shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden rounded-xl flex flex-col h-full"
            >
              {/* Imagen del plato */}
              <CardHeader floated={false} shadow={false} className="m-0 rounded-none h-48 overflow-hidden bg-stone-100">
                {dish.foto ? (
                  <img
                    src={dish.foto}
                    alt={dish.nombre}
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-stone-200">
                    <Typography variant="small" className="text-stone-500">
                      Sin foto
                    </Typography>
                  </div>
                )}
              </CardHeader>

              {/* Contenido */}
              <CardBody className="flex-grow px-4 py-3">
                <Typography variant="h6" className="text-gray-800 mb-1 line-clamp-2">
                  {dish.nombre}
                </Typography>

                {dish.descripcion && (
                  <Typography variant="small" className="text-stone-600 mb-2 line-clamp-2">
                    {dish.descripcion}
                  </Typography>
                )}

                <div className="flex items-center justify-between mb-3">
                  <Typography variant="h5" className="text-[#2D4F4F] font-bold">
                    Q {dish.precio.toFixed(2)}
                  </Typography>
                  <span className="inline-block px-2 py-1 bg-gray-200 text-[#2D4F4F] text-xs font-semibold rounded-full">
                    {getCategoryLabel(dish.categoria)}
                  </span>
                </div>

                <Typography variant="small" className="text-[#2D4F4F] mb-2">
                  Restaurante: {getRestaurantName(dish.restaurantId, restaurantOptions)}
                </Typography>

                {dish.ingredientes && dish.ingredientes.length > 0 && (
                  <Typography variant="small" className="text-stone-600 text-xs mb-3">
                    {dish.ingredientes.length} ingrediente{dish.ingredientes.length !== 1 ? 's' : ''}
                  </Typography>
                )}
              </CardBody>

              {/* Acciones */}
              <div className="border-t border-[#E8D4B8] px-4 py-3 flex gap-2 bg-[#FDFBF7]">
                <IconButton
                  size="sm"
                  onClick={() => handleEditDish(dish)}
                  className="bg-[#2D4F4F] shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200 flex-1"
                  title="Editar plato"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </IconButton>
                <IconButton
                  size="sm"
                  onClick={() => handleRequestDeleteDish(dish)}
                  className="bg-[#D97065] shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200 flex-1"
                  title="Eliminar plato"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-[#FDFBF7] border border-[#E8D4B8] shadow-[0_16px_34px_rgba(26,26,26,0.08)] rounded-xl">
          <CardBody className="flex items-center justify-center py-12">
            <Typography className="text-center text-[#2D4F4F]">
              {searchTerm.trim() ? 'No hay platos que coincidan con la búsqueda.' : 'No hay platos registrados para este filtro.'}
            </Typography>
          </CardBody>
        </Card>
      )}

      <DishFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        dish={selectedDish}
      />

      {/* Modal de confirmación de eliminación */}
      {dishToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[#E8D4B8] bg-[#FDFBF7] p-6 shadow-2xl">
            <Typography variant="h5" className="text-[#1A1A1A]">
              Confirmar eliminación
            </Typography>
            <Typography variant="small" className="mt-2 text-[#2D4F4F]">
              ¿Estás seguro de que deseas eliminar este plato?
            </Typography>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="text"
                onClick={handleCloseDeleteDialog}
                className="rounded-md text-[#2D4F4F] transition-colors duration-200 hover:bg-[#F5EFEA]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDeleteDish}
                disabled={loading}
                className="rounded-md bg-[#D97065] text-white shadow-md transition-all duration-200 hover:shadow-lg"
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
