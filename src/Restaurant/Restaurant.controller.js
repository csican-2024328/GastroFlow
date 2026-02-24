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

    // Procesar archivos subidos (fotos)
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(file => file.path); // Cloudinary devuelve la URL en 'path'
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
    const { page = 1, limit = 10, isActive = true } = req.query;
    const filter = { isActive };

    const restaurants = await Restaurant.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Restaurant.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: restaurants,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit,
      },
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
    } = req.body;

    // Obtener el restaurante actual para mantener fotos existentes
    const currentRestaurant = await Restaurant.findById(id);
    if (!currentRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

    // Procesar archivos subidos (fotos nuevas)
    let photos = currentRestaurant.photos || [];
    
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => file.path); // URLs de Cloudinary
      photos = newPhotos; // Reemplazar con las nuevas fotos
    }

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

export const deleteRestaurant = asyncHandler(async (req, res) => {
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
      message: 'Restaurante eliminado (inactivado) exitosamente',
      data: restaurant,
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar restaurante',
      error: error.message,
    });
  }
});

export const changeRestaurantStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = req.url.includes('/activate');
    const action = isActive ? 'activado' : 'desactivado';

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { isActive },
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
      message: `Restaurante ${action} exitosamente`,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error changing restaurant status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del restaurante',
      error: error.message,
    });
  }
});