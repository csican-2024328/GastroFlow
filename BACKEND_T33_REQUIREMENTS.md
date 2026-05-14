# 📋 INSTRUCCIONES PARA BACKEND - T33: Asignación de Admin a Restaurante

## 🎯 Objetivo

Implementar endpoint para que un PLATFORM_ADMIN asigne un restaurante a otro PLATFORM_ADMIN.

---

## 📌 Endpoint Requerido

### Ruta
```
PUT /api/v1/users/:userId/assign-restaurant
```

### Método HTTP
```
PUT
```

### Autenticación
```
Bearer Token (JWT)
```

### Autorización
```
Solo PLATFORM_ADMIN puede ejecutar esta acción
```

### Validaciones
```
1. El usuario que realiza la acción debe ser PLATFORM_ADMIN
2. El userId debe ser un usuario válido
3. El restaurantId debe ser un MongoId válido
4. El restaurante debe existir en MongoDB
5. El usuario target debe tener rol PLATFORM_ADMIN (opcional pero recomendado)
```

---

## 📤 Request Body

```json
{
  "restaurantId": "507f1f77bcf86cd799439011"
}
```

### Validaciones del Body
```
- restaurantId: required, type=string (MongoId), must exist in MongoDB
```

---

## 📥 Response Success (200 OK)

```json
{
  "success": true,
  "message": "Restaurante asignado exitosamente",
  "data": {
    "userId": 1,
    "name": "Juan",
    "surname": "Pérez",
    "email": "juan.perez@gastroflow.com",
    "restaurantId": "507f1f77bcf86cd799439011",
    "restaurantName": "El Asador",
    "previousRestaurantId": "507f1f77bcf86cd799439010",
    "previousRestaurantName": "La Trattoria",
    "updatedAt": "2026-05-13T10:30:00Z"
  }
}
```

---

## 📤 Response Error Examples

### 400 - Falta restaurantId
```json
{
  "success": false,
  "message": "restaurantId es requerido"
}
```

### 401 - No autorizado
```json
{
  "success": false,
  "message": "Solo administradores de plataforma pueden asignar restaurantes"
}
```

### 404 - Usuario no existe
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

### 404 - Restaurante no existe
```json
{
  "success": false,
  "message": "Restaurante no encontrado"
}
```

### 500 - Error del servidor
```json
{
  "success": false,
  "message": "Error al asignar restaurante"
}
```

---

## 🔧 Implementación Sugerida (Node.js + Express + Sequelize)

```javascript
import { User } from '../models/User.js';
import asyncHandler from 'express-async-handler';

export const assignRestaurantToUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { restaurantId } = req.body;
  const requestingUserId = req.usuario?.sub || req.userId;

  // 1. Validar que quien solicita sea PLATFORM_ADMIN
  const requestingUser = await User.findByPk(requestingUserId);
  if (requestingUser?.Role?.RoleName !== 'PLATFORM_ADMIN') {
    return res.status(401).json({
      success: false,
      message: 'Solo administradores de plataforma pueden asignar restaurantes'
    });
  }

  // 2. Validar restaurantId formato
  if (!restaurantId || typeof restaurantId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'restaurantId es requerido y debe ser texto'
    });
  }

  // 3. Validar que restaurante existe en MongoDB (llamar API de MongoDB)
  // const restaurantExists = await checkRestaurantInMongo(restaurantId);

  // 4. Obtener usuario target
  const targetUser = await User.findByPk(userId);
  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  // 5. Guardar restaurantId anterior
  const previousRestaurantId = targetUser.RestaurantId;

  // 6. Actualizar usuario
  targetUser.RestaurantId = restaurantId;
  await targetUser.save();

  // 7. Retornar datos
  res.status(200).json({
    success: true,
    message: 'Restaurante asignado exitosamente',
    data: {
      userId: targetUser.Id,
      name: targetUser.Name,
      surname: targetUser.Surname,
      email: targetUser.Email,
      restaurantId: targetUser.RestaurantId,
      previousRestaurantId,
      updatedAt: targetUser.UpdatedAt
    }
  });
});
```

---

## 📍 Ruta en auth.routes.js

```javascript
import { assignRestaurantToUser } from './auth.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';

// ... otras rutas ...

router.put(
  '/:userId/assign-restaurant',
  autenticar,
  autorizarRole('PLATFORM_ADMIN'),
  assignRestaurantToUser
);
```

---

## 🗄️ Modelo User - Campo Requerido

El modelo User en PostgreSQL DEBE tener el campo:

```javascript
// User.js (Sequelize Model)
export const User = sequelize.define('User', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Surname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  // ... otros campos ...
  RestaurantId: {
    type: DataTypes.STRING, // MongoDB ObjectId como string
    allowNull: true,        // Puede ser null si no tiene restaurante asignado
    defaultValue: null
  },
  // ... más campos ...
});
```

---

## 🔄 Flujo Frontend → Backend

```
┌─────────────────────────────────────────┐
│ Frontend (React)                        │
│ AssignmentsPage.jsx                     │
└───────────┬─────────────────────────────┘
            │
            │ 1. Usuario selecciona admin + restaurant
            │ 2. Hace click "Sí, asignar"
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: assignmentService.js                              │
│ const result = await assignRestaurantToAdmin(userId, restId)│
│ → PUT /api/v1/users/:userId/assign-restaurant               │
│ → Body: { restaurantId: "507f1f77bcf86cd799439011" }        │
└───────────┬─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: auth.routes.js                                     │
│ router.put('/:userId/assign-restaurant', autenticar, ...)   │
└───────────┬─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: auth.controller.js                                 │
│ export const assignRestaurantToUser = async (req, res) => { │
│   // Validaciones                                           │
│   // Actualizar User.RestaurantId                           │
│   // Retornar datos actualizados                            │
│ }                                                           │
└───────────┬─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: PostgreSQL                                         │
│ UPDATE users SET RestaurantId = ? WHERE Id = ?              │
└────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: useAssignmentStore.js                             │
│ ✅ Toast de éxito                                           │
│ ✅ Refresca listas                                          │
│ ✅ Limpia selecciones                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

- [ ] Crear función `assignRestaurantToUser` en auth.controller.js
- [ ] Agregar ruta PUT /:userId/assign-restaurant en auth.routes.js
- [ ] Agregar campo `RestaurantId` a modelo User (si no existe)
- [ ] Validar autorización (solo PLATFORM_ADMIN)
- [ ] Validar que restaurante existe en MongoDB
- [ ] Guardar restaurantId anterior para referencia
- [ ] Retornar datos completos del usuario actualizado
- [ ] Testear E2E con frontend
- [ ] Manejar edge cases (errores, validaciones)

---

## 🧪 Test cURL

```bash
curl -X PUT http://localhost:3006/api/v1/users/1/assign-restaurant \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId": "507f1f77bcf86cd799439011"}'
```

---

## ⚠️ Notas Importantes

1. **Validación de MongoDB**: El restaurantId debe ser validado contra MongoDB. Se puede usar una función helper que verifique si el restaurante existe.

2. **Duplicados**: ¿Puede un mismo restaurante tener múltiples admins asignados? Actualmente el modelo asume 1:1. Si se necesita 1:N, se debe cambiar la estructura.

3. **Cascada**: ¿Qué pasa si se elimina un restaurante? Se debe definir la estrategia (soft-delete, set null, error, etc).

4. **Auditoría**: Opcional pero recomendado: registrar quién hizo la asignación y cuándo.

---

## 📞 Contacto

Si tienes dudas sobre la implementación, contacta al equipo de frontend.
