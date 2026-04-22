import Notification from './notification.model.js';

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.usuario?.sub;
    const { isRead, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 20, 1);

    const filter = { userId };
    if (isRead === 'true') filter.isRead = true;
    if (isRead === 'false') filter.isRead = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(parsedLimit)
        .skip((parsedPage - 1) * parsedLimit),
      Notification.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Notificaciones obtenidas exitosamente',
      data: notifications,
      pagination: {
        total,
        pages: Math.ceil(total / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.usuario?.sub;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída',
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al marcar notificación como leída',
      error: error.message,
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.usuario?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: 'Todas las notificaciones fueron marcadas como leídas',
      updatedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al marcar todas las notificaciones como leídas',
      error: error.message,
    });
  }
};

export const seedTestNotification = async (req, res) => {
  try {
    const userId = req.usuario?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const notification = await Notification.create({
      userId,
      type: 'TEST_NOTIFICATION',
      message: 'Notificación de prueba para validar endpoints',
      data: { source: 'manual-seed' },
    });

    return res.status(201).json({
      success: true,
      message: 'Notificación de prueba creada',
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al crear notificación de prueba',
      error: error.message,
    });
  }
};
