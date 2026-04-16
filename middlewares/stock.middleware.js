import Order from '../src/Order/order.model.js';
import { buildOrderIngredientRequirements, getStockShortages } from '../helper/stock-engine.js';

export const validateStockAvailability = async (req, res, next) => {
  try {
    const { items } = req.body;
    const restaurantId = req.body.restaurantId || req.body.restaurantID;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items del pedido son requeridos y deben ser un array no vacío'
      });
    }

    const buildResult = await buildOrderIngredientRequirements(items, restaurantId);
    if (!buildResult.success) {
      return res.status(400).json({
        success: false,
        message: buildResult.message
      });
    }

    const shortageResult = await getStockShortages(buildResult.requirements, restaurantId);

    if (shortageResult.restaurantMismatches?.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El pedido contiene ingredientes de otro restaurante',
        mismatches: shortageResult.restaurantMismatches
      });
    }

    if (shortageResult.hasShortage) {
      return res.status(409).json({
        success: false,
        message: 'Stock insuficiente para completar la orden',
        faltantes: shortageResult.faltantes
      });
    }

    req.stockRequirements = buildResult.requirements;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error validando disponibilidad de inventario',
      error: error.message
    });
  }
};


export const validateUpdateOrderStock = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next();
    }

    const order = await Order.findById(req.params.id).select('restaurantID isActive');

    if (!order || !order.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    const restaurantId = order.restaurantID?.toString();
    const buildResult = await buildOrderIngredientRequirements(items, restaurantId);

    if (!buildResult.success) {
      return res.status(400).json({
        success: false,
        message: buildResult.message
      });
    }

    const shortageResult = await getStockShortages(buildResult.requirements, restaurantId);

    if (shortageResult.restaurantMismatches?.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El pedido contiene ingredientes de otro restaurante',
        mismatches: shortageResult.restaurantMismatches
      });
    }

    if (shortageResult.hasShortage) {
      return res.status(409).json({
        success: false,
        message: 'Stock insuficiente para completar la actualización del pedido',
        faltantes: shortageResult.faltantes
      });
    }

    req.stockRequirements = buildResult.requirements;
    req.stockOrderRestaurantId = restaurantId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error validando stock para actualizar el pedido',
      error: error.message
    });
  }
};
