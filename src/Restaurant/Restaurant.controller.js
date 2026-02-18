import { Restaurant } from './Restaurant.model.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';

export const createRestaurant = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, address, city, openingHours } = req.body;

    if (!name || !email || !phone || !address || !city || !openingHours) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos',
      });
    }

    const existingRestaurant = await Restaurant.findOne({
      where: { Email: email },
    });

    if (existingRestaurant) {
      return res.status(409).json({
        success: false,
        message: 'El email del restaurante ya está registrado',
      });
    }

    const restaurant = await Restaurant.create({
      Name: name,
      Email: email,
      Phone: phone,
      Address: address,
      City: city,
      OpeningHours: openingHours,
      IsActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Restaurante creado exitosamente',
      data: restaurant,
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el restaurante',
      error: error.message,
    });
  }
});

export const getRestaurants = asyncHandler(async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { IsActive: true },
    });

    res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener restaurantes',
      error: error.message,
    });
  }
});

export const getRestaurantById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el restaurante',
      error: error.message,
    });
  }
});

export const updateRestaurant = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, openingHours } = req.body;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

    await restaurant.update({
      Name: name || restaurant.Name,
      Email: email || restaurant.Email,
      Phone: phone || restaurant.Phone,
      Address: address || restaurant.Address,
      City: city || restaurant.City,
      OpeningHours: openingHours || restaurant.OpeningHours,
    });

    res.status(200).json({
      success: true,
      message: 'Restaurante actualizado exitosamente',
      data: restaurant,
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el restaurante',
      error: error.message,
    });
  }
});

export const activateRestaurant = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

    await restaurant.update({ IsActive: true });

    res.status(200).json({
      success: true,
      message: 'Restaurante activado',
      data: restaurant,
    });
  } catch (error) {
    console.error('Error activating restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar el restaurante',
      error: error.message,
    });
  }
});

export const deactivateRestaurant = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

    await restaurant.update({ IsActive: false });

    res.status(200).json({
      success: true,
      message: 'Restaurante desactivado',
      data: restaurant,
    });
  } catch (error) {
    console.error('Error deactivating restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar el restaurante',
      error: error.message,
    });
  }
});