import Plato from '../src/Platos/platos-model.js';
import Menu from '../src/Menu/menu.model.js';

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
            if (!item.tipo || !['PLATO', 'MENU'].includes(item.tipo)) {
                return res.status(400).json({
                    success: false,
                    message: 'El tipo de item debe ser PLATO o MENU'
                });
            }

            if (!item.cantidad || item.cantidad <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cantidad debe ser mayor a 0'
                });
            }

            if (item.tipo === 'PLATO') {
                if (!item.plato) {
                    return res.status(400).json({
                        success: false,
                        message: 'ID del plato es requerido cuando tipo es PLATO'
                    });
                }

                const plato = await Plato.findById(item.plato);

                if (!plato) {
                    unavailableItems.push({
                        tipo: 'PLATO',
                        platoId: item.plato,
                        reason: 'Plato no encontrado',
                        cantidad: item.cantidad
                    });
                    continue;
                }

                if (!plato.isActive) {
                    unavailableItems.push({
                        tipo: 'PLATO',
                        platoNombre: plato.nombre,
                        platoId: plato._id,
                        reason: 'Plato inactivo',
                        cantidad: item.cantidad
                    });
                    continue;
                }

                if (!plato.disponible) {
                    unavailableItems.push({
                        tipo: 'PLATO',
                        platoNombre: plato.nombre,
                        platoId: plato._id,
                        reason: 'Plato no disponible en este momento',
                        cantidad: item.cantidad
                    });
                    continue;
                }

                if (restaurantID && plato.restaurantID.toString() !== restaurantID) {
                    unavailableItems.push({
                        tipo: 'PLATO',
                        platoNombre: plato.nombre,
                        platoId: plato._id,
                        reason: 'Plato no pertenece a este restaurante',
                        cantidad: item.cantidad
                    });
                    continue;
                }

                validatedItems.push({
                    tipo: 'PLATO',
                    platoId: plato._id,
                    platoNombre: plato.nombre,
                    precio: plato.precio,
                    cantidad: item.cantidad,
                    subtotal: plato.precio * item.cantidad
                });
                continue;
            }

            if (!item.menu) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del menú es requerido cuando tipo es MENU'
                });
            }

            const menu = await Menu.findById(item.menu);

            if (!menu) {
                unavailableItems.push({
                    tipo: 'MENU',
                    menuId: item.menu,
                    reason: 'Menú no encontrado',
                    cantidad: item.cantidad
                });
                continue;
            }

            if (!menu.isActive) {
                unavailableItems.push({
                    tipo: 'MENU',
                    menuNombre: menu.nombre,
                    menuId: menu._id,
                    reason: 'Menú inactivo',
                    cantidad: item.cantidad
                });
                continue;
            }

            if (!menu.disponible) {
                unavailableItems.push({
                    tipo: 'MENU',
                    menuNombre: menu.nombre,
                    menuId: menu._id,
                    reason: 'Menú no disponible en este momento',
                    cantidad: item.cantidad
                });
                continue;
            }

            if (restaurantID && menu.restaurantID.toString() !== restaurantID) {
                unavailableItems.push({
                    tipo: 'MENU',
                    menuNombre: menu.nombre,
                    menuId: menu._id,
                    reason: 'Menú no pertenece a este restaurante',
                    cantidad: item.cantidad
                });
                continue;
            }

            validatedItems.push({
                tipo: 'MENU',
                menuId: menu._id,
                menuNombre: menu.nombre,
                precio: menu.precio,
                cantidad: item.cantidad,
                subtotal: menu.precio * item.cantidad
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
