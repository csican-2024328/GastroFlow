import { useEffect, useState } from 'react';
import { Typography } from '@material-tailwind/react';
import '../../../styles/reports.css';
import { getIncomeReport, getTopPlatosReport } from '../../../shared/api/reportService.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';

const formatCurrency = (value) => new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'GTQ',
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
    <div className="reports-root">
      <div className="reports-container">
        <div className="reports-header">
          <div>
            <Typography className="reports-title">Reportes</Typography>
            <Typography className="reports-sub">Genera reportes acotados al restaurante asignado ({user?.restaurantId?.name || user?.restaurantId?.nombre || 'tu restaurante'}).</Typography>
          </div>
        </div>

        <div className="mb-6 reports-card">
          <div className="reports-controls">
            <div className="reports-field">
              <label className="reports-label">Fecha inicio</label>
              <input className="reports-input" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="reports-field">
              <label className="reports-label">Fecha fin</label>
              <input className="reports-input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div className="reports-actions">
              <button onClick={handleGenerateIncome} disabled={loading} className="reports-btn reports-btn--income">{loading ? 'Generando...' : 'Ingresos'}</button>
              <button onClick={handleGenerateTopPlatos} disabled={loading} className="reports-btn reports-btn--topplatos">{loading ? 'Generando...' : 'Top platos'}</button>
            </div>
          </div>
        </div>

        {error && (
          <div className="da-error">{error}</div>
        )}

        {income && (
          <div className="mb-6 reports-card">
            <Typography variant="h6" className="mb-3 da-text-primary">Resumen de ingresos</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm da-text-muted">Total ingresos</p>
                <p className="text-2xl font-bold da-text-primary">{formatCurrency(income?.data?.resumen?.totalIngresos ?? income?.resumen?.totalIngresos ?? 0)}</p>
              </div>
              <div>
                <p className="text-sm da-text-muted">Cobros pagados</p>
                <p className="text-2xl font-bold da-text-primary">{income?.data?.resumen?.pagadas ?? income?.resumen?.pagadas ?? 0}</p>
              </div>
            </div>
          </div>
        )}

        {topPlatos.length > 0 && (
          <div className="reports-card">
            <Typography variant="h6" className="mb-3 da-text-primary">Top platos</Typography>
            <div className="space-y-2">
              {topPlatos.map((p, idx) => (
                <div key={p._id || p.id || p.nombre || idx} className="flex items-center justify-between p-3 rounded" style={{ border: '0.5px solid var(--da-border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <p className="font-semibold da-text-primary">{p.nombre || p.platoNombre || p.plato?.nombre || `Plato ${idx + 1}`}</p>
                    <p className="text-sm da-text-muted">Vendidos: {p.total || p.cantidad || p.ventas || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm da-text-muted">Ingresos</p>
                    <p className="font-semibold da-text-primary">{formatCurrency(p.ingresos || p.revenue || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="reports-empty-space" />
      </div>
    </div>
  );
};

export default RestaurantReportsPage;
