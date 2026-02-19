import Inventory from './inventory.model.js';

export const crearInsumo = async (req, res, next) => {
    try {
        const { nombre, stock, unidadMedida } = req.body;

        if (!nombre || stock === undefined || !unidadMedida) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, stock y unidad de medida son requeridos'
            });
        }

        const existe = await Inventory.findOne({ nombre: nombre.toLowerCase() });

        if (existe) {
            return res.status(409).json({
                success: false,
                message: 'El insumo ya existe'
            });
        }

        const nuevoInsumo = await Inventory.create({
            nombre: nombre.toLowerCase(),
            stock,
            unidadMedida
        });

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
        const insumos = await Inventory.find({ activo: true });

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

        res.status(200).json({
            success: true,
            message: 'Insumo eliminado correctamente'
        });

    } catch (error) {
        next(error);
    }
};