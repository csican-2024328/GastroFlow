import Plato from '../Platos/platos-model.js';

export async function calcularPrecioYTipoDePlatos(platosIDs = []) {
  if (!Array.isArray(platosIDs) || platosIDs.length === 0) {
    return { precio: 0, tipo: '' };
  }
  const platos = await Plato.find({ _id: { $in: platosIDs } });
  const precio = platos.reduce((acc, plato) => acc + (plato.precio || 0), 0);
  // Concatenar las categorías únicas separadas por coma
  const tiposUnicos = [...new Set(platos.map((plato) => plato.categoria))];
  const tipo = tiposUnicos.join(',');
  return { precio, tipo };
}
