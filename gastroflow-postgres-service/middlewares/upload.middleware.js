'use strict';

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Middleware para subir fotos de restaurantes (múltiples archivos)
 * Almacena las imágenes en Cloudinary en la carpeta /restaurantes/
 */
const restaurantPhotosStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'gastrflow/restaurantes',
    resource_type: 'auto',
    format: async (req, file) => 'webp',
    public_id: async (req, file) => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `restaurant_${timestamp}_${randomStr}`;
    },
  },
});

/**
 * Middleware para subir una foto de plato
 * Almacena la imagen en Cloudinary en la carpeta /platos/
 */
const platoPhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'gastrflow/platos',
    resource_type: 'auto',
    format: async (req, file) => 'webp',
    public_id: async (req, file) => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `plato_${timestamp}_${randomStr}`;
    },
  },
});

/**
 * Middleware para subir avatar de perfil
 * Almacena la imagen en Cloudinary en la carpeta /profiles/
 */
const profileAvatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: process.env.CLOUDINARY_FOLDER || 'gastroflow/profiles',
    resource_type: 'image',
    format: async () => 'webp',
    public_id: async (req, file) => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `avatar_${timestamp}_${randomStr}`;
    },
  },
});

/**
 * Filtro de archivos personalizado
 * Valida que el archivo sea una imagen y tenga tamaño permitido
 */
const fileFilter = (req, file, cb) => {
  // Validar tipo MIME: aceptar cualquier imagen
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    const error = new Error(
      'Tipo de archivo no permitido. Solo se aceptan imágenes.'
    );
    error.status = 400;
    return cb(error);
  }

  // Validar tamaño (el size está disponible en algunos casos)
  // Para req.file.size, multer lo agrega después de procesar
  cb(null, true);
};

/**
 * Middleware para subidas de fotos de restaurantes (múltiples)
 * Usa: uploadRestaurantPhotos.array('fotos', 5)
 * - 'fotos': nombre del campo en el formulario
 * - 5: máximo de archivos
 */
export const uploadRestaurantPhotos = multer({
  storage: restaurantPhotosStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Middleware para subida de una foto de plato
 * Usa: uploadPlatoPhoto.single('foto')
 * - 'foto': nombre del campo en el formulario
 */
export const uploadPlatoPhoto = multer({
  storage: platoPhotoStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Middleware para subida de avatar de perfil
 * Usa: uploadProfileAvatar.single('profilePicture')
 */
export const uploadProfileAvatar = multer({
  storage: profileAvatarStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Middleware para manejar errores de Multer de forma consistente
 * Se puede usar después de los uploads para capturar errores
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `El archivo excede el tamaño máximo permitido (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Excedió el número máximo de archivos permitidos',
      });
    }
  }

  if (err && err.status === 400) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la subida de archivo',
      error: err.message,
    });
  }

  next();
};
