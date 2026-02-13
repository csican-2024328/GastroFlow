# 🍽️ GastroFlow - Backend API

Sistema de gestión de restaurantes con autenticación JWT, verificación de email y roles basados en acceso.

## 📋 Requisitos Previos

- Node.js v25+
- pnpm o npm
- MongoDB local o remoto
- Gmail SMTP configurado (para envío de emails)

## ⚡ Instalación y Ejecución

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor en desarrollo
pnpm run dev

# Puerto por defecto: 3006
```

## 🔑 Configuración `.env`

```env
NODE_ENV=development
PORT=3006

# Base de datos
URI_MONGO=mongodb://localhost:27017/GastroFlow

# JWT
JWT_SECRET=MyVerySecretKeyForJWTTokenAuthenticationWith256Bits!
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=AuthService
JWT_AUDIENCE=AuthService

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENABLE_SSL=true
SMTP_USERNAME=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password

# Frontend
FRONTEND_URL=http://localhost:5173

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:3006
```

---

## 🗂️ Estructura del Proyecto

```
GastroFlow/
├── src/
│   ├── User/              # Autenticación y usuarios
│   ├── Restaurant/        # Gestión de restaurantes
│   ├── Platos/           # Gestión de platos/menú
│   ├── Mesas/            # Gestión de mesas
│   └── utils/
├── configs/              # Configuración del servidor
├── middlewares/          # Middlewares de autenticación y validación
├── helper/               # Servicios auxiliares (emails)
├── index.js
└── .env
```

---

## 📍 Rutas API

### 🔐 **AUTENTICACIÓN** (`/api/auth`)

#### Públicas (sin token)

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| `POST` | `/registro` | Registrar nuevo usuario | `{ name, surname, email, password, phone, role }` |
| `POST` | `/login` | Iniciar sesión | `{ email, password }` |
| `POST` | `/verificar-email` | Verificar email del usuario | `{ token }` o `?token=...` |
| `POST` | `/refresh` | Obtener nuevo access token | `{ refreshToken }` |
| `POST` | `/olvide-contraseña` | Solicitar reset de contraseña | `{ email }` |
| `PUT` | `/reset-contraseña/:token` | Resetear contraseña | `{ password }` |

#### Privadas (requieren `Authorization: Bearer {token}`)

| Método | Ruta | Descripción | Requiere |
|--------|------|-------------|----------|
| `GET` | `/me` | Obtener perfil del usuario autenticado | Token válido |
| `PUT` | `/actualizar` | Actualizar datos del perfil | Token válido |
| `PUT` | `/cambiar-contraseña` | Cambiar contraseña | Token válido |
| `POST` | `/logout` | Cerrar sesión | Token válido |

---

### 🏢 **RESTAURANTES** (`/api/restaurants`)

| Método | Ruta | Descripción | Requiere |
|--------|------|-------------|----------|
| `POST` | `/create` | Crear nuevo restaurante | `{ name, email, phone, address, city, openingHours }` |
| `GET` | `/get` | Obtener todos los restaurantes | - |
| `GET` | `/:id` | Obtener restaurante por ID | - |
| `PUT` | `/:id` | Actualizar restaurante | Token (ADMIN) |
| `PUT` | `/:id/activate` | Activar restaurante | Token (ADMIN) |
| `PUT` | `/:id/deactivate` | Desactivar restaurante | Token (ADMIN) |

---

### 🍴 **PLATOS/MENÚ** (`/api/platos`)

| Método | Ruta | Descripción | Requiere |
|--------|------|-------------|----------|
| `POST` | `/create` | Crear nuevo plato | Token (ADMIN) + multipart/form-data (imagen) |
| `GET` | `/get` | Obtener todos los platos | - |
| `GET` | `/:id` | Obtener plato por ID | - |
| `GET` | `/menu/:restaurantID` | Obtener menú del restaurante | - |
| `PUT` | `/:id` | Actualizar plato | Token (ADMIN) + multipart/form-data (imagen) |
| `PUT` | `/:id/activate` | Activar plato | Token (ADMIN) |
| `PUT` | `/:id/deactivate` | Desactivar plato | Token (ADMIN) |

---

### 📊 **MESAS** (`/api/mesas`)

| Método | Ruta | Descripción | Requiere |
|--------|------|-------------|----------|
| `POST` | `/create` | Crear nueva mesa | Token (ADMIN) |
| `GET` | `/get` | Obtener todas las mesas | - |
| `GET` | `/:id` | Obtener mesa por ID | - |
| `PUT` | `/:id` | Actualizar mesa | Token (ADMIN) |
| `DELETE` | `/:id` | Eliminar mesa | Token (ADMIN) |

---

## 🔐 Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| `CLIENT` | Cliente que reserva y comenta |
| `RESTAURANT_ADMIN` | Administrador de restaurante |
| `PLATFORM_ADMIN` | Administrador de plataforma |


---

## 📧 Sistema de Emails

- ✅ **Verificación de Email** - Se envía al registrarse
- ✅ **Bienvenida** - Se envía al verificar email
- ✅ **Reset de Contraseña** - Se envía al solicitar reset
- ✅ **Cambio de Contraseña** - Se envía al cambiar contraseña

**Nota:** En modo `DEVELOPMENT`, los emails se loguean en la consola.

---

## 🧪 Ejemplos de Peticiones en Postman

### 1️⃣ Registrarse

```http
POST http://localhost:3006/api/auth/registro
Content-Type: application/json

{
  "name": "Juan",
  "surname": "Pérez",
  "email": "juan@example.com",
  "password": "Password123!",
  "phone": "50212345678",
  "role": "CLIENT"
}
```

### 2️⃣ Verificar Email

```http
POST http://localhost:3006/api/auth/verificar-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3️⃣ Iniciar Sesión

```http
POST http://localhost:3006/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

### 4️⃣ Obtener Perfil (con token)

```http
GET http://localhost:3006/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5️⃣ Crear Restaurante

```http
POST http://localhost:3006/api/restaurants/create
Authorization: Bearer {token_de_admin}
Content-Type: application/json

{
  "name": "Mi Restaurante",
  "email": "admin@restaurante.com",
  "phone": "50212345678",
  "address": "Calle Principal 123",
  "city": "Ciudad de Guatemala"
}
```

### 6️⃣ Crear Plato con Imagen

```http
POST http://localhost:3006/api/platos/create
Authorization: Bearer {token_de_admin}
Content-Type: multipart/form-data

Form-data:
- nombre: "Tacos al Pastor"
- descripcion: "Deliciosos tacos"
- precio: 35.50
- imagen: [archivo.jpg]
```

---

## 📱 Estados de Cuenta

| Estado | Descripción |
|--------|-------------|
| `INACTIVO` | Creado pero email no verificado (por defecto) |
| `ACTIVO` | Email verificado y cuenta activa |
| `SUSPENDIDO` | Suspendida por administrador |

---

## ⚠️ Códigos de Error

| Código | Significado |
|--------|-----------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado |
| `400` | Bad Request - Datos inválidos |
| `401` | Unauthorized - Token inválido/expirado |
| `403` | Forbidden - No tienes permiso |
| `404` | Not Found - Recurso no encontrado |
| `409` | Conflict - Recurso duplicado |
| `500` | Server Error - Error del servidor |

---

## 🔄 Flujo de Autenticación

```
1. REGISTRO → Status: INACTIVO, emailVerified: false
   ↓
2. VERIFICAR EMAIL → Status: ACTIVO, emailVerified: true
   ↓
3. LOGIN → Token de acceso + Refresh token
   ↓
4. USAR RUTAS PROTEGIDAS → Con Authorization header
```

---

## 📦 Dependencias Principales

- `express` - Framework web
- `mongodb` + `mongoose` - Base de datos
- `jsonwebtoken` - Autenticación JWT
- `bcryptjs` - Hash de contraseñas
- `nodemailer` - Envío de emails
- `cors` - Control de CORS
- `dotenv` - Variables de entorno

---

## 👨‍💻 Desarrollo

**Servidor en watch mode:**
```bash
pnpm run dev
```


