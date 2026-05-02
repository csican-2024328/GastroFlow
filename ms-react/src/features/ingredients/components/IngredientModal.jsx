import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Input, Typography } from '@material-tailwind/react';
import { useIngredientStore } from '../store/useIngredientStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'lts' },
  { value: 'ml', label: 'ml' },
  { value: 'unidad', label: 'unidad' },
  { value: 'paquete', label: 'paquete' },
];

export const IngredientModal = ({ open, onClose, ingredient = null }) => {
  const restaurantOptions = useIngredientStore((state) => state.restaurantOptions);
  const fetchRestaurantOptions = useIngredientStore((state) => state.fetchRestaurantOptions);
  const restaurantOptionsLoading = useIngredientStore((state) => state.restaurantOptionsLoading);
  const selectedRestaurantId = useIngredientStore((state) => state.selectedRestaurantId);
  const createIngredientAction = useIngredientStore((state) => state.createIngredientAction);
  const updateIngredientAction = useIngredientStore((state) => state.updateIngredientAction);
  const loading = useIngredientStore((state) => state.loading);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: '',
      stock: '',
      unidadMedida: '',
      restaurantId: '',
    },
  });

  useEffect(() => {
    if (restaurantOptions.length === 0) {
      fetchRestaurantOptions();
    }
  }, [fetchRestaurantOptions, restaurantOptions.length]);

  useEffect(() => {
    if (!open) return;

    reset({
      nombre: ingredient?.nombre || '',
      stock: ingredient?.stock ?? '',
      unidadMedida: ingredient?.unidadMedida || '',
      restaurantId: ingredient?.restaurantId?._id || ingredient?.restaurantId || selectedRestaurantId || '',
    });
  }, [ingredient, open, reset, selectedRestaurantId]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        nombre: data.nombre.trim(),
        stock: Number(data.stock),
        unidadMedida: data.unidadMedida,
        restaurantId: data.restaurantId,
      };

      const result = ingredient?._id
        ? await updateIngredientAction(ingredient._id, payload)
        : await createIngredientAction(payload);

      if (result.success) {
        notyfSuccess(ingredient ? 'Ingrediente actualizado correctamente' : 'Ingrediente creado correctamente');
        onClose();
      } else {
        notyfError(result.error || 'No fue posible guardar el ingrediente');
      }
    } catch (error) {
      notyfError(error?.response?.data?.message || error.message || 'No fue posible guardar el ingrediente');
    }
  };

  if (!open) return null;

  const selectClassName =
    'w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-stone-900 outline-none transition focus:border-[#2C4035] focus:ring-2 focus:ring-[#2C4035]/20 disabled:cursor-not-allowed disabled:opacity-70';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-stone-200 bg-[#2C4035] text-stone-50 shadow-2xl">
        <div className="border-b border-stone-200/20 px-6 py-5">
          <Typography variant="h5" className="text-stone-50">
            {ingredient ? 'Editar ingrediente' : 'Nuevo ingrediente'}
          </Typography>
          <Typography variant="small" className="text-stone-300">
            Gestiona el stock por sucursal.
          </Typography>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[75vh] px-6 py-5">
          <form id="ingredient-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Typography variant="small" className="mb-2 text-stone-300">
                Nombre del producto *
              </Typography>
              <Input
                type="text"
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                  minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                })}
                placeholder="Leche entera"
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-stone-900 placeholder:text-stone-500 outline-none transition focus:border-[#2C4035] focus:ring-2 focus:ring-[#2C4035]/20"
                labelProps={{ className: 'hidden' }}
              />
              {errors.nombre && <p className="mt-1 text-xs text-red-300">{errors.nombre.message}</p>}
            </div>

            <div>
              <Typography variant="small" className="mb-2 text-stone-300">
                Stock *
              </Typography>
              <Input
                type="number"
                min="0"
                step="any"
                {...register('stock', {
                  required: 'El stock es obligatorio',
                  valueAsNumber: true,
                  validate: (value) => Number.isFinite(value) && value >= 0 || 'El stock debe ser un número mayor o igual a 0',
                })}
                placeholder="0"
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-stone-900 placeholder:text-stone-500 outline-none transition focus:border-[#2C4035] focus:ring-2 focus:ring-[#2C4035]/20"
                labelProps={{ className: 'hidden' }}
              />
              {errors.stock && <p className="mt-1 text-xs text-red-300">{errors.stock.message}</p>}
            </div>

            <div>
              <Typography variant="small" className="mb-2 text-stone-300">
                Unidad de medida *
              </Typography>
              <Controller
                name="unidadMedida"
                control={control}
                rules={{ required: 'La unidad de medida es obligatoria' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className={selectClassName}
                  >
                    <option value="">-- Selecciona una unidad --</option>
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.unidadMedida && <p className="mt-1 text-xs text-red-300">{errors.unidadMedida.message}</p>}
            </div>

            <div>
              <Typography variant="small" className="mb-2 text-stone-300">
                Restaurante *
              </Typography>
              <Controller
                name="restaurantId"
                control={control}
                rules={{ required: 'El restaurante es obligatorio' }}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={restaurantOptionsLoading || Boolean(ingredient?._id)}
                    className={selectClassName}
                  >
                    <option value="">-- Selecciona un restaurante --</option>
                    {restaurantOptions.map((restaurant) => (
                      <option key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {ingredient?._id && (
                <p className="mt-1 text-xs text-stone-300">
                  El restaurante no se puede cambiar en una edición.
                </p>
              )}
              {errors.restaurantId && <p className="mt-1 text-xs text-red-300">{errors.restaurantId.message}</p>}
            </div>

          </form>
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-200/20 px-6 py-4">
          <Button
            variant="text"
            onClick={onClose}
            className="rounded-md text-stone-300 transition-colors duration-200 hover:bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="rounded-md bg-[#2C4035] text-white shadow-md transition-all duration-200 hover:bg-[#24352c] hover:shadow-lg"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  );
};