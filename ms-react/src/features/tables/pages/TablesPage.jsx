import { useEffect, useRef, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Chip, IconButton, Typography } from '@material-tailwind/react';
import { useTableStore } from '../store/useTableStore.js';
import { TableFilters } from '../components/TableFilters.jsx';
import { TableModal } from '../components/TableModal.jsx';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';

export const TablesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const hasMountedRef = useRef(false);
  const skipNextPageFetchRef = useRef(false);
  const currentPageRef = useRef(currentPage);

  currentPageRef.current = currentPage;

  const restaurantOptions = useTableStore((state) => state.restaurantOptions);
  const fetchRestaurantOptions = useTableStore((state) => state.fetchRestaurantOptions);
  const selectedRestaurantId = useTableStore((state) => state.selectedRestaurantId);
  const mesas = useTableStore((state) => state.mesas);
  const loading = useTableStore((state) => state.loading);
  const pagination = useTableStore((state) => state.pagination);
  const fetchMesas = useTableStore((state) => state.fetchMesas);
  const deleteMesaAction = useTableStore((state) => state.deleteMesaAction);
  const clearSelectedMesa = useTableStore((state) => state.clearSelectedMesa);

  useEffect(() => {
    if (restaurantOptions.length === 0) {
      fetchRestaurantOptions();
    }
  }, [fetchRestaurantOptions, restaurantOptions.length]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (currentPageRef.current !== 1) {
      skipNextPageFetchRef.current = true;
      setCurrentPage(1);
    }

    fetchMesas(1, 10, selectedRestaurantId);
  }, [fetchMesas, selectedRestaurantId]);

  useEffect(() => {
    if (skipNextPageFetchRef.current) {
      skipNextPageFetchRef.current = false;
      return;
    }

    fetchMesas(currentPage, 10, selectedRestaurantId);
  }, [currentPage, fetchMesas]);

  const handleCreateMesa = () => {
    clearSelectedMesa();
    setSelectedMesa(null);
    setIsModalOpen(true);
  };

  const handleEditMesa = (mesa) => {
    setSelectedMesa(mesa);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMesa(null);
    clearSelectedMesa();
  };

  const handleDeleteMesa = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta mesa?')) return;

    const result = await deleteMesaAction(id);
    if (result.success) {
      notyfSuccess('Mesa eliminada correctamente');
    } else {
      notyfError(result.error || 'Error al eliminar la mesa');
    }
  };

  const getRestaurantName = (restaurantID) => {
    const restaurant = restaurantOptions.find((item) => item._id === restaurantID || item._id === restaurantID?._id);
    return restaurant?.name || restaurantID?.name || 'Sin restaurante';
  };

  if (loading && mesas.length === 0) {
    return (
      <div className="p-6">
        <p className="text-[#C4A882]">Cargando mesas...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <Typography variant="h3" className="text-[#F0EDE8]">Mesas</Typography>
          <Typography variant="small" className="text-[#C4A882]">
            Administra las mesas por sucursal.
          </Typography>
        </div>
        <Button onClick={handleCreateMesa} className="bg-[#1A3D25] text-[#F0EDE8]">
          + Nueva mesa
        </Button>
      </div>

      <TableFilters />

      <Card className="bg-[#0F452A] border border-[#113a26] shadow-none rounded-lg overflow-hidden">
        <CardHeader floated={false} shadow={false} className="bg-transparent m-0 rounded-none border-b border-[#113a26] px-4 py-3">
          <Typography variant="h6" className="text-[#F0EDE8]">
            Lista de mesas
          </Typography>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[#F0EDE8]">
              <thead>
                <tr className="text-[#C4A882]">
                  <th className="p-4 text-left font-normal">Identificador</th>
                  <th className="p-4 text-left font-normal">Número</th>
                  <th className="p-4 text-left font-normal">Capacidad</th>
                  <th className="p-4 text-left font-normal">Restaurante</th>
                  <th className="p-4 text-left font-normal">Estado</th>
                  <th className="p-4 text-left font-normal">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mesas.length > 0 ? (
                  mesas.map((mesa) => (
                    <tr key={mesa._id} className="border-t border-[#113a26]">
                      <td className="p-4">
                        <Typography variant="small" className="font-semibold text-[#F0EDE8]">
                          {mesa.ubicacion}
                        </Typography>
                      </td>
                      <td className="p-4 text-[#F0EDE8]">{mesa.numero}</td>
                      <td className="p-4 text-[#F0EDE8]">{mesa.capacidad}</td>
                      <td className="p-4 text-[#F0EDE8]">{getRestaurantName(mesa.restaurantID)}</td>
                      <td className="p-4">
                        <Chip
                          value={mesa.isActive ? 'Activa' : 'Inactiva'}
                          className={mesa.isActive ? 'bg-green-700' : 'bg-gray-600'}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <IconButton
                            size="sm"
                            onClick={() => handleEditMesa(mesa)}
                            className="bg-[#1A3D25]"
                            title="Editar mesa"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </IconButton>
                          <IconButton
                            size="sm"
                            onClick={() => handleDeleteMesa(mesa._id)}
                            className="bg-red-700"
                            title="Eliminar mesa"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4"
                            >
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
                    <td colSpan="6" className="p-6 text-center text-[#7A9E85]">
                      No hay mesas registradas para este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={page === currentPage ? 'bg-[#1A3D25] text-[#F0EDE8]' : 'bg-[#0F452A] text-[#C4A882]'}
            >
              {page}
            </Button>
          ))}
        </div>
      )}

      <TableModal open={isModalOpen} onClose={handleCloseModal} mesa={selectedMesa} />
    </div>
  );
};
