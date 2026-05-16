import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Input, Typography } from '@material-tailwind/react';
import { useEventStore } from '../store/useEventStore.js';
import { useMenuStore } from '../../dishes/store/useMenuStore.js';
import { useDishStore } from '../../dishes/store/useDishStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';

const EVENT_TYPE_OPTIONS = [
  { value: 'PROMOCION', label: 'Promoción' },
  { value: 'DESCUENTO', label: 'Descuento' },
  { value: 'COMBO', label: 'Combo' },
  { value: 'HAPPY_HOUR', label: 'Happy Hour' },
  { value: 'EVENTO_ESPECIAL', label: 'Evento Especial' },
  { value: 'OFERTA_TEMPORAL', label: 'Oferta Temporal' },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'PORCENTAJE', label: 'Porcentaje (%)' },
  { value: 'CANTIDAD_FIJA', label: 'Cantidad Fija (Q)' },
];

export const EventFormModal = ({ open, onClose, event = null, restaurantId }) => {
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const user = useAuthStore((state) => state.user);
  const createEventAction = useEventStore((state) => state.createEventAction);
  const updateEventAction = useEventStore((state) => state.updateEventAction);
  const loading = useEventStore((state) => state.loading);

  const menus = useMenuStore((state) => state.menus);
  const fetchMenus = useMenuStore((state) => state.fetchMenus);
  const menusLoading = useMenuStore((state) => state.loading);

  const dishes = useDishStore((state) => state.dishes);
  const fetchDishes = useDishStore((state) => state.fetchDishes);
  const dishesLoading = useDishStore((state) => state.loading);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      tipo: '',
      descuentoTipo: 'PORCENTAJE',
      descuentoValor: '',
      fechaInicio: '',
      fechaFin: '',
      platosAplicables: [],
      menusAplicables: [],
      condiciones: '',
    },
  });

  const descuentoTipo = watch('descuentoTipo');
  const platosAplicables = watch('platosAplicables');
  const menusAplicables = watch('menusAplicables');

  const rId = restaurantId || user?.restaurantId || user?.RestaurantId;

  useEffect(() => {
    if (open && rId) {
      console.log('🍽️ [EVENTS MODAL] Cargando platos y menús para restaurante:', rId);
      fetchMenus(rId);
      fetchDishes(rId);
    }
  }, [open, rId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (event) {
      reset({
        nombre: event.nombre || '',
        descripcion: event.descripcion || '',
        tipo: event.tipo || '',
        descuentoTipo: event.descuentoTipo || 'PORCENTAJE',
        descuentoValor: event.descuentoValor || '',
        fechaInicio: event.fechaInicio ? event.fechaInicio.split('T')[0] : '',
        fechaFin: event.fechaFin ? event.fechaFin.split('T')[0] : '',
        platosAplicables: event.platosAplicables?.map((plato) => plato._id || plato) || [],
        menusAplicables: event.menusAplicables?.map((menu) => menu._id || menu) || [],
        condiciones: event.condiciones || '',
      });
    } else {
      reset({
        nombre: '',
        descripcion: '',
        tipo: '',
        descuentoTipo: 'PORCENTAJE',
        descuentoValor: '',
        fechaInicio: '',
        fechaFin: '',
        platosAplicables: [],
        menusAplicables: [],
        condiciones: '',
      });
    }
  }, [event, open, reset]);

  const onSubmit = async (data) => {
    if (loading || isSubmittingLocal) return;

    try {
      setIsSubmittingLocal(true);
      // Validar que se seleccione al menos un plato o menú
      if (!data.platosAplicables?.length && !data.menusAplicables?.length) {
        notyfError('Debes seleccionar al menos un plato o menú');
        setIsSubmittingLocal(false);
        return;
      }

      const eventData = {
        nombre: data.nombre.trim(),
        descripcion: (data.descripcion || '').trim(),
        tipo: data.tipo,
        descuentoTipo: data.descuentoTipo,
        descuentoValor: Number(data.descuentoValor),
        fechaInicio: new Date(data.fechaInicio).toISOString(),
        fechaFin: new Date(data.fechaFin).toISOString(),
        platosAplicables: data.platosAplicables || [],
        menusAplicables: data.menusAplicables || [],
        condiciones: (data.condiciones || '').trim(),
      };

      if (rId) {
        eventData.restaurantID = rId;
      }

      const result = event?._id
        ? await updateEventAction(event._id, eventData)
        : await createEventAction(eventData);

      if (result.success) {
        notyfSuccess(event ? 'Evento actualizado correctamente' : 'Evento creado correctamente');
        onClose();
      } else {
        // Mostrar errores de validación si existen
        if (result.error?.errors || result.errors) {
          const validationErrors = result.error?.errors || result.errors;
          if (Array.isArray(validationErrors)) {
            validationErrors.forEach(err => notyfError(`${err.field}: ${err.message}`));
          } else {
            notyfError(result.error || 'Errores de validación en el formulario');
          }
        } else {
          notyfError(result.error || 'No fue posible guardar el evento');
        }
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'No fue posible guardar el evento';
      if (error?.response?.status === 429) {
        notyfError('Demasiadas solicitudes. Espera un momento e intenta nuevamente.');
      } else {
        notyfError(errorMessage);
      }
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#E8D4B8] bg-[#FDFBF7] shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
        <div className="border-b border-[#E8D4B8] bg-[#F5EFEA] px-8 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D4F4F] text-xl">
                📅
              </span>
              <Typography variant="h4" className="text-[#2D4F4F] font-bold font-['Playfair_Display']">
                {event ? 'Editar Evento' : 'Nuevo Evento'}
              </Typography>
            </div>
            <Typography variant="small" className="text-[#5A5146] mt-2">
              {event ? 'Edita los detalles del evento seleccionado' : 'Crea un nuevo evento para tu restaurante'}
            </Typography>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[75vh] px-8 py-6">
          <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Primera fila: Nombre y Tipo de descuento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Typography variant="small" className="mb-2 font-semibold text-[#5A5146]">
                  Nombre del Evento *
                </Typography>
                <Input
                  type="text"
                  disabled={loading}
                  {...register('nombre', {
                    required: 'El nombre es obligatorio',
                    minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                    maxLength: { value: 100, message: 'El nombre no debe exceder 100 caracteres' },
                  })}
                  placeholder="Ej. Noche de Aniversario"
                  className="w-full rounded-lg border border-[#E8D4B8] bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-1 focus:ring-[#2D4F4F]"
                  labelProps={{ className: 'hidden' }}
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
              </div>

              <div>
                <Typography variant="small" className="mb-2 font-semibold text-[#5A5146]">
                  Tipo de Descuento *
                </Typography>
                <Controller
                  name="descuentoTipo"
                  control={control}
                  rules={{ required: 'El tipo de descuento es obligatorio' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      disabled={loading}
                      className="w-full rounded-lg border border-[#E8D4B8] bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-1 focus:ring-[#2D4F4F]"
                    >
                      {DISCOUNT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.descuentoTipo && <p className="mt-1 text-xs text-red-500">{errors.descuentoTipo.message}</p>}
              </div>
            </div>

            {/* Segunda fila: Valor de descuento y Vigencia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Typography variant="small" className="mb-2 font-semibold text-[#5A5146]">
                  Valor del Descuento {descuentoTipo === 'PORCENTAJE' ? '(%)' : '(Q)'} *
                </Typography>
                <div className="relative">
                  <Input
                    type="number"
                    disabled={loading}
                    min="0"
                    max={descuentoTipo === 'PORCENTAJE' ? '100' : undefined}
                    step="0.01"
                    {...register('descuentoValor', {
                      required: 'El valor del descuento es obligatorio',
                      valueAsNumber: true,
                      validate: (value) => {
                        if (!Number.isFinite(value) || value < 0) return 'El valor debe ser mayor o igual a 0';
                        if (descuentoTipo === 'PORCENTAJE' && value > 100) return 'El porcentaje no puede exceder 100%';
                        return true;
                      },
                    })}
                    placeholder={descuentoTipo === 'PORCENTAJE' ? 'Ej. 15' : 'Ej. 100.00'}
                    className="w-full rounded-lg border border-[#E8D4B8] bg-white px-4 py-2.5 pr-10 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-1 focus:ring-[#2D4F4F]"
                    labelProps={{ className: 'hidden' }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    {descuentoTipo === 'PORCENTAJE' ? '%' : 'Q'}
                  </span>
                </div>
                {errors.descuentoValor && <p className="mt-1 text-xs text-red-500">{errors.descuentoValor.message}</p>}
              </div>

              <div>
                <Typography variant="small" className="mb-2 font-semibold text-[#5A5146]">
                  Vigencia del Evento *
                </Typography>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="date"
                      disabled={loading}
                      {...register('fechaInicio', { required: 'Requerido' })}
                      className="w-full rounded-lg border border-[#E8D4B8] bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-1 focus:ring-[#2D4F4F] text-sm"
                      labelProps={{ className: 'hidden' }}
                    />
                  </div>
                  <span className="text-gray-400 font-bold">-</span>
                  <div className="flex-1">
                    <Input
                      type="date"
                      disabled={loading}
                      {...register('fechaFin', { 
                        required: 'Requerido',
                        validate: (value, formValues) => {
                          if (!formValues.fechaInicio) return true;
                          return new Date(value) > new Date(formValues.fechaInicio) || 'Fecha inválida';
                        }
                      })}
                      className="w-full rounded-lg border border-[#E8D4B8] bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-1 focus:ring-[#2D4F4F] text-sm"
                      labelProps={{ className: 'hidden' }}
                    />
                  </div>
                </div>
                {(errors.fechaInicio || errors.fechaFin) && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.fechaFin?.message || errors.fechaInicio?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Tipo de evento (extra row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Typography variant="small" className="mb-2 font-semibold text-[#5A5146]">
                  Categoría del Evento *
                </Typography>
                <Controller
                  name="tipo"
                  control={control}
                  rules={{ required: 'La categoría es obligatoria' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      disabled={loading}
                      className="w-full rounded-lg border border-[#E8D4B8] bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-1 focus:ring-[#2D4F4F]"
                    >
                      <option value="">-- Selecciona --</option>
                      {EVENT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.tipo && <p className="mt-1 text-xs text-red-500">{errors.tipo.message}</p>}
              </div>
            </div>

            {/* Platos aplicables */}
            <div className="border-t border-[#E8D4B8] pt-5">
              <Typography variant="small" className="mb-2 font-semibold text-[#5A5146]">
                Platos Aplicables ({platosAplicables?.length || 0} seleccionados)
              </Typography>
              <div className="p-4 border border-[#E8D4B8] rounded-lg bg-white h-40 overflow-y-auto">
                {dishesLoading ? (
                  <p className="text-sm text-gray-500">Cargando platos...</p>
                ) : dishes.length === 0 ? (
                  <p className="text-sm text-red-500">No hay platos disponibles en este restaurante</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dishes.map((dish) => (
                      <label key={dish._id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={platosAplicables?.includes(dish._id) || false}
                          onChange={(e) => {
                            const current = platosAplicables || [];
                            const updated = e.target.checked
                              ? [...current, dish._id]
                              : current.filter(id => id !== dish._id);
                            setValue('platosAplicables', updated);
                          }}
                          className="mt-1 w-4 h-4 cursor-pointer accent-[#2D4F4F]"
                          disabled={loading}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{dish.nombre}</p>
                          <p className="text-xs text-gray-500">Q {dish.precio?.toFixed(2) || '0.00'} · {dish.categoria}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Menús aplicables */}
            <div>
              <Typography variant="small" className="mb-2 font-semibold text-[#5A5146]">
                Menús Aplicables ({menusAplicables?.length || 0} seleccionados)
              </Typography>
              <div className="p-4 border border-[#E8D4B8] rounded-lg bg-white h-40 overflow-y-auto">
                {menusLoading ? (
                  <p className="text-sm text-gray-500">Cargando menús...</p>
                ) : menus.length === 0 ? (
                  <p className="text-sm text-red-500">No hay menús disponibles en este restaurante</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {menus.map((menu) => (
                      <label key={menu._id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={menusAplicables?.includes(menu._id) || false}
                          onChange={(e) => {
                            const current = menusAplicables || [];
                            const updated = e.target.checked
                              ? [...current, menu._id]
                              : current.filter(id => id !== menu._id);
                            setValue('menusAplicables', updated);
                          }}
                          className="mt-1 w-4 h-4 cursor-pointer accent-[#2D4F4F]"
                          disabled={loading}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{menu.nombre}</p>
                          <p className="text-xs text-gray-500">Q {menu.precio?.toFixed(2) || '0.00'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Descripción y Condiciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Typography variant="small" className="mb-2 font-semibold text-[#5A5146]">
                  Descripción *
                </Typography>
                <textarea
                  disabled={loading}
                  rows={3}
                  {...register('descripcion', {
                    required: 'La descripción es obligatoria',
                    minLength: { value: 10, message: 'Debe tener al menos 10 caracteres' },
                    maxLength: { value: 500, message: 'No debe exceder 500 caracteres' },
                  })}
                  placeholder="Ej: Celebra con nosotros nuestro aniversario con descuentos especiales"
                  className="w-full rounded-lg border border-[#E8D4B8] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-1 focus:ring-[#2D4F4F]"
                />
                {errors.descripcion && <p className="mt-1 text-xs text-red-500">{errors.descripcion.message}</p>}
              </div>

              <div>
                <Typography variant="small" className="mb-2 font-semibold text-[#5A5146]">
                  Condiciones (opcional)
                </Typography>
                <textarea
                  disabled={loading}
                  rows={3}
                  {...register('condiciones', {
                    maxLength: { value: 500, message: 'No debe exceder 500 caracteres' },
                  })}
                  placeholder="Ej: Válido solo los viernes, no acumulable con otras promociones..."
                  className="w-full rounded-lg border border-[#E8D4B8] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2D4F4F] focus:ring-1 focus:ring-[#2D4F4F]"
                />
                {errors.condiciones && <p className="mt-1 text-xs text-red-500">{errors.condiciones.message}</p>}
              </div>
            </div>
            
          </form>
        </div>

        <div className="border-t border-[#E8D4B8] bg-gray-50 flex justify-end gap-4 px-8 py-5 rounded-b-2xl">
          <Button
            variant="outlined"
            onClick={onClose}
            className="border-[#E8D4B8] text-gray-600 hover:bg-gray-100 font-semibold"
          >
            Cancelar
          </Button>
          <Button
            form="event-form"
            type="submit"
            disabled={loading || isSubmittingLocal}
            className="bg-[#2D4F4F] text-white shadow-md hover:shadow-lg font-semibold"
          >
            {loading || isSubmittingLocal ? 'Guardando...' : 'Guardar Evento'}
          </Button>
        </div>
      </div>
    </div>
  );
};
