import Inventory from './inventory.model.js';
import { actualizarPlatosPorIngrediente } from '../../helper/inventory-helpers.js';

// Función auxiliar para excluir restaurantId de la respuesta
const excluirRestaurantId = (doc) => {
    const objeto = doc.toObject();
    delete objeto.restaurantId;
    return objeto;
};

export const crearInsumo = async (req, res, next) => {
    try {
        const { nombre, stock, unidadMedida, restaurantId } = req.body;

        if (!nombre || stock === undefined || !unidadMedida) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, stock y unidad de medida son requeridos'
            });
        }

        const existe = await Inventory.findOne({ 
            nombre: nombre.toLowerCase(),
            restaurantId: restaurantId || null
        });

        if (existe) {
            return res.status(409).json({
                success: false,
                message: 'El insumo ya existe'
            });
        }

        const nuevoInsumo = await Inventory.create({
            nombre: nombre.toLowerCase(),
            stock,
            unidadMedida,
            restaurantId: restaurantId || null
        });

        // Actualizar disponibilidad de platos que usen este ingrediente
        await actualizarPlatosPorIngrediente(nuevoInsumo._id);

        res.status(201).json({
            success: true,
            message: 'Insumo creado correctamente',
            data: excluirRestaurantId(nuevoInsumo)
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
            filtro.restaurantId = restaurantId;
        }

        const insumos = await Inventory.find(filtro);

        res.status(200).json({
            success: true,
            data: insumos.map(excluirRestaurantId)
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
            data: excluirRestaurantId(insumo)
        });

    } catch (error) {
        next(error);
    }
};

export const actualizarInsumo = async (req, res, next) => {
    try {
        const { nombre, stock, unidadMedida } = req.body;

        const insumo = await Inventory.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    nombre: nombre?.toLowerCase(),
                    stock,
                    unidadMedida
                }
            },
            { new: true, runValidators: true }
        );

        if (!insumo) {
            return res.status(404).json({
                success: false,
                message: 'Insumo no encontrado'
            });
        }

        // Actualizar disponibilidad de platos que usen este ingrediente
        await actualizarPlatosPorIngrediente(insumo._id);

        res.status(200).json({
            success: true,
            message: 'Insumo actualizado correctamente',
            data: excluirRestaurantId(insumo)
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
            message: 'Insumo eliminado correctamente'
        });

    } catch (error) {
        next(error);
    }
};