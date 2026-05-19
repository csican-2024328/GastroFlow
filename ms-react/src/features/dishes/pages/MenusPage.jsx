import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardBody, CardHeader, IconButton, Typography } from '@material-tailwind/react';
import { useMenuStore } from '../store/useMenuStore.js';
import { MenuFilters } from '../components/MenuFilters.jsx';
import { MenuFormModal } from '../components/MenuFormModal.jsx';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';

const getRestaurantName = (restaurantId, restaurantOptions) => {
  const normalizedId = restaurantId?._id || restaurantId;
  const restaurant = restaurantOptions.find((item) => item._id === normalizedId);
  return restaurant?.name || restaurantId?.name || 'Sin restaurante';
};

const formatCurrency = (value) => {
  const number = Number(value || 0);
  return `Q ${number.toFixed(2)}`;
};

export const MenusPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const menus = useMenuStore((state) => state.menus);
  const restaurantOptions = useMenuStore((state) => state.restaurantOptions);
  const loading = useMenuStore((state) => state.loading);
  const selectedRestaurantId = useMenuStore((state) => state.selectedRestaurantId);
  const fetchRestaurantOptions = useMenuStore((state) => state.fetchRestaurantOptions);
  const fetchMenus = useMenuStore((state) => state.fetchMenus);
  const deleteMenuAction = useMenuStore((state) => state.deleteMenuAction);
  const clearSelectedMenu = useMenuStore((state) => state.clearSelectedMenu);

  const { restaurantId } = useRestaurantScope();

  const effectiveRestaurantId = restaurantId || selectedRestaurantId || '';

  const filteredMenus = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return menus.filter((menu) => {
      if (effectiveRestaurantId) {
        const menuRestaurantId = menu.restaurantId?._id || menu.restaurantId;
        if (!menuRestaurantId || String(menuRestaurantId) !== String(effectiveRestaurantId)) {
          return false;
        }
      }

      if (!normalizedSearch) return true;

      return menu.nombre?.toLowerCase().includes(normalizedSearch)
        || menu.descripcion?.toLowerCase().includes(normalizedSearch);
    });
  }, [effectiveRestaurantId, menus, searchTerm]);

  useEffect(() => {
    if (restaurantOptions.length === 0) {
      fetchRestaurantOptions();
    }
  }, [fetchRestaurantOptions, restaurantOptions.length]);

  useEffect(() => {
    fetchMenus(effectiveRestaurantId || undefined);
  }, [effectiveRestaurantId, fetchMenus]);

  const handleCreateMenu = () => {
    clearSelectedMenu();
    setSelectedMenu(null);
    setIsModalOpen(true);
  };

  const handleEditMenu = (menu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMenu(null);
    clearSelectedMenu();
  };

  const handleRequestDeleteMenu = (menu) => {
    setMenuToDelete(menu);
  };

  const handleCloseDeleteDialog = () => {
    setMenuToDelete(null);
  };

  const handleConfirmDeleteMenu = async () => {
    if (!menuToDelete?._id) return;

    const result = await deleteMenuAction(menuToDelete._id);
    if (result.success) {
      notyfSuccess('Menú eliminado correctamente');
      handleCloseDeleteDialog();
    } else {
      notyfError(result.error || 'Error al eliminar menú');
    }
  };

  if (loading && menus.length === 0) {
    return (
      <div className="p-6">
        <p className="text-[#2D4F4F]">Cargando menús...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography variant="h3" className="text-gray-800">Menús</Typography>
          <Typography variant="small" className="text-[#2D4F4F]">
            Administra los menús y su relación con platos e ingredientes.
          </Typography>
        </div>
        <Button
          onClick={handleCreateMenu}
          className="rounded-lg bg-[#2D4F4F] text-white shadow-[0_10px_22px_rgba(45,79,79,0.3)] transition-all duration-200 hover:shadow-[0_14px_30px_rgba(45,79,79,0.35)]"
        >
          + Nuevo menú
        </Button>
      </div>

      <MenuFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {filteredMenus.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMenus.map((menu) => (
            <Card
              key={menu._id}
              className="flex h-full flex-col overflow-hidden rounded-xl border border-[#E8D4B8] bg-[#FDFBF7] shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <CardHeader floated={false} shadow={false} className="m-0 h-48 overflow-hidden rounded-none bg-stone-100">
                {menu.foto ? (
                  <img
                    src={menu.foto}
                    alt={menu.nombre}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-stone-200">
                    <Typography variant="small" className="text-stone-500">Sin foto</Typography>
                  </div>
                )}
              </CardHeader>

              <CardBody className="flex-grow px-4 py-3">
                <Typography variant="h6" className="mb-1 line-clamp-2 text-gray-800">{menu.nombre}</Typography>

                {menu.descripcion && (
                  <Typography variant="small" className="mb-2 line-clamp-2 text-stone-600">{menu.descripcion}</Typography>
                )}

                <div className="mb-3 flex items-center justify-between">
                  <Typography variant="h5" className="font-bold text-[#2D4F4F]">{formatCurrency(menu.precio)}</Typography>
                  <span className="inline-block rounded-full bg-gray-200 px-2 py-1 text-xs font-semibold text-[#2D4F4F]">
                    {menu.tipo || 'SIN TIPO'}
                  </span>
                </div>

                <Typography variant="small" className="mb-1 text-[#2D4F4F]">
                  Restaurante: {getRestaurantName(menu.restaurantId, restaurantOptions)}
                </Typography>

                <Typography variant="small" className="mb-1 text-xs text-stone-600">
                  {Array.isArray(menu.platos) ? `${menu.platos.length} plato${menu.platos.length !== 1 ? 's' : ''}` : 'Sin platos'}
                </Typography>

                <Typography variant="small" className="text-xs text-stone-600">
                  {Array.isArray(menu.ingredientes) ? `${menu.ingredientes.length} ingrediente${menu.ingredientes.length !== 1 ? 's' : ''}` : 'Sin ingredientes'}
                </Typography>
              </CardBody>

              <div className="flex gap-2 border-t border-[#E8D4B8] bg-[#FDFBF7] px-4 py-3">
                <IconButton
                  size="sm"
                  onClick={() => handleEditMenu(menu)}
                  className="flex-1 bg-[#2D4F4F] shadow-md transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg"
                  title="Editar menú"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </IconButton>
                <IconButton
                  size="sm"
                  onClick={() => handleRequestDeleteMenu(menu)}
                  className="flex-1 bg-[#D97065] shadow-md transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg"
                  title="Eliminar menú"
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
        <Card className="rounded-xl border border-[#E8D4B8] bg-[#FDFBF7] shadow-[0_16px_34px_rgba(26,26,26,0.08)]">
          <CardBody className="flex items-center justify-center py-12">
            <Typography className="text-center text-[#2D4F4F]">
              {searchTerm.trim() ? 'No hay menús que coincidan con la búsqueda.' : 'No hay menús registrados para este filtro.'}
            </Typography>
          </CardBody>
        </Card>
      )}

      <MenuFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        menu={selectedMenu}
      />

      {menuToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[#E8D4B8] bg-[#FDFBF7] p-6 shadow-2xl">
            <Typography variant="h5" className="text-[#1A1A1A]">Confirmar eliminación</Typography>
            <Typography variant="small" className="mt-2 text-[#2D4F4F]">
              ¿Estás seguro de que deseas eliminar este menú?
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
                onClick={handleConfirmDeleteMenu}
                disabled={loading}
                className="bg-[#D97065] text-white"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};