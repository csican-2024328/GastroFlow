import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { getRestaurantVigentesCoupons } from '../../../shared/api/couponService.js';

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

const CouponCard = ({ coupon }) => {
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
    <article className="overflow-hidden rounded-2xl border border-[#E2D4B7] bg-white shadow-[0_10px_24px_rgba(61,44,30,0.10)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(61,44,30,0.14)]">
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
          className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
            copied
              ? 'border border-[#2C4035] bg-[#F5EDE0] text-[#2C4035]'
              : 'bg-gradient-to-r from-[#C87A55] to-[#C49A2B] text-white shadow-sm hover:shadow-lg'
          }`}
        >
          {copied ? '✓ Copiado' : 'Copiar código'}
        </button>
      </div>
    </article>
  );
};

export const CouponsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRestaurants(1, 50);
  }, [fetchRestaurants]);

  useEffect(() => {
    if (!selectedRestaurantId) return;

    const loadCoupons = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getRestaurantVigentesCoupons(selectedRestaurantId);
        setCoupons(response.data.data || []);
      } catch (requestError) {
        const message = requestError.response?.data?.message || 'Error al obtener cupones vigentes';
        setCoupons([]);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadCoupons();
  }, [selectedRestaurantId]);

  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant._id === selectedRestaurantId),
    [restaurants, selectedRestaurantId]
  );

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
        {loading ? (
          <div className="py-14 text-center text-[#5A5146]">Cargando cupones...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-700">{error}</p>
            <button
              onClick={() => setSelectedRestaurantId(null)}
              className="mt-4 rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Volver a seleccionar restaurante
            </button>
          </div>
        ) : coupons.length === 0 ? (
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
            {coupons.map((coupon) => (
              <CouponCard key={coupon._id} coupon={coupon} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
