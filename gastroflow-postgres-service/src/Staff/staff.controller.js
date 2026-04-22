import { Staff } from './staff.model.js';

const parseBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }

    if (value.toLowerCase() === 'false') {
      return false;
    }
  }

  return null;
};

const buildStaffResponse = (staff) => ({
  id: staff.Id,
  name: staff.Name,
  surname: staff.Surname,
  restaurantId: staff.RestaurantId,
  role: staff.Role,
  status: staff.Status,
  createdAt: staff.CreatedAt,
  updatedAt: staff.UpdatedAt,
});

export const createStaff = async (req, res) => {
  try {
    const { name, surname, restaurantId, role } = req.body;
    if (!name || !surname || !restaurantId || !role) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }
    const staff = await Staff.create({ Name: name, Surname: surname, RestaurantId: restaurantId, Role: role });
    res.status(201).json({ success: true, message: 'Empleado creado', data: buildStaffResponse(staff) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creando empleado', error: error.message });
  }
};

export const getStaff = async (req, res) => {
  try {
    const { restaurantId, status } = req.query;
    const filter = {};

    if (restaurantId) filter.RestaurantId = restaurantId;

    if (status !== undefined) {
      const parsedStatus = parseBoolean(status);
      if (parsedStatus === null) {
        return res.status(400).json({ success: false, message: 'El status debe ser booleano' });
      }
      filter.Status = parsedStatus;
    }

    const staffList = await Staff.findAll({ where: filter });
    res.status(200).json({ success: true, data: staffList.map(buildStaffResponse) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo empleados', error: error.message });
  }
};

export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id);

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    res.status(200).json({ success: true, data: buildStaffResponse(staff) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo empleado', error: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, restaurantId, role } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.Name = name;
    if (surname !== undefined) updateData.Surname = surname;
    if (restaurantId !== undefined) updateData.RestaurantId = restaurantId;
    if (role !== undefined) updateData.Role = role;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'Debe enviar al menos un campo para actualizar' });
    }

    const [updatedCount] = await Staff.update(updateData, { where: { Id: id } });

    if (updatedCount === 0) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    const updatedStaff = await Staff.findByPk(id);
    return res.status(200).json({ success: true, message: 'Empleado actualizado', data: buildStaffResponse(updatedStaff) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error actualizando empleado', error: error.message });
  }
};

export const toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const nextStatus = parseBoolean(req.body.status);

    if (nextStatus === null) {
      return res.status(400).json({ success: false, message: 'El status debe ser booleano' });
    }

    const [updatedCount] = await Staff.update({ Status: nextStatus }, { where: { Id: id } });

    if (updatedCount === 0) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    const updatedStaff = await Staff.findByPk(id);
    return res.status(200).json({
      success: true,
      message: nextStatus ? 'Empleado activado' : 'Empleado desactivado',
      data: buildStaffResponse(updatedStaff),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error actualizando estado del empleado', error: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedCount] = await Staff.update({ Status: false }, { where: { Id: id } });
    if (updatedCount === 0) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error eliminando empleado', error: error.message });
  }
};