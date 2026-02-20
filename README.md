# GastroFlow API

## Total de Endpoints (activos): 53

## Credenciales por defecto (seed)

- Username: admin
- Email: admin@gastroflow.local
- Password: Admin@1234!

## Configuración Importante
⚠️ **IMPORTANTE**: Crear archivo `.env` con las credenciales necesarias (no se sube al repositorio por seguridad)

### 📝 Contenido del archivo `.env`

Copia este contenido en un archivo `.env` en la raíz del proyecto:

```env
NODE_ENV = development
PORT = 3006
 
# MongoDB (Restaurantes, Mesas, Platos) - Local sin autenticación
MONGODB_URI=mongodb://localhost:27017/GastroFlow
 
# Database PostgreSQL (Usuarios, Autenticación)
DB_HOST=localhost
DB_PORT=5435
DB_NAME=GastroFlow
DB_USERNAME=root
DB_PASSWORD=admin
DB_SQL_LOGGING=false
 
JWT_SECRET=MyVerySecretKeyForJWTTokenAuthenticationWith256Bits!
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=AuthService
JWT_AUDIENCE=AuthService
 
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENABLE_SSL=true
SMTP_USERNAME=kinalsports@gmail.com
SMTP_PASSWORD=yrsd prvf kwat toee
EMAIL_FROM=kinalsports@gmail.com
EMAIL_FROM_NAME=AuthDotnet App
 
# Verification Tokens (en horas)
VERIFICATION_EMAIL_EXPIRY_HOURS=24
PASSWORD_RESET_EXPIRY_HOURS=1
 
# Frontend URL (para enlaces en emails)
FRONTEND_URL=http://localhost:5173
 
# Cloudinary (upload de imágenes de perfil)
CLOUDINARY_CLOUD_NAME=dut08rmaz
CLOUDINARY_API_KEY=279612751725163
CLOUDINARY_API_SECRET=UxGMRqU1iB580Kxb2AlDR4n4hu0
CLOUDINARY_BASE_URL=https://res.cloudinary.com/dut08rmaz/image/upload/
CLOUDINARY_FOLDER=gastroflow/profiles
CLOUDINARY_DEFAULT_AVATAR_FILENAME=default-avatar_ewzxwx.png
 
# File Upload (alternativa local)
UPLOAD_PATH=./uploads
 
# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:3006
ADMIN_ALLOWED_ORIGINS=http://localhost:5173

```

---
## 📍 Endpoints Funcionales

**Base URL:** http://localhost:3006/api/v1

### 🔐 AUTENTICACION (`/auth`) - 8 endpoints

#### `POST http://localhost:3006/api/v1/auth/register` - Publico
```json
{
  "name": "Juan",
  "surname": "Perez",
  "username": "juanperez",
  "email": "juan@example.com",
  "password": "Password123!",
  "phone": "50212345678"
}
```

#### `POST http://localhost:3006/api/v1/auth/login` - Publico
```json
{
  "emailOrUsername": "admin",
  "password": "Admin@1234!"
}
```

#### `POST http://localhost:3006/api/v1/auth/verify-email` - Publico
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST http://localhost:3006/api/v1/auth/resend-verification` - Publico
```json
{
  "email": "juan@example.com"
}
```

#### `POST http://localhost:3006/api/v1/auth/forgot-password` - Publico
```json
{
  "email": "juan@example.com"
}
```

#### `POST http://localhost:3006/api/v1/auth/reset-password` - Publico
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NuevaPassword123!"
}
```

#### `GET http://localhost:3006/api/v1/auth/profile` - Requiere token
```bash
Authorization: Bearer {token_de_usuario}
```

#### `POST http://localhost:3006/api/v1/auth/profile/by-id` - Requiere token
```json
{
  "userId": "usr_xxxxxxxxxxxx"
}
```
```bash
Authorization: Bearer {token_de_usuario}
```

---

### 🏢 RESTAURANTES (`/restaurants`) - 6 endpoints

#### `POST http://localhost:3006/api/v1/restaurants/create` - Requiere token
```json
{
  "name": "Mi Restaurante",
  "email": "admin@restaurante.com",
  "phone": "50212345678",
  "address": "Calle Principal 123",
  "city": "Ciudad de Guatemala",
  "openingHours": "Lun-Vie 9:00-18:00"
}
```
```bash
Authorization: Bearer {token_de_usuario}
```

#### `GET http://localhost:3006/api/v1/restaurants/get` - Publico

#### `GET http://localhost:3006/api/v1/restaurants/:id` - Publico

#### `PUT http://localhost:3006/api/v1/restaurants/:id` - Requiere token
```json
{
  "name": "Restaurante Actualizado",
  "email": "nuevo@restaurante.com",
  "phone": "50287654321",
  "address": "Avenida Central 456",
  "city": "Antigua Guatemala",
  "openingHours": "Lun-Vie 10:00-20:00"
}
```
```bash
Authorization: Bearer {token_de_usuario}
```

#### `PUT http://localhost:3006/api/v1/restaurants/:id/activate` - Requiere token
```bash
Authorization: Bearer {token_de_usuario}
```

#### `PUT http://localhost:3006/api/v1/restaurants/:id/deactivate` - Requiere token
```bash
Authorization: Bearer {token_de_usuario}
```

---

### 📊 REPORTES (`/reports`) - 3 endpoints

#### `GET http://localhost:3006/api/v1/reports/top-platos` - Requiere token de PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_platform_admin}
```
**Respuesta:** Top 5 platos más vendidos con cantidad de ventas e ingresos

#### `GET http://localhost:3006/api/v1/reports/ingresos` - Requiere token de PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_platform_admin}
Query params:
- start: "2026-02-01" (fecha inicio)
- end: "2026-02-28" (fecha fin)
```
**Respuesta:** Total de ingresos, mesas cerradas y promedio de cuenta en rango de fechas

#### `GET http://localhost:3006/api/v1/reports/ocupacion` - Requiere token de PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_platform_admin}
```
**Respuesta:** Horarios de mayor ocupación de mesas

---

### 📦 INVENTARIO (`/inventory`) - 5 endpoints

#### `POST http://localhost:3006/api/v1/inventory/create` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "nombre": "Aceite de Oliva",
  "stock": 50,
  "unidadMedida": "l"
}
```
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Unidades permitidas:** kg, g, l, ml, unidad, paquete

#### `GET http://localhost:3006/api/v1/inventory/get` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Respuesta:** Lista de todos los insumos activos

#### `GET http://localhost:3006/api/v1/inventory/:id` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Respuesta:** Detalles de un insumo específico

#### `PUT http://localhost:3006/api/v1/inventory/:id` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "nombre": "Aceite de Oliva Extra Virgen",
  "stock": 75,
  "unidadMedida": "l"
}
```
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```

#### `DELETE http://localhost:3006/api/v1/inventory/:id` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Nota:** Soft delete (marca como inactivo)

---

### ❤️ HEALTH - 1 endpoint

#### `GET http://localhost:3006/api/v1/health` - Publico


### 🍴 PLATOS/MENU (`/platos`) - 7 endpoints

#### `POST http://localhost:3006/api/v1/platos/create` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "nombre": "Tacos al Pastor",
  "descripcion": "Deliciosos tacos con piña",
  "precio": 45.00,
  "categoria": "FUERTE",
  "restaurantID": "507f1f77bcf86cd799439011",
  "ingredientes": ["tortilla", "cerdo", "piña", "cilantro"],
  "disponible": true
}
```
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Nota:** Si necesitas subir una imagen, usa `multipart/form-data` en lugar de JSON

#### `GET http://localhost:3006/api/v1/platos/get` - Publico

#### `GET http://localhost:3006/api/v1/platos/:id` - Publico

#### `GET http://localhost:3006/api/v1/platos/menu/:restaurantID` - Publico

#### `PUT http://localhost:3006/api/v1/platos/:id` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "nombre": "Tacos Premium",
  "descripcion": "Tacos mejorados",
  "precio": 55.00,
  "categoria": "FUERTE"
}
```

#### `PUT http://localhost:3006/api/v1/platos/:id/activate` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```

#### `PUT http://localhost:3006/api/v1/platos/:id/deactivate` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```

---

### 📊 MESAS (`/mesas`) - 5 endpoints

#### `POST http://localhost:3006/api/v1/mesas/create` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "numero": 5,
  "capacidad": 4,
  "ubicacion": "Terraza",
  "restaurantID": "507f1f77bcf86cd799439011",
  "isActive": true
}
```
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```

#### `GET http://localhost:3006/api/v1/mesas/get` - Publico

#### `GET http://localhost:3006/api/v1/mesas/:id` - Publico

#### `PUT http://localhost:3006/api/v1/mesas/:id` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "numero": 5,
  "capacidad": 6,
  "ubicacion": "Terraza VIP",
  "isActive": true
}
```
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```

#### `DELETE http://localhost:3006/api/v1/mesas/:id` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```

---

### 🛎️ PEDIDOS (`/orders`) - 9 endpoints

#### `POST http://localhost:3006/api/v1/orders/create` - Requiere token de CLIENT, RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "restaurantID": "507f1f77bcf86cd799439011",
  "mesaID": "507f1f77bcf86cd799439012",
  "clienteNombre": "Juan Pérez",
  "clienteTelefono": "50212345678",
  "items": [
    {
      "plato": "507f1f77bcf86cd799439013",
      "cantidad": 2,
      "notas": "Sin cebolla"
    },
    {
      "plato": "507f1f77bcf86cd799439014",
      "cantidad": 1
    }
  ],
  "impuesto": 10.50,
  "descuento": 5.00,
  "notas": "Cliente prefiere comida no picante"
}
```
```bash
Authorization: Bearer {token_de_usuario}
```
**Respuesta:** Pedido creado con número de orden único, subtotal y total calculados automáticamente

#### `GET http://localhost:3006/api/v1/orders/get` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
Query params (opcionales):
- restaurantID: "507f1f77bcf86cd799439011"
- mesaID: "507f1f77bcf86cd799439012"
- estado: "PENDIENTE" | "EN_PREPARACION" | "LISTO" | "SERVIDO" | "PAGADO" | "CANCELADO"
- page: 1 (número de página)
- limit: 10 (items por página)
```
**Respuesta:** Lista de pedidos con paginación e información de restaurante, mesa y platos

#### `GET http://localhost:3006/api/v1/orders/:id` - Requiere token
```bash
Authorization: Bearer {token_de_usuario}
```
**Respuesta:** Detalles completos de un pedido específico

#### `GET http://localhost:3006/api/v1/orders/numero/:numeroOrden` - Requiere token
```bash
Authorization: Bearer {token_de_usuario}
Ejemplo: GET /orders/numero/ORD-20260215-12345
```
**Respuesta:** Pedido buscado por su número de orden único

#### `PUT http://localhost:3006/api/v1/orders/:id` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "clienteNombre": "Juan Pérez Actualizado",
  "clienteTelefono": "50287654321",
  "items": [
    {
      "plato": "507f1f77bcf86cd799439013",
      "cantidad": 3,
      "notas": "Extra queso"
    }
  ],
  "impuesto": 12.00,
  "descuento": 10.00,
  "notas": "Pedido actualizado"
}
```
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Nota:** Solo se puede editar si el pedido está en estado PENDIENTE

#### `PUT http://localhost:3006/api/v1/orders/:id/estado` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "estado": "EN_PREPARACION"
}
```
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Estados válidos:** PENDIENTE, EN_PREPARACION, LISTO, SERVIDO, PAGADO, CANCELADO  
**Nota:** No se puede cambiar el estado de pedidos CANCELADO o PAGADO

#### `PUT http://localhost:3006/api/v1/orders/:id/pagar` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "metodoPago": "TARJETA"
}
```
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Métodos de pago válidos:** EFECTIVO, TARJETA, TRANSFERENCIA  
**Nota:** Cambia el estado a PAGADO y registra la hora del pago

#### `DELETE http://localhost:3006/api/v1/orders/:id` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "motivo": "Cliente canceló la orden"
}
```
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Nota:** Cambia el estado a CANCELADO (no elimina el registro)

#### `DELETE http://localhost:3006/api/v1/orders/:id/permanent` - Requiere token de PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_platform_admin}
```
**Nota:** Elimina permanentemente el pedido de la base de datos (solo para administradores de plataforma)

---

### 🎉 EVENTOS Y PROMOCIONES (`/events`) - 9 endpoints

#### `POST http://localhost:3006/api/v1/events/create` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "nombre": "Descuento de Fin de Semana",
  "descripcion": "20% de descuento en todas las bebidas durante el fin de semana",
  "tipo": "DESCUENTO",
  "restaurantID": "507f1f77bcf86cd799439011",
  "descuentoTipo": "PORCENTAJE",
  "descuentoValor": 20,
  "fechaInicio": "2026-02-21T00:00:00Z",
  "fechaFin": "2026-02-22T23:59:59Z",
  "platosAplicables": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
  "condiciones": "Solo viernes y sábados a partir de las 6 PM",
  "compraMinima": 50,
  "cantidadMaximaUsos": 100
}
```
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Tipos válidos:** PROMOCION, DESCUENTO, COMBO, HAPPY_HOUR, EVENTO_ESPECIAL, OFERTA_TEMPORAL  
**Respuesta:** Evento creado con ID único y estado automático

#### `GET http://localhost:3006/api/v1/events/get` - Requiere token
```bash
Authorization: Bearer {token_de_usuario}
Query params (opcionales):
- restaurantID: "507f1f77bcf86cd799439011"
- tipo: "DESCUENTO" | "PROMOCION" | "COMBO" | "HAPPY_HOUR" | "EVENTO_ESPECIAL" | "OFERTA_TEMPORAL"
- estado: "ACTIVA" | "INACTIVA" | "FINALIZADA"
- vigentes: true (solo eventos vigentes)
- page: 1 (número de página)
- limit: 10 (items por página)
```
**Respuesta:** Lista de eventos con paginación e información del restaurante y platos

#### `GET http://localhost:3006/api/v1/events/restaurant/:restaurantID/vigentes` - Público
```bash
Parámetros:
- restaurantID: ID del restaurante
```
**Respuesta:** Eventos vigentes y activos del restaurante especificado

#### `GET http://localhost:3006/api/v1/events/:id` - Requiere token
```bash
Authorization: Bearer {token_de_usuario}
```
**Respuesta:** Detalles completos de un evento específico

#### `PUT http://localhost:3006/api/v1/events/:id` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```json
{
  "nombre": "Descuento Mejorado de Fin de Semana",
  "descripcion": "30% de descuento en todas las bebidas",
  "descuentoValor": 30,
  "fechaInicio": "2026-02-21T00:00:00Z",
  "fechaFin": "2026-02-23T23:59:59Z"
}
```
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Nota:** No se puede cambiar el restaurante o el usuario creador del evento

#### `PUT http://localhost:3006/api/v1/events/:id/activate` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Respuesta:** Evento activado

#### `PUT http://localhost:3006/api/v1/events/:id/deactivate` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Respuesta:** Evento desactivado

#### `POST http://localhost:3006/api/v1/events/:id/usar` - Requiere token
```bash
Authorization: Bearer {token_de_usuario}
```
**Nota:** Registra el uso de una promoción, incrementa contador y valida disponibilidad  
**Respuesta:** Confirmación con detalles del descuento aplicable

#### `DELETE http://localhost:3006/api/v1/events/:id` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}
```
**Nota:** Soft delete - marca el evento como inactivo sin eliminar registro

---
