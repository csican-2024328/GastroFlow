import Plato from '../src/Platos/platos-model.js';

export const validateStockAvailability = async (req, res, next) => {
    try {
        const { items, restaurantID } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items del pedido son requeridos y deben ser un array no vacío'
            });
        }

        const unavailableItems = [];
        const validatedItems = [];

        for (const item of items) {
            if (!item.plato) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del plato es requerido para cada item'
                });
            }

            if (!item.cantidad || item.cantidad <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cantidad debe ser mayor a 0'
                });
            }

            const plato = await Plato.findById(item.plato);

            if (!plato) {
                unavailableItems.push({
                    platoId: item.plato,
                    reason: 'Plato no encontrado',
                    cantidad: item.cantidad
                });
                continue;
            }

            if (!plato.isActive) {
                unavailableItems.push({
                    platoNombre: plato.nombre,
                    platoId: plato._id,
                    reason: 'Plato inactivo',
                    cantidad: item.cantidad
                });
                continue;
            }

            if (!plato.disponible) {
                unavailableItems.push({
                    platoNombre: plato.nombre,
                    platoId: plato._id,
                    reason: 'Plato no disponible en este momento',
                    cantidad: item.cantidad
                });
                continue;
            }

            if (restaurantID && plato.restaurantID.toString() !== restaurantID) {
                unavailableItems.push({
                    platoNombre: plato.nombre,
                    platoId: plato._id,
                    reason: 'Plato no pertenece a este restaurante',
                    cantidad: item.cantidad
                });
                continue;
            }

            validatedItems.push({
                platoId: plato._id,
                platoNombre: plato.nombre,
                precio: plato.precio,
                cantidad: item.cantidad,
                subtotal: plato.precio * item.cantidad
            });
        }

        if (unavailableItems.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Algunos items no están disponibles',
                unavailableItems: unavailableItems
            });
        }

        req.validatedItems = validatedItems;
        next();

    } catch (error) {
        console.error('Stock validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validando disponibilidad de items',
            error: error.message
        });
    }
};
