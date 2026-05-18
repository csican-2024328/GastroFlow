import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Chip, IconButton, Typography } from '@material-tailwind/react';
import { IngredientFilters } from '../components/IngredientFilters.jsx';
import { IngredientModal } from '../components/IngredientModal.jsx';
import { useIngredientStore } from '../store/useIngredientStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';

const getRestaurantName = (restaurantId, restaurantOptions) => {
  const normalizedId = restaurantId?._id || restaurantId;
  const restaurant = restaurantOptions.find((item) => item._id === normalizedId);
  return restaurant?.name || restaurantId?.name || 'Sin restaurante';
};

const normalizeIngredientRestaurantId = (ingredient) => (
  ingredient?.restaurantId?._id ||
  ingredient?.restaurantId ||
  ingredient?.RestaurantId?._id ||
  ingredient?.RestaurantId ||
  ''
);

export const IngredientsPage = ({ hideRestaurantFilter = false, lockedRestaurantId = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const ingredients = useIngredientStore((state) => state.ingredients);
  const restaurantOptions = useIngredientStore((state) => state.restaurantOptions);
  const loading = useIngredientStore((state) => state.loading);
  const selectedRestaurantId = useIngredientStore((state) => state.selectedRestaurantId);
  const fetchRestaurantOptions = useIngredientStore((state) => state.fetchRestaurantOptions);
  const fetchIngredients = useIngredientStore((state) => state.fetchIngredients);
  const deleteIngredientAction = useIngredientStore((state) => state.deleteIngredientAction);
  const clearSelectedIngredient = useIngredientStore((state) => state.clearSelectedIngredient);

  const filteredIngredients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const scopedIngredients = lockedRestaurantId
      ? ingredients.filter((ingredient) => normalizeIngredientRestaurantId(ingredient).toString() === lockedRestaurantId.toString())
      : ingredients;

    if (!normalizedSearch) return scopedIngredients;

    return scopedIngredients.filter((ingredient) =>
      ingredient.nombre?.toLowerCase().includes(normalizedSearch),
    );
  }, [ingredients, lockedRestaurantId, searchTerm]);

  useEffect(() => {
    if (restaurantOptions.length === 0) {
      fetchRestaurantOptions();
    }
  }, [fetchRestaurantOptions, restaurantOptions.length]);

  useEffect(() => {
    fetchIngredients(lockedRestaurantId || selectedRestaurantId);
  }, [fetchIngredients, lockedRestaurantId, selectedRestaurantId]);

  const handleCreateIngredient = () => {
    clearSelectedIngredient();
    setSelectedIngredient(null);
    setIsModalOpen(true);
  };

  const handleEditIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIngredient(null);
    clearSelectedIngredient();
  };

  const handleRequestDeleteIngredient = (ingredient) => {
    setIngredientToDelete(ingredient);
  };

  const handleCloseDeleteDialog = () => {
    setIngredientToDelete(null);
  };

  const handleConfirmDeleteIngredient = async () => {
    if (!ingredientToDelete?._id) {
      return;
    }

    const result = await deleteIngredientAction(ingredientToDelete._id);
    if (result.success) {
      notyfSuccess('Ingrediente eliminado correctamente');
      handleCloseDeleteDialog();
    } else {
      notyfError(result.error || 'Error al eliminar ingrediente');
    }
  };

  if (loading && ingredients.length === 0) {
    return (
      <div className="p-6">
        <p className="text-[#2D4F4F]">Cargando ingredientes...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <Typography variant="h3" className="text-gray-800">Ingredientes</Typography>
          <Typography variant="small" className="text-[#2D4F4F]">
            Administra el inventario de ingredientes por sucursal.
          </Typography>
        </div>
        <Button
          onClick={handleCreateIngredient}
          className="bg-[#2D4F4F] text-white rounded-lg shadow-[0_10px_22px_rgba(45,79,79,0.3)] hover:shadow-[0_14px_30px_rgba(45,79,79,0.35)] transition-all duration-200"
        >
          + Nuevo ingrediente
        </Button>
      </div>

      {!hideRestaurantFilter ? (
        <IngredientFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      ) : (
        <div className="mb-6 rounded-xl border border-[#E8D4B8] bg-[#F5EFEA] px-5 py-4 shadow-sm">
          <Typography variant="small" className="font-medium tracking-wide text-[#2D4F4F]">
            Ingredientes restringidos al restaurante asignado
          </Typography>
        </div>
      )}

      <Card className="bg-[#FDFBF7] border border-[#E8D4B8] shadow-[0_16px_34px_rgba(26,26,26,0.08)] rounded-xl overflow-hidden">
        <CardHeader floated={false} shadow={false} className="bg-transparent m-0 rounded-none border-b border-[#E8D4B8] px-5 py-4">
          <Typography variant="h6" className="text-gray-800">
            Lista de ingredientes
          </Typography>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[#1A1A1A]">
              <thead>
                <tr className="text-[#2D4F4F] uppercase tracking-wide text-xs">
                  <th className="p-4 text-left font-semibold">Nombre</th>
                  <th className="p-4 text-left font-semibold">Stock</th>
                  <th className="p-4 text-left font-semibold">Unidad de medida</th>
                  <th className="p-4 text-left font-semibold">Restaurante</th>
                  <th className="p-4 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.length > 0 ? (
                  filteredIngredients.map((ingredient) => (
                    <tr key={ingredient._id} className="border-t border-[#E8D4B8] hover:bg-[#F5EFEA]/70 transition-colors duration-200">
                      <td className="p-4">
                        <Typography variant="small" className="font-semibold text-[#1A1A1A]">
                          {ingredient.nombre}
                        </Typography>
                      </td>
                      <td className="p-4 text-[#1A1A1A]">
                        <Chip
                          value={ingredient.stock ?? 0}
                          className="inline-flex bg-[#2D4F4F] text-white"
                        />
                      </td>
                      <td className="p-4 text-[#1A1A1A]">{ingredient.unidadMedida}</td>
                      <td className="p-4 text-[#1A1A1A]">{getRestaurantName(ingredient.restaurantId, restaurantOptions)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <IconButton
                            size="sm"
                            onClick={() => handleEditIngredient(ingredient)}
                            className="bg-[#2D4F4F] shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200"
                            title="Editar ingrediente"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </IconButton>
                          <IconButton
                            size="sm"
                            onClick={() => handleRequestDeleteIngredient(ingredient)}
                            className="bg-[#D97065] shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200"
                            title="Eliminar ingrediente"
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-[#2D4F4F]">
                      {searchTerm.trim() ? 'No hay ingredientes que coincidan con la búsqueda.' : 'No hay ingredientes registrados para este filtro.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <IngredientModal
        open={isModalOpen}
        onClose={handleCloseModal}
        ingredient={selectedIngredient}
        lockedRestaurantId={lockedRestaurantId}
      />

      {ingredientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[#E8D4B8] bg-[#FDFBF7] p-6 shadow-2xl">
            <Typography variant="h5" className="text-gray-800">
              Confirmar eliminación
            </Typography>
            <Typography variant="small" className="mt-2 text-[#2D4F4F]">
              ¿Estás seguro de que deseas eliminar este ingrediente?
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
                onClick={handleConfirmDeleteIngredient}
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
