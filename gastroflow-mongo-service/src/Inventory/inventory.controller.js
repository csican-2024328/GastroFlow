import Inventory from './inventory.model.js';
import { actualizarPlatosPorIngrediente } from '../../helper/inventory-helpers.js';
import mongoose from 'mongoose';

export const crearInsumo = async (req, res, next) => {
    try {
        const { nombre, stock, unidadMedida, restaurantId } = req.body;

        // Validación: nombre, stock, unidad de medida son requeridos
        if (!nombre || stock === undefined || !unidadMedida) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, stock y unidad de medida son requeridos'
            });
        }

        // Validación: restaurantId es obligatorio
        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'restaurantId es obligatorio'
            });
        }

        // Validación: restaurantId debe ser un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: 'restaurantId debe ser un ID válido'
            });
        }

        // Validación: nombre e ingrediente debe ser único por restaurante (manejado por índice unique en BD)
        const existe = await Inventory.findOne({ 
            nombre: nombre.toLowerCase(),
            restaurantId: restaurantId
        });

        if (existe) {
            return res.status(409).json({
                success: false,
                message: 'El insumo con este nombre ya existe en este restaurante'
            });
        }

        const nuevoInsumo = await Inventory.create({
            nombre: nombre.toLowerCase(),
            stock,
            unidadMedida,
            restaurantId
        });

        // Actualizar disponibilidad de platos que usen este ingrediente
        await actualizarPlatosPorIngrediente(nuevoInsumo._id);

        res.status(201).json({
            success: true,
            message: 'Insumo creado correctamente',
            data: nuevoInsumo
        });

    } catch (error) {
        next(error);
    }
};

export const obtenerInsumos = async (req, res, next) => {
    try {
        const { restaurantId } = req.query;

        // Filtro base
        const filtro = { activo: true };
        
        // Si se proporciona restaurantId, filtrar por restaurante
        if (restaurantId) {
            if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
                return res.status(400).json({
                    success: false,
                    message: 'restaurantId debe ser un ID válido'
                });
            }
            filtro.restaurantId = restaurantId;
        }

        const insumos = await Inventory.find(filtro);

        res.status(200).json({
            success: true,
            data: insumos
        });

    } catch (error) {
        next(error);
    }
};

export const obtenerInsumoPorId = async (req, res, next) => {
    try {
        const insumo = await Inventory.findById(req.params.id);

        if (!insumo || !insumo.activo) {
            return res.status(404).json({
                success: false,
                message: 'Insumo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: insumo
        });

    } catch (error) {
        next(error);
    }
};

export const actualizarInsumo = async (req, res, next) => {
    try {
        const { nombre, stock, unidadMedida, restaurantId } = req.body;

        // Obtener el insumo actual
        const insumoActual = await Inventory.findById(req.params.id);

        if (!insumoActual) {
            return res.status(404).json({
                success: false,
                message: 'Insumo no encontrado'
            });
        }

        // Protección: NO permitir cambiar o eliminar restaurantId
        if (restaurantId && restaurantId !== insumoActual.restaurantId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'No se puede cambiar el restaurante de un insumo existente'
            });
        }

        // Protección: validar que restaurantId siga siendo válido
        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'restaurantId no puede estar vacío'
            });
        }

        // Construir objeto de actualización (sin restaurantId)
        const updateData = {
            nombre: nombre ? nombre.toLowerCase() : insumoActual.nombre,
            stock: stock !== undefined ? stock : insumoActual.stock,
            unidadMedida: unidadMedida || insumoActual.unidadMedida
        };

        const insumo = await Inventory.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Actualizar disponibilidad de platos que usen este ingrediente
        await actualizarPlatosPorIngrediente(insumo._id);

        res.status(200).json({
            success: true,
            message: 'Insumo actualizado correctamente',
            data: insumo
        });

    } catch (error) {
        next(error);
    }
};

export const eliminarInsumo = async (req, res, next) => {
    try {
        const insumo = await Inventory.findByIdAndUpdate(
            req.params.id,
            { activo: false },
            { new: true }
        );

        if (!insumo) {
            return res.status(404).json({
                success: false,
                message: 'Insumo no encontrado'
            });
        }

        // Actualizar disponibilidad de platos que usen este ingrediente (los marca como no disponibles)
        await actualizarPlatosPorIngrediente(insumo._id);

        res.status(200).json({
            success: true,
            message: 'Insumo eliminado correctamente',
            data: insumo
        });

    } catch (error) {
        next(error);
    }
};