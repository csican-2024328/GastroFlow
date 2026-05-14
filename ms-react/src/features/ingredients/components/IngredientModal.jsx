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
      restaurantId:
        ingredient?.restaurantId?._id ||
        ingredient?.restaurantId ||
        selectedRestaurantId ||
        '',
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
        notyfSuccess(
          ingredient
            ? 'Ingrediente actualizado correctamente'
            : 'Ingrediente creado correctamente'
        );
        onClose();
      } else {
        notyfError(result.error || 'No fue posible guardar el ingrediente');
      }
    } catch (error) {
      notyfError(
        error?.response?.data?.message ||
          error.message ||
          'No fue posible guardar el ingrediente'
      );
    }
  };

  if (!open) return null;

  const selectClassName =
    'w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 shadow-sm outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20 disabled:cursor-not-allowed disabled:opacity-70';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FDFBF7] text-gray-800 border border-[#E8D4B8] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_30px_70px_rgba(26,26,26,0.45)]">

        {/* Header */}
        <div className="border-b border-[#E8D4B8] px-6 py-5 bg-[#F5EFEA]">
          <Typography variant="h5" className="text-[#2D4F4F]">
            {ingredient ? 'Editar ingrediente' : 'Nuevo ingrediente'}
          </Typography>
          <Typography variant="small" className="text-gray-500">
            Gestiona el stock por sucursal.
          </Typography>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto max-h-[75vh] px-6 py-5">
          <form id="ingredient-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Nombre */}
            <div>
              <Typography variant="small" className="mb-2 text-[#2D4F4F]">
                Nombre del producto *
              </Typography>
              <Input
                type="text"
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres',
                  },
                })}
                placeholder="Leche entera"
                className="!border-[#E8D4B8] bg-[#FDFBF7] text-gray-800 rounded-md"
                labelProps={{ className: 'hidden' }}
              />
              {errors.nombre && (
                <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <Typography variant="small" className="mb-2 text-[#2D4F4F]">
                Stock *
              </Typography>
              <Input
                type="number"
                min="0"
                step="any"
                {...register('stock', {
                  required: 'El stock es obligatorio',
                  valueAsNumber: true,
                  validate: (value) =>
                    (Number.isFinite(value) && value >= 0) ||
                    'El stock debe ser un número mayor o igual a 0',
                })}
                placeholder="0"
                className="!border-[#E8D4B8] bg-[#FDFBF7] text-gray-800 rounded-md"
                labelProps={{ className: 'hidden' }}
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>
              )}
            </div>

            {/* Unidad de medida */}
            <div>
              <Typography variant="small" className="mb-2 text-[#2D4F4F]">
                Unidad de medida *
              </Typography>
              <Controller
                name="unidadMedida"
                control={control}
                rules={{ required: 'La unidad de medida es obligatoria' }}
                render={({ field }) => (
                  <select {...field} className={selectClassName}>
                    <option value="">-- Selecciona una unidad --</option>
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.unidadMedida && (
                <p className="mt-1 text-xs text-red-500">{errors.unidadMedida.message}</p>
              )}
            </div>

            {/* Restaurante */}
            <div>
              <Typography variant="small" className="mb-2 text-[#2D4F4F]">
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
                <p className="mt-1 text-xs text-gray-500">
                  El restaurante no se puede cambiar en una edición.
                </p>
              )}
              {errors.restaurantId && (
                <p className="mt-1 text-xs text-red-500">{errors.restaurantId.message}</p>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E8D4B8] gap-2 flex justify-end px-6 py-4 bg-[#F5EFEA]">
          <Button
            variant="text"
            onClick={onClose}
            className="text-[#2D4F4F] hover:bg-[#F5EFEA] rounded-md transition-colors duration-200"
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