import Inventory from '../src/Inventory/inventory.model.js';
import Plato from '../src/Platos/platos-model.js';
import Menu from '../src/Menu/menu.model.js';
import InventoryMovement from '../src/InventoryMovement/inventoryMovement.model.js';
import { actualizarPlatosPorIngrediente } from './inventory-helpers.js';

const toId = (value) => value?.toString?.() || String(value);

const countIngredientOccurrences = (ingredientes = []) => {
  const requirements = new Map();
  for (const ingredienteId of ingredientes) {
    const key = toId(ingredienteId);
    requirements.set(key, (requirements.get(key) || 0) + 1);
  }
  return requirements;
};

const mergeRequirements = (targetMap, sourceMap, factor = 1) => {
  for (const [ingredientId, qty] of sourceMap.entries()) {
    targetMap.set(ingredientId, (targetMap.get(ingredientId) || 0) + qty * factor);
  }
};

export const buildOrderIngredientRequirements = async (items, restaurantId) => {
  const requirements = new Map();

  for (const item of items) {
    const itemCantidad = Number(item.cantidad || 1);

    if (item.tipo === 'PLATO') {
      const plato = await Plato.findById(item.plato).select('nombre ingredientes isActive restaurantId');
      if (!plato || !plato.isActive) {
        return {
          success: false,
          message: `Plato con ID ${item.plato} no encontrado o inactivo`
        };
      }

      if (restaurantId && plato.restaurantId?.toString() !== restaurantId) {
        return {
          success: false,
          message: `El plato \"${plato.nombre}\" no pertenece al restaurante seleccionado`
        };
      }

      const platoReq = countIngredientOccurrences(plato.ingredientes || []);
      mergeRequirements(requirements, platoReq, itemCantidad);
      continue;
    }

    if (item.tipo === 'MENU') {
      const menu = await Menu.findById(item.menu).select('nombre platos isActive restaurantId');
      if (!menu || !menu.isActive) {
        return {
          success: false,
          message: `Menú con ID ${item.menu} no encontrado o inactivo`
        };
      }

      if (restaurantId && menu.restaurantId?.toString() !== restaurantId) {
        return {
          success: false,
          message: `El menú \"${menu.nombre}\" no pertenece al restaurante seleccionado`
        };
      }

      const platos = await Plato.find({ _id: { $in: menu.platos }, isActive: true }).select('nombre ingredientes restaurantId');
      if (platos.length !== menu.platos.length) {
        return {
          success: false,
          message: `Uno o más platos del menú \"${menu.nombre}\" no están activos`
        };
      }

      for (const plato of platos) {
        if (restaurantId && plato.restaurantId?.toString() !== restaurantId) {
          return {
            success: false,
            message: `El plato \"${plato.nombre}\" del menú \"${menu.nombre}\" no pertenece al restaurante seleccionado`
          };
        }

        const platoReq = countIngredientOccurrences(plato.ingredientes || []);
        mergeRequirements(requirements, platoReq, itemCantidad);
      }
      continue;
    }

    return {
      success: false,
      message: 'El tipo de item debe ser PLATO o MENU'
    };
  }

  return { success: true, requirements };
};

export const getStockShortages = async (requirementsMap) => {
  const ingredientIds = [...requirementsMap.keys()];
  const inventories = await Inventory.find({ _id: { $in: ingredientIds }, activo: true }).select('nombre stock restaurantId');
  const inventoryMap = new Map(inventories.map((inv) => [inv._id.toString(), inv]));

  const faltantes = [];
  for (const [ingredientId, requiredQty] of requirementsMap.entries()) {
    const inv = inventoryMap.get(ingredientId);
    const disponible = inv?.stock || 0;
    if (!inv || disponible < requiredQty) {
      faltantes.push({
        ingredienteId: ingredientId,
        nombre: inv?.nombre || 'Ingrediente no encontrado',
        requerido: requiredQty,
        disponible,
        faltante: Math.max(requiredQty - disponible, 0),
        restaurantId: inv?.restaurantId || null
      });
    }
  }

  return {
    hasShortage: faltantes.length > 0,
    faltantes,
    inventoryMap
  };
};

export const reserveInventoryAtomically = async ({ requirementsMap, restaurantId, orderId, userId }) => {
  const sortedRequirements = [...requirementsMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const successfulReservations = [];

  try {
    for (const [inventoryId, cantidadRequerida] of sortedRequirements) {
      const before = await Inventory.findById(inventoryId).select('stock nombre restaurantId activo');

      if (!before || !before.activo || before.stock < cantidadRequerida) {
        throw new Error('STOCK_INSUFICIENTE');
      }

      const updated = await Inventory.findOneAndUpdate(
        {
          _id: inventoryId,
          activo: true,
          stock: { $gte: cantidadRequerida }
        },
        { $inc: { stock: -cantidadRequerida } },
        { new: true }
      ).select('stock nombre restaurantId');

      if (!updated) {
        throw new Error('STOCK_CONCURRENCIA');
      }

      successfulReservations.push({
        inventoryId,
        cantidad: cantidadRequerida,
        stockAntes: before.stock,
        stockDespues: updated.stock,
        restaurantId: updated.restaurantId
      });
    }

    if (successfulReservations.length > 0) {
      await InventoryMovement.insertMany(
        successfulReservations.map((r) => ({
          inventoryId: r.inventoryId,
          restaurantId: r.restaurantId || restaurantId,
          orderId: orderId || null,
          userId: userId || null,
          tipo: 'SALIDA',
          motivo: 'ORDER_EN_PREPARACION',
          cantidad: r.cantidad,
          stockAntes: r.stockAntes,
          stockDespues: r.stockDespues
        }))
      );
    }

    for (const r of successfulReservations) {
      await actualizarPlatosPorIngrediente(r.inventoryId);
    }

    return { success: true };
  } catch (error) {
    // Rollback best-effort de lo ya descontado
    for (const r of successfulReservations.reverse()) {
      const beforeRollback = await Inventory.findById(r.inventoryId).select('stock restaurantId');
      const afterRollback = await Inventory.findByIdAndUpdate(
        r.inventoryId,
        { $inc: { stock: r.cantidad } },
        { new: true }
      ).select('stock restaurantId');

      if (beforeRollback && afterRollback) {
        await InventoryMovement.create({
          inventoryId: r.inventoryId,
          restaurantId: afterRollback.restaurantId || restaurantId,
          orderId: orderId || null,
          userId: userId || null,
          tipo: 'ENTRADA',
          motivo: 'ROLLBACK_DESCUENTO',
          cantidad: r.cantidad,
          stockAntes: beforeRollback.stock,
          stockDespues: afterRollback.stock
        });
      }

      await actualizarPlatosPorIngrediente(r.inventoryId);
    }

    const shortageResult = await getStockShortages(requirementsMap);

    return {
      success: false,
      message: 'No hay stock suficiente para completar la orden',
      faltantes: shortageResult.faltantes
    };
  }
};

export const releaseInventoryForOrder = async ({ requirementsMap, restaurantId, orderId, userId, motivo = 'ORDER_CANCELADA' }) => {
  const releases = [];

  for (const [inventoryId, cantidad] of requirementsMap.entries()) {
    const before = await Inventory.findById(inventoryId).select('stock restaurantId');
    const updated = await Inventory.findByIdAndUpdate(
      inventoryId,
      { $inc: { stock: cantidad } },
      { new: true }
    ).select('stock restaurantId');

    if (!before || !updated) continue;

    releases.push({
      inventoryId,
      cantidad,
      stockAntes: before.stock,
      stockDespues: updated.stock,
      restaurantId: updated.restaurantId
    });
  }

  if (releases.length > 0) {
    await InventoryMovement.insertMany(
      releases.map((r) => ({
        inventoryId: r.inventoryId,
        restaurantId: r.restaurantId || restaurantId,
        orderId: orderId || null,
        userId: userId || null,
        tipo: 'ENTRADA',
        motivo,
        cantidad: r.cantidad,
        stockAntes: r.stockAntes,
        stockDespues: r.stockDespues
      }))
    );
  }

  for (const r of releases) {
    await actualizarPlatosPorIngrediente(r.inventoryId);
  }

  return { success: true };
};
