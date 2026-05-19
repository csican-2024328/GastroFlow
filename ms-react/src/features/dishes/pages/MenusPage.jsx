import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardBody, CardHeader, IconButton, Typography } from '@material-tailwind/react';
import { useMenuStore } from '../store/useMenuStore.js';
import { MenuFilters } from '../components/MenuFilters.jsx';
import { MenuFormModal } from '../components/MenuFormModal.jsx';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
import '../../../styles/menu.css';

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
      <div className="menu-page">
        <div className="menu-page__hero">
          <div>
            <p className="menu-page__eyebrow">Menús</p>
            <h1 className="menu-page__title">Administración de menús</h1>
            <p className="menu-page__subtitle">Cargando menús...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="menu-page__hero">
        <div>
          <p className="menu-page__eyebrow">Gestión de cocina</p>
          <Typography variant="h3" className="menu-page__title">Menús</Typography>
          <Typography variant="small" className="menu-page__subtitle">
            Administra los menús y su relación con platos e ingredientes.
          </Typography>
        </div>
        <Button
          onClick={handleCreateMenu}
          className="ds-btn-new"
        >
          + Nuevo menú
        </Button>
      </div>

      <MenuFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {filteredMenus.length > 0 ? (
        <div className="menu-page__grid">
          {filteredMenus.map((menu) => (
            <Card
              key={menu._id}
              className="menu-card"
            >
              <CardHeader floated={false} shadow={false} className="menu-card__media m-0 rounded-none border-0 p-0">
                {menu.foto ? (
                  <img
                    src={menu.foto}
                    alt={menu.nombre}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="menu-card__media-placeholder">
                    <Typography variant="small" className="text-inherit">Sin foto</Typography>
                  </div>
                )}
              </CardHeader>

              <CardBody className="menu-card__body">
                <Typography variant="h6" className="menu-card__title line-clamp-2">{menu.nombre}</Typography>

                {menu.descripcion && (
                  <Typography variant="small" className="menu-card__description line-clamp-2">{menu.descripcion}</Typography>
                )}

                <div className="menu-card__meta-row">
                  <Typography variant="h5" className="menu-card__price">{formatCurrency(menu.precio)}</Typography>
                  <span className="menu-card__tag">
                    {menu.tipo || 'SIN TIPO'}
                  </span>
                </div>

                <Typography variant="small" className="menu-card__detail">
                  Restaurante: {getRestaurantName(menu.restaurantId, restaurantOptions)}
                </Typography>

                <Typography variant="small" className="menu-card__detail text-xs">
                  {Array.isArray(menu.platos) ? `${menu.platos.length} plato${menu.platos.length !== 1 ? 's' : ''}` : 'Sin platos'}
                </Typography>

                <Typography variant="small" className="menu-card__detail text-xs">
                  {Array.isArray(menu.ingredientes) ? `${menu.ingredientes.length} ingrediente${menu.ingredientes.length !== 1 ? 's' : ''}` : 'Sin ingredientes'}
                </Typography>
              </CardBody>

              <div className="menu-card__actions">
                <IconButton
                  size="sm"
                  onClick={() => handleEditMenu(menu)}
                  className="menu-icon-btn menu-icon-btn--edit flex-1 transition-all duration-200 hover:-translate-y-[1px]"
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
                  className="menu-icon-btn menu-icon-btn--delete flex-1 transition-all duration-200 hover:-translate-y-[1px]"
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
        <Card className="menu-empty shadow-[0_16px_34px_rgba(26,26,26,0.08)]">
          <CardBody className="menu-empty__body">
            <Typography className="text-center text-inherit">
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
        <div className="menu-modal-overlay">
          <div className="menu-confirm p-6 shadow-2xl">
            <Typography variant="h5" className="text-inherit">Confirmar eliminación</Typography>
            <Typography variant="small" className="mt-2 text-inherit">
              ¿Estás seguro de que deseas eliminar este menú?
            </Typography>
            <div className="menu-confirm__actions">
              <Button
                variant="text"
                onClick={handleCloseDeleteDialog}
                className="menu-confirm__button menu-confirm__button--secondary transition-colors duration-200"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDeleteMenu}
                disabled={loading}
                className="menu-confirm__button menu-confirm__button--danger"
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