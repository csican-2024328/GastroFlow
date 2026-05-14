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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: restaurant?.name || '',
      email: restaurant?.email || '',
      phone: restaurant?.phone || '',
      address: restaurant?.address || '',
      city: restaurant?.city || '',
      openingHours: restaurant?.openingHours || '',
      aforoMaximo: restaurant?.aforoMaximo || '',
      category: restaurant?.category || '',
      description: restaurant?.description || '',
      averagePrice: restaurant?.averagePrice || '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState(
    restaurant?.photos ? [...restaurant.photos] : []
  );
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const createRestaurantAction = useRestaurantStore((s) => s.createRestaurantAction);
  const updateRestaurantAction = useRestaurantStore((s) => s.updateRestaurantAction);
  const storeLoading = useRestaurantStore((s) => s.loading);

  const onPhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedPhotos((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result]);
      };
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
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        openingHours: data.openingHours,
        aforoMaximo: parseInt(data.aforoMaximo, 10),
        category: data.category || undefined,
        description: data.description || undefined,
        averagePrice: data.averagePrice ? parseFloat(data.averagePrice) : undefined,
        photos: selectedPhotos,
      };

      let result;
      if (restaurant && restaurant._id) {
        result = await updateRestaurantAction(restaurant._id, payload);
      } else {
        result = await createRestaurantAction(payload);
      }

      if (result.success) {
        notyfSuccess(
          restaurant
            ? 'Restaurante actualizado correctamente'
            : 'Restaurante creado correctamente'
        );
        setPhotoPreviews([]);
        setSelectedPhotos([]);
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

  const inputClassName =
    'w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-2.5 text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20';

  const labelClassName = 'block text-sm font-medium text-[#2D4F4F] mb-1.5';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FDFBF7] text-gray-800 border border-[#E8D4B8] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_30px_70px_rgba(26,26,26,0.45)]">

        {/* Header */}
        <div className="border-b border-[#E8D4B8] px-6 py-5 bg-[#F5EFEA]">
          <h2 className="text-xl font-semibold text-[#2D4F4F]">
            {restaurant ? 'Editar Restaurante' : 'Crear Nuevo Restaurante'}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[75vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Nombre */}
            <div>
              <label className={labelClassName}>Nombre *</label>
              <input
                {...register('name', { required: 'El nombre es obligatorio' })}
                className={inputClassName}
                placeholder="Nombre del restaurante"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={labelClassName}>Email *</label>
              <input
                {...register('email', {
                  required: 'El email es obligatorio',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'El email debe ser válido',
                  },
                })}
                className={inputClassName}
                placeholder="restaurante@email.com"
                type="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className={labelClassName}>Teléfono *</label>
              <input
                {...register('phone', { required: 'El teléfono es obligatorio' })}
                className={inputClassName}
                placeholder="23456789"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className={labelClassName}>Dirección *</label>
              <input
                {...register('address', { required: 'La dirección es obligatoria' })}
                className={inputClassName}
                placeholder="Calle Principal 123"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* Ciudad */}
            <div>
              <label className={labelClassName}>Ciudad *</label>
              <input
                {...register('city', { required: 'La ciudad es obligatoria' })}
                className={inputClassName}
                placeholder="Ciudad de Guatemala"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
              )}
            </div>

            {/* Horario */}
            <div>
              <label className={labelClassName}>Horario de apertura *</label>
              <input
                {...register('openingHours', { required: 'El horario es obligatorio' })}
                className={inputClassName}
                placeholder="Lun-Vie 9:00-18:00"
              />
              {errors.openingHours && (
                <p className="text-red-500 text-xs mt-1">{errors.openingHours.message}</p>
              )}
            </div>

            {/* Aforo máximo */}
            <div>
              <label className={labelClassName}>Aforo máximo *</label>
              <input
                {...register('aforoMaximo', { required: 'El aforo máximo es obligatorio' })}
                className={inputClassName}
                placeholder="100"
                type="number"
              />
              {errors.aforoMaximo && (
                <p className="text-red-500 text-xs mt-1">{errors.aforoMaximo.message}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className={labelClassName}>Categoría</label>
              <input
                {...register('category')}
                className={inputClassName}
                placeholder="Italiana, Mexicana, etc."
              />
            </div>

            {/* Descripción */}
            <div>
              <label className={labelClassName}>Descripción</label>
              <textarea
                {...register('description')}
                className={inputClassName}
                placeholder="Descripción del restaurante"
                rows="3"
              />
            </div>

            {/* Precio promedio */}
            <div>
              <label className={labelClassName}>Precio promedio</label>
              <input
                {...register('averagePrice')}
                className={inputClassName}
                placeholder="50.00"
                type="number"
                step="0.01"
              />
            </div>

            {/* Fotos */}
            <div>
              <label className={labelClassName}>Fotos (cualquier imagen)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onPhotoChange}
                className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-2.5 text-gray-900 shadow-sm outline-none transition file:mr-3 file:rounded file:border-0 file:bg-[#2D4F4F] file:px-3 file:py-1 file:text-xs file:font-medium file:text-white hover:file:bg-[#3A6B6B]"
              />

              {/* Preview de fotos */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded-md border border-[#E8D4B8]"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 text-xs rounded leading-none hover:bg-red-600 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E8D4B8] flex justify-end gap-3 px-6 py-4 bg-[#F5EFEA]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-[#E8D4B8] text-gray-700 bg-[#FDFBF7] hover:bg-[#F5EFEA] transition-colors duration-200 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading || storeLoading}
            className="px-4 py-2 rounded-md bg-[#2D4F4F] text-white hover:bg-[#3A6B6B] shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium disabled:opacity-50"
          >
            {loading || storeLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

      </div>
    </div>
  );
};