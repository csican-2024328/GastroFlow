/**
 * @fileoverview Helpers para gestión de inventario y disponibilidad de platos
 */

import Inventory from '../src/Inventory/inventory.model.js';
import Plato from '../src/Platos/platos-model.js';

/**
 * Verifica si todos los ingredientes tienen stock disponible
 * @param {Array<ObjectId>} ingredientes - Array de IDs de ingredientes del inventario
 * @returns {Promise<boolean>} - true si todos tienen stock, false si alguno no tiene
 */
export const verificarStockIngredientes = async (ingredientes) => {
    try {
        if (!ingredientes || ingredientes.length === 0) {
            return false;
        }

        // Buscar todos los ingredientes en el inventario por ID
        const inventarios = await Inventory.find({
            _id: { $in: ingredientes },
            activo: true
        });

        // Si no existen todos los ingredientes en el inventario, no está disponible
        if (inventarios.length !== ingredientes.length) {
            return false;
        }

        // Verificar que todos tengan stock > 0
        const todosTienenStock = inventarios.every(inv => inv.stock > 0);

        return todosTienenStock;
    } catch (error) {
        console.error('Error al verificar stock de ingredientes:', error);
        return false;
    }
};

/**
 * Actualiza la disponibilidad de todos los platos basándose en el stock de inventario
 * @param {string} [restaurantID] - ID del restaurante (opcional, si se omite actualiza todos)
 * @returns {Promise<Object>} - Resultado de la actualización
 */
export const actualizarDisponibilidadPlatos = async (restaurantID = null) => {
    try {
        // Construir filtro
        const filter = { isActive: true };
        if (restaurantID) {
            filter.restaurantID = restaurantID;
        }

        // Obtener todos los platos activos
        const platos = await Plato.find(filter);

        let actualizados = 0;
        let noDisponibles = 0;
        let disponibles = 0;

        // Verificar cada plato
        for (const plato of platos) {
            const tieneStock = await verificarStockIngredientes(plato.ingredientes);
            
            // Solo actualizar si cambió el estado
            if (plato.disponible !== tieneStock) {
                await Plato.findByIdAndUpdate(plato._id, { disponible: tieneStock });
                actualizados++;
            }

            if (tieneStock) {
                disponibles++;
            } else {
                noDisponibles++;
            }
        }

        return {
            success: true,
            totalPlatos: platos.length,
            actualizados,
            disponibles,
            noDisponibles
        };
    } catch (error) {
        console.error('Error al actualizar disponibilidad de platos:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Actualiza la disponibilidad de platos que contienen un ingrediente específico
 * @param {string} ingredienteID - ID del ingrediente del inventario
 * @returns {Promise<void>}
 */
export const actualizarPlatosPorIngrediente = async (ingredienteID) => {
    try {
        // Buscar todos los platos que contengan este ingrediente
        const platos = await Plato.find({
            isActive: true,
            ingredientes: ingredienteID
        });

        // Actualizar cada plato
        for (const plato of platos) {
            const tieneStock = await verificarStockIngredientes(plato.ingredientes);
            await Plato.findByIdAndUpdate(plato._id, { disponible: tieneStock });
        }

        console.log(`✓ Actualizados ${platos.length} platos relacionados con el ingrediente`);
        
        // También actualizar menús que usen este ingrediente
        await actualizarMenusPorIngrediente(ingredienteID);
    } catch (error) {
        console.error('Error al actualizar platos por ingrediente:', error);
    }
};

/**
 * Verifica si un menú tiene stock disponible (ingredientes propios + platos asociados)
 * @param {Object} menu - Objeto del menú con ingredientes y platos
 * @returns {Promise<boolean>} - true si tiene stock disponible
 */
export const verificarStockMenu = async (menu) => {
    try {
        // Verificar ingredientes propios del menú
        if (menu.ingredientes && menu.ingredientes.length > 0) {
            const tieneStockIngredientes = await verificarStockIngredientes(menu.ingredientes);
            if (!tieneStockIngredientes) return false;
        }

        // Verificar platos asociados
        if (menu.platos && menu.platos.length > 0) {
            const platos = await Plato.find({
                _id: { $in: menu.platos },
                isActive: true
            });

            // Si algún plato no está disponible, el menú no está disponible
            for (const plato of platos) {
                if (!plato.disponible) return false;
                
                // También verificar los ingredientes de cada plato
                if (plato.ingredientes && plato.ingredientes.length > 0) {
                    const tieneStock = await verificarStockIngredientes(plato.ingredientes);
                    if (!tieneStock) return false;
                }
            }
        }

        return true;
    } catch (error) {
        console.error('Error al verificar stock de menú:', error);
        return false;
    }
};

/**
 * Actualiza la disponibilidad de todos los menús basándose en el stock
 * @param {string} [restaurantID] - ID del restaurante (opcional)
 * @returns {Promise<Object>} - Resultado de la actualización
 */
export const actualizarDisponibilidadMenus = async (restaurantID = null) => {
    try {
        const Menu = (await import('../src/Menu/menu.model.js')).default;
        
        const filter = { isActive: true };
        if (restaurantID) {
            filter.restaurantID = restaurantID;
        }

        const menus = await Menu.find(filter).populate('platos');

        let actualizados = 0;
        let noDisponibles = 0;
        let disponibles = 0;

        for (const menu of menus) {
            const tieneStock = await verificarStockMenu(menu);
            
            // Solo actualizar si cambió el estado
            if (menu.disponible !== tieneStock) {
                await Menu.findByIdAndUpdate(menu._id, { disponible: tieneStock });
                actualizados++;
            }

            if (tieneStock) {
                disponibles++;
            } else {
                noDisponibles++;
            }
        }

        return {
            success: true,
            totalMenus: menus.length,
            actualizados,
            disponibles,
            noDisponibles
        };
    } catch (error) {
        console.error('Error al actualizar disponibilidad de menús:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Actualiza la disponibilidad de menús que contienen un ingrediente específico
 * @param {string} ingredienteID - ID del ingrediente del inventario
 * @returns {Promise<void>}
 */
export const actualizarMenusPorIngrediente = async (ingredienteID) => {
    try {
        const Menu = (await import('../src/Menu/menu.model.js')).default;

        // Buscar menús que contengan el ingrediente directamente
        const menusConIngrediente = await Menu.find({
            isActive: true,
            ingredientes: ingredienteID
        }).populate('platos');

        // Buscar menús que contengan platos con ese ingrediente
        const platosConIngrediente = await Plato.find({
            isActive: true,
            ingredientes: ingredienteID
        });

        const platoIDs = platosConIngrediente.map(p => p._id);
        const menusConPlatos = await Menu.find({
            isActive: true,
            platos: { $in: platoIDs }
        }).populate('platos');

        // Combinar ambos conjuntos de menús (sin duplicados)
        const menusSet = new Map();
        [...menusConIngrediente, ...menusConPlatos].forEach(menu => {
            menusSet.set(menu._id.toString(), menu);
        });

        // Actualizar cada menú
        for (const menu of menusSet.values()) {
            const tieneStock = await verificarStockMenu(menu);
            await Menu.findByIdAndUpdate(menu._id, { disponible: tieneStock });
        }

        console.log(`✓ Actualizados ${menusSet.size} menús relacionados con el ingrediente`);
    } catch (error) {
        console.error('Error al actualizar menús por ingrediente:', error);
    }
};
