import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Input,
  Typography,
} from '@material-tailwind/react';
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
    if (restaurantOptions.length === 0) {
      fetchRestaurantOptions();
    }
  }, [fetchRestaurantOptions, restaurantOptions.length]);

  useEffect(() => {
    if (open) {
      reset({
        numero: mesa?.numero ?? '',
        capacidad: mesa?.capacidad ?? '',
        ubicacion: mesa?.ubicacion ?? '',
        restaurantID: mesa?.restaurantID?._id || mesa?.restaurantID || selectedRestaurantId || '',
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
      notyfError(error?.response?.data?.message || error.message || 'No fue posible guardar la mesa');
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
      <div className="bg-gradient-to-br from-[var(--gf-green)] to-[var(--gf-green)]/95 text-[var(--gf-cream)] border border-[var(--gf-beige)]/35 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-[0_30px_70px_rgba(26,26,26,0.45)]">
      <div className="border-b border-[var(--gf-beige)]/25 px-6 py-5">
        <Typography variant="h5" className="text-[var(--gf-cream)]">
          {mesa ? 'Editar mesa' : 'Nueva mesa'}
        </Typography>
      </div>
      <div className="space-y-4 overflow-y-auto max-h-[75vh] px-6 py-5">
        <form id="table-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Typography variant="small" className="mb-2 text-[var(--gf-beige)]">
              Número de mesa *
            </Typography>
            <Input
              type="number"
              min="1"
              {...register('numero', {
                required: 'El número de mesa es obligatorio',
                valueAsNumber: true,
                validate: (value) => Number(value) > 0 || 'El número debe ser mayor a 0',
              })}
              className="!border-[var(--gf-beige)]/40 text-[var(--gf-cream)] rounded-md"
              labelProps={{ className: 'hidden' }}
            />
            {errors.numero && <p className="mt-1 text-xs text-red-400">{errors.numero.message}</p>}
          </div>

          <div>
            <Typography variant="small" className="mb-2 text-[var(--gf-beige)]">
              Capacidad de personas *
            </Typography>
            <Input
              type="number"
              min="1"
              {...register('capacidad', {
                required: 'La capacidad es obligatoria',
                valueAsNumber: true,
                validate: (value) => Number(value) > 0 || 'La capacidad debe ser mayor a 0',
              })}
              className="!border-[var(--gf-beige)]/40 text-[var(--gf-cream)] rounded-md"
              labelProps={{ className: 'hidden' }}
            />
            {errors.capacidad && <p className="mt-1 text-xs text-red-400">{errors.capacidad.message}</p>}
          </div>

          <div>
            <Typography variant="small" className="mb-2 text-[var(--gf-beige)]">
              Identificador visual / Ubicación *
            </Typography>
            <Input
              type="text"
              {...register('ubicacion', {
                required: 'El identificador visual es obligatorio',
              })}
              placeholder="Terraza, Ventana, Sala 1"
              className="!border-[var(--gf-beige)]/40 text-[var(--gf-cream)] rounded-md"
              labelProps={{ className: 'hidden' }}
            />
            {errors.ubicacion && <p className="mt-1 text-xs text-red-400">{errors.ubicacion.message}</p>}
          </div>

          <div>
            <Typography variant="small" className="mb-2 text-[var(--gf-beige)]">
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
                  className="w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 shadow-sm outline-none transition focus:border-[#2C4035] focus:ring-2 focus:ring-[#2C4035]/20 disabled:cursor-not-allowed disabled:opacity-70"
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
            {errors.restaurantID && <p className="mt-1 text-xs text-red-400">{errors.restaurantID.message}</p>}
          </div>
        </form>
      </div>
      <div className="border-t border-[var(--gf-beige)]/25 gap-2 flex justify-end px-6 py-4">
        <Button variant="text" onClick={onClose} className="text-[var(--gf-beige)] hover:bg-[var(--gf-beige)]/10 rounded-md transition-colors duration-200">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-[var(--gf-beige)] text-[var(--gf-graphite)] hover:bg-[var(--gf-terracotta)] hover:text-[var(--gf-cream)] rounded-md shadow-md hover:shadow-lg transition-all duration-200"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
      </div>
    </div>
  );
};
