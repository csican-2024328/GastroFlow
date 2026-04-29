import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRestaurantStore } from '../store/useRestaurantStore.js';
import { notyfSuccess, notyfError } from '../../../shared/utils/notyf.js';

export const RestaurantModal = ({ isOpen, onClose, restaurant = null }) => {
  const { register, handleSubmit, formState: { errors }, reset, control, setValue } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      openingHours: '',
      aforoMaximo: '',
      category: '',
      description: '',
      averagePrice: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const createRestaurantAction = useRestaurantStore((s) => s.createRestaurantAction);
  const updateRestaurantAction = useRestaurantStore((s) => s.updateRestaurantAction);
  const storeLoading = useRestaurantStore((s) => s.loading);

  // Load restaurant data when editing
  useEffect(() => {
    if (restaurant && isOpen) {
      setValue('name', restaurant.name || '');
      setValue('email', restaurant.email || '');
      setValue('phone', restaurant.phone || '');
      setValue('address', restaurant.address || '');
      setValue('city', restaurant.city || '');
      setValue('openingHours', restaurant.openingHours || '');
      setValue('aforoMaximo', restaurant.aforoMaximo || '');
      setValue('category', restaurant.category || '');
      setValue('description', restaurant.description || '');
      setValue('averagePrice', restaurant.averagePrice || '');
      
      // Set existing photos as previews
      if (restaurant.photos && restaurant.photos.length > 0) {
        setPhotoPreviews(restaurant.photos);
      }
    } else {
      reset();
      setPhotoPreviews([]);
      setSelectedPhotos([]);
    }
  }, [restaurant, isOpen, setValue, reset]);

  const onPhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedPhotos((prev) => [...prev, ...files]);
    
    // Create previews for new files
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
    // If it's a new photo, also remove it from selectedPhotos
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
          restaurant ? 'Restaurante actualizado correctamente' : 'Restaurante creado correctamente'
        );
        reset();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0F452A] rounded-lg border border-[#113a26] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-semibold mb-6 text-[#F0EDE8]">
          {restaurant ? 'Editar Restaurante' : 'Crear Nuevo Restaurante'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="text-sm text-[#C4A882]">Nombre *</label>
            <input
              {...register('name', { required: 'El nombre es obligatorio' })}
              className="w-full p-2 rounded bg-[#112D1C] text-[#F0EDE8] border border-[#1A3D25] focus:border-[#C4A882] focus:outline-none"
              placeholder="Nombre del restaurante"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-[#C4A882]">Email *</label>
            <input
              {...register('email', {
                required: 'El email es obligatorio',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'El email debe ser válido',
                },
              })}
              className="w-full p-2 rounded bg-[#112D1C] text-[#F0EDE8] border border-[#1A3D25] focus:border-[#C4A882] focus:outline-none"
              placeholder="restaurante@email.com"
              type="email"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-sm text-[#C4A882]">Teléfono *</label>
            <input
              {...register('phone', { required: 'El teléfono es obligatorio' })}
              className="w-full p-2 rounded bg-[#112D1C] text-[#F0EDE8] border border-[#1A3D25] focus:border-[#C4A882] focus:outline-none"
              placeholder="23456789"
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* Dirección */}
          <div>
            <label className="text-sm text-[#C4A882]">Dirección *</label>
            <input
              {...register('address', { required: 'La dirección es obligatoria' })}
              className="w-full p-2 rounded bg-[#112D1C] text-[#F0EDE8] border border-[#1A3D25] focus:border-[#C4A882] focus:outline-none"
              placeholder="Calle Principal 123"
            />
            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
          </div>

          {/* Ciudad */}
          <div>
            <label className="text-sm text-[#C4A882]">Ciudad *</label>
            <input
              {...register('city', { required: 'La ciudad es obligatoria' })}
              className="w-full p-2 rounded bg-[#112D1C] text-[#F0EDE8] border border-[#1A3D25] focus:border-[#C4A882] focus:outline-none"
              placeholder="Ciudad de Guatemala"
            />
            {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
          </div>

          {/* Horario de apertura */}
          <div>
            <label className="text-sm text-[#C4A882]">Horario de apertura *</label>
            <input
              {...register('openingHours', { required: 'El horario es obligatorio' })}
              className="w-full p-2 rounded bg-[#112D1C] text-[#F0EDE8] border border-[#1A3D25] focus:border-[#C4A882] focus:outline-none"
              placeholder="Lun-Vie 9:00-18:00"
            />
            {errors.openingHours && <p className="text-red-400 text-xs mt-1">{errors.openingHours.message}</p>}
          </div>

          {/* Aforo máximo */}
          <div>
            <label className="text-sm text-[#C4A882]">Aforo máximo *</label>
            <input
              {...register('aforoMaximo', { required: 'El aforo máximo es obligatorio' })}
              className="w-full p-2 rounded bg-[#112D1C] text-[#F0EDE8] border border-[#1A3D25] focus:border-[#C4A882] focus:outline-none"
              placeholder="100"
              type="number"
            />
            {errors.aforoMaximo && <p className="text-red-400 text-xs mt-1">{errors.aforoMaximo.message}</p>}
          </div>

          {/* Categoría */}
          <div>
            <label className="text-sm text-[#C4A882]">Categoría</label>
            <input
              {...register('category')}
              className="w-full p-2 rounded bg-[#112D1C] text-[#F0EDE8] border border-[#1A3D25] focus:border-[#C4A882] focus:outline-none"
              placeholder="Italiana, Mexicana, etc."
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm text-[#C4A882]">Descripción</label>
            <textarea
              {...register('description')}
              className="w-full p-2 rounded bg-[#112D1C] text-[#F0EDE8] border border-[#1A3D25] focus:border-[#C4A882] focus:outline-none"
              placeholder="Descripción del restaurante"
              rows="3"
            />
          </div>

          {/* Precio promedio */}
          <div>
            <label className="text-sm text-[#C4A882]">Precio promedio</label>
            <input
              {...register('averagePrice')}
              className="w-full p-2 rounded bg-[#112D1C] text-[#F0EDE8] border border-[#1A3D25] focus:border-[#C4A882] focus:outline-none"
              placeholder="50.00"
              type="number"
              step="0.01"
            />
          </div>

          {/* Fotos */}
          <div>
            <label className="text-sm text-[#C4A882]">Fotos (cualquier imagen)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onPhotoChange}
              className="w-full p-2 rounded bg-[#112D1C] text-[#F0EDE8] border border-[#1A3D25]"
            />
            
            {/* Preview de fotos */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 text-xs rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[#1A3D25]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-[#F0EDE8]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || storeLoading}
              className="px-4 py-2 rounded bg-[#1A3D25] hover:bg-[#0F452A] text-[#F0EDE8] disabled:opacity-50"
            >
              {loading || storeLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
