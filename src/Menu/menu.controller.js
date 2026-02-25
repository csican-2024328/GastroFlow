
import Menu from './menu.model.js';
import { calcularPrecioYTipoDePlatos } from './menu-helpers.js';

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

export const createMenu = async (req, res) => {
	try {
		const menuData = { ...req.body };
		if (req.file) menuData.foto = req.file.path;

		// Obtener los IDs de platos del body (puede venir como string o array)
		let platosIDs = menuData.platos;
		if (typeof platosIDs === 'string') {
			platosIDs = [platosIDs];
		}
		if (!Array.isArray(platosIDs)) platosIDs = [];

		// Calcular precio y tipo
		const { precio, tipo } = await calcularPrecioYTipoDePlatos(platosIDs);
		menuData.precio = precio;
		menuData.tipo = tipo;
		menuData.platos = platosIDs;

		const menu = new Menu(menuData);
		await menu.save();

		return res.status(201).json({ success: true, message: 'Menú creado exitosamente', data: menu });
	} catch (error) {
		return res.status(400).json({ success: false, message: 'Error al crear menú', error: error.message });
	}
};

export const getMenus = async (req, res) => {
	try {
		const { page = 1, limit = 10, isActive = true, restaurantID, tipo, date } = req.query;
		const filter = {};
		if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true' || isActive === true;
		if (restaurantID) filter.restaurantID = restaurantID;
		if (tipo) filter.tipo = tipo;

		const parsedPage = parseInt(page);
		const parsedLimit = parseInt(limit);

		let menus = await Menu.find(filter)
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
		const menu = await Menu.findById(id).populate('restaurantID');
		if (!menu) return res.status(404).json({ success: false, message: 'Menú no encontrado' });
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
		if (req.file) updateData.foto = req.file.path;

		const updated = await Menu.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
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
		const { restaurantID } = req.params;
		const { date } = req.query;
		if (!restaurantID) return res.status(400).json({ success: false, message: 'ID del restaurante es requerido' });

		const filter = { restaurantID, isActive: true, disponible: true };
		let menus = await Menu.find(filter).sort({ createdAt: -1 });

		if (date) {
			const dt = new Date(date);
			menus = menus.filter((m) => isWithinDateRange(m, dt) && isWithinSchedule(m, dt));
		}

		return res.status(200).json({ success: true, message: 'Menú obtenido exitosamente', data: menus });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Error al obtener el menú', error: error.message });
	}
};

