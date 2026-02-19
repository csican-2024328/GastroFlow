# GastroFlow API

## Total de Endpoints (activos): 27

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

### ❤️ HEALTH

#### `GET http://localhost:3006/api/v1/health` - Publico

---

### 🍴 PLATOS/MENU (`/platos`) - 7 endpoints

#### `POST http://localhost:3006/api/v1/platos/create` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Content-Type: multipart/form-data
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}

Form data:
- nombre: "Tacos al Pastor"
- descripcion: "Deliciosos tacos con pina"
- precio: 35.50
- categoria: "FUERTE"
- restaurantID: "507f1f77bcf86cd799439011"
- ingredientes: ["tortilla", "cerdo", "pina", "cilantro"]
- image: [archivo.jpg]
```

#### `GET http://localhost:3006/api/v1/platos/get` - Publico

#### `GET http://localhost:3006/api/v1/platos/:id` - Publico

#### `GET http://localhost:3006/api/v1/platos/menu/:restaurantID` - Publico

#### `PUT http://localhost:3006/api/v1/platos/:id` - Requiere token de RESTAURANT_ADMIN o PLATFORM_ADMIN
```bash
Content-Type: multipart/form-data
Authorization: Bearer {token_de_restaurant_admin_o_platform_admin}

Form data:
- nombre: "Tacos Premium"
- descripcion: "Tacos mejorados"
- precio: 45.00
- categoria: "FUERTE"
- image: [nuevo_archivo.jpg] (opcional)
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
  "number": 5,
  "capacity": 4,
  "location": "Terraza",
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
  "number": 5,
  "capacity": 6,
  "location": "Terraza VIP",
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
#### `GET /api/platos/:id` - Público

Sin autenticación requerida.

