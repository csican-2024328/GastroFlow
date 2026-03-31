
import Menu from './menu.model.js';
import Plato from '../Platos/platos-model.js';
import mongoose from 'mongoose';
import { calcularPrecioYTipoDePlatos } from './menu-helpers.js';
import { verificarStockMenu, actualizarDisponibilidadMenus } from '../../helper/inventory-helpers.js';

// Helper: verifica si una fecha (Date) cae dentro del rango availableFrom/To
const isWithinDateRange = (menu, date) => {
	if (menu.availableFrom && date < new Date(menu.availableFrom)) return false;
	if (menu.availableTo && date > new Date(menu.availableTo)) return false;
	return true;
};

// Helper: verifica schedule para un Date
const isWithinSchedule = (menu, date) => {
	if (!menu.schedule || menu.schedule.length === 0) return true; // si no hay schedule, está disponible

	const dayNumber = date.getDay(); // 0-6
	const hh = String(date.getHours()).padStart(2, '0');
	const mm = String(date.getMinutes()).padStart(2, '0');
	const time = `${hh}:${mm}`;

	// Busca algún item de schedule que contenga el día y el rango
	return menu.schedule.some((s) => {
		if (s.dayNumber !== dayNumber) return false;
		return s.startTime <= time && time <= s.endTime;
	});
};

// Helper: valida que todos los platos pertenezcan al mismo restaurante
const validarPlatosPertenecenAlRestaurante = async (platosIds, restaurantId) => {
	if (!platosIds || !Array.isArray(platosIds) || platosIds.length === 0) {
		return { valid: false, error: 'Los platos son obligatorios y debe haber al menos uno' };
	}

	// Validar que todos los IDs de platos sean válidos
	for (const platoId of platosIds) {
		if (!mongoose.Types.ObjectId.isValid(platoId)) {
			return { valid: false, error: `ID de plato inválido: ${platoId}` };
		}
	}

	// Obtener todos los platos y validar que pertenezcan al restaurante
	const platos = await Plato.find({ _id: { $in: platosIds } });

	if (platos.length !== platosIds.length) {
		return { valid: false, error: 'Uno o más platos no existen' };
	}

	// Validar que todos los platos pertenezcan al mismo restaurante
	for (const plato of platos) {
		if (plato.restaurantId.toString() !== restaurantId) {
			return { valid: false, error: `El plato ${plato.nombre} no pertenece a este restaurante` };
		}
	}

	return { valid: true };
};

export const createMenu = async (req, res) => {
	try {
		const menuData = { ...req.body };

		// Validación: restaurantId es obligatorio
		if (!menuData.restaurantId) {
			return res.status(400).json({
				success: false,
				message: 'restaurantId es obligatorio'
			});
		}

		// Validación: restaurantId debe ser un ObjectId válido
		if (!mongoose.Types.ObjectId.isValid(menuData.restaurantId)) {
			return res.status(400).json({
				success: false,
				message: 'restaurantId debe ser un ID válido'
			});
		}

		// Validación: ingredientes
		if (menuData.ingredientes) {
			if (!Array.isArray(menuData.ingredientes)) {
				return res.status(400).json({
					success: false,
					message: 'Ingredientes debe ser un array'
				});
			}
			// Validar que todos los ingredientes sean ObjectIds válidos
			for (const ingredienteId of menuData.ingredientes) {
				if (!mongoose.Types.ObjectId.isValid(ingredienteId)) {
					return res.status(400).json({
						success: false,
						message: `ID de ingrediente inválido: ${ingredienteId}`
					});
				}
			}
		}

		// Obtener los IDs de platos del body (puede venir como string o array)
		let platosIDs = menuData.platos;
		if (typeof platosIDs === 'string') {
			platosIDs = [platosIDs];
		}
		if (!Array.isArray(platosIDs)) platosIDs = [];

		// Validación cruzada: verificar que todos los platos pertenezcan al restaurante
		const validacionPlatos = await validarPlatosPertenecenAlRestaurante(platosIDs, menuData.restaurantId);
		if (!validacionPlatos.valid) {
			return res.status(400).json({
				success: false,
				message: validacionPlatos.error
			});
		}

		// Calcular precio y tipo
		const { precio, tipo } = await calcularPrecioYTipoDePlatos(platosIDs);
		menuData.precio = precio;
		menuData.tipo = tipo;
		menuData.platos = platosIDs;

		if (req.file) menuData.foto = req.file.path;

		const menu = new Menu(menuData);
		await menu.save();

		// Actualizar disponibilidad después de crear el menú
		await actualizarDisponibilidadMenus(menuData.restaurantId);

		// Obtener el menú actualizado con la disponibilidad correcta
		const menuActualizado = await Menu.findById(menu._id).populate('platos').populate('ingredientes');

		return res.status(201).json({ success: true, message: 'Menú creado exitosamente', data: menuActualizado });
	} catch (error) {
		return res.status(400).json({ success: false, message: 'Error al crear menú', error: error.message });
	}
};

export const getMenus = async (req, res) => {
	try {
		const { page = 1, limit = 10, isActive = true, restaurantId, tipo, date } = req.query;
		const filter = {};
		if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true' || isActive === true;
		if (restaurantId) {
			if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
				return res.status(400).json({
					success: false,
					message: 'restaurantId debe ser un ID válido'
				});
			}
			filter.restaurantId = restaurantId;
		}
		if (tipo) filter.tipo = tipo;

		// Actualizar disponibilidad de menús antes de consultar
		await actualizarDisponibilidadMenus(restaurantId);

		const parsedPage = parseInt(page);
		const parsedLimit = parseInt(limit);

		let menus = await Menu.find(filter)
			.populate('ingredientes')
			.populate('platos')
			.limit(parsedLimit)
			.skip((parsedPage - 1) * parsedLimit)
			.sort({ createdAt: -1 });

		// Si se pide filtrar por disponibilidad en una fecha/hora específica
		if (date) {
			const dt = new Date(date);
			menus = menus.filter((m) => m.disponible && isWithinDateRange(m, dt) && isWithinSchedule(m, dt));
		}

		const total = await Menu.countDocuments(filter);

		return res.status(200).json({ success: true, data: menus, pagination: { currentPage: parsedPage, totalPages: Math.ceil(total / parsedLimit), totalRecords: total, limit: parsedLimit } });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Error al obtener menús', error: error.message });
	}
};

export const getMenuById = async (req, res) => {
	try {
		const { id } = req.params;
		const menu = await Menu.findById(id)
			.populate('restaurantId')
			.populate('platos')
			.populate('ingredientes');
		if (!menu) return res.status(404).json({ success: false, message: 'Menú no encontrado' });
		
		// Verificar disponibilidad actual del menú
		const tieneStock = await verificarStockMenu(menu);
		if (menu.disponible !== tieneStock) {
			menu.disponible = tieneStock;
			await menu.save();
		}
		
		return res.status(200).json({ success: true, data: menu });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Error al obtener menú', error: error.message });
	}
};

export const updateMenu = async (req, res) => {
	try {
		const { id } = req.params;
		const existing = await Menu.findById(id);
		if (!existing) return res.status(404).json({ success: false, message: 'Menú no encontrado' });

		const updateData = { ...req.body };

		// Protección: NO permitir cambiar restaurantId
		if (updateData.restaurantId && updateData.restaurantId !== existing.restaurantId.toString()) {
			return res.status(400).json({
				success: false,
				message: 'No se puede cambiar el restaurante de un menú existente'
			});
		}
		// No incluir restaurantId en updateData
		delete updateData.restaurantId;

		// Validación: ingredientes
		if (updateData.ingredientes) {
			if (!Array.isArray(updateData.ingredientes)) {
				return res.status(400).json({
					success: false,
					message: 'Ingredientes debe ser un array'
				});
			}
			// Validar que todos los ingredientes sean ObjectIds válidos
			for (const ingredienteId of updateData.ingredientes) {
				if (!mongoose.Types.ObjectId.isValid(ingredienteId)) {
					return res.status(400).json({
						success: false,
						message: `ID de ingrediente inválido: ${ingredienteId}`
					});
				}
			}
		}

		// Validación cruzada: si se actualizan los platos
		if (updateData.platos) {
			let platosIds = updateData.platos;
			if (typeof platosIds === 'string') {
				platosIds = [platosIds];
			}
			const validacionPlatos = await validarPlatosPertenecenAlRestaurante(platosIds, existing.restaurantId.toString());
			if (!validacionPlatos.valid) {
				return res.status(400).json({
					success: false,
					message: validacionPlatos.error
				});
			}
			// Recalcular precio y tipo si se actualizan platos
			const { precio, tipo } = await calcularPrecioYTipoDePlatos(platosIds);
			updateData.precio = precio;
			updateData.tipo = tipo;
			updateData.platos = platosIds;
		}

		if (req.file) updateData.foto = req.file.path;

		const updated = await Menu.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
			.populate('platos')
			.populate('ingredientes');
		
		// Verificar disponibilidad después de actualizar
		const tieneStock = await verificarStockMenu(updated);
		if (updated.disponible !== tieneStock) {
			updated.disponible = tieneStock;
			await updated.save();
		}
		
		return res.status(200).json({ success: true, message: 'Menú actualizado', data: updated });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Error al actualizar menú', error: error.message });
	}
};

export const changeMenuStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const isActive = req.url.includes('/activate');
		const menu = await Menu.findByIdAndUpdate(id, { isActive }, { new: true });
		if (!menu) return res.status(404).json({ success: false, message: 'Menú no encontrado' });
		const action = isActive ? 'activado' : 'desactivado';
		return res.status(200).json({ success: true, message: `Menú ${action} exitosamente`, data: menu });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Error al cambiar estado del menú', error: error.message });
	}
};

// Obtener menú (items) activos por restaurante, aplicando reglas dinámicas si se solicita fecha
export const getMenuByRestaurant = async (req, res) => {
	try {
		const restaurantId = req.params.restaurantId || req.params.restaurantID;
		const { date } = req.query;
		if (!restaurantId) return res.status(400).json({ success: false, message: 'ID del restaurante es requerido' });

		if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
			return res.status(400).json({
				success: false,
				message: 'restaurantId debe ser un ID válido'
			});
		}

		// Actualizar disponibilidad de menús del restaurante antes de consultar
		await actualizarDisponibilidadMenus(restaurantId);

		const filter = { restaurantId, isActive: true, disponible: true };
		let menus = await Menu.find(filter)
			.populate('ingredientes')
			.populate('platos')
			.sort({ createdAt: -1 });

		if (date) {
			const dt = new Date(date);
			menus = menus.filter((m) => isWithinDateRange(m, dt) && isWithinSchedule(m, dt));
		}

		return res.status(200).json({ success: true, message: 'Menú obtenido exitosamente', data: menus });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Error al obtener el menú', error: error.message });
	}
};

