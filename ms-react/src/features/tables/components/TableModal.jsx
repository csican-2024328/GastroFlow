import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Typography } from '@material-tailwind/react';
import { useTableStore } from '../store/useTableStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';

export const TableModal = ({ open, onClose, mesa = null }) => {
  const restaurantOptions = useTableStore((state) => state.restaurantOptions);
  const fetchRestaurantOptions = useTableStore((state) => state.fetchRestaurantOptions);
  const restaurantOptionsLoading = useTableStore((state) => state.restaurantOptionsLoading);
  const selectedRestaurantId = useTableStore((state) => state.selectedRestaurantId);
  const createMesaAction = useTableStore((state) => state.createMesaAction);
  const updateMesaAction = useTableStore((state) => state.updateMesaAction);
  const loading = useTableStore((state) => state.loading);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      numero: '',
      capacidad: '',
      ubicacion: '',
      restaurantID: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (restaurantOptions.length === 0) {
        fetchRestaurantOptions();
      } else {
        fetchRestaurantOptions(true);
      }
    }
  }, [open, fetchRestaurantOptions, restaurantOptions.length]);

  useEffect(() => {
    if (open) {
      reset({
        numero: mesa?.numero ?? '',
        capacidad: mesa?.capacidad ?? '',
        ubicacion: mesa?.ubicacion ?? '',
        restaurantID:
          mesa?.restaurantID?._id ||
          mesa?.restaurantID ||
          selectedRestaurantId ||
          '',
      });
    }
  }, [mesa, open, reset, selectedRestaurantId]);

  const onSubmit = async (formData) => {
    try {
      const payload = {
        numero: Number(formData.numero),
        capacidad: Number(formData.capacidad),
        ubicacion: formData.ubicacion,
        restaurantID: formData.restaurantID,
        isActive: true,
      };

      const result = mesa?._id
        ? await updateMesaAction(mesa._id, payload)
        : await createMesaAction(payload);

      if (result.success) {
        notyfSuccess(mesa ? 'Mesa actualizada correctamente' : 'Mesa creada correctamente');
        onClose();
      } else {
        notyfError(result.error || 'No fue posible guardar la mesa');
      }
    } catch (error) {
      notyfError(
        error?.response?.data?.message ||
          error.message ||
          'No fue posible guardar la mesa'
      );
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FDFBF7] text-gray-800 border border-[#E8D4B8] rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-[0_30px_70px_rgba(26,26,26,0.45)]">

        {/* Header */}
        <div className="border-b border-[#E8D4B8] px-6 py-5 bg-[#F5EFEA]\">
          <Typography variant="h5" className="text-[#2D4F4F]\">
            {mesa ? 'Editar mesa' : 'Nueva mesa'}
          </Typography>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto max-h-[75vh] px-6 py-5">
          <form id="table-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Número de mesa */}
            <div>
              <Typography variant="small" className="mb-2 text-[#2D4F4F]">
                Número de mesa *
              </Typography>
              <Input
                type="number"
                min="1"
                {...register('numero', {
                  required: 'El número de mesa es obligatorio',
                  valueAsNumber: true,
                  validate: (value) =>
                    Number(value) > 0 || 'El número debe ser mayor a 0',
                })}
                className="!border-[#E8D4B8] text-gray-800 rounded-md"
                labelProps={{ className: 'hidden' }}
              />
              {errors.numero && (
                <p className="mt-1 text-xs text-red-500">{errors.numero.message}</p>
              )}
            </div>

            {/* Capacidad */}
            <div>
              <Typography variant="small" className="mb-2 text-[#2D4F4F]">
                Capacidad de personas *
              </Typography>
              <Input
                type="number"
                min="1"
                {...register('capacidad', {
                  required: 'La capacidad es obligatoria',
                  valueAsNumber: true,
                  validate: (value) =>
                    Number(value) > 0 || 'La capacidad debe ser mayor a 0',
                })}
                className="!border-[#E8D4B8] text-gray-800 rounded-md"
                labelProps={{ className: 'hidden' }}
              />
              {errors.capacidad && (
                <p className="mt-1 text-xs text-red-500">{errors.capacidad.message}</p>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <Typography variant="small" className="mb-2 text-[#2D4F4F]">
                Identificador visual / Ubicación *
              </Typography>
              <Input
                type="text"
                {...register('ubicacion', {
                  required: 'El identificador visual es obligatorio',
                })}
                placeholder="Terraza, Ventana, Sala 1"
                className="!border-[#E8D4B8] text-gray-800 rounded-md"
                labelProps={{ className: 'hidden' }}
              />
              {errors.ubicacion && (
                <p className="mt-1 text-xs text-red-500">{errors.ubicacion.message}</p>
              )}
            </div>

            {/* Restaurante */}
            <div>
              <Typography variant="small" className="mb-2 text-[#2D4F4F]">
                Restaurante *
              </Typography>
              <Controller
                name="restaurantID"
                control={control}
                rules={{ required: 'El restaurante es obligatorio' }}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value || ''}
                    disabled={restaurantOptionsLoading}
                    className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 shadow-sm outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="">Selecciona un restaurante</option>
                    {restaurantOptions.map((restaurant) => (
                      <option key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.restaurantID && (
                <p className="mt-1 text-xs text-red-500">{errors.restaurantID.message}</p>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E8D4B8] gap-2 flex justify-end px-6 py-4 bg-[#F5EFEA]">
          <Button
            variant="text"
            onClick={onClose}
            className="text-[#2D4F4F] hover:bg-[#FDFBF7] rounded-md transition-colors duration-200"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-[#2D4F4F] text-white hover:bg-[#3A6B6B] rounded-md shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>

      </div>
    </div>
  );
};