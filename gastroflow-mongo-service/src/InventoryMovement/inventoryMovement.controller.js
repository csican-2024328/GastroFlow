import InventoryMovement from './inventoryMovement.model.js';
import mongoose from 'mongoose';

export const getInventoryMovements = async (req, res) => {
  try {
    const {
      restaurantId,
      inventoryId,
      orderId,
      tipo,
      motivo,
      from,
      to,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};
    if (restaurantId) filter.restaurantId = restaurantId;
    if (inventoryId) filter.inventoryId = inventoryId;
    if (orderId) filter.orderId = orderId;
    if (tipo) filter.tipo = tipo;
    if (motivo) filter.motivo = motivo;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const currentPage = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const data = await InventoryMovement.find(filter)
      .populate('inventoryId', 'nombre unidadMedida restaurantId')
      .populate('orderId', 'numeroOrden estado')
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);

    const total = await InventoryMovement.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        currentPage,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener historial de inventario',
      error: error.message
    });
  }
};

export const getInventoryMovementById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de movimiento inválido'
      });
    }

    const movement = await InventoryMovement.findById(id)
      .populate('inventoryId', 'nombre unidadMedida restaurantId')
      .populate('orderId', 'numeroOrden estado');

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
      });
    }

    return res.status(200).json({ success: true, data: movement });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener movimiento',
      error: error.message
    });
  }
};
