import { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Button, Input, Typography } from '@material-tailwind/react';
import { useMenuStore } from '../store/useMenuStore.js';
import { useDishStore } from '../store/useDishStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';

const DAY_OPTIONS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const MenuFormModal = ({ open, onClose, menu = null }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const restaurantOptions = useMenuStore((state) => state.restaurantOptions);
  const fetchRestaurantOptions = useMenuStore((state) => state.fetchRestaurantOptions);
  const restaurantOptionsLoading = useMenuStore((state) => state.restaurantOptionsLoading);
  const selectedRestaurantId = useMenuStore((state) => state.selectedRestaurantId);
  const createMenuAction = useMenuStore((state) => state.createMenuAction);
  const updateMenuAction = useMenuStore((state) => state.updateMenuAction);
  const loading = useMenuStore((state) => state.loading);

  const menuDishes = useDishStore((state) => state.dishes);
  const fetchDishes = useDishStore((state) => state.fetchDishes);

  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      restaurantId: '',
      platos: [],
      availableFrom: '',
      availableTo: '',
      schedule: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'schedule',
  });

  const watchRestaurantId = useWatch({ control, name: 'restaurantId' });

  const restaurantContextId = useMemo(() => {
    if (isRestaurantAdmin && hasRestaurantAssigned) {
      return restaurantId;
    }

    return watchRestaurantId || selectedRestaurantId || '';
  }, [hasRestaurantAssigned, isRestaurantAdmin, restaurantId, selectedRestaurantId, watchRestaurantId]);

  useEffect(() => {
    if (!open) return;

    fetchRestaurantOptions();
  }, [fetchRestaurantOptions, open]);

  useEffect(() => {
    if (!open || !restaurantContextId) return;

    fetchDishes(restaurantContextId);
  }, [fetchDishes, open, restaurantContextId]);

  useEffect(() => {
    if (!open) {
      setImagePreview(null);
      setSelectedFile(null);
      return;
    }

    const resolvedRestaurantId = menu?.restaurantId?._id || menu?.restaurantId || restaurantId || selectedRestaurantId || '';

    reset({
      nombre: menu?.nombre || '',
      descripcion: menu?.descripcion || '',
      restaurantId: resolvedRestaurantId,
      platos: menu?.platos?.map((item) => item._id || item) || [],
      availableFrom: toDateInputValue(menu?.availableFrom),
      availableTo: toDateInputValue(menu?.availableTo),
      schedule: menu?.schedule?.length
        ? menu.schedule.map((item) => ({
          dayNumber: String(item.dayNumber ?? 0),
          startTime: item.startTime || '',
          endTime: item.endTime || '',
        }))
        : [],
    });

    if (menu?.foto) {
      setImagePreview(menu.foto);
    }
  }, [menu, open, reset, restaurantId, selectedRestaurantId]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    if (loading) return;

    if (!data.restaurantId) {
      notyfError('Debes seleccionar un restaurante');
      return;
    }

    if (!Array.isArray(data.platos) || data.platos.length === 0) {
      notyfError('Debes seleccionar al menos un plato');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nombre', data.nombre.trim());
      formData.append('descripcion', (data.descripcion || '').trim());
      formData.append('restaurantId', data.restaurantId);
      formData.append('platos', JSON.stringify(data.platos));

      if (data.availableFrom) {
        formData.append('availableFrom', data.availableFrom);
      }

      if (data.availableTo) {
        formData.append('availableTo', data.availableTo);
      }

      if (Array.isArray(data.schedule)) {
        formData.append('schedule', JSON.stringify(data.schedule.filter((item) => item.dayNumber !== '' && item.startTime && item.endTime)));
      }

      if (selectedFile) {
        formData.append('foto', selectedFile);
      }

      const result = menu?._id
        ? await updateMenuAction(menu._id, formData)
        : await createMenuAction(formData);

      if (result.success) {
        notyfSuccess(menu ? 'Menú actualizado correctamente' : 'Menú creado correctamente');
        onClose();
      } else {
        notyfError(result.error || 'No fue posible guardar el menú');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'No fue posible guardar el menú';
      notyfError(errorMessage);
    }
  };

  if (!open) return null;

  const selectClassName = 'w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20 disabled:cursor-not-allowed disabled:opacity-70';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-[#E8D4B8] bg-[#2D4F4F] text-stone-50 shadow-2xl">
        <div className="border-b border-[#E8D4B8]/20 px-6 py-5">
          <Typography variant="h5" className="text-stone-50">
            {menu ? 'Editar menú' : 'Nuevo menú'}
          </Typography>
          <Typography variant="small" className="text-stone-300">
            Gestiona menús, platos asociados, ingredientes y programación.
          </Typography>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[75vh] px-6 py-5">
          <form id="menu-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Typography variant="small" className="mb-2 text-stone-300">Restaurante *</Typography>
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
                      <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
                    ))}
                  </select>
                )}
              />
              {errors.restaurantId && <p className="mt-1 text-xs text-red-300">{errors.restaurantId.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Typography variant="small" className="mb-2 text-stone-300">Nombre *</Typography>
                <Input
                  type="text"
                  disabled={loading}
                  {...register('nombre', {
                    required: 'El nombre es obligatorio',
                    minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                  })}
                  placeholder="Ej: Menú ejecutivo"
                  className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
                  labelProps={{ className: 'hidden' }}
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-300">{errors.nombre.message}</p>}
              </div>

              <div>
                <Typography variant="small" className="mb-2 text-stone-300">Foto</Typography>
                <input
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={handleImageChange}
                  className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-2 text-stone-900 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20"
                />
              </div>
            </div>

            <div>
              <Typography variant="small" className="mb-2 text-stone-300">Descripción</Typography>
              <textarea
                disabled={loading}
                rows={3}
                {...register('descripcion', {
                  maxLength: { value: 500, message: 'La descripción no debe exceder 500 caracteres' },
                })}
                placeholder="Ej: Menú de temporada con entradas, plato fuerte y bebida"
                className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
              />
              {errors.descripcion && <p className="mt-1 text-xs text-red-300">{errors.descripcion.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              <div>
                <Typography variant="small" className="mb-2 text-stone-300">Platos *</Typography>
                <Controller
                  name="platos"
                  control={control}
                  rules={{
                    validate: (value) => Array.isArray(value) && value.length > 0 || 'Debes seleccionar al menos un plato',
                  }}
                  render={({ field }) => {
                    const selectedValues = Array.isArray(field.value) ? field.value : [];

                    const toggleDish = (dishId) => {
                      const nextValues = selectedValues.includes(dishId)
                        ? selectedValues.filter((value) => value !== dishId)
                        : [...selectedValues, dishId];

                      field.onChange(nextValues);
                    };

                    return (
                      <div className="grid grid-cols-1 gap-3 rounded-md border border-[#E8D4B8] bg-[#FDFBF7] p-4 text-stone-900 md:grid-cols-2">
                        {menuDishes.length > 0 ? (
                          menuDishes.map((dish) => {
                            const checked = selectedValues.includes(dish._id);

                            return (
                              <label
                                key={dish._id}
                                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition ${checked ? 'border-[#2D4F4F] bg-[#EAF2F0]' : 'border-[#E8D4B8] bg-white hover:border-[#2D4F4F]/50'}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={loading || !restaurantContextId}
                                  onChange={() => toggleDish(dish._id)}
                                  className="mt-1 h-4 w-4 rounded border-[#2D4F4F] text-[#2D4F4F] focus:ring-[#2D4F4F]"
                                />
                                <span className="flex flex-col">
                                  <span className="font-medium text-[#1A1A1A]">{dish.nombre}</span>
                                  {dish.descripcion && (
                                    <span className="line-clamp-2 text-xs text-stone-600">{dish.descripcion}</span>
                                  )}
                                </span>
                              </label>
                            );
                          })
                        ) : (
                          <div className="rounded-md border border-dashed border-[#E8D4B8] bg-white px-4 py-4 text-sm text-stone-600 md:col-span-2">
                            No hay platos cargados para este restaurante.
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                {errors.platos && <p className="mt-1 text-xs text-red-300">{errors.platos.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Typography variant="small" className="mb-2 text-stone-300">Disponible desde</Typography>
                <Input
                  type="date"
                  disabled={loading}
                  {...register('availableFrom')}
                  className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
                  labelProps={{ className: 'hidden' }}
                />
              </div>

              <div>
                <Typography variant="small" className="mb-2 text-stone-300">Disponible hasta</Typography>
                <Input
                  type="date"
                  disabled={loading}
                  {...register('availableTo')}
                  className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
                  labelProps={{ className: 'hidden' }}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <Typography variant="small" className="text-stone-300">Horario</Typography>
                <Button
                  type="button"
                  onClick={() => append({ dayNumber: '1', startTime: '12:00', endTime: '15:00' })}
                  className="bg-[#1A3A3A] text-white"
                >
                  + Agregar horario
                </Button>
              </div>

              <div className="space-y-3">
                {fields.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[#E8D4B8] bg-[#FDFBF7] px-4 py-4 text-sm text-stone-600">
                    Sin horarios configurados. Puedes agregar franjas si el menú tiene horario especial.
                  </div>
                ) : (
                  fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 gap-3 rounded-md border border-[#E8D4B8] bg-[#FDFBF7] p-4 md:grid-cols-4 md:items-end">
                      <div>
                        <Typography variant="small" className="mb-2 text-[#2D4F4F]">Día</Typography>
                        <Controller
                          name={`schedule.${index}.dayNumber`}
                          control={control}
                          render={({ field: scheduleField }) => (
                            <select {...scheduleField} className={selectClassName}>
                              {DAY_OPTIONS.map((day) => (
                                <option key={day.value} value={day.value}>{day.label}</option>
                              ))}
                            </select>
                          )}
                        />
                      </div>
                      <div>
                        <Typography variant="small" className="mb-2 text-[#2D4F4F]">Inicio</Typography>
                        <Input
                          type="time"
                          disabled={loading}
                          {...register(`schedule.${index}.startTime`)}
                          className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
                          labelProps={{ className: 'hidden' }}
                        />
                      </div>
                      <div>
                        <Typography variant="small" className="mb-2 text-[#2D4F4F]">Fin</Typography>
                        <Input
                          type="time"
                          disabled={loading}
                          {...register(`schedule.${index}.endTime`)}
                          className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
                          labelProps={{ className: 'hidden' }}
                        />
                      </div>
                      <div className="md:pt-6">
                        <Button
                          type="button"
                          variant="text"
                          onClick={() => remove(index)}
                          className="w-full rounded-md text-[#D97065]"
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {imagePreview && (
              <div>
                <Typography variant="small" className="mb-2 text-stone-300">Previsualización</Typography>
                <img src={imagePreview} alt="Preview del menú" className="h-48 w-full rounded-md border border-[#E8D4B8] object-cover" />
              </div>
            )}
          </form>
        </div>

        <div className="border-t border-[#E8D4B8]/20 flex justify-end gap-3 px-6 py-4">
          <Button variant="text" onClick={onClose} className="rounded-md text-stone-300 transition-colors duration-200 hover:bg-stone-900/50">
            Cancelar
          </Button>
          <Button form="menu-form" type="submit" disabled={loading} className="bg-[#1A3A3A] text-white">
            {menu ? 'Actualizar menú' : 'Crear menú'}
          </Button>
        </div>
      </div>
    </div>
  );
};