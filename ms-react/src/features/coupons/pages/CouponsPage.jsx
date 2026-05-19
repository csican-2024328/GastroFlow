import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { NoRestaurantAssigned } from '../../../shared/components/layout/NoRestaurantAssigned.jsx';
import {
  getRestaurantVigentesCoupons,
  getCoupons,
  createCoupon,
  updateCoupon,
  deactivateCoupon,
  activateCoupon,
  getCouponById,
} from '../../../shared/api/couponService.js';

const formatDate = (value) => {
  if (!value) return 'No especificada';
  const date = new Date(value);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getCouponStatus = (coupon) => {
  const now = new Date();
  // If explicitly deactivated, show Inactivo
  if (coupon.isActive === false) {
    return { label: 'Inactivo', className: 'bg-[#9DA39A] text-white' };
  }

  const expiration = new Date(coupon.fechaExpiracion);

  if (Number.isNaN(expiration.getTime())) {
    return { label: 'Activo', className: 'bg-[#2C4035] text-white' };
  }

  if (expiration < now) {
    return { label: 'Expirado', className: 'bg-[#5A5146] text-white' };
  }

  const diffMs = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    return { label: 'Por vencer', className: 'bg-[#C49A2B] text-white' };
  }

  return { label: 'Activo', className: 'bg-[#2C4035] text-white' };
};

const formatDiscount = (coupon) => {
  if (coupon.tipo === 'PORCENTAJE') {
    return `${coupon.porcentajeDescuento ?? 0}%`;
  }

  return `Q ${Number(coupon.montoFijo ?? 0).toFixed(2)}`;
};

const CouponCard = ({ coupon, isAdmin, onEdit, onToggleActive }) => {
  const [copied, setCopied] = useState(false);

  const status = useMemo(() => getCouponStatus(coupon), [coupon]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.codigo);
      setCopied(true);
      toast.success('Código copiado');

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      toast.error('No se pudo copiar el código');
    }
  };

  return (
    <article className={`overflow-hidden rounded-2xl border border-[#E2D4B7] bg-white shadow-[0_10px_24px_rgba(61,44,30,0.10)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(61,44,30,0.14)] ${coupon.isActive === false ? 'opacity-60' : ''}`}>
      <div className="flex h-28 items-center justify-between bg-gradient-to-br from-[#2C4035] via-[#3D2C1E] to-[#C87A55] px-5 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/75">Cupón</p>
          <h3 className="mt-1 font-['Playfair_Display'] text-2xl font-bold">{coupon.codigo}</h3>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-[#FAF7F2] p-3">
            <p className="text-xs uppercase tracking-wide text-[#B59070]">Tipo</p>
            <p className="mt-1 font-semibold text-[#1A1A1A]">
              {coupon.tipo === 'PORCENTAJE' ? 'Porcentaje' : 'Monto fijo'}
            </p>
          </div>
          <div className="rounded-xl bg-[#FAF7F2] p-3">
            <p className="text-xs uppercase tracking-wide text-[#B59070]">Descuento</p>
            <p className="mt-1 font-semibold text-[#1A1A1A]">{formatDiscount(coupon)}</p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-[#E8D9C4] bg-[#FAF7F2] p-4 text-sm text-[#5A5146]">
          <p>
            <span className="font-semibold text-[#1A1A1A]">Expira:</span> {formatDate(coupon.fechaExpiracion)}
          </p>
          {coupon.descripcion && (
            <p className="line-clamp-3">
              <span className="font-semibold text-[#1A1A1A]">Detalle:</span> {coupon.descripcion}
            </p>
          )}
          {coupon.montoMinimo > 0 && (
            <p>
              <span className="font-semibold text-[#1A1A1A]">Monto mínimo:</span> Q {Number(coupon.montoMinimo).toFixed(2)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopyCode}
          disabled={coupon.isActive === false}
          className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${copied ? 'border border-[#2C4035] bg-[#F5EDE0] text-[#2C4035]' : 'bg-gradient-to-r from-[#C87A55] to-[#C49A2B] text-white shadow-sm hover:shadow-lg'} ${coupon.isActive === false ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {copied ? '✓ Copiado' : coupon.isActive === false ? 'Inactivo' : 'Copiar código'}
        </button>
        {isAdmin && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onEdit(coupon)}
              className="flex-1 rounded-xl border border-[#2C4035] px-3 py-2 text-sm font-semibold text-[#2C4035] hover:bg-[#E2D4B7]"
            >
              Editar
            </button>
            <button
              onClick={() => onToggleActive(coupon)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white ${coupon.isActive ? 'bg-[#C9695A] hover:bg-[#B45A4C]' : 'bg-[#2C4035] hover:bg-[#23342B]'}`}
            >
              {coupon.isActive ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export const CouponsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form state for admin create/edit
  const [form, setForm] = useState({
    codigo: '', descripcion: '', tipo: 'PORCENTAJE', porcentajeDescuento: 0, montoFijo: 0,
    fechaExpiracion: '', fechaInicio: '', usosMaximos: 0, montoMinimo: 0, montoMaximoDescuento: 0,
  });

  useEffect(() => {
    fetchRestaurants(1, 50);
  }, [fetchRestaurants]);

  useEffect(() => {
    if (restaurantId) {
      setSelectedRestaurantId(restaurantId);
    }
  }, [restaurantId]);

  if (isRestaurantAdmin && !hasRestaurantAssigned) {
    return <NoRestaurantAssigned />;
  }

  useEffect(() => {
    if (!selectedRestaurantId) return;

    const loadCoupons = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getRestaurantVigentesCoupons(selectedRestaurantId);
        setCoupons(response.data.data || []);

        // If admin, also fetch inactive coupons to manage (separate call)
        if (user?.role === 'RESTAURANT_ADMIN' || user?.role === 'PLATFORM_ADMIN') {
          try {
            const active = await getCoupons({ restaurantID: selectedRestaurantId, isActive: true, limit: 100 });
            const inactive = await getCoupons({ restaurantID: selectedRestaurantId, isActive: false, limit: 100 });
            setAllCoupons([...(active.data.data || []), ...(inactive.data.data || [])]);
          } catch (innerErr) {
            // ignore
            setAllCoupons(response.data.data || []);
          }
        }
      } catch (requestError) {
        const message = requestError.response?.data?.message || 'Error al obtener cupones vigentes';
        setCoupons([]);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadCoupons();
  }, [selectedRestaurantId, user]);

  const refreshCoupons = async () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    try {
      const active = await getCoupons({ restaurantID: selectedRestaurantId, isActive: true, limit: 100 });
      const inactive = await getCoupons({ restaurantID: selectedRestaurantId, isActive: false, limit: 100 });
      setAllCoupons([...(active.data.data || []), ...(inactive.data.data || [])]);
      setCoupons(active.data.data || []);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (coupon) => {
    // populate form
    setEditingCoupon(coupon);
    setForm({
      codigo: coupon.codigo || '',
      descripcion: coupon.descripcion || '',
      tipo: coupon.tipo || 'PORCENTAJE',
      porcentajeDescuento: coupon.porcentajeDescuento || 0,
      montoFijo: coupon.montoFijo || 0,
      fechaExpiracion: coupon.fechaExpiracion ? new Date(coupon.fechaExpiracion).toISOString().slice(0,10) : '',
      fechaInicio: coupon.fechaInicio ? new Date(coupon.fechaInicio).toISOString().slice(0,10) : '',
      usosMaximos: coupon.usosMaximos || 0,
      montoMinimo: coupon.montoMinimo || 0,
      montoMaximoDescuento: coupon.montoMaximoDescuento || 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (coupon) => {
    try {
      setLoading(true);
      if (coupon.isActive) {
        await deactivateCoupon(coupon._id);
        toast.success('Cupón desactivado');
      } else {
        await activateCoupon(coupon._id);
        toast.success('Cupón activado');
      }
      await refreshCoupons();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al cambiar estado del cupón');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (key, value) => setForm((s) => ({ ...s, [key]: value }));

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        codigo: form.codigo.toUpperCase(),
        descripcion: form.descripcion,
        tipo: form.tipo,
        porcentajeDescuento: form.tipo === 'PORCENTAJE' ? Number(form.porcentajeDescuento) : 0,
        montoFijo: form.tipo === 'MONTO_FIJO' ? Number(form.montoFijo) : 0,
        fechaExpiracion: form.fechaExpiracion,
        fechaInicio: form.fechaInicio || undefined,
        usosMaximos: Number(form.usosMaximos) || undefined,
        montoMinimo: Number(form.montoMinimo) || 0,
        montoMaximoDescuento: Number(form.montoMaximoDescuento) || undefined,
        restaurantID: selectedRestaurantId,
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload);
        toast.success('Cupón actualizado');
      } else {
        await createCoupon(payload);
        toast.success('Cupón creado');
      }

      setForm({ codigo: '', descripcion: '', tipo: 'PORCENTAJE', porcentajeDescuento: 0, montoFijo: 0, fechaExpiracion: '', fechaInicio: '', usosMaximos: 0, montoMinimo: 0, montoMaximoDescuento: 0 });
      setEditingCoupon(null);
      await refreshCoupons();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al guardar el cupón');
    } finally {
      setLoading(false);
    }
  };

  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant._id === selectedRestaurantId),
    [restaurants, selectedRestaurantId]
  );

  const isAdmin = user && (user.role === 'RESTAURANT_ADMIN' || user.role === 'PLATFORM_ADMIN');
  const visibleCoupons = isAdmin ? allCoupons : coupons;

  if (!selectedRestaurantId) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A] fade-in">
        <header className="border-b border-[#E2D4B7] bg-[#F8F5F0]">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <div>
              <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A]">
                Cupones disponibles
              </h1>
              <p className="text-sm text-[#5A5146]">
                {user?.name}, selecciona un restaurante para ver sus cupones vigentes
              </p>
            </div>
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2C4035] bg-white px-4 py-2 text-sm font-semibold text-[#2C4035] hover:bg-[#E2D4B7]"
            >
              ← Menu Principal
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 py-8">
          <div className="mb-6">
            <h2 className="mb-4 font-['Playfair_Display'] text-2xl font-bold text-[#1A1A1A]">
              Selecciona un restaurante
            </h2>
          </div>

          {restaurants.length === 0 ? (
            <div className="rounded-2xl border border-[#E2D4B7] bg-white p-10 text-center">
              <p className="text-[#5A5146]">No hay restaurantes disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant._id}
                  onClick={() => setSelectedRestaurantId(restaurant._id)}
                  className="overflow-hidden rounded-2xl border border-[#E2D4B7] bg-white text-left transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-32 bg-gradient-to-br from-[#E2D4B7] to-[#F8F5F0]">
                    {restaurant.fotos && restaurant.fotos.length > 0 ? (
                      <img
                        src={restaurant.fotos[0]}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🏷️</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#1A1A1A]">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-[#5A5146]">{restaurant.category || 'Restaurante'}</p>
                    {restaurant.address && (
                      <p className="mt-2 text-xs text-[#B59070]">📍 {restaurant.address}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A] fade-in">
      <header className="border-b border-[#E2D4B7] bg-[#F8F5F0]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A]">
              {selectedRestaurant?.name || 'Cupones vigentes'}
            </h1>
            <p className="text-sm text-[#5A5146]">Promociones disponibles para clientes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRestaurantId(null)}
              className="rounded-full border border-[#C87A55] bg-white px-4 py-2 text-sm font-semibold text-[#C87A55] hover:bg-[#E2D4B7]"
            >
              ← Cambiar Restaurante
            </button>
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2C4035] bg-white px-4 py-2 text-sm font-semibold text-[#2C4035] hover:bg-[#E2D4B7]"
            >
              ← Menu Principal
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {user && (user.role === 'RESTAURANT_ADMIN' || user.role === 'PLATFORM_ADMIN') && (
          <div className="mb-6 rounded-2xl border border-[#E8D9C4] bg-[#FBF8F2] p-6">
            <h2 className="mb-4 font-['Playfair_Display'] text-2xl font-bold text-[#1A1A1A]">Crear/Editar Cupón</h2>
            <form onSubmit={handleSubmitForm} className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              <label className="space-y-1">
                <div className="text-xs font-semibold text-[#8A7A63]">Código del Cupón *</div>
                <input value={form.codigo} onChange={(e) => handleFormChange('codigo', e.target.value)} required className="w-full rounded-lg border border-[#D9C7AC] bg-white px-3 py-2 text-sm outline-none" />
              </label>
              <label className="space-y-1">
                <div className="text-xs font-semibold text-[#8A7A63]">Tipo de Descuento *</div>
                <select value={form.tipo} onChange={(e) => handleFormChange('tipo', e.target.value)} className="w-full rounded-lg border border-[#D9C7AC] bg-white px-3 py-2 text-sm outline-none">
                  <option value="PORCENTAJE">Porcentaje</option>
                  <option value="MONTO_FIJO">Monto fijo</option>
                </select>
              </label>
              <label className="space-y-1">
                <div className="text-xs font-semibold text-[#8A7A63]">Valor del Descuento *</div>
                {form.tipo === 'PORCENTAJE' ? (
                  <input type="number" min="0" max="100" value={form.porcentajeDescuento} onChange={(e) => handleFormChange('porcentajeDescuento', e.target.value)} className="w-full rounded-lg border border-[#D9C7AC] bg-white px-3 py-2 text-sm outline-none" />
                ) : (
                  <input type="number" min="0" step="0.01" value={form.montoFijo} onChange={(e) => handleFormChange('montoFijo', e.target.value)} className="w-full rounded-lg border border-[#D9C7AC] bg-white px-3 py-2 text-sm outline-none" />
                )}
              </label>
              <label className="space-y-1">
                <div className="text-xs font-semibold text-[#8A7A63]">Fecha de Expiración *</div>
                <input type="date" value={form.fechaExpiracion} onChange={(e) => handleFormChange('fechaExpiracion', e.target.value)} required className="w-full rounded-lg border border-[#D9C7AC] bg-white px-3 py-2 text-sm outline-none" />
              </label>

              <label className="space-y-1 md:col-span-2 lg:col-span-3">
                <div className="text-xs font-semibold text-[#8A7A63]">Descripción</div>
                <textarea value={form.descripcion} onChange={(e) => handleFormChange('descripcion', e.target.value)} className="w-full rounded-lg border border-[#D9C7AC] bg-white px-3 py-2 text-sm outline-none" rows={2} />
              </label>

              <div className="flex items-end gap-3 md:col-span-3 lg:col-span-1">
                <button type="button" onClick={() => { setEditingCoupon(null); setForm({ codigo: '', descripcion: '', tipo: 'PORCENTAJE', porcentajeDescuento: 0, montoFijo: 0, fechaExpiracion: '', fechaInicio: '', usosMaximos: 0, montoMinimo: 0, montoMaximoDescuento: 0 }); }} className="rounded-lg border border-[#C87A55] px-4 py-2 text-sm font-semibold text-[#C87A55] hover:bg-[#E2D4B7]">Cancelar</button>
                <button type="submit" className="rounded-lg bg-[#2C4035] px-4 py-2 text-sm font-semibold text-white">{editingCoupon ? 'Guardar Cupón' : 'Crear Cupón'}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="py-14 text-center text-[#5A5146]">Cargando cupones...</div>
        ) : visibleCoupons.length === 0 ? (
          <div className="rounded-2xl border border-[#E2D4B7] bg-white p-10 text-center">
            <div className="mb-4 text-5xl">🏷️</div>
            <p className="font-semibold text-[#1A1A1A]">No hay cupones vigentes</p>
            <p className="mt-2 text-sm text-[#5A5146]">
              Vuelve pronto para revisar nuevas promociones disponibles.
            </p>
            <button
              onClick={() => setSelectedRestaurantId(null)}
              className="mt-6 rounded-lg border border-[#2C4035] bg-white px-6 py-2 font-semibold text-[#2C4035] hover:bg-[#E2D4B7]"
            >
              Seleccionar otro restaurante
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleCoupons.map((coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
