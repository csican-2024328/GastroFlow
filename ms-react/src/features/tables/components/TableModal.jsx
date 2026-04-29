import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Option,
  Select,
  Typography,
} from '@material-tailwind/react';
import { useTableStore } from '../store/useTableStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';

export const TableModal = ({ open, onClose, mesa = null }) => {
  const restaurantOptions = useTableStore((state) => state.restaurantOptions);
  const fetchRestaurantOptions = useTableStore((state) => state.fetchRestaurantOptions);
  const restaurantOptionsLoading = useTableStore((state) => state.restaurantOptionsLoading);
  const selectedRestaurantId = useTableStore((state) => state.selectedRestaurantId);
  const createMesaAction = useTableStore((state) => state.createMesaAction);
  const updateMesaAction = useTableStore((state) => state.updateMesaAction);
  const loading = useTableStore((state) => state.loading);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      numero: '',
      capacidad: '',
      ubicacion: '',
      restaurantID: '',
    },
  });

  useEffect(() => {
    if (restaurantOptions.length === 0) {
      fetchRestaurantOptions();
    }
  }, [fetchRestaurantOptions, restaurantOptions.length]);

  useEffect(() => {
    if (open) {
      reset({
        numero: mesa?.numero ?? '',
        capacidad: mesa?.capacidad ?? '',
        ubicacion: mesa?.ubicacion ?? '',
        restaurantID: mesa?.restaurantID?._id || mesa?.restaurantID || selectedRestaurantId || '',
      });
    }
  }, [mesa, open, reset, selectedRestaurantId]);

  const onSubmit = async (formData) => {
    try {
      const payload = {
        numero: Number(formData.numero),
        capacidad: Number(formData.capacidad),
        ubicacion: formData.ubicacion,
        restaurantID: formData.restaurantID,
        isActive: true,
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

  return (
    <Dialog open={open} handler={onClose} size="lg" className="bg-[#0F452A] text-[#F0EDE8]">
      <DialogHeader className="border-b border-[#113a26]">
        <Typography variant="h5" className="text-[#F0EDE8]">
          {mesa ? 'Editar mesa' : 'Nueva mesa'}
        </Typography>
      </DialogHeader>
      <DialogBody className="space-y-4 overflow-y-auto max-h-[75vh]">
        <form id="table-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Typography variant="small" className="mb-2 text-[#C4A882]">
              Número de mesa *
            </Typography>
            <Input
              type="number"
              min="1"
              {...register('numero', {
                required: 'El número de mesa es obligatorio',
                valueAsNumber: true,
                validate: (value) => Number(value) > 0 || 'El número debe ser mayor a 0',
              })}
              className="!border-[#1A3D25] text-[#F0EDE8]"
              labelProps={{ className: 'hidden' }}
            />
            {errors.numero && <p className="mt-1 text-xs text-red-400">{errors.numero.message}</p>}
          </div>

          <div>
            <Typography variant="small" className="mb-2 text-[#C4A882]">
              Capacidad de personas *
            </Typography>
            <Input
              type="number"
              min="1"
              {...register('capacidad', {
                required: 'La capacidad es obligatoria',
                valueAsNumber: true,
                validate: (value) => Number(value) > 0 || 'La capacidad debe ser mayor a 0',
              })}
              className="!border-[#1A3D25] text-[#F0EDE8]"
              labelProps={{ className: 'hidden' }}
            />
            {errors.capacidad && <p className="mt-1 text-xs text-red-400">{errors.capacidad.message}</p>}
          </div>

          <div>
            <Typography variant="small" className="mb-2 text-[#C4A882]">
              Identificador visual / Ubicación *
            </Typography>
            <Input
              type="text"
              {...register('ubicacion', {
                required: 'El identificador visual es obligatorio',
              })}
              placeholder="Terraza, Ventana, Sala 1"
              className="!border-[#1A3D25] text-[#F0EDE8]"
              labelProps={{ className: 'hidden' }}
            />
            {errors.ubicacion && <p className="mt-1 text-xs text-red-400">{errors.ubicacion.message}</p>}
          </div>

          <div>
            <Typography variant="small" className="mb-2 text-[#C4A882]">
              Restaurante *
            </Typography>
            <Controller
              name="restaurantID"
              control={control}
              rules={{ required: 'El restaurante es obligatorio' }}
              render={({ field }) => (
                <Select
                  label="Selecciona un restaurante"
                  value={field.value || ''}
                  onChange={field.onChange}
                  disabled={restaurantOptionsLoading}
                  className="text-[#F0EDE8]"
                  containerProps={{ className: 'min-w-full' }}
                >
                  <Option value="">-- Selecciona un restaurante --</Option>
                  {restaurantOptions.map((restaurant) => (
                    <Option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
            {errors.restaurantID && <p className="mt-1 text-xs text-red-400">{errors.restaurantID.message}</p>}
          </div>
        </form>
      </DialogBody>
      <DialogFooter className="border-t border-[#113a26] gap-2">
        <Button variant="text" onClick={onClose} className="text-[#C4A882]">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-[#1A3D25] text-[#F0EDE8]"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
