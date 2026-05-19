import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
 
  const selectClassName = 'menu-field__select menu-field__control menu-field__control--select disabled:cursor-not-allowed disabled:opacity-70';

  const modalContent = (
    <div className="dm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
      <div className="dm-modal dm-modal--wide">
        <div className="dm-header">
          <div className="dm-header-left">
            <div className="dm-header-icon"><i className="ti ti-tools-kitchen-2" aria-hidden="true" /></div>
            <div>
              <div className="dm-header-title">{menu ? 'Editar menú' : 'Nuevo menú'}</div>
              <div className="dm-header-sub">Gestiona menús, platos asociados, ingredientes y programación.</div>
            </div>
          </div>
          <button onClick={onClose} className="dm-close" aria-label="Cerrar"><i className="ti ti-x" aria-hidden="true" /></button>
        </div>
 
        <div className="dm-body">
          <form id="menu-form" onSubmit={handleSubmit(onSubmit)} className="dm-form">
            <div className="menu-field">
              <Typography variant="small" className="dm-label">Restaurante <span className="dm-label-req">*</span></Typography>
              <Controller
                name="restaurantId"
                control={control}
                rules={{ required: 'El restaurante es obligatorio' }}
                render={({ field }) => (
                  <div className="dm-input-wrap">
                    <i className="ti ti-building-store dm-input-icon" aria-hidden="true" />
                    <select
                      {...field}
                      disabled={restaurantOptionsLoading || loading || (isRestaurantAdmin && hasRestaurantAssigned)}
                      className={`dm-select${errors.restaurantId ? ' dm-input--error' : ''}`}
                    >
                      <option value="">-- Selecciona un restaurante --</option>
                      {restaurantOptions.map((restaurant) => (
                        <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              />
              {errors.restaurantId && <span className="dm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.restaurantId.message}</span>}
            </div>
 
            <div className="dm-field">
              <Typography variant="small" className="dm-label">Nombre <span className="dm-label-req">*</span></Typography>
              <div className="dm-input-wrap">
                <i className="ti ti-tools-kitchen-2 dm-input-icon" aria-hidden="true" />
                <Input
                  type="text"
                  disabled={loading}
                  {...register('nombre', {
                    required: 'El nombre es obligatorio',
                    minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                  })}
                  placeholder="Ej: Menú ejecutivo"
                  className={`dm-input${errors.nombre ? ' dm-input--error' : ''}`}
                  labelProps={{ className: 'hidden' }}
                />
              </div>
              {errors.nombre && <span className="dm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.nombre.message}</span>}
            </div>
 
            <div className="dm-row">
              <div className="dm-field">
                <Typography variant="small" className="dm-label">Disponible desde</Typography>
                <div className="dm-input-wrap">
                  <i className="ti ti-calendar-event dm-input-icon" aria-hidden="true" />
                  <Input
                    type="date"
                    disabled={loading}
                    {...register('availableFrom')}
                    className="dm-input"
                    labelProps={{ className: 'hidden' }}
                  />
                </div>
              </div>

              <div className="dm-field">
                <Typography variant="small" className="dm-label">Disponible hasta</Typography>
                <div className="dm-input-wrap">
                  <i className="ti ti-calendar-event dm-input-icon" aria-hidden="true" />
                  <Input
                    type="date"
                    disabled={loading}
                    {...register('availableTo')}
                    className="dm-input"
                    labelProps={{ className: 'hidden' }}
                  />
                </div>
              </div>
            </div>
 
            <div className="dm-field">
              <Typography variant="small" className="dm-label">Descripción</Typography>
              <div className="dm-input-wrap" style={{ alignItems: 'flex-start' }}>
                <i className="ti ti-file-description dm-input-icon" style={{ top: 10, position: 'absolute' }} aria-hidden="true" />
                <textarea
                  disabled={loading}
                  rows={3}
                  {...register('descripcion', {
                    maxLength: { value: 500, message: 'La descripción no debe exceder 500 caracteres' },
                  })}
                  placeholder="Ej: Menú de temporada con entradas, plato fuerte y bebida"
                  className={`dm-textarea${errors.descripcion ? ' dm-input--error' : ''}`}
                />
              </div>
              {errors.descripcion && <span className="dm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.descripcion.message}</span>}
            </div>
 
            <div className="dm-field">
              <Typography variant="small" className="dm-label">Platos <span className="dm-label-req">*</span></Typography>
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
                    <div className="menu-field__dish-grid">
                      {menuDishes.length > 0 ? (
                        menuDishes.map((dish) => {
                          const checked = selectedValues.includes(dish._id);

                          return (
                            <label
                              key={dish._id}
                              className={`menu-field__dish-item ${checked ? 'is-selected' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={loading || !restaurantContextId}
                                onChange={() => toggleDish(dish._id)}
                                className="mt-1 h-4 w-4 rounded border-[#2D4F4F] text-[#2D4F4F] focus:ring-[#2D4F4F]"
                              />
                              <span className="flex flex-col">
                                <span className="menu-field__dish-name">{dish.nombre}</span>
                                {dish.descripcion && (
                                  <span className="menu-field__dish-desc line-clamp-2">{dish.descripcion}</span>
                                )}
                              </span>
                            </label>
                          );
                        })
                      ) : (
                        <div className="menu-field__dish-empty md:col-span-2">
                          No hay platos cargados para este restaurante.
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              {errors.platos && <span className="dm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.platos.message}</span>}
            </div>
 
            <div className="dm-field">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Typography variant="small" className="dm-label">Horario</Typography>
                <Button
                  type="button"
                  onClick={() => append({ dayNumber: '1', startTime: '12:00', endTime: '15:00' })}
                  className="dm-btn dm-btn-save"
                >
                  + Agregar horario
                </Button>
              </div>
 
              <div className="space-y-3">
                {fields.length === 0 ? (
                  <div className="menu-field__empty">
                    Sin horarios configurados. Puedes agregar franjas si el menú tiene horario especial.
                  </div>
                ) : (
                  fields.map((field, index) => (
                    <div key={field.id} className="menu-field__schedule-row">
                      <div className="menu-field">
                        <Typography variant="small" className="dm-label">Día</Typography>
                        <Controller
                          name={`schedule.${index}.dayNumber`}
                          control={control}
                          render={({ field: scheduleField }) => (
                            <select {...scheduleField} className={selectClassName.replace('menu-field__select menu-field__control menu-field__control--select', 'dm-select dm-input') }>
                              {DAY_OPTIONS.map((day) => (
                                <option key={day.value} value={day.value}>{day.label}</option>
                              ))}
                            </select>
                          )}
                        />
                      </div>
                      <div className="menu-field">
                        <Typography variant="small" className="dm-label">Inicio</Typography>
                        <Input
                          type="time"
                          disabled={loading}
                          {...register(`schedule.${index}.startTime`)}
                          className="dm-input"
                          labelProps={{ className: 'hidden' }}
                        />
                      </div>
                      <div className="menu-field">
                        <Typography variant="small" className="dm-label">Fin</Typography>
                        <Input
                          type="time"
                          disabled={loading}
                          {...register(`schedule.${index}.endTime`)}
                          className="dm-input"
                          labelProps={{ className: 'hidden' }}
                        />
                      </div>
                      <div className="md:pt-6">
                        <Button
                          type="button"
                          variant="text"
                          onClick={() => remove(index)}
                          className="dm-btn dm-btn-cancel w-full"
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
              <div className="menu-field">
                <Typography variant="small" className="dm-label">Previsualización</Typography>
                <div className="menu-field__preview">
                  <img src={imagePreview} alt="Preview del menú" />
                </div>
              </div>
            )}
          </form>
        </div>
 
        <div className="dm-footer">
          <span className="dm-footer-hint"><i className="ti ti-info-circle" aria-hidden="true" />Los campos <span style={{ color:'var(--menu-gold)' }}>*</span> son obligatorios</span>
          <Button variant="text" onClick={onClose} className="dm-btn dm-btn-cancel">
            Cancelar
          </Button>
          <Button form="menu-form" type="submit" disabled={loading} className="dm-btn dm-btn-save">
            {loading ? <><span className="dm-spinner" />Guardando...</> : <><i className="ti ti-device-floppy" aria-hidden="true" />{menu ? 'Actualizar menú' : 'Crear menú'}</>}
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};