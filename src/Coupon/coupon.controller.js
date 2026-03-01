'use strict';

import Coupon from './coupon.model.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';

/**
 * Crear un nuevo cupón
 * POST /create
 * Acceso: RESTAURANT_ADMIN, PLATFORM_ADMIN
 */
export const createCoupon = asyncHandler(async (req, res) => {
  try {
    const {
      codigo,
      descripcion,
      porcentajeDescuento,
      montoFijo,
      tipo,
      fechaExpiracion,
      fechaInicio,
      usosMaximos,
      montoMinimo,
      montoMaximoDescuento,
      restaurantID,
    } = req.body;

    if (!codigo || !tipo || !fechaExpiracion) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: código, tipo, fechaExpiracion',
      });
    }

    // Validar que el código sea único
    const couponExists = await Coupon.findOne({ codigo: codigo.toUpperCase() });
    if (couponExists) {
      return res.status(409).json({
        success: false,
        message: 'El código del cupón ya existe',
      });
    }

    // Validar tipo de descuento
    if (tipo === 'PORCENTAJE' && !porcentajeDescuento) {
      return res.status(400).json({
        success: false,
        message: 'El porcentajeDescuento es requerido para tipo PORCENTAJE',
      });
    }

    if (tipo === 'MONTO_FIJO' && !montoFijo) {
      return res.status(400).json({
        success: false,
        message: 'El montoFijo es requerido para tipo MONTO_FIJO',
      });
    }

    const coupon = await Coupon.create({
      codigo: codigo.toUpperCase(),
      descripcion,
      porcentajeDescuento,
      montoFijo,
      tipo,
      fechaExpiracion,
      fechaInicio,
      usosMaximos,
      montoMinimo,
      montoMaximoDescuento,
      restaurantID,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Cupón creado exitosamente',
      data: coupon,
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el cupón',
      error: error.message,
    });
  }
});

/**
 * Obtener todos los cupones
 * GET /get
 * Acceso: Público (solo muestra cupones vigentes)
 */
export const getCoupons = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, restaurantID, isActive = true } = req.query;

    const filter = { isActive };

    if (restaurantID) {
      filter.restaurantID = restaurantID;
    }

    const coupons = await Coupon.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Coupon.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: coupons,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cupones',
      error: error.message,
    });
  }
});

/**
 * Obtener cupón por código (para validación)
 * GET /code/:codigo
 * Acceso: Público
 */
export const getCouponByCode = asyncHandler(async (req, res) => {
  try {
    const { codigo } = req.params;

    if (!codigo) {
      return res.status(400).json({
        success: false,
        message: 'El código del cupón es requerido',
      });
    }

    const coupon = await Coupon.findOne({
      codigo: codigo.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado o inactivo',
      });
    }

    // Verificar si es válido
    const validacion = coupon.esValido();
    if (!validacion.valido) {
      return res.status(400).json({
        success: false,
        message: `Cupón no válido: ${validacion.razon}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cupón válido',
      data: coupon,
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el cupón',
      error: error.message,
    });
  }
});

/**
 * Obtener cupón por ID
 * GET /:id
 * Acceso: Público
 */
export const getCouponById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el cupón',
      error: error.message,
    });
  }
});

/**
 * Actualizar cupón
 * PUT /:id
 * Acceso: RESTAURANT_ADMIN, PLATFORM_ADMIN
 */
export const updateCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Si intenta actualizar el código, verificar unicidad
    if (updateData.codigo) {
      const couponExists = await Coupon.findOne({
        codigo: updateData.codigo.toUpperCase(),
        _id: { $ne: id },
      });
      if (couponExists) {
        return res.status(409).json({
          success: false,
          message: 'El código del cupón ya existe',
        });
      }
      updateData.codigo = updateData.codigo.toUpperCase();
    }

    // Limpiar campos indefinidos
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cupón actualizado exitosamente',
      data: coupon,
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el cupón',
      error: error.message,
    });
  }
});

/**
 * Desactivar cupón (soft delete)
 * PUT /:id/deactivate
 * Acceso: RESTAURANT_ADMIN, PLATFORM_ADMIN
 */
export const deactivateCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cupón desactivado exitosamente',
      data: coupon,
    });
  } catch (error) {
    console.error('Error deactivating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar el cupón',
      error: error.message,
    });
  }
});

/**
 * Activar cupón
 * PUT /:id/activate
 * Acceso: RESTAURANT_ADMIN, PLATFORM_ADMIN
 */
export const activateCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cupón activado exitosamente',
      data: coupon,
    });
  } catch (error) {
    console.error('Error activating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar el cupón',
      error: error.message,
    });
  }
});

/**
 * Obtener cupones vigentes para un restaurante
 * GET /restaurant/:restaurantID/vigentes
 * Acceso: Público
 */
export const getCuponeVigentes = asyncHandler(async (req, res) => {
  try {
    const { restaurantID } = req.params;
    const ahora = new Date();

    const coupons = await Coupon.find({
      $or: [{ restaurantID }, { restaurantID: null }],
      isActive: true,
      fechaInicio: { $lte: ahora },
      fechaExpiracion: { $gte: ahora },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error('Error fetching vigentes coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cupones vigentes',
      error: error.message,
    });
  }
});

/**
 * Validar cupón (sin registrar uso)
 * POST /validate
 * Acceso: Público
 */
export const validateCoupon = asyncHandler(async (req, res) => {
  try {
    const { codigo, montoTotal, restaurantID } = req.body;

    if (!codigo || !montoTotal) {
      return res.status(400).json({
        success: false,
        message: 'Código y montoTotal son requeridos',
      });
    }

    const coupon = await Coupon.findOne({
      codigo: codigo.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado o inactivo',
      });
    }

    // Verificar si aplica a este restaurante
    if (coupon.restaurantID && coupon.restaurantID.toString() !== restaurantID) {
      return res.status(400).json({
        success: false,
        message: 'Este cupón no aplica a este restaurante',
      });
    }

    // Verificar validez
    const validacion = coupon.esValido();
    if (!validacion.valido) {
      return res.status(400).json({
        success: false,
        message: `Cupón no válido: ${validacion.razon}`,
      });
    }

    // Verificar monto mínimo
    if (montoTotal < coupon.montoMinimo) {
      return res.status(400).json({
        success: false,
        message: `Monto mínimo requerido: ${coupon.montoMinimo}`,
      });
    }

    // Calcular descuento
    const descuento = coupon.calcularDescuento(montoTotal);

    res.status(200).json({
      success: true,
      message: 'Cupón válido',
      data: {
        coupon,
        descuento,
        montoFinal: montoTotal - descuento,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar el cupón',
      error: error.message,
    });
  }
});

/**
 * Eliminar cupón permanentemente
 * DELETE /:id
 * Acceso: PLATFORM_ADMIN
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cupón eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el cupón',
      error: error.message,
    });
  }
});
