# GastroFlow API

## Total de Endpoints: 28

## Configuración Importante
⚠️ **IMPORTANTE**: Crear archivo `.env` con las credenciales necesarias (no se sube al repositorio por seguridad)

### 📝 Contenido del archivo `.env`

Copia este contenido en un archivo `.env` en la raíz del proyecto:

```env
NODE_ENV = development
PORT = 3006

URI_MONGO=mongodb://localhost:27017/GastroFlow

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

## � Flujo de Activación de Cuenta

1. **Al registrarse**: La cuenta se crea con `status: "INACTIVO"` y `emailVerified: false`
2. **Se envía email**: Con un token de verificación (válido 24 horas)
3. **Al verificar email**: La cuenta cambia a `status: "ACTIVO"` y `emailVerified: true`
4. **Login permitido**: Solo después de verificar el email

⚠️ **Importante**: No puedes hacer login si no has verificado tu email primero.

---

## �📍 Endpoints Funcionales

### 🔐 AUTENTICACIÓN (`/api/auth`) - 10 endpoints

#### `POST /api/auth/registro` - Público
```json
{
  "name": "Juan",
  "surname": "Pérez",
  "email": "juan@example.com",
  "password": "Password123!",
  "phone": "50212345678",
  "role": "CLIENT"
}
```
📧 **Nota**: Al registrarse, la cuenta queda con `status: "INACTIVO"`. Debes verificar el email para activarla.

#### `POST /api/auth/login` - Público
```json
{
  "email": "juan@example.com",
  "password": "Password123!"
}
```
⚠️ **Nota**: Solo funciona si el email ha sido verificado. Si no, recibirás un error 403.

#### `POST /api/auth/verificar-email` - Público
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
También puedes usar: `GET /api/auth/verificar-email?token=...`

✅ **Nota**: Este endpoint cambia el `status: "ACTIVO"` y permite hacer login.

#### `POST /api/auth/refresh` - Público
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/auth/olvide-contraseña` - Público
```json
{
  "email": "juan@example.com"
}
```

#### `PUT /api/auth/reset-contraseña/:token` - Público
```json
{
  "password": "NuevaPassword123!"
}
```

#### `GET /api/auth/me` - Requiere token de USUARIO
```bash
Authorization: Bearer {token_de_cualquier_usuario}
```

#### `PUT /api/auth/actualizar` - Requiere token de USUARIO
```json
{
  "name": "Juan Carlos",
  "surname": "Pérez López",
  "phone": "50212345679"
}
```
```bash
Authorization: Bearer {token_de_usuario}
```

#### `PUT /api/auth/cambiar-contraseña` - Requiere token de USUARIO
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NuevaPassword456!"
}
```
```bash
Authorization: Bearer {token_de_usuario}
```

#### `POST /api/auth/logout` - Requiere token de USUARIO
```bash
Authorization: Bearer {token_de_usuario}
```
Sin body necesario.

---

### 🏢 RESTAURANTES (`/api/restaurants`) - 6 endpoints

#### `POST /api/restaurants/create` - Requiere token de ADMIN
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
Authorization: Bearer {token_de_admin}
```

#### `GET /api/restaurants/get` - Público
Sin autenticación requerida.

#### `GET /api/restaurants/:id` - Público
Sin autenticación requerida.

#### `PUT /api/restaurants/:id` - Requiere token de ADMIN
```json
{
  "name": "Restaurante Actualizado",
  "email": "nuevo@restaurante.com",
  "phone": "50287654321",
  "address": "Avenida Central 456",
  "city": "Antigua Guatemala"
}
```
```bash
Authorization: Bearer {token_de_admin}
```

#### `PUT /api/restaurants/:id/activate` - Requiere token de ADMIN
```bash
Authorization: Bearer {token_de_admin}
```
Sin body necesario.

#### `PUT /api/restaurants/:id/deactivate` - Requiere token de ADMIN
```bash
Authorization: Bearer {token_de_admin}
```
Sin body necesario.

---

### 🍴 PLATOS/MENÚ (`/api/platos`) - 7 endpoints

#### `POST /api/platos/create` - Requiere token de ADMIN
```bash
Content-Type: multipart/form-data
Authorization: Bearer {token_de_admin}

Form data:
- nombre: "Tacos al Pastor"
- descripcion: "Deliciosos tacos con piña"
- precio: 35.50
- categoria: "Comida Mexicana"
- restaurantID: "507f1f77bcf86cd799439011"
- ingredientes: ["tortilla", "cerdo", "piña", "cilantro"]
- image: [archivo.jpg]
```

#### `GET /api/platos/get` - Público
Sin autenticación requerida.

#### `GET /api/platos/:id` - Público
Sin autenticación requerida.

#### `GET /api/platos/menu/:restaurantID` - Público
Sin autenticación requerida.

#### `PUT /api/platos/:id` - Requiere token de ADMIN
```bash
Content-Type: multipart/form-data
Authorization: Bearer {token_de_admin}

Form data:
- nombre: "Tacos Premium"
- descripcion: "Tacos mejorados"
- precio: 45.00
- categoria: "Comida Mexicana"
- image: [nuevo_archivo.jpg] (opcional)
```

#### `PUT /api/platos/:id/activate` - Requiere token de ADMIN
```bash
Authorization: Bearer {token_de_admin}
```
Sin body necesario.

#### `PUT /api/platos/:id/deactivate` - Requiere token de ADMIN
```bash
Authorization: Bearer {token_de_admin}
```
Sin body necesario.

---

### 📊 MESAS (`/api/mesas`) - 5 endpoints

#### `POST /api/mesas/create` - Requiere token de ADMIN
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
Authorization: Bearer {token_de_admin}
```

#### `GET /api/mesas/get` - Público
Sin autenticación requerida.

#### `GET /api/mesas/:id` - Público
Sin autenticación requerida.

#### `PUT /api/mesas/:id` - Requiere token de ADMIN
```json
{
  "number": 5,
  "capacity": 6,
  "location": "Terraza VIP",
  "isActive": true
}
```
```bash
Authorization: Bearer {token_de_admin}
```

#### `DELETE /api/mesas/:id` - Requiere token de ADMIN
```bash
Authorization: Bearer {token_de_admin}
```
Sin body necesario.


