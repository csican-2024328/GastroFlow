import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDishStore } from '../store/useDishStore.js';
import { useIngredientStore } from '../../ingredients/store/useIngredientStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
 
const CATEGORY_OPTIONS = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'FUERTE',  label: 'Plato Fuerte' },
  { value: 'POSTRE',  label: 'Postre' },
  { value: 'BEBIDA',  label: 'Bebida' },
];
 
export const DishFormModal = ({ open, onClose, dish = null }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
 
  const restaurantOptions        = useDishStore((s) => s.restaurantOptions);
  const fetchRestaurantOptions   = useDishStore((s) => s.fetchRestaurantOptions);
  const restaurantOptionsLoading = useDishStore((s) => s.restaurantOptionsLoading);
  const selectedRestaurantId     = useDishStore((s) => s.selectedRestaurantId);
  const createDishAction         = useDishStore((s) => s.createDishAction);
  const updateDishAction         = useDishStore((s) => s.updateDishAction);
  const loading                  = useDishStore((s) => s.loading);
 
  const ingredients    = useIngredientStore((s) => s.ingredients);
  const fetchIngredients = useIngredientStore((s) => s.fetchIngredients);
 
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm({
    defaultValues: { nombre: '', descripcion: '', precio: '', categoria: '', ingredientes: [], restaurantId: '' },
  });
 
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
  const watchRestaurantId = watch('restaurantId');
 
  /* ── Effects — INTACTOS ── */
  useEffect(() => {
    if (open) {
      if (restaurantOptions.length === 0) fetchRestaurantOptions();
      else fetchRestaurantOptions(true);
    }
  }, [open, fetchRestaurantOptions, restaurantOptions.length]);
 
  useEffect(() => {
    if (watchRestaurantId && watchRestaurantId !== selectedRestaurantId) {
      fetchIngredients(watchRestaurantId);
    }
  }, [watchRestaurantId, fetchIngredients, selectedRestaurantId]);
 
  useEffect(() => {
    if (!open) { setImagePreview(null); setSelectedFile(null); return; }
    reset({
      nombre:       dish?.nombre       || '',
      descripcion:  dish?.descripcion  || '',
      precio:       dish?.precio       ?? '',
      categoria:    dish?.categoria    || '',
      ingredientes: dish?.ingredientes?.map((ing) => ing._id || ing) || [],
      restaurantId: dish?.restaurantId?._id || dish?.restaurantId || restaurantId || selectedRestaurantId || '',
    });
    if (dish?.foto) setImagePreview(dish.foto);
  }, [dish, open, reset, selectedRestaurantId]);
 
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
 
  /* ── Submit — INTACTO ── */
  const onSubmit = async (data) => {
    if (loading) return;
    try {
      const formData = new FormData();
      formData.append('nombre', data.nombre.trim());
      formData.append('descripcion', (data.descripcion || '').trim());
      formData.append('precio', Number(data.precio));
      formData.append('categoria', data.categoria);
      formData.append('restaurantId', data.restaurantId);
      if (Array.isArray(data.ingredientes)) formData.append('ingredientes', JSON.stringify(data.ingredientes));
      if (selectedFile) formData.append('foto', selectedFile);
 
      const result = dish?._id ? await updateDishAction(dish._id, formData) : await createDishAction(formData);
 
      if (result.success) { notyfSuccess(dish ? 'Plato actualizado correctamente' : 'Plato creado correctamente'); onClose(); }
      else notyfError(result.error || 'No fue posible guardar el plato');
    } catch (error) {
      if (error?.response?.status === 429) notyfError('Demasiadas solicitudes. Espera un momento e intenta nuevamente.');
      else notyfError(error?.response?.data?.message || error.message || 'No fue posible guardar el plato');
    }
  };
 
  if (!open) return null;
 
  return (
    <div className="dm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
      <div className="dm-modal">
 
        {/* Header */}
        <div className="dm-header">
          <div className="dm-header-left">
            <div className="dm-header-icon"><i className="ti ti-tools-kitchen-2" aria-hidden="true" /></div>
            <div>
              <div className="dm-header-title">{dish ? 'Editar plato' : 'Nuevo plato'}</div>
              <div className="dm-header-sub">Gestiona el catálogo de platos de tu restaurante.</div>
            </div>
          </div>
          <button onClick={onClose} className="dm-close" aria-label="Cerrar"><i className="ti ti-x" aria-hidden="true" /></button>
        </div>
 
        {/* Body */}
        <div className="dm-body">
          <form id="dish-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="dm-form">
 
              {/* Restaurante */}
              <div className="dm-field">
                <label className="dm-label">Restaurante <span className="dm-label-req">*</span></label>
                <Controller name="restaurantId" control={control} rules={{ required: 'El restaurante es obligatorio' }}
                  render={({ field }) => (
                    <div className="dm-input-wrap">
                      <i className="ti ti-building-store dm-input-icon" aria-hidden="true" />
                      <select {...field} disabled={restaurantOptionsLoading || loading || (isRestaurantAdmin && hasRestaurantAssigned)} className={`dm-select${errors.restaurantId ? ' dm-input--error' : ''}`}>
                        <option value="">-- Selecciona un restaurante --</option>
                        {restaurantOptions.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                      </select>
                    </div>
                  )}
                />
                {errors.restaurantId && <span className="dm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.restaurantId.message}</span>}
              </div>
 
              {/* Nombre */}
              <div className="dm-field">
                <label className="dm-label">Nombre del plato <span className="dm-label-req">*</span></label>
                <div className="dm-input-wrap">
                  <i className="ti ti-tools-kitchen-2 dm-input-icon" aria-hidden="true" />
                  <input type="text" disabled={loading} placeholder="Ej: Ceviche mixto" className={`dm-input${errors.nombre ? ' dm-input--error' : ''}`}
                    {...register('nombre', { required: 'El nombre es obligatorio', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
                  />
                </div>
                {errors.nombre && <span className="dm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.nombre.message}</span>}
              </div>
 
              {/* Precio + Categoría */}
              <div className="dm-row">
                <div className="dm-field">
                  <label className="dm-label">Precio <span className="dm-label-req">*</span></label>
                  <div className="dm-input-wrap">
                    <i className="ti ti-currency-dollar dm-input-icon" aria-hidden="true" />
                    <input type="number" disabled={loading} min="0" step="0.01" placeholder="0.00" className={`dm-input${errors.precio ? ' dm-input--error' : ''}`}
                      {...register('precio', { required: 'El precio es obligatorio', valueAsNumber: true, validate: (v) => (Number.isFinite(v) && v > 0) || 'El precio debe ser mayor a 0' })}
                    />
                  </div>
                  {errors.precio && <span className="dm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.precio.message}</span>}
                </div>
 
                <div className="dm-field">
                  <label className="dm-label">Categoría <span className="dm-label-req">*</span></label>
                  <Controller name="categoria" control={control} rules={{ required: 'La categoría es obligatoria' }}
                    render={({ field }) => (
                      <div className="dm-input-wrap">
                        <i className="ti ti-tag dm-input-icon" aria-hidden="true" />
                        <select {...field} disabled={loading} className={`dm-select${errors.categoria ? ' dm-input--error' : ''}`}>
                          <option value="">-- Selecciona una categoría --</option>
                          {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                    )}
                  />
                  {errors.categoria && <span className="dm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.categoria.message}</span>}
                </div>
              </div>
 
              {/* Descripción */}
              <div className="dm-field">
                <label className="dm-label">Descripción</label>
                <div className="dm-input-wrap" style={{ alignItems: 'flex-start' }}>
                  <i className="ti ti-file-description dm-input-icon" style={{ top: 10, position: 'absolute' }} aria-hidden="true" />
                  <textarea rows={3} disabled={loading} placeholder="Ej: Filete de pescado con limón, cebolla morada y cilantro fresco" className="dm-textarea"
                    {...register('descripcion', { maxLength: { value: 500, message: 'Máximo 500 caracteres' } })}
                  />
                </div>
                {errors.descripcion && <span className="dm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.descripcion.message}</span>}
              </div>
 
              {/* Ingredientes */}
              <div className="dm-field">
                <label className="dm-label">Ingredientes <span className="dm-label-req">*</span></label>
                <Controller name="ingredientes" control={control}
                  rules={{ required: 'Debes seleccionar al menos un ingrediente', validate: (v) => (Array.isArray(v) && v.length > 0) || 'Debes seleccionar al menos un ingrediente' }}
                  render={({ field }) => (
                    <select {...field} multiple size={5} disabled={loading} className={`dm-multiselect${errors.ingredientes ? ' dm-input--error' : ''}`}
                      onChange={(e) => { field.onChange(Array.from(e.target.selectedOptions, (o) => o.value)); }}
                    >
                      {ingredients.map((ing) => <option key={ing._id} value={ing._id}>{ing.nombre} ({ing.stock} {ing.unidadMedida})</option>)}
                    </select>
                  )}
                />
                <span className="dm-multiselect-hint"><i className="ti ti-info-circle" aria-hidden="true" />Ctrl+Click para seleccionar múltiples</span>
                {errors.ingredientes && <span className="dm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.ingredientes.message}</span>}
              </div>
 
              {/* Foto */}
              <div className="dm-field">
                <label className="dm-label">Foto del plato {!dish && <span className="dm-label-req">*</span>}</label>
                <div className="dm-upload-area">
                  <i className="ti ti-cloud-upload" aria-hidden="true" />
                  <span>Haz clic para subir imagen</span>
                  <input type="file" accept="image/*" disabled={loading}
                    {...register('foto', { validate: () => { if (dish?.foto && !selectedFile) return true; return selectedFile || 'La foto es obligatoria para nuevos platos'; } })}
                    onChange={handleImageChange}
                  />
                </div>
                {errors.foto && <span className="dm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.foto.message}</span>}
                {imagePreview && (
                  <div className="dm-img-preview">
                    <img src={imagePreview} alt="Preview del plato" />
                  </div>
                )}
              </div>
 
            </div>
          </form>
        </div>
 
        {/* Footer */}
        <div className="dm-footer">
          <span className="dm-footer-hint"><i className="ti ti-info-circle" aria-hidden="true" />Los campos <span style={{ color:'var(--ds-gold)' }}>*</span> son obligatorios</span>
          <button onClick={onClose} className="dm-btn dm-btn-cancel">Cancelar</button>
          <button form="dish-form" type="submit" disabled={loading} className="dm-btn dm-btn-save">
            {loading ? <><span className="dm-spinner" />Guardando...</> : <><i className="ti ti-device-floppy" aria-hidden="true" />Guardar plato</>}
          </button>
        </div>
 
      </div>
    </div>
  );
};