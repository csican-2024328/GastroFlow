import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTableStore } from '../store/useTableStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
 
export const TableModal = ({ open, onClose, mesa = null }) => {
  const restaurantOptions        = useTableStore((s) => s.restaurantOptions);
  const fetchRestaurantOptions   = useTableStore((s) => s.fetchRestaurantOptions);
  const restaurantOptionsLoading = useTableStore((s) => s.restaurantOptionsLoading);
  const selectedRestaurantId     = useTableStore((s) => s.selectedRestaurantId);
  const createMesaAction         = useTableStore((s) => s.createMesaAction);
  const updateMesaAction         = useTableStore((s) => s.updateMesaAction);
  const loading                  = useTableStore((s) => s.loading);
 
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { numero: '', capacidad: '', ubicacion: '', restaurantID: '' },
  });
 
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
 
  /* ── Effects — INTACTOS ── */
  useEffect(() => {
    if (open) {
      if (restaurantOptions.length === 0) fetchRestaurantOptions();
      else fetchRestaurantOptions(true);
    }
  }, [open, fetchRestaurantOptions, restaurantOptions.length]);
 
  useEffect(() => {
    if (open) {
      reset({
        numero:       mesa?.numero ?? '',
        capacidad:    mesa?.capacidad ?? '',
        ubicacion:    mesa?.ubicacion ?? '',
        restaurantID: mesa?.restaurantID?._id || mesa?.restaurantID || restaurantId || selectedRestaurantId || '',
      });
    }
  }, [mesa, open, reset, selectedRestaurantId]);
 
  /* ── Submit — INTACTO ── */
  const onSubmit = async (formData) => {
    try {
      const payload = {
        numero:       Number(formData.numero),
        capacidad:    Number(formData.capacidad),
        ubicacion:    formData.ubicacion,
        restaurantID: formData.restaurantID,
        isActive:     true,
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
      className="tm-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={mesa ? 'Editar mesa' : 'Nueva mesa'}
    >
      <div className="tm-modal">
 
        {/* Header */}
        <div className="tm-header">
          <div className="tm-header-left">
            <div className="tm-header-icon">
              <i className="ti ti-armchair" aria-hidden="true" />
            </div>
            <div>
              <div className="tm-header-title">{mesa ? 'Editar mesa' : 'Nueva mesa'}</div>
              <div className="tm-header-sub">
                {mesa ? 'Modifica los datos de la mesa' : 'Completa los datos para registrar la mesa'}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="tm-close" aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
 
        {/* Body */}
        <div className="tm-body">
          <form id="table-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="tm-form">
 
              {/* Número + Capacidad */}
              <div className="tm-row">
                <div className="tm-field">
                  <label className="tm-label">
                    Número de mesa <span className="tm-label-req">*</span>
                  </label>
                  <div className="tm-input-wrap">
                    <i className="ti ti-hash tm-input-icon" aria-hidden="true" />
                    <input
                      type="number"
                      min="1"
                      placeholder="Ej: 12"
                      className={`tm-input${errors.numero ? ' tm-input--error' : ''}`}
                      {...register('numero', {
                        required: 'El número de mesa es obligatorio',
                        valueAsNumber: true,
                        validate: (v) => Number(v) > 0 || 'El número debe ser mayor a 0',
                      })}
                    />
                  </div>
                  {errors.numero && (
                    <span className="tm-error-msg">
                      <i className="ti ti-alert-circle" aria-hidden="true" />
                      {errors.numero.message}
                    </span>
                  )}
                </div>
 
                <div className="tm-field">
                  <label className="tm-label">
                    Capacidad de personas <span className="tm-label-req">*</span>
                  </label>
                  <div className="tm-input-wrap">
                    <i className="ti ti-users tm-input-icon" aria-hidden="true" />
                    <input
                      type="number"
                      min="1"
                      placeholder="Ej: 4"
                      className={`tm-input${errors.capacidad ? ' tm-input--error' : ''}`}
                      {...register('capacidad', {
                        required: 'La capacidad es obligatoria',
                        valueAsNumber: true,
                        validate: (v) => Number(v) > 0 || 'La capacidad debe ser mayor a 0',
                      })}
                    />
                  </div>
                  {errors.capacidad && (
                    <span className="tm-error-msg">
                      <i className="ti ti-alert-circle" aria-hidden="true" />
                      {errors.capacidad.message}
                    </span>
                  )}
                </div>
              </div>
 
              {/* Ubicación */}
              <div className="tm-field">
                <label className="tm-label">
                  Identificador visual / Ubicación <span className="tm-label-req">*</span>
                </label>
                <div className="tm-input-wrap">
                  <i className="ti ti-map-pin tm-input-icon" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Terraza, Ventana, Sala 1"
                    className={`tm-input${errors.ubicacion ? ' tm-input--error' : ''}`}
                    {...register('ubicacion', { required: 'El identificador visual es obligatorio' })}
                  />
                </div>
                {errors.ubicacion && (
                  <span className="tm-error-msg">
                    <i className="ti ti-alert-circle" aria-hidden="true" />
                    {errors.ubicacion.message}
                  </span>
                )}
              </div>
 
              {/* Restaurante */}
              <div className="tm-field">
                <label className="tm-label">
                  Restaurante <span className="tm-label-req">*</span>
                </label>
                <Controller
                  name="restaurantID"
                  control={control}
                  rules={{ required: 'El restaurante es obligatorio' }}
                  render={({ field }) => (
                    <div className="tm-input-wrap">
                      <i className="ti ti-building-store tm-input-icon" aria-hidden="true" />
                      <select
                        {...field}
                        value={field.value || ''}
                        disabled={restaurantOptionsLoading || (isRestaurantAdmin && hasRestaurantAssigned)}
                        className={`tm-select${errors.restaurantID ? ' tm-input--error' : ''}`}
                      >
                        <option value="">Selecciona un restaurante</option>
                        {restaurantOptions.map((r) => (
                          <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                />
                {errors.restaurantID && (
                  <span className="tm-error-msg">
                    <i className="ti ti-alert-circle" aria-hidden="true" />
                    {errors.restaurantID.message}
                  </span>
                )}
              </div>
 
            </div>
          </form>
        </div>
 
        {/* Footer */}
        <div className="tm-footer">
          <span className="tm-footer-hint">
            <i className="ti ti-info-circle" aria-hidden="true" />
            Todos los campos son obligatorios
          </span>
          <button onClick={onClose} className="tm-btn tm-btn-cancel">
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="tm-btn tm-btn-save"
          >
            {loading
              ? <><span className="tm-spinner" />Guardando...</>
              : <><i className="ti ti-device-floppy" aria-hidden="true" />Guardar</>}
          </button>
        </div>
 
      </div>
    </div>
  );
};