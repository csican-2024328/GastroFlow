import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRestaurantStore } from '../store/useRestaurantStore.js';
import { notyfSuccess, notyfError } from '../../../shared/utils/notyf.js';
 
export const RestaurantModal = ({ isOpen, onClose, restaurant = null }) => {
  if (!isOpen) return null;
  return (
    <RestaurantModalContent
      key={restaurant?._id || 'new'}
      onClose={onClose}
      restaurant={restaurant}
    />
  );
};
 
const RestaurantModalContent = ({ onClose, restaurant = null }) => {
  /* ── Form — INTACTO ── */
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name:         restaurant?.name         || '',
      email:        restaurant?.email        || '',
      phone:        restaurant?.phone        || '',
      address:      restaurant?.address      || '',
      city:         restaurant?.city         || '',
      openingHours: restaurant?.openingHours || '',
      aforoMaximo:  restaurant?.aforoMaximo  || '',
      category:     restaurant?.category     || '',
      description:  restaurant?.description  || '',
      averagePrice: restaurant?.averagePrice || '',
    },
  });
 
  const [loading, setLoading]               = useState(false);
  const [photoPreviews, setPhotoPreviews]   = useState(restaurant?.photos ? [...restaurant.photos] : []);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
 
  const createRestaurantAction = useRestaurantStore((s) => s.createRestaurantAction);
  const updateRestaurantAction = useRestaurantStore((s) => s.updateRestaurantAction);
  const storeLoading           = useRestaurantStore((s) => s.loading);
 
  /* ── Handlers — INTACTOS ── */
  const onPhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedPhotos((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };
 
  const removePhoto = (index) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    if (index >= (restaurant?.photos?.length || 0)) {
      const newPhotoIndex = index - (restaurant?.photos?.length || 0);
      setSelectedPhotos((prev) => prev.filter((_, i) => i !== newPhotoIndex));
    }
  };
 
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        name:         data.name,
        email:        data.email,
        phone:        data.phone,
        address:      data.address,
        city:         data.city,
        openingHours: data.openingHours,
        aforoMaximo:  parseInt(data.aforoMaximo, 10),
        category:     data.category     || undefined,
        description:  data.description  || undefined,
        averagePrice: data.averagePrice ? parseFloat(data.averagePrice) : undefined,
        photos:       selectedPhotos,
      };
 
      const result = restaurant?._id
        ? await updateRestaurantAction(restaurant._id, payload)
        : await createRestaurantAction(payload);
 
      if (result.success) {
        notyfSuccess(restaurant ? 'Restaurante actualizado correctamente' : 'Restaurante creado correctamente');
        setPhotoPreviews([]); setSelectedPhotos([]);
        onClose();
      } else {
        notyfError(result.error || 'Error al guardar restaurante');
      }
    } catch (err) {
      notyfError(err.message || 'Error al guardar restaurante');
    } finally {
      setLoading(false);
    }
  };
 
  /* ── Render ── */
  return (
    <div
      className="rm-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={restaurant ? 'Editar restaurante' : 'Crear nuevo restaurante'}
    >
      <div className="rm-modal">
 
        {/* Header */}
        <div className="rm-header">
          <div className="rm-header-left">
            <div className="rm-header-icon">
              <i className="ti ti-building-store" aria-hidden="true" />
            </div>
            <div>
              <div className="rm-header-title">
                {restaurant ? 'Editar Restaurante' : 'Crear Nuevo Restaurante'}
              </div>
              <div className="rm-header-sub">
                {restaurant ? 'Modifica los datos del local' : 'Completa los datos para registrar el restaurante'}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rm-close" aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
 
        {/* Body */}
        <div className="rm-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="rm-form">
 
              {/* ── Información básica ── */}
              <p className="rm-section-label">
                <i className="ti ti-info-circle" style={{ fontSize: 12, color: 'var(--rp-gold)' }} aria-hidden="true" />
                Información básica
              </p>
 
              {/* Nombre */}
              <div className="rm-field">
                <label className="rm-label">Nombre <span className="rm-label-req">*</span></label>
                <div className="rm-input-wrap">
                  <i className="ti ti-building-store rm-input-icon" aria-hidden="true" />
                  <input
                    {...register('name', { required: 'El nombre es obligatorio' })}
                    className={`rm-input${errors.name ? ' rm-input--error' : ''}`}
                    placeholder="Nombre del restaurante"
                  />
                </div>
                {errors.name && <span className="rm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.name.message}</span>}
              </div>
 
              {/* Email + Teléfono */}
              <div className="rm-row">
                <div className="rm-field">
                  <label className="rm-label">Email <span className="rm-label-req">*</span></label>
                  <div className="rm-input-wrap">
                    <i className="ti ti-mail rm-input-icon" aria-hidden="true" />
                    <input
                      {...register('email', {
                        required: 'El email es obligatorio',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'El email debe ser válido' },
                      })}
                      type="email"
                      className={`rm-input${errors.email ? ' rm-input--error' : ''}`}
                      placeholder="restaurante@email.com"
                    />
                  </div>
                  {errors.email && <span className="rm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.email.message}</span>}
                </div>
 
                <div className="rm-field">
                  <label className="rm-label">Teléfono <span className="rm-label-req">*</span></label>
                  <div className="rm-input-wrap">
                    <i className="ti ti-phone rm-input-icon" aria-hidden="true" />
                    <input
                      {...register('phone', { required: 'El teléfono es obligatorio' })}
                      className={`rm-input${errors.phone ? ' rm-input--error' : ''}`}
                      placeholder="23456789"
                    />
                  </div>
                  {errors.phone && <span className="rm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.phone.message}</span>}
                </div>
              </div>
 
              {/* Dirección + Ciudad */}
              <div className="rm-row">
                <div className="rm-field">
                  <label className="rm-label">Dirección <span className="rm-label-req">*</span></label>
                  <div className="rm-input-wrap">
                    <i className="ti ti-map-pin rm-input-icon" aria-hidden="true" />
                    <input
                      {...register('address', { required: 'La dirección es obligatoria' })}
                      className={`rm-input${errors.address ? ' rm-input--error' : ''}`}
                      placeholder="Calle Principal 123"
                    />
                  </div>
                  {errors.address && <span className="rm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.address.message}</span>}
                </div>
 
                <div className="rm-field">
                  <label className="rm-label">Ciudad <span className="rm-label-req">*</span></label>
                  <div className="rm-input-wrap">
                    <i className="ti ti-building rm-input-icon" aria-hidden="true" />
                    <input
                      {...register('city', { required: 'La ciudad es obligatoria' })}
                      className={`rm-input${errors.city ? ' rm-input--error' : ''}`}
                      placeholder="Ciudad de Guatemala"
                    />
                  </div>
                  {errors.city && <span className="rm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.city.message}</span>}
                </div>
              </div>
 
              {/* ── Detalles operativos ── */}
              <p className="rm-section-label">
                <i className="ti ti-settings" style={{ fontSize: 12, color: 'var(--rp-gold)' }} aria-hidden="true" />
                Detalles operativos
              </p>
 
              {/* Horario + Aforo + Precio */}
              <div className="rm-row-3">
                <div className="rm-field">
                  <label className="rm-label">Horario <span className="rm-label-req">*</span></label>
                  <div className="rm-input-wrap">
                    <i className="ti ti-clock rm-input-icon" aria-hidden="true" />
                    <input
                      {...register('openingHours', { required: 'El horario es obligatorio' })}
                      className={`rm-input${errors.openingHours ? ' rm-input--error' : ''}`}
                      placeholder="Lun-Vie 9:00-18:00"
                    />
                  </div>
                  {errors.openingHours && <span className="rm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.openingHours.message}</span>}
                </div>
 
                <div className="rm-field">
                  <label className="rm-label">Aforo máximo <span className="rm-label-req">*</span></label>
                  <div className="rm-input-wrap">
                    <i className="ti ti-users rm-input-icon" aria-hidden="true" />
                    <input
                      type="number"
                      {...register('aforoMaximo', { required: 'El aforo máximo es obligatorio' })}
                      className={`rm-input${errors.aforoMaximo ? ' rm-input--error' : ''}`}
                      placeholder="100"
                    />
                  </div>
                  {errors.aforoMaximo && <span className="rm-error-msg"><i className="ti ti-alert-circle" aria-hidden="true" />{errors.aforoMaximo.message}</span>}
                </div>
 
                <div className="rm-field">
                  <label className="rm-label">Precio promedio</label>
                  <div className="rm-input-wrap">
                    <i className="ti ti-currency-dollar rm-input-icon" aria-hidden="true" />
                    <input
                      type="number" step="0.01"
                      {...register('averagePrice')}
                      className="rm-input"
                      placeholder="50.00"
                    />
                  </div>
                </div>
              </div>
 
              {/* Categoría */}
              <div className="rm-field">
                <label className="rm-label">Categoría</label>
                <div className="rm-input-wrap">
                  <i className="ti ti-tools-kitchen-2 rm-input-icon" aria-hidden="true" />
                  <input
                    {...register('category')}
                    className="rm-input"
                    placeholder="Italiana, Mexicana, Fusión..."
                  />
                </div>
              </div>
 
              {/* Descripción */}
              <div className="rm-field">
                <label className="rm-label">Descripción</label>
                <div className="rm-input-wrap" style={{ alignItems: 'flex-start' }}>
                  <i className="ti ti-file-description rm-input-icon" style={{ top: 10, position: 'absolute' }} aria-hidden="true" />
                  <textarea
                    {...register('description')}
                    className="rm-textarea"
                    placeholder="Descripción del restaurante..."
                    rows={3}
                  />
                </div>
              </div>
 
              {/* ── Fotos ── */}
              <p className="rm-section-label">
                <i className="ti ti-photo" style={{ fontSize: 12, color: 'var(--rp-gold)' }} aria-hidden="true" />
                Fotos del restaurante
              </p>
 
              <div className="rm-upload-area">
                <i className="ti ti-cloud-upload" aria-hidden="true" />
                <span>Haz clic o arrastra imágenes aquí</span>
                <input
                  type="file" accept="image/*" multiple
                  onChange={onPhotoChange}
                />
              </div>
 
              {photoPreviews.length > 0 && (
                <div className="rm-photo-grid">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="rm-photo-item">
                      <img src={preview} alt={`Preview ${index}`} />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="rm-photo-remove"
                        aria-label="Eliminar foto"
                      >
                        <i className="ti ti-x" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
 
            </div>
          </form>
        </div>
 
        {/* Footer */}
        <div className="rm-footer">
          <span className="rm-footer-hint">
            <i className="ti ti-info-circle" aria-hidden="true" />
            Los campos con <span style={{ color: 'var(--rp-gold)' }}>*</span> son obligatorios
          </span>
          <button onClick={onClose} className="rm-btn rm-btn-cancel">
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading || storeLoading}
            className="rm-btn rm-btn-save"
          >
            {loading || storeLoading
              ? <><span className="rm-spinner" />Guardando...</>
              : <><i className="ti ti-device-floppy" aria-hidden="true" />Guardar</>}
          </button>
        </div>
 
      </div>
    </div>
  );
};