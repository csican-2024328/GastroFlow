import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useIngredientStore } from '../store/useIngredientStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
 
const UNIT_OPTIONS = [
  { value: 'kg',       label: 'kg' },
  { value: 'g',        label: 'g' },
  { value: 'l',        label: 'lts' },
  { value: 'ml',       label: 'ml' },
  { value: 'unidad',   label: 'unidad' },
  { value: 'paquete',  label: 'paquete' },
];
 
export const IngredientModal = ({ open, onClose, ingredient = null, lockedRestaurantId = '' }) => {
  const restaurantOptions        = useIngredientStore((s) => s.restaurantOptions);
  const fetchRestaurantOptions   = useIngredientStore((s) => s.fetchRestaurantOptions);
  const restaurantOptionsLoading = useIngredientStore((s) => s.restaurantOptionsLoading);
  const selectedRestaurantId     = useIngredientStore((s) => s.selectedRestaurantId);
  const createIngredientAction   = useIngredientStore((s) => s.createIngredientAction);
  const updateIngredientAction   = useIngredientStore((s) => s.updateIngredientAction);
  const loading                  = useIngredientStore((s) => s.loading);
 
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: { nombre: '', stock: '', unidadMedida: '', restaurantId: '' },
  });
 
  /* ── Effects — INTACTOS ── */
  useEffect(() => {
    if (restaurantOptions.length === 0) fetchRestaurantOptions();
  }, [fetchRestaurantOptions, restaurantOptions.length]);
 
  useEffect(() => {
    if (!open) return;
    reset({
      nombre:       ingredient?.nombre       || '',
      stock:        ingredient?.stock        ?? '',
      unidadMedida: ingredient?.unidadMedida || '',
      restaurantId:
        lockedRestaurantId ||
        ingredient?.restaurantId?._id ||
        ingredient?.restaurantId ||
        selectedRestaurantId ||
        '',
    });
  }, [ingredient, lockedRestaurantId, open, reset, selectedRestaurantId]);
 
  /* ── Submit — INTACTO ── */
  const onSubmit = async (data) => {
    try {
      const payload = {
        nombre:       data.nombre.trim(),
        stock:        Number(data.stock),
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
 
  return (
    <div
      className="im-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={ingredient ? 'Editar ingrediente' : 'Nuevo ingrediente'}
    >
      <div className="im-modal">
 
        {/* Header */}
        <div className="im-header">
          <div className="im-header-left">
            <div className="im-header-icon">
              <i className="ti ti-carrot" aria-hidden="true" />
            </div>
            <div>
              <div className="im-header-title">{ingredient ? 'Editar ingrediente' : 'Nuevo ingrediente'}</div>
              <div className="im-header-sub">Gestiona el stock por sucursal.</div>
            </div>
          </div>
          <button onClick={onClose} className="im-close" aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
 
        {/* Body */}
        <div className="im-body">
          <form id="ingredient-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="im-form">
 
              {/* Nombre */}
              <div className="im-field">
                <label className="im-label">Nombre del producto <span className="im-label-req">*</span></label>
                <div className="im-input-wrap">
                  <i className="ti ti-carrot im-input-icon" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Leche entera"
                    className={`im-input${errors.nombre ? ' im-input--error' : ''}`}
                    {...register('nombre', {
                      required: 'El nombre es obligatorio',
                      minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                    })}
                  />
                </div>
                {errors.nombre && <span className="im-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.nombre.message}</span>}
              </div>
 
              {/* Stock + Unidad */}
              <div className="im-row">
                <div className="im-field">
                  <label className="im-label">Stock <span className="im-label-req">*</span></label>
                  <div className="im-input-wrap">
                    <i className="ti ti-package im-input-icon" aria-hidden="true" />
                    <input
                      type="number" min="0" step="any"
                      placeholder="0"
                      className={`im-input${errors.stock ? ' im-input--error' : ''}`}
                      {...register('stock', {
                        required: 'El stock es obligatorio',
                        valueAsNumber: true,
                        validate: (v) => (Number.isFinite(v) && v >= 0) || 'El stock debe ser ≥ 0',
                      })}
                    />
                  </div>
                  {errors.stock && <span className="im-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.stock.message}</span>}
                </div>
 
                <div className="im-field">
                  <label className="im-label">Unidad de medida <span className="im-label-req">*</span></label>
                  <Controller
                    name="unidadMedida"
                    control={control}
                    rules={{ required: 'La unidad de medida es obligatoria' }}
                    render={({ field }) => (
                      <div className="im-input-wrap">
                        <i className="ti ti-ruler im-input-icon" aria-hidden="true" />
                        <select {...field} className={`im-select${errors.unidadMedida ? ' im-input--error' : ''}`}>
                          <option value="">-- Selecciona una unidad --</option>
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                  {errors.unidadMedida && <span className="im-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.unidadMedida.message}</span>}
                </div>
              </div>
 
              {/* Restaurante */}
              <div className="im-field">
                <label className="im-label">Restaurante <span className="im-label-req">*</span></label>
                <Controller
                  name="restaurantId"
                  control={control}
                  rules={{ required: 'El restaurante es obligatorio' }}
                  render={({ field }) => (
                    <div className="im-input-wrap">
                      <i className="ti ti-building-store im-input-icon" aria-hidden="true" />
                      <select
                        {...field}
                        disabled={restaurantOptionsLoading || Boolean(ingredient?._id) || Boolean(lockedRestaurantId)}
                        className={`im-select${errors.restaurantId ? ' im-input--error' : ''}`}
                      >
                        <option value="">-- Selecciona un restaurante --</option>
                        {restaurantOptions.map((r) => (
                          <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                />
                {ingredient?._id && (
                  <span className="im-hint"><i className="ti ti-info-circle" aria-hidden="true" />El restaurante no se puede cambiar al editar.</span>
                )}
                {lockedRestaurantId && !ingredient?._id && (
                  <span className="im-hint"><i className="ti ti-lock" aria-hidden="true" />Este ingrediente se guardará en el restaurante asignado.</span>
                )}
                {errors.restaurantId && <span className="im-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.restaurantId.message}</span>}
              </div>
 
            </div>
          </form>
        </div>
 
        {/* Footer */}
        <div className="im-footer">
          <span className="im-footer-hint">
            <i className="ti ti-info-circle" aria-hidden="true" />
            Campos con <span style={{ color: 'var(--ig-gold)' }}>*</span> son obligatorios
          </span>
          <button onClick={onClose} className="im-btn im-btn-cancel">Cancelar</button>
          <button onClick={handleSubmit(onSubmit)} disabled={loading} className="im-btn im-btn-save">
            {loading
              ? <><span className="im-spinner" />Guardando...</>
              : <><i className="ti ti-device-floppy" aria-hidden="true" />Guardar</>}
          </button>
        </div>
 
      </div>
    </div>
  );
};