import Restaurant from './Restaurant.model.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';

export const createRestaurant = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      openingHours,
      category,
      description,
      averagePrice,
      photos,
    } = req.body;

    if (!name || !email || !phone || !address || !city || !openingHours) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos',
      });
    }

    const existingRestaurant = await Restaurant.findOne({ email });

    if (existingRestaurant) {
      return res.status(409).json({
        success: false,
        message: 'El email del restaurante ya está registrado',
      });
    }

    const restaurant = await Restaurant.create({
      name,
      email,
      phone,
      address,
      city,
      openingHours,
      category,
      description,
      averagePrice,
      photos,
      isActive: true,
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
    const restaurants = await Restaurant.find({ isActive: true });

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

    const restaurant = await Restaurant.findById(id);

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
    const {
      name,
      email,
      phone,
      address,
      city,
      openingHours,
      category,
      description,
      averagePrice,
      photos,
    } = req.body;

    const updateData = {
      name,
      email,
      phone,
      address,
      city,
      openingHours,
      category,
      description,
      averagePrice,
      photos,
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

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

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

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

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

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