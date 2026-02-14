import { parse } from 'dotenv';
import Mesa from './mesa.model.js';

export const createMesa = async (req, res) => {
    try {
        const mesaData = req.body;
        const mesa = new Mesa(mesaData);
        await mesa.save();

        res.status(201).json({
            success: true,
            message: 'Mesa creada exitosamente',
            data: mesa,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear mesa',
            error: error.message,
        });
    }
};

export const getMesas = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;
        const filter = { isActive };

        const mesas = await Mesa.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Mesa.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: mesas,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las mesas',
            error: error.message,
        });
    }
};

export const getMesaById = async (req, res) => {
    try {
        const { id } = req.params;
        const mesa = await Mesa.findById(id);

        if (!mesa) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
        }

        res.status(200).json({
            success: true,
            data: mesa,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la mesa',
            error: error.message,
        });
    }
};

export const updateMesa = async (req, res) => {
    try {
        const { id } = req.params;
        const mesa = await Mesa.findById(id);

        if (!mesa) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
        }

        const updateData = { ...req.body };
        const updatedMesa = await Mesa.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Mesa actualizada exitosamente',
            data: updatedMesa,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar mesa',
            error: error.message,
        });
    }
};

export const deleteMesa = async (req, res) => {
    try {
        const { id } = req.params;
        const mesa = await Mesa.findByIdAndUpdate(id, { isActive: false });

        if (!mesa) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mesa eliminada exitosamente',
            data: mesa,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar mesa',
            error: error.message,
        });
    }
};
