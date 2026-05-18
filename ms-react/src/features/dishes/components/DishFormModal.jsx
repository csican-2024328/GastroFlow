import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Input, Typography } from '@material-tailwind/react';
import { useDishStore } from '../store/useDishStore.js';
import { useIngredientStore } from '../../ingredients/store/useIngredientStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';

const CATEGORY_OPTIONS = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'FUERTE', label: 'Plato Fuerte' },
  { value: 'POSTRE', label: 'Postre' },
  { value: 'BEBIDA', label: 'Bebida' },
];

export const DishFormModal = ({ open, onClose, dish = null }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const restaurantOptions = useDishStore((state) => state.restaurantOptions);
  const fetchRestaurantOptions = useDishStore((state) => state.fetchRestaurantOptions);
  const restaurantOptionsLoading = useDishStore((state) => state.restaurantOptionsLoading);
  const selectedRestaurantId = useDishStore((state) => state.selectedRestaurantId);
  const createDishAction = useDishStore((state) => state.createDishAction);
  const updateDishAction = useDishStore((state) => state.updateDishAction);
  const loading = useDishStore((state) => state.loading);

  const ingredients = useIngredientStore((state) => state.ingredients);
  const fetchIngredients = useIngredientStore((state) => state.fetchIngredients);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: '',
      ingredientes: [],
      restaurantId: '',
    },
  });

  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchRestaurantId = watch('restaurantId');

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
    if (watchRestaurantId && watchRestaurantId !== selectedRestaurantId) {
      fetchIngredients(watchRestaurantId);
    }
  }, [watchRestaurantId, fetchIngredients, selectedRestaurantId]);

  useEffect(() => {
    if (!open) {
      setImagePreview(null);
      setSelectedFile(null);
      return;
    }

    reset({
      nombre: dish?.nombre || '',
      descripcion: dish?.descripcion || '',
      precio: dish?.precio ?? '',
      categoria: dish?.categoria || '',
      ingredientes: dish?.ingredientes?.map((ing) => ing._id || ing) || [],
      restaurantId: dish?.restaurantId?._id || dish?.restaurantId || restaurantId || selectedRestaurantId || '',
    });

    if (dish?.foto) {
      setImagePreview(dish.foto);
    }
  }, [dish, open, reset, selectedRestaurantId]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    // Prevenir doble envío si ya está cargando
    if (loading) return;

    try {
      const formData = new FormData();
      formData.append('nombre', data.nombre.trim());
      formData.append('descripcion', (data.descripcion || '').trim());
      formData.append('precio', Number(data.precio));
      formData.append('categoria', data.categoria);
      formData.append('restaurantId', data.restaurantId);

      if (Array.isArray(data.ingredientes)) {
        formData.append('ingredientes', JSON.stringify(data.ingredientes));
      }

      if (selectedFile) {
        formData.append('foto', selectedFile);
      }

      const result = dish?._id
        ? await updateDishAction(dish._id, formData)
        : await createDishAction(formData);

      if (result.success) {
        notyfSuccess(dish ? 'Plato actualizado correctamente' : 'Plato creado correctamente');
        onClose();
      } else {
        notyfError(result.error || 'No fue posible guardar el plato');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'No fue posible guardar el plato';
      if (error?.response?.status === 429) {
        notyfError('Demasiadas solicitudes. Espera un momento e intenta nuevamente.');
      } else {
        notyfError(errorMessage);
      }
    }
  };

  if (!open) return null;

  const selectClassName =
    'w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20 disabled:cursor-not-allowed disabled:opacity-70';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#E8D4B8] bg-[#2D4F4F] text-stone-50 shadow-2xl">
        <div className="border-b border-[#E8D4B8]/20 px-6 py-5">
          <Typography variant="h5" className="text-stone-50">
            {dish ? 'Editar plato' : 'Nuevo plato'}
          </Typography>
          <Typography variant="small" className="text-stone-300">
            Gestiona el catálogo de platos de tu restaurante.
          </Typography>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[75vh] px-6 py-5">
          <form id="dish-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Restaurante */}
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
                    disabled={restaurantOptionsLoading || loading || (isRestaurantAdmin && hasRestaurantAssigned)}
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
              {errors.restaurantId && <p className="mt-1 text-xs text-red-300">{errors.restaurantId.message}</p>}
            </div>

            {/* Nombre */}
            <div>
              <Typography variant="small" className="mb-2 text-stone-300">
                Nombre del plato *
              </Typography>
              <Input
                type="text"
                disabled={loading}
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                  minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                })}
                placeholder="Ej: Ceviche mixto"
                className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
                labelProps={{ className: 'hidden' }}
              />
              {errors.nombre && <p className="mt-1 text-xs text-red-300">{errors.nombre.message}</p>}
            </div>

            {/* Descripción */}
            <div>
              <Typography variant="small" className="mb-2 text-stone-300">
                Descripción
              </Typography>
              <textarea
                disabled={loading}
                rows={3}
                {...register('descripcion', {
                  maxLength: { value: 500, message: 'La descripción no debe exceder 500 caracteres' },
                })}
                placeholder="Ej: Filete de pescado con limón, cebolla morada y cilantro fresco"
                className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
              />
              {errors.descripcion && <p className="mt-1 text-xs text-red-300">{errors.descripcion.message}</p>}
            </div>

            {/* Precio */}
            <div>
              <Typography variant="small" className="mb-2 text-stone-300">
                Precio *
              </Typography>
              <Input
                type="number"
                disabled={loading}
                min="0"
                step="0.01"
                {...register('precio', {
                  required: 'El precio es obligatorio',
                  valueAsNumber: true,
                  validate: (value) => Number.isFinite(value) && value > 0 || 'El precio debe ser mayor a 0',
                })}
                placeholder="0.00"
                className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
                labelProps={{ className: 'hidden' }}
              />
              {errors.precio && <p className="mt-1 text-xs text-red-300">{errors.precio.message}</p>}
            </div>

            {/* Categoría */}
            <div>
              <Typography variant="small" className="mb-2 text-stone-300">
                Categoría *
              </Typography>
              <Controller
                name="categoria"
                control={control}
                rules={{ required: 'La categoría es obligatoria' }}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={loading}
                    className={selectClassName}
                  >
                    <option value="">-- Selecciona una categoría --</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.categoria && <p className="mt-1 text-xs text-red-300">{errors.categoria.message}</p>}
            </div>

            {/* Ingredientes */}
            <div>
              <Typography variant="small" className="mb-2 text-stone-300">
                Ingredientes *
              </Typography>
              <Controller
                name="ingredientes"
                control={control}
                rules={{
                  required: 'Debes seleccionar al menos un ingrediente',
                  validate: (value) => Array.isArray(value) && value.length > 0 || 'Debes seleccionar al menos un ingrediente',
                }}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={loading}
                    multiple
                    size={5}
                    className={selectClassName}
                    onChange={(e) => {
                      const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);
                      field.onChange(selectedValues);
                    }}
                  >
                    {ingredients.map((ing) => (
                      <option key={ing._id} value={ing._id}>
                        {ing.nombre} ({ing.stock} {ing.unidadMedida})
                      </option>
                    ))}
                  </select>
                )}
              />
              <Typography variant="small" className="mt-1 text-stone-300">
                (Ctrl+Click para seleccionar múltiples)
              </Typography>
              {errors.ingredientes && <p className="mt-1 text-xs text-red-300">{errors.ingredientes.message}</p>}
            </div>

            {/* Foto */}
            <div>
              <Typography variant="small" className="mb-2 text-stone-300">
                Foto del plato {!dish && '*'}
              </Typography>
              <input
                type="file"
                accept="image/*"
                disabled={loading}
                {...register('foto', {
                  validate: () => {
                    if (dish?.foto && !selectedFile) return true;
                    return selectedFile || 'La foto es obligatoria para nuevos platos';
                  },
                })}
                onChange={handleImageChange}
                className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-2 text-stone-900 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20"
              />
              {errors.foto && <p className="mt-1 text-xs text-red-300">{errors.foto.message}</p>}

              {/* Previsualización de imagen */}
              {imagePreview && (
                <div className="mt-4">
                  <Typography variant="small" className="mb-2 text-stone-300">
                    Previsualización
                  </Typography>
                  <img
                    src={imagePreview}
                    alt="Preview del plato"
                    className="h-48 w-full rounded-md border border-[#E8D4B8] object-cover"
                  />
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="border-t border-[#E8D4B8]/20 flex justify-end gap-3 px-6 py-4">
          <Button
            variant="text"
            onClick={onClose}
            className="rounded-md text-stone-300 transition-colors duration-200 hover:bg-stone-900/50"
          >
            Cancelar
          </Button>
          <Button
            form="dish-form"
            type="submit"
            disabled={loading}
            className="rounded-md bg-[#2D4F4F] text-white shadow-md transition-all duration-200 hover:bg-[#24352c] hover:shadow-lg"
          >
            {loading ? 'Guardando...' : 'Guardar plato'}
          </Button>
        </div>
      </div>
    </div>
  );
};
