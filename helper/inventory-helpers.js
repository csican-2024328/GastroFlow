/**
 * @fileoverview Helpers para gestión de inventario y disponibilidad de platos/menús
 */

import Inventory from '../src/Inventory/inventory.model.js';
import Plato from '../src/Platos/platos-model.js';

const toId = (value) => value?.toString?.() || String(value);

const countIngredientOccurrences = (ingredientes = []) => {
  const counts = new Map();
  for (const ingredienteId of ingredientes) {
    const key = toId(ingredienteId);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
};

const calcularPorcionesConInventario = (requiredMap, inventoryMap) => {
  let porciones = Number.MAX_SAFE_INTEGER;

  for (const [ingredienteId, cantidadPorPorcion] of requiredMap.entries()) {
    const inv = inventoryMap.get(ingredienteId);
    if (!inv) return 0;

    const posible = Math.floor((inv.stock || 0) / cantidadPorPorcion);
    porciones = Math.min(porciones, posible);
  }

  return porciones === Number.MAX_SAFE_INTEGER ? 0 : porciones;
};

export const verificarStockIngredientes = async (ingredientes, cantidad = 1) => {
  try {
    if (!ingredientes || ingredientes.length === 0 || cantidad <= 0) {
      return false;
    }

    const requiredMap = countIngredientOccurrences(ingredientes);
    const ingredientIds = [...requiredMap.keys()];

    const inventarios = await Inventory.find({
      _id: { $in: ingredientIds },
      activo: true
    }).select('stock');

    if (inventarios.length !== ingredientIds.length) {
      return false;
    }

    const inventoryMap = new Map(inventarios.map((i) => [i._id.toString(), i]));

    for (const [ingredientId, requiredPerPortion] of requiredMap.entries()) {
      const requiredTotal = requiredPerPortion * cantidad;
      const available = inventoryMap.get(ingredientId)?.stock || 0;
      if (available < requiredTotal) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error al verificar stock de ingredientes:', error);
    return false;
  }
};

const calcularDisponibilidadPlato = async (plato) => {
  if (!plato.ingredientes || plato.ingredientes.length === 0) {
    return false;
  }

  const requiredMap = countIngredientOccurrences(plato.ingredientes);
  const ingredientIds = [...requiredMap.keys()];

  const inventarios = await Inventory.find({
    _id: { $in: ingredientIds },
    activo: true
  }).select('stock');

  if (inventarios.length !== ingredientIds.length) {
    return false;
  }

  const inventoryMap = new Map(inventarios.map((i) => [i._id.toString(), i]));
  const porcionesDisponibles = calcularPorcionesConInventario(requiredMap, inventoryMap);

  return porcionesDisponibles > 0;
};

export const actualizarDisponibilidadPlatos = async (restaurantId = null) => {
  try {
    const filter = { isActive: true };
    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }

    const platos = await Plato.find(filter).select('ingredientes disponible');

    let actualizados = 0;
    let disponibles = 0;
    let noDisponibles = 0;

    for (const plato of platos) {
      const tieneStock = await calcularDisponibilidadPlato(plato);

      if (plato.disponible !== tieneStock) {
        await Plato.findByIdAndUpdate(plato._id, { disponible: tieneStock });
        actualizados++;
      }

      if (tieneStock) disponibles++;
      else noDisponibles++;
    }

    return {
      success: true,
      totalPlatos: platos.length,
      actualizados,
      disponibles,
      noDisponibles
    };
  } catch (error) {
    console.error('Error al actualizar disponibilidad de platos:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const actualizarPlatosPorIngrediente = async (ingredienteID) => {
  try {
    const platos = await Plato.find({
      isActive: true,
      ingredientes: ingredienteID
    }).select('ingredientes');

    for (const plato of platos) {
      const tieneStock = await calcularDisponibilidadPlato(plato);
      await Plato.findByIdAndUpdate(plato._id, { disponible: tieneStock });
    }

    await actualizarMenusPorIngrediente(ingredienteID);
  } catch (error) {
    console.error('Error al actualizar platos por ingrediente:', error);
  }
};

export const verificarStockMenu = async (menu) => {
  try {
    if (menu.ingredientes && menu.ingredientes.length > 0) {
      const tieneStockIngredientes = await verificarStockIngredientes(menu.ingredientes, 1);
      if (!tieneStockIngredientes) return false;
    }

    if (menu.platos && menu.platos.length > 0) {
      const platos = await Plato.find({
        _id: { $in: menu.platos },
        isActive: true
      }).select('ingredientes disponible');

      if (platos.length !== menu.platos.length) {
        return false;
      }

      for (const plato of platos) {
        const tieneStock = await calcularDisponibilidadPlato(plato);
        if (!tieneStock || !plato.disponible) return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error al verificar stock de menú:', error);
    return false;
  }
};

export const actualizarDisponibilidadMenus = async (restaurantId = null) => {
  try {
    const Menu = (await import('../src/Menu/menu.model.js')).default;

    const filter = { isActive: true };
    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }

    const menus = await Menu.find(filter).populate('platos');

    let actualizados = 0;
    let disponibles = 0;
    let noDisponibles = 0;

    for (const menu of menus) {
      const tieneStock = await verificarStockMenu(menu);
      if (menu.disponible !== tieneStock) {
        await Menu.findByIdAndUpdate(menu._id, { disponible: tieneStock });
        actualizados++;
      }

      if (tieneStock) disponibles++;
      else noDisponibles++;
    }

    return {
      success: true,
      totalMenus: menus.length,
      actualizados,
      disponibles,
      noDisponibles
    };
  } catch (error) {
    console.error('Error al actualizar disponibilidad de menús:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const actualizarMenusPorIngrediente = async (ingredienteID) => {
  try {
    const Menu = (await import('../src/Menu/menu.model.js')).default;

    const menusConIngrediente = await Menu.find({
      isActive: true,
      ingredientes: ingredienteID
    }).populate('platos');

    const platosConIngrediente = await Plato.find({
      isActive: true,
      ingredientes: ingredienteID
    }).select('_id');

    const platoIDs = platosConIngrediente.map((p) => p._id);

    const menusConPlatos = await Menu.find({
      isActive: true,
      platos: { $in: platoIDs }
    }).populate('platos');

    const menusSet = new Map();
    [...menusConIngrediente, ...menusConPlatos].forEach((menu) => {
      menusSet.set(menu._id.toString(), menu);
    });

    for (const menu of menusSet.values()) {
      const tieneStock = await verificarStockMenu(menu);
      await Menu.findByIdAndUpdate(menu._id, { disponible: tieneStock });
    }
  } catch (error) {
    console.error('Error al actualizar menús por ingrediente:', error);
  }
};
