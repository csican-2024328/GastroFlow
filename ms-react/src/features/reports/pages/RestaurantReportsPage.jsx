import { useEffect, useState } from 'react';
import { Button, Input, Typography } from '@material-tailwind/react';
import { getIncomeReport, getTopPlatosReport } from '../../../shared/api/reportService.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';

const formatCurrency = (value) => new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const normalizeList = (response, nestedKeys = []) => {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  for (const key of nestedKeys) {
    const nested = payload?.[key];
    if (Array.isArray(nested)) return nested;
  }
  return [];
};

export const RestaurantReportsPage = () => {
  const { restaurantId, user } = useRestaurantScope();
  const [start, setStart] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  });

  const [loading, setLoading] = useState(false);
  const [income, setIncome] = useState(null);
  const [topPlatos, setTopPlatos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // reset when restaurant changes
    setIncome(null);
    setTopPlatos([]);
    setError('');
  }, [restaurantId]);

  const handleGenerateIncome = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getIncomeReport({ start, end, restaurantID: restaurantId || undefined, restaurantId: restaurantId || undefined });
      setIncome(res?.data || res || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al generar reporte de ingresos');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTopPlatos = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getTopPlatosReport({ start, end, limit: 10, restaurantID: restaurantId || undefined, restaurantId: restaurantId || undefined });
      setTopPlatos(normalizeList(res, ['topPlatos', 'platos', 'items']));
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al generar reporte de platillos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <Typography variant="h3" className="text-gray-800">Reportes</Typography>
          <Typography variant="small" className="text-[#2D4F4F]">
            Genera reportes acotados al restaurante asignado ({user?.restaurantId?.name || user?.restaurantId?.nombre || 'tu restaurante'}).
          </Typography>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-stone-200 bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Typography variant="small" className="mb-2 text-sm text-gray-700">Fecha inicio</Typography>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <Typography variant="small" className="mb-2 text-sm text-gray-700">Fecha fin</Typography>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerateIncome} disabled={loading} className="bg-[#2D4F4F]">{loading ? 'Generando...' : 'Ingresos'}</Button>
            <Button onClick={handleGenerateTopPlatos} disabled={loading} className="bg-[#C87A55]">{loading ? 'Generando...' : 'Top platos'}</Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-[#FFF6F6] p-4 text-sm text-red-700">{error}</div>
      )}

      {income && (
        <div className="mb-6 rounded-lg border border-stone-200 bg-white p-5">
          <Typography variant="h6" className="mb-3">Resumen de ingresos</Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-600">Total ingresos</p>
              <p className="text-2xl font-bold text-[#2D4F4F]">{formatCurrency(income?.data?.resumen?.totalIngresos ?? income?.resumen?.totalIngresos ?? 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cobros pagados</p>
              <p className="text-2xl font-bold text-[#2D4F4F]">{income?.data?.resumen?.pagadas ?? income?.resumen?.pagadas ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {topPlatos.length > 0 && (
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <Typography variant="h6" className="mb-3">Top platos</Typography>
          <div className="space-y-2">
            {topPlatos.map((p, idx) => (
              <div key={p._id || p.id || p.nombre || idx} className="flex items-center justify-between border p-3 rounded">
                <div>
                  <p className="font-semibold text-gray-800">{p.nombre || p.platoNombre || p.plato?.nombre || `Plato ${idx + 1}`}</p>
                  <p className="text-sm text-gray-600">Vendidos: {p.total || p.cantidad || p.ventas || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Ingresos</p>
                  <p className="font-semibold text-[#2D4F4F]">{formatCurrency(p.ingresos || p.revenue || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantReportsPage;
