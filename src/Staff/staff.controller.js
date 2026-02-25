import { Staff } from './staff.model.js';

export const createStaff = async (req, res) => {
  try {
    const { name, surname, restaurantId, role } = req.body;
    if (!name || !surname || !restaurantId || !role) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }
    const staff = await Staff.create({ Name: name, Surname: surname, RestaurantId: restaurantId, Role: role });
    res.status(201).json({ success: true, message: 'Empleado creado', data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creando empleado', error: error.message });
  }
};

export const getStaff = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const filter = { Status: true };
    if (restaurantId) filter.RestaurantId = restaurantId;
    const staffList = await Staff.findAll({ where: filter });
    res.status(200).json({ success: true, data: staffList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo empleados', error: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.update({ Status: false }, { where: { Id: id } });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error eliminando empleado', error: error.message });
  }
};