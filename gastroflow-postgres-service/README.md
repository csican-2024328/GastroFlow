# GastroFlow - Sistema de Gestión de Restaurantes

## 📋 Descripción General
GastroFlow es una plataforma completa de gestión para restaurantes que permite administrar menús, reservas, pedidos, mesas e inventario. El sistema diferencia entre dos tipos de usuarios: Administrador y Usuario Regular, cada uno con permisos y funcionalidades específicas.

---

## 🔐 Credenciales de Inicio

**Administrador:**
- Username: admin
- Email: admin@gastroflow.local
- Password: Admin@1234!

---

## ⚙️ Configuración Técnica

### 📚 Documentación API (Swagger UI)

Con el servidor corriendo, la documentación interactiva está disponible en:

- `http://localhost:3006/swagger`

Si usas otro puerto, reemplaza `3006` por el valor de `PORT` en tu `.env`.

### ⚠️ IMPORTANTE
Crear archivo `.env` con las credenciales necesarias (no se sube al repositorio por seguridad)

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
SMTP_PORT=465
SMTP_ENABLE_SSL=true
SMTP_USERNAME=narutoshippude745@gmail.com
SMTP_PASSWORD=rhcs dgno ywts egrt
EMAIL_FROM=narutoshippude745@gmail.com
EMAIL_FROM_NAME=AuthDotnet App
 
# Verification Tokens (en horas)
VERIFICATION_EMAIL_EXPIRY_HOURS=24
PASSWORD_RESET_EXPIRY_HOURS=1
 
# Frontend URL (para enlaces en emails)
FRONTEND_URL=http://localhost:5173
 
# Cloudinary (upload de imágenes de restaurantes, platos y perfiles)
# Requiere: crear cuenta en https://cloudinary.com/ y obtener credenciales
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# Carpetas para organización:
# - gastrflow/restaurantes (fotos de restaurantes)
# - gastrflow/platos (fotos de platos)
 
# File Upload (alternativa local)
UPLOAD_PATH=./uploads
 
# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:3006
ADMIN_ALLOWED_ORIGINS=http://localhost:5173
```

---

# 📖 MANUAL DE USUARIO

## PARTE 1: MANUAL DEL ADMINISTRADOR

El Administrador es el usuario con máximos permisos en GastroFlow. Tiene control total sobre toda la plataforma, incluyendo la gestión de restaurantes, usuarios, reportes y configuraciones globales.

### ✅ QUÉ PUEDE HACER EL ADMINISTRADOR

#### 1. **Gestión de Restaurantes**
El administrador puede crear, editar y eliminar restaurantes en la plataforma.

**Cómo hacerlo:**
- Accede al menú "Restaurantes" en el panel principal
- Haz clic en "Crear Nuevo Restaurante"
- Completa los campos requeridos:
  - Nombre del restaurante
  - Descripción
  - Dirección
  - Teléfono de contacto
  - Foto del restaurante (se sube a Cloudinary)
  - Horarios de operación
  - Número de mesas disponibles
- Guarda los cambios

**Editar un restaurante:**
- Selecciona el restaurante de la lista
- Haz clic en "Editar"
- Modifica los datos necesarios
- Guarda los cambios

#### 2. **Gestión de Usuarios**
El administrador puede crear, modificar y eliminar usuarios en el sistema. Puede asignar roles y permisos.

**Crear un usuario:**
- Ve a "Gestión de Usuarios"
- Haz clic en "Agregar Usuario"
- Completa:
  - Nombre completo
  - Email
  - Teléfono
  - Rol (Administrador, Gerente, Mesero, etc.)
  - Contraseña
- El sistema envía un email de verificación al usuario
- Guarda el nuevo usuario

**Modificar datos de usuario:**
- Busca el usuario en la lista
- Haz clic en "Editar"
- Cambia los datos necesarios
- Guarda los cambios

**Cambiar rol de usuario:**
- Selecciona el usuario
- Asigna un nuevo rol
- Guarda

#### 3. **Gestión de Menús y Platos**
El administrador gestiona los menús de cada restaurante y los platos disponibles.

**Crear un menú:**
- Selecciona un restaurante
- Ve a "Menús"
- Haz clic en "Crear Menú"
- Asigna un nombre al menú (Almuerzo, Cena, etc.)
- Define fechas de disponibilidad
- Guarda

**Agregar platos al menú:**
- Selecciona el menú
- Haz clic en "Agregar Plato"
- Completa los datos:
  - Nombre del plato
  - Descripción
  - Precio
  - Foto del plato
  - Categoría (Entrada, Plato Principal, Postre, etc.)
  - Ingredientes
  - Disponibilidad
- Guarda el plato

**Editar o eliminar platos:**
- Selecciona el plato
- Haz clic en "Editar" o "Eliminar"
- Realiza los cambios o confirma la eliminación

#### 4. **Gestión de Mesas**
El administrador puede crear y configurar mesas en los restaurantes.

**Agregar una mesa:**
- Selecciona un restaurante
- Ve a "Mesas"
- Haz clic en "Crear Mesa"
- Asigna:
  - Número de mesa
  - Capacidad (número de personas)
  - Ubicación en el restaurante
  - Estado (Disponible, Ocupada, Mantenimiento)
- Guarda

**Modificar estado de mesa:**
- Selecciona la mesa
- Cambia su estado según sea necesario
- Actualiza

#### 5. **Gestión de Inventario**
El administrador controla el inventario de ingredientes y productos.

**Crear un ítem de inventario:**
- Ve a "Inventario"
- Haz clic en "Agregar Artículo"
- Completa:
  - Nombre del artículo
  - Categoría
  - Cantidad actual
  - Unidad de medida (kg, litros, unidades, etc.)
  - Precio unitario
  - Proveedor
- Guarda

**Actualizar inventario:**
- Selecciona el artículo
- Modifica la cantidad disponible
- Registra la razón del cambio (Compra, Uso, Devolución, etc.)
- Guarda

**Ver historial de inventario:**
- Selecciona un artículo
- Haz clic en "Historial"
- Visualiza todos los cambios realizados

#### 6. **Gestión de Pedidos**
El administrador puede visualizar, modificar y cancelar pedidos de toda la plataforma.

**Ver pedidos:**
- Ve a "Pedidos"
- Visualiza todos los pedidos del sistema con filtros disponibles:
  - Por fecha
  - Por restaurante
  - Por estado (Pendiente, En Preparación, Listo, Cancelado)
  - Por usuario

**Cambiar estado de pedido:**
- Selecciona un pedido
- Cambia su estado
- Los cambios se sincronizarán con el usuario

**Cancelar pedido:**
- Selecciona el pedido
- Haz clic en "Cancelar"
- Proporciona una razón de cancelación
- Confirma

#### 7. **Gestión de Reservas**
El administrador gestiona todas las reservas realizadas en los restaurantes.

**Ver reservas:**
- Ve a "Reservas"
- Visualiza todas las reservas con información:
  - Fecha y hora
  - Número de personas
  - Usuario que realizó la reserva
  - Estado (Confirmada, Cancelada, Completada)

**Confirmar reserva:**
- Selecciona una reserva pendiente
- Haz clic en "Confirmar"
- Asigna una mesa si es necesario
- Guarda

**Cancelar reserva:**
- Selecciona la reserva
- Haz clic en "Cancelar"
- Añade una nota si es necesario
- Confirma la cancelación

#### 8. **Gestión de Cupones y Promociones**
El administrador crea cupones de descuento para atraer clientes.

**Crear un cupón:**
- Ve a "Cupones"
- Haz clic en "Crear Cupón"
- Define:
  - Código del cupón
  - Porcentaje o monto de descuento
  - Cantidad de usos permitidos
  - Cantidad de usos por usuario
  - Fecha de expiración
  - Restaurantes aplicables
  - Monto mínimo de compra (opcional)
- Guarda

**Desactivar cupón:**
- Selecciona el cupón
- Haz clic en "Desactivar"
- Confirma

#### 9. **Ver Reportes y Análisis**
El administrador accede a reportes detallados del sistema.

**Reportes disponibles:**
- **Demanda de Restaurantes**: Muestra cuáles son los restaurantes más populares
- **Top de Platos**: Los platos más vendidos
- **Ingresos**: Análisis de ingresos totales por período
- **Horas Pico**: Identifica cuándo hay mayor demanda
- **Reservaciones**: Estadísticas de reservas
- **Desempeño de Restaurante**: Métricas específicas por restaurante (Requiere seleccionar restaurante)
- **Ocupación**: Análisis de ocupación de mesas (Requiere seleccionar restaurante)
- **Clientes Frecuentes**: Lista de clientes más activos (Requiere seleccionar restaurante)
- **Pedidos Recurrentes**: Patrones de compra de clientes (Requiere seleccionar restaurante)

**Cómo acceder a reportes:**
- Ve al menú "Reportes"
- Selecciona el tipo de reporte
- Elige el período de tiempo si aplica
- Visualiza o descarga en PDF o Excel

#### 10. **Gestión de Eventos**
El administrador puede crear eventos especiales en los restaurantes.

**Crear un evento:**
- Ve a "Eventos"
- Haz clic en "Crear Evento"
- Completa:
  - Nombre del evento
  - Descripción
  - Fecha y hora
  - Restaurante asociado
  - Número de lugares disponibles
  - Precio (si aplica)
  - Foto del evento
- Guarda

#### 11. **Exportar Datos**

**Exportar a PDF:**
- En cualquier reporte, haz clic en "Descargar PDF"
- El archivo se descargará automáticamente

**Exportar a Excel:**
- En cualquier reporte, haz clic en "Descargar Excel"
- Compatible con Microsoft Excel y Google Sheets

### ❌ QUÉ NO PUEDE HACER EL ADMINISTRADOR

- **No puede editar perfiles de otros administradores** (solo su propio perfil)
- **No puede cambiar credenciales de acceso de otros administradores** sin autorización especial
- **No puede borrar el historial completo de pedidos** (por auditoría y compliance)
- **No puede revertir cambios de inventario sin registro** (todos los cambios quedan registrados)
- **No puede crear promociones que pierdan dinero al restaurante** (el sistema valida márgenes)
- **No puede acceder a información de pagos procesados fuera del sistema**

---

## PARTE 2: MANUAL DEL USUARIO REGULAR

El Usuario Regular es un cliente de GastroFlow que puede realizar pedidos, hacer reservas, ver menús y gestionar su perfil personal.

### ✅ QUÉ PUEDE HACER EL USUARIO REGULAR

#### 1. **Registrarse en la Plataforma**

**Paso a paso:**
- Ve a la página de inicio de GastroFlow
- Haz clic en "Crear Cuenta"
- Completa el formulario de registro con:
  - Nombre completo
  - Email (válido y único)
  - Número de teléfono
  - Contraseña (mínimo 8 caracteres, mayúscula, minúscula, número, carácter especial)
  - Confirmar contraseña
- Acepta los términos y condiciones
- Haz clic en "Registrarse"
- Recibirás un email de verificación
- Haz clic en el enlace del email para confirmar tu cuenta
- ¡Tu cuenta está lista!

**¿Olvidaste tu contraseña?**
- En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?"
- Ingresa tu email
- Recibirás un enlace para resetear tu contraseña
- Sigue las instrucciones del email
- Crea una nueva contraseña
- Inicia sesión con la nueva contraseña

#### 2. **Gestionar Perfil Personal**

**Acceder al perfil:**
- Inicia sesión
- Haz clic en tu nombre en la esquina superior derecha
- Selecciona "Mi Perfil"

**Editar información personal:**
- En tu perfil, haz clic en "Editar Perfil"
- Modifica:
  - Nombre
  - Teléfono
  - Dirección
  - Foto de perfil (se sube a Cloudinary)
- Haz clic en "Guardar Cambios"

**Cambiar contraseña:**
- Ve a "Mi Perfil"
- Haz clic en "Cambiar Contraseña"
- Ingresa tu contraseña actual
- Ingresa la nueva contraseña (mínimo 8 caracteres)
- Confirma la nueva contraseña
- Haz clic en "Actualizar"

**Gestionar Direcciones:**
- En el menú del perfil, ve a "Mis Direcciones"
- Haz clic en "Agregar Dirección"
- Completa:
  - Tipo de dirección (Casa, Oficina, Otro)
  - Dirección completa
  - Teléfono de referencia
  - Indicaciones adicionales
- Guarda
- Puedes marcar una dirección como "Principal"
- Para futuras compras, se usará la dirección principal por defecto

#### 3. **Explorar Restaurantes**

**Buscar restaurantes:**
- En la página principal, visualiza la lista de restaurantes disponibles
- Usa la barra de búsqueda para buscar por nombre
- Filtra por:
  - Categoría de comida
  - Calificación
  - Horario abierto
  - Distancia desde tu ubicación

**Ver detalles del restaurante:**
- Haz clic en un restaurante
- Visualiza:
  - Descripción y fotos
  - Horario de operación
  - Teléfono de contacto
  - Dirección
  - Calificación y reseñas de otros usuarios
  - Menú disponible

**Guardar favoritos:**
- En la página del restaurante, haz clic en el icono de corazón
- El restaurante se agregará a "Mis Favoritos"
- Accede a tus favoritos desde "Mi Perfil" > "Restaurantes Favoritos"

#### 4. **Ver Menú y Platos**

**Acceder al menú:**
- Selecciona un restaurante
- Visualiza automáticamente el menú disponible para hoy
- Si hay múltiples menús (Almuerzo, Cena, etc.), selecciona el que desees

**Filtrar platos:**
- Usa los filtros disponibles:
  - Por categoría (Entrada, Plato Principal, Postre, Bebida)
  - Por precio
  - Búsqueda rápida por nombre

**Ver detalle de un plato:**
- Haz clic en un plato
- Visualiza:
  - Descripción completa
  - Foto de alta calidad
  - Precio
  - Ingredientes
  - Información nutricional (si disponible)
  - Calificaciones de otros usuarios

#### 5. **Realizar Pedidos**

**Paso a paso para hacer un pedido:**

1. **Selecciona el restaurante:**
   - Navega a la lista de restaurantes
   - Elige el restaurante donde deseas ordenar

2. **Escoge los platos:**
   - Busca los platos que deseas
   - Haz clic en "Agregar al Carrito"
   - Especifica la cantidad
   - Si hay opciones (tamaño, ingredientes adicionales), selecciónalas

3. **Revisa tu carrito:**
   - Haz clic en el icono del carrito
   - Visualiza:
     - Subtotal
     - Impuestos
     - Costo de envío (si aplica)
     - Total a pagar
   - Ajusta cantidades si es necesario

4. **Aplica cupón de descuento (opcional):**
   - En el carrito, hay un campo "Código de Cupón"
   - Ingresa tu código de cupón
   - Haz clic en "Aplicar"
   - El descuento se reflejará automáticamente

5. **Proceder al checkout:**
   - Haz clic en "Proceder al Pago"
   - Verifica tu dirección de entrega (aparecerá tu dirección principal)
   - Si necesitas cambiar dirección, haz clic en "Seleccionar Otra Dirección"

6. **Selecciona método de entrega:**
   - A domicilio (incluye costo de envío)
   - Recoger en el restaurante (sin costo de envío)

7. **Realiza el pago:**
   - Selecciona tu método de pago
   - Sigue las instrucciones de seguridad
   - Confirma el pago

8. **Recibe confirmación:**
   - Recibirás un email con los detalles del pedido
   - Número de pedido
   - Hora estimada de entrega
   - Puedes rastrear tu pedido en tiempo real

**Rastrear tu pedido:**
- Ve a "Mis Pedidos"
- Selecciona el pedido activo
- Visualiza:
  - Estado actual (Preparando, En camino, Entregado)
  - Ubicación del repartidor (si aplica)
  - Tiempo restante estimado
  - Detalles del repartidor (nombre y teléfono)

**Cancelar un pedido:**
- Ve a "Mis Pedidos"
- Selecciona el pedido (solo si aún no ha iniciado la preparación)
- Haz clic en "Cancelar Pedido"
- Proporciona una razón (opcional)
- Confirma la cancelación
- Se procesará un reembolso en 3-5 días hábiles

#### 6. **Hacer Reservas**

**Crear una reserva:**

1. **Selecciona el restaurante:**
   - Elige el restaurante donde deseas reservar
   - Haz clic en "Hacer Reserva"

2. **Completa los detalles:**
   - Fecha de la reserva
   - Hora de la reserva
   - Número de personas

3. **Selecciona preferencias:**
   - Tipo de mesa (esquina, ventana, regular) si disponible
   - Notas especiales (cumpleaños, ocasión especial, preferencias dietéticas)

4. **Confirma y paga:**
   - Revisa el resumen
   - Si la reserva requiere depósito, realiza el pago
   - Haz clic en "Confirmar Reserva"

5. **Recibe confirmación:**
   - Recibirás email con:
     - Número de confirmación
     - Detalles de la reserva
     - Código QR para presentar en el restaurante

**Gestionar tus reservas:**
- Ve a "Mis Reservas"
- Visualiza todas tus reservas actuales y pasadas
- Puedes ver el estado (Confirmada, Cancelada, Completada)

**Modificar una reserva:**
- Selecciona una reserva (solo si está confirmada y no es hoy)
- Haz clic en "Editar"
- Cambia la fecha, hora o número de personas
- Guarda los cambios

**Cancelar una reserva:**
- Selecciona la reserva
- Haz clic en "Cancelar Reserva"
- Ingresa una razón (opcional)
- Confirma
- Se te reembolsará según la política de cancelación del restaurante

#### 7. **Calificar y Reseñar**

**Dejar una reseña de un plato:**
- Después de recibir tu pedido, ve a "Mis Pedidos"
- Selecciona el pedido completado
- Haz clic en "Calificar Platos"
- Para cada plato:
  - Asigna una calificación (1-5 estrellas)
  - Escribe tu opinión
  - Haz clic en "Enviar Reseña"

**Dejar una reseña del restaurante:**
- Ve a la página del restaurante
- Haz clic en "Escribir Reseña"
- Completa:
  - Calificación general (1-5 estrellas)
  - Categorías (Comida, Servicio, Ambiente)
  - Comentario detallado
- Haz clic en "Publicar"

**Ver tus reseñas:**
- Ve a "Mi Perfil"
- Haz clic en "Mis Reseñas"
- Visualiza todas las reseñas que has escrito
- Puedes editar o eliminar reseñas recientes

#### 8. **Historial de Pedidos**

**Acceder al historial:**
- Ve a "Mi Perfil"
- Haz clic en "Mis Pedidos"
- Visualiza todos tus pedidos históricos

**Información disponible:**
- Fecha y hora del pedido
- Restaurante
- Platos ordenados
- Monto total
- Estado del pedido
- Número de referencia

**Repetir un pedido:**
- En el historial, haz clic en un pedido anterior
- Haz clic en "Repetir Este Pedido"
- Se cargarán los mismos platos en tu carrito
- Procede al pago como de costumbre

#### 9. **Usar Cupones y Promociones**

**Obtener cupones:**
- Los cupones pueden venir a través de:
  - Email de promociones
  - Invitationes especiales
  - Recompensas por compras anteriores
  - Promociones del restaurante

**Cómo usar un cupón:**
- Ten el código del cupón
- Ve a tu carrito de compras
- En el campo "Código de Cupón", ingresa el código
- Haz clic en "Aplicar"
- Si es válido, verás el descuento reflejado automáticamente
- Procede al pago

**Verificar tus cupones:**
- Ve a "Mi Perfil"
- Haz clic en "Mis Cupones"
- Visualiza todos los cupones disponibles con:
  - Código
  - Descuento
  - Fecha de expiración
  - Restricciones (si aplica)

#### 10. **Notificaciones y Preferencias**

**Gestionar notificaciones:**
- Ve a "Mi Perfil"
- Haz clic en "Configuración"
- Selecciona "Notificaciones"
- Activa o desactiva:
  - Notificaciones de pedidos
  - Notificaciones de reservas
  - Promociones y ofertas
  - Nuevas reseñas de tus comentarios
  - Email de marketing

**Métodos de notificación:**
- Puedes recibir notificaciones por:
  - SMS (requiere verificación de teléfono)
  - Email
  - Notificaciones push (en la app)

### ❌ QUÉ NO PUEDE HACER EL USUARIO REGULAR

- **No puede acceder a información de otros usuarios** (privacidad protegida)
- **No puede crear ni editar restaurantes** (solo administradores pueden)
- **No puede ver informes detallados de las ganancias de un restaurante**
- **No puede cambiar precios de platos**
- **No puede crear cupones** (solo administradores)
- **No puede ver detalles de pago de otros usuarios**
- **No puede acceder a la sección de administración**
- **No puede eliminar su cuenta directamente** (debe contactar soporte)
- **No puede hacer pedidos para otros usuarios** con su cuenta (cada usuario es responsable de su propia cuenta)
- **No puede acceder a conversaciones de otros usuarios**

---

## 📊 Reportes - Guía de Exportación

### Exportación PDF

1. GET http://localhost:3006/api/v1/reports/exportar/reporte/demanda-restaurantes/pdf
2. GET http://localhost:3006/api/v1/reports/exportar/reporte/top-platos/pdf
3. GET http://localhost:3006/api/v1/reports/exportar/reporte/ingresos/pdf
4. GET http://localhost:3006/api/v1/reports/exportar/reporte/horas-pico/pdf
5. GET http://localhost:3006/api/v1/reports/exportar/reporte/reservaciones/pdf
6. GET http://localhost:3006/api/v1/reports/exportar/reporte/desempeno-restaurante/pdf (requiere restaurantID)
7. GET http://localhost:3006/api/v1/reports/exportar/reporte/ocupacion/pdf (requiere restaurantID)
8. GET http://localhost:3006/api/v1/reports/exportar/reporte/clientes-frecuentes/pdf (requiere restaurantID)
9. GET http://localhost:3006/api/v1/reports/exportar/reporte/pedidos-recurrentes/pdf (requiere restaurantID)

### Exportación Excel (CSV compatible)

10. GET http://localhost:3006/api/v1/reports/exportar/reporte/demanda-restaurantes/excel
11. GET http://localhost:3006/api/v1/reports/exportar/reporte/top-platos/excel
12. GET http://localhost:3006/api/v1/reports/exportar/reporte/ingresos/excel
13. GET http://localhost:3006/api/v1/reports/exportar/reporte/horas-pico/excel
14. GET http://localhost:3006/api/v1/reports/exportar/reporte/reservaciones/excel
15. GET http://localhost:3006/api/v1/reports/exportar/reporte/desempeno-restaurante/excel (requiere restaurantID)
16. GET http://localhost:3006/api/v1/reports/exportar/reporte/ocupacion/excel (requiere restaurantID)
17. GET http://localhost:3006/api/v1/reports/exportar/reporte/clientes-frecuentes/excel (requiere restaurantID)
18. GET http://localhost:3006/api/v1/reports/exportar/reporte/pedidos-recurrentes/excel (requiere restaurantID)

---

# 🔌 EJEMPLOS API CON JSON

Esta sección muestra ejemplos prácticos de peticiones y respuestas en JSON para las principales funcionalidades, tanto para Administrador como para Usuario Regular.

## PARTE 1: EJEMPLOS PARA ADMINISTRADOR

### 1️⃣ **Crear un Restaurante (Admin)**

**¿Qué hace?** El administrador crea un nuevo restaurante en el sistema con toda su información.

**Cómo se hace:** Envía una petición POST a la API con los datos del restaurante

**Petición (POST):**
```json
POST /api/v1/restaurants/create
Content-Type: application/json
Authorization: Bearer {token_admin}

{
  "name": "La Bella Italia",
  "description": "Restaurante italiano con auténticas recetas tradicionales",
  "address": "Calle Principal 123, Ciudad",
  "phone": "+1-555-0123",
  "email": "info@bellaitalia.com",
  "photo_url": "https://cloudinary.com/image.jpg",
  "opening_time": "10:00",
  "closing_time": "23:00",
  "total_tables": 25,
  "cuisine_type": "Italiana"
}
```

**Respuesta Esperada (201 Created):**
```json
{
  "success": true,
  "message": "Restaurante creado exitosamente",
  "data": {
    "id": "60d5ec49c1234567890abcde",
    "name": "La Bella Italia",
    "description": "Restaurante italiano con auténticas recetas tradicionales",
    "address": "Calle Principal 123, Ciudad",
    "phone": "+1-555-0123",
    "email": "info@bellaitalia.com",
    "photo_url": "https://cloudinary.com/image.jpg",
    "opening_time": "10:00",
    "closing_time": "23:00",
    "total_tables": 25,
    "cuisine_type": "Italiana",
    "created_at": "2026-03-01T10:30:45Z",
    "status": "active"
  }
}
```

**¿Resultado esperado?**
✅ El restaurante aparecerá en la plataforma y estará disponible para que los usuarios hagan pedidos y reservas

---

### 2️⃣ **Crear un Usuario (Admin)**

**¿Qué hace?** El administrador crea una nueva cuenta de usuario en el sistema.

**Cómo se hace:** Envía una petición POST con los datos del nuevo usuario

**Petición (POST):**
```json
POST /api/v1/users/create
Content-Type: application/json
Authorization: Bearer {token_admin}

{
  "full_name": "Juan García López",
  "email": "juan.garcia@example.com",
  "phone": "+1-555-0456",
  "role": "mesero",
  "password": "SecurePass@123",
  "restaurant_id": "60d5ec49c1234567890abcde"
}
```

**Respuesta Esperada (201 Created):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente. Se ha enviado email de verificación",
  "data": {
    "id": "60d5ec49c1234567890abcdf",
    "full_name": "Juan García López",
    "email": "juan.garcia@example.com",
    "phone": "+1-555-0456",
    "role": "mesero",
    "restaurant_id": "60d5ec49c1234567890abcde",
    "email_verified": false,
    "created_at": "2026-03-01T10:35:20Z",
    "status": "active"
  }
}
```

**¿Resultado esperado?**
✅ El usuario recibe un email de verificación y puede acceder al sistema una vez confirme su email

---

### 3️⃣ **Agregar Plato al Menú (Admin)**

**¿Qué hace?** El administrador añade un nuevo plato a un menú del restaurante.

**Cómo se hace:** Envía una petición POST con los datos del plato

**Petición (POST):**
```json
POST /api/v1/platos/create
Content-Type: application/json
Authorization: Bearer {token_admin}

{
  "menu_id": "60d5ec49c1234567890abce0",
  "restaurant_id": "60d5ec49c1234567890abcde",
  "name": "Spaghetti Carbonara",
  "description": "Delicioso spaghetti con salsa de huevo, queso y tocino",
  "price": 18.50,
  "category": "Plato Principal",
  "photo_url": "https://cloudinary.com/platos/spaghetti.jpg",
  "ingredients": ["Spaghetti", "Huevo", "Queso Parmesano", "Tocino", "Pimienta"],
  "available": true,
  "stock": 50
}
```

**Respuesta Esperada (201 Created):**
```json
{
  "success": true,
  "message": "Plato agregado al menú exitosamente",
  "data": {
    "id": "60d5ec49c1234567890abce1",
    "menu_id": "60d5ec49c1234567890abce0",
    "name": "Spaghetti Carbonara",
    "description": "Delicioso spaghetti con salsa de huevo, queso y tocino",
    "price": 18.50,
    "category": "Plato Principal",
    "photo_url": "https://cloudinary.com/platos/spaghetti.jpg",
    "ingredients": ["Spaghetti", "Huevo", "Queso Parmesano", "Tocino", "Pimienta"],
    "available": true,
    "stock": 50,
    "rating": 0,
    "reviews_count": 0,
    "created_at": "2026-03-01T10:40:15Z"
  }
}
```

**¿Resultado esperado?**
✅ El plato aparece en el menú y los clientes pueden ordenarlo

---

### 4️⃣ **Crear Cupón de Descuento (Admin)**

**¿Qué hace?** El administrador crea un código de descuento para atraer clientes.

**Cómo se hace:** Envía una petición POST con los detalles del cupón

**Petición (POST):**
```json
POST /api/v1/coupons/create
Content-Type: application/json
Authorization: Bearer {token_admin}

{
  "code": "DESCUENTO20",
  "discount_type": "percentage",
  "discount_value": 20,
  "max_uses": 100,
  "max_uses_per_user": 1,
  "expiration_date": "2026-12-31",
  "min_order_amount": 25.00,
  "restaurant_ids": ["60d5ec49c1234567890abcde", "60d5ec49c1234567890abce2"],
  "active": true
}
```

**Respuesta Esperada (201 Created):**
```json
{
  "success": true,
  "message": "Cupón creado exitosamente",
  "data": {
    "id": "60d5ec49c1234567890abce3",
    "code": "DESCUENTO20",
    "discount_type": "percentage",
    "discount_value": 20,
    "max_uses": 100,
    "current_uses": 0,
    "max_uses_per_user": 1,
    "expiration_date": "2026-12-31",
    "min_order_amount": 25.00,
    "restaurant_ids": ["60d5ec49c1234567890abcde", "60d5ec49c1234567890abce2"],
    "active": true,
    "created_at": "2026-03-01T10:45:30Z"
  }
}
```

**¿Resultado esperado?**
✅ Los clientes pueden usar el código "DESCUENTO20" para obtener 20% de descuento en sus compras

---

### 5️⃣ **Ver Reportes de Ingresos (Admin)**

**¿Qué hace?** El administrador consulta un reporte de ingresos del sistema.

**Cómo se hace:** Envía una petición GET con los parámetros del período

**Petición (GET):**
```json
GET /api/v1/reports/ingresos?start_date=2026-02-01&end_date=2026-03-01&restaurant_id=60d5ec49c1234567890abcde
Content-Type: application/json
Authorization: Bearer {token_admin}
```

**Respuesta Esperada (200 OK):**
```json
{
  "success": true,
  "message": "Reporte de ingresos obtenido",
  "data": {
    "period": {
      "start_date": "2026-02-01",
      "end_date": "2026-03-01"
    },
    "restaurant_id": "60d5ec49c1234567890abcde",
    "restaurant_name": "La Bella Italia",
    "total_income": 15750.50,
    "total_orders": 342,
    "average_order_value": 46.04,
    "daily_breakdown": [
      {
        "date": "2026-03-01",
        "income": 1245.75,
        "orders": 28
      },
      {
        "date": "2026-02-28",
        "income": 1189.30,
        "orders": 26
      }
    ],
    "commission_charged": 1575.05,
    "net_income": 14175.45
  }
}
```

**¿Resultado esperado?**
✅ El admin ve el análisis completo de ingresos y puede tomar decisiones comerciales basadas en datos reales

---

## PARTE 2: EJEMPLOS PARA USUARIO REGULAR

### 1️⃣ **Registrarse en la Plataforma (Usuario)**

**¿Qué hace?** Un nuevo usuario crea su cuenta en GastroFlow.

**Cómo se hace:** Envía una petición POST con sus datos personales

**Petición (POST):**
```json
POST /api/v1/auth/register
Content-Type: application/json

{
  "full_name": "María Rodríguez",
  "email": "maria.rodriguez@email.com",
  "phone": "+1-555-0789",
  "password": "MySecurePass@2026",
  "terms_accepted": true
}
```

**Respuesta Esperada (201 Created):**
```json
{
  "success": true,
  "message": "Cuenta creada exitosamente. Por favor, verifica tu email",
  "data": {
    "id": "60d5ec49c1234567890abce4",
    "full_name": "María Rodríguez",
    "email": "maria.rodriguez@email.com",
    "phone": "+1-555-0789",
    "email_verified": false,
    "created_at": "2026-03-01T11:00:00Z",
    "status": "pending_verification"
  }
}
```

**¿Resultado esperado?**
✅ El usuario recibe un email con un enlace para verificar su cuenta

---

### 2️⃣ **Iniciar Sesión (Usuario)**

**¿Qué hace?** El usuario accede a su cuenta en la plataforma.

**Cómo se hace:** Envía su email y contraseña

**Petición (POST):**
```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "maria.rodriguez@email.com",
  "password": "MySecurePass@2026"
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "success": true,
  "message": "Sesión iniciada exitosamente",
  "data": {
    "user": {
      "id": "60d5ec49c1234567890abce4",
      "full_name": "María Rodríguez",
      "email": "maria.rodriguez@email.com",
      "phone": "+1-555-0789",
      "profile_picture": null,
      "email_verified": true
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 1800
    }
  }
}
```

**¿Resultado esperado?**
✅ El usuario accede a su cuenta y recibe un token para realizar acciones

---

### 3️⃣ **Agregar Plato al Carrito (Usuario)**

**¿Qué hace?** El usuario selecciona un plato y lo añade a su carrito de compra.

**Cómo se hace:** Envía una petición POST con el ID del plato y cantidad

**Petición (POST):**
```json
POST /api/v1/orders/cart/add
Content-Type: application/json
Authorization: Bearer {token_usuario}

{
  "plato_id": "60d5ec49c1234567890abce1",
  "quantity": 2,
  "restaurant_id": "60d5ec49c1234567890abcde",
  "special_instructions": "Sin ajo, por favor"
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "success": true,
  "message": "Plato agregado al carrito",
  "data": {
    "cart": {
      "cart_id": "60d5ec49c1234567890abce5",
      "restaurant_id": "60d5ec49c1234567890abcde",
      "restaurant_name": "La Bella Italia",
      "items": [
        {
          "plato_id": "60d5ec49c1234567890abce1",
          "plato_name": "Spaghetti Carbonara",
          "quantity": 2,
          "unit_price": 18.50,
          "subtotal": 37.00,
          "special_instructions": "Sin ajo, por favor"
        }
      ],
      "subtotal": 37.00,
      "tax": 3.70,
      "total": 40.70,
      "item_count": 2
    }
  }
}
```

**¿Resultado esperado?**
✅ El plato aparece en el carrito y se calcula automáticamente el total

---

### 4️⃣ **Aplicar Cupón de Descuento (Usuario)**

**¿Qué hace?** El usuario aplica un código de descuento a su carrito.

**Cómo se hace:** Envía el código de cupón

**Petición (POST):**
```json
POST /api/v1/orders/cart/apply-coupon
Content-Type: application/json
Authorization: Bearer {token_usuario}

{
  "cart_id": "60d5ec49c1234567890abce5",
  "coupon_code": "DESCUENTO20"
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "success": true,
  "message": "Cupón aplicado correctamente",
  "data": {
    "cart": {
      "cart_id": "60d5ec49c1234567890abce5",
      "items": [
        {
          "plato_id": "60d5ec49c1234567890abce1",
          "plato_name": "Spaghetti Carbonara",
          "quantity": 2,
          "unit_price": 18.50,
          "subtotal": 37.00
        }
      ],
      "subtotal": 37.00,
      "coupon_applied": {
        "code": "DESCUENTO20",
        "discount_type": "percentage",
        "discount_value": 20,
        "discount_amount": 7.40
      },
      "tax": 5.88,
      "total": 35.48
    }
  }
}
```

**¿Resultado esperado?**
✅ El descuento se aplica automáticamente y el total se recalcula

---

### 5️⃣ **Realizar Pedido (Usuario)**

**¿Qué hace?** El usuario completa la compra y realiza el pago del pedido.

**Cómo se hace:** Envía los detalles finales del pedido y método de pago

**Petición (POST):**
```json
POST /api/v1/orders/create
Content-Type: application/json
Authorization: Bearer {token_usuario}

{
  "cart_id": "60d5ec49c1234567890abce5",
  "delivery_address": {
    "street": "Calle Secundaria 456",
    "city": "Ciudad",
    "zip_code": "12345",
    "phone": "+1-555-0789"
  },
  "delivery_type": "a_domicilio",
  "payment_method": "credit_card",
  "payment_details": {
    "card_token": "tok_visa_4242",
    "card_last_four": "4242"
  },
  "estimated_delivery": "2026-03-01T12:30:00Z"
}
```

**Respuesta Esperada (201 Created):**
```json
{
  "success": true,
  "message": "Pedido realizado exitosamente",
  "data": {
    "order": {
      "id": "60d5ec49c1234567890abce6",
      "order_number": "PED-20260301-001",
      "restaurant_id": "60d5ec49c1234567890abcde",
      "restaurant_name": "La Bella Italia",
      "user_id": "60d5ec49c1234567890abce4",
      "items": [
        {
          "plato_id": "60d5ec49c1234567890abce1",
          "plato_name": "Spaghetti Carbonara",
          "quantity": 2,
          "unit_price": 18.50,
          "subtotal": 37.00
        }
      ],
      "subtotal": 37.00,
      "discount_applied": 7.40,
      "tax": 5.88,
      "delivery_fee": 2.00,
      "total": 37.48,
      "payment_method": "credit_card",
      "delivery_type": "a_domicilio",
      "delivery_address": "Calle Secundaria 456, Ciudad",
      "status": "confirmed",
      "estimated_delivery": "2026-03-01T12:30:00Z",
      "created_at": "2026-03-01T11:05:00Z",
      "tracking_url": "https://gastroflow.com/track/PED-20260301-001"
    }
  }
}
```

**¿Resultado esperado?**
✅ El pedido se crea, el pago se procesa y el usuario recibe confirmación por email con número de pedido

---

### 6️⃣ **Rastrear Pedido (Usuario)**

**¿Qué hace?** El usuario consulta el estado y ubicación de su pedido en tiempo real.

**Cómo se hace:** Envía una petición GET con el ID del pedido

**Petición (GET):**
```json
GET /api/v1/orders/60d5ec49c1234567890abce6/track
Content-Type: application/json
Authorization: Bearer {token_usuario}
```

**Respuesta Esperada (200 OK):**
```json
{
  "success": true,
  "message": "Información de rastreo obtenida",
  "data": {
    "order": {
      "id": "60d5ec49c1234567890abce6",
      "order_number": "PED-20260301-001",
      "status": "en_camino",
      "current_step": 3,
      "steps": [
        {
          "step": 1,
          "name": "Pedido Confirmado",
          "status": "completed",
          "timestamp": "2026-03-01T11:05:00Z"
        },
        {
          "step": 2,
          "name": "Preparando",
          "status": "completed",
          "timestamp": "2026-03-01T11:20:00Z"
        },
        {
          "step": 3,
          "name": "En Camino",
          "status": "in_progress",
          "timestamp": "2026-03-01T11:35:00Z"
        },
        {
          "step": 4,
          "name": "Entregado",
          "status": "pending",
          "expected_time": "2026-03-01T12:30:00Z"
        }
      ],
      "delivery_person": {
        "name": "Carlos Mendoza",
        "phone": "+1-555-9999",
        "vehicle": "Moto - Placa XYZ123"
      },
      "current_location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "Avenida Central, esquina Principal"
      },
      "estimated_delivery": "2026-03-01T12:30:00Z",
      "remaining_minutes": 25
    }
  }
}
```

**¿Resultado esperado?**
✅ El usuario ve el estado actual, ubicación del repartidor y tiempo estimado de llegada

---

### 7️⃣ **Hacer Reserva (Usuario)**

**¿Qué hace?** El usuario reserva una mesa en un restaurante para una fecha y hora específica.

**Cómo se hace:** Envía los detalles de la reserva

**Petición (POST):**
```json
POST /api/v1/reservations/create
Content-Type: application/json
Authorization: Bearer {token_usuario}

{
  "restaurant_id": "60d5ec49c1234567890abcde",
  "reservation_date": "2026-03-15",
  "reservation_time": "19:30",
  "party_size": 4,
  "table_preference": "ventana",
  "special_notes": "Es un cumpleaños, sorpresa especial",
  "contact_phone": "+1-555-0789"
}
```

**Respuesta Esperada (201 Created):**
```json
{
  "success": true,
  "message": "Reserva realizada exitosamente",
  "data": {
    "reservation": {
      "id": "60d5ec49c1234567890abce7",
      "reservation_number": "RES-20260315-001",
      "restaurant_id": "60d5ec49c1234567890abcde",
      "restaurant_name": "La Bella Italia",
      "user_id": "60d5ec49c1234567890abce4",
      "reservation_date": "2026-03-15",
      "reservation_time": "19:30",
      "party_size": 4,
      "table_preference": "ventana",
      "assigned_table": "Mesa 12",
      "special_notes": "Es un cumpleaños, sorpresa especial",
      "status": "confirmed",
      "qr_code": "https://api.gastroflow.com/qr/RES-20260315-001",
      "confirmation_code": "ABC123XYZ",
      "created_at": "2026-03-01T11:10:00Z",
      "confirmation_email_sent": true
    }
  }
}
```

**¿Resultado esperado?**
✅ La reserva se confirma, se asigna mesa y se envía email con código QR para presentar

---

### 8️⃣ **Dejar Reseña de Plato (Usuario)**

**¿Qué hace?** El usuario califica un plato que ya ha recibido.

**Cómo se hace:** Envía la calificación y comentario

**Petición (POST):**
```json
POST /api/v1/reviews/plato/create
Content-Type: application/json
Authorization: Bearer {token_usuario}

{
  "order_id": "60d5ec49c1234567890abce6",
  "plato_id": "60d5ec49c1234567890abce1",
  "rating": 5,
  "title": "¡Excelente spaghetti!",
  "comment": "El Spaghetti Carbonara estaba delicioso, bien presentado y con ingredientes frescos. Sin duda vuelvo a pedir.",
  "verified_purchase": true
}
```

**Respuesta Esperada (201 Created):**
```json
{
  "success": true,
  "message": "Reseña publicada exitosamente",
  "data": {
    "review": {
      "id": "60d5ec49c1234567890abce8",
      "order_id": "60d5ec49c1234567890abce6",
      "plato_id": "60d5ec49c1234567890abce1",
      "user_id": "60d5ec49c1234567890abce4",
      "user_name": "María Rodríguez",
      "rating": 5,
      "title": "¡Excelente spaghetti!",
      "comment": "El Spaghetti Carbonara estaba delicioso, bien presentado y con ingredientes frescos. Sin duda vuelvo a pedir.",
      "verified_purchase": true,
      "helpful_count": 0,
      "created_at": "2026-03-01T13:00:00Z"
    }
  }
}
```

**¿Resultado esperado?**
✅ La reseña se publica y ayuda a otros clientes a tomar decisiones informadas

---

### 9️⃣ **Ver Historial de Pedidos (Usuario)**

**¿Qué hace?** El usuario visualiza todos sus pedidos realizados.

**Cómo se hace:** Envía una petición GET

**Petición (GET):**
```json
GET /api/v1/users/me/orders?limit=10&offset=0&status=all
Content-Type: application/json
Authorization: Bearer {token_usuario}
```

**Respuesta Esperada (200 OK):**
```json
{
  "success": true,
  "message": "Historial de pedidos obtenido",
  "data": {
    "total_orders": 15,
    "orders": [
      {
        "id": "60d5ec49c1234567890abce6",
        "order_number": "PED-20260301-001",
        "restaurant_id": "60d5ec49c1234567890abcde",
        "restaurant_name": "La Bella Italia",
        "total": 37.48,
        "items_count": 2,
        "status": "delivered",
        "delivery_date": "2026-03-01T12:30:00Z",
        "reviewed": true
      },
      {
        "id": "60d5ec49c1234567890abce9",
        "order_number": "PED-20260228-005",
        "restaurant_id": "60d5ec49c1234567890abce2",
        "restaurant_name": "La Casa del Tacos",
        "total": 24.99,
        "items_count": 4,
        "status": "delivered",
        "delivery_date": "2026-02-28T18:45:00Z",
        "reviewed": false
      }
    ]
  }
}
```

**¿Resultado esperado?**
✅ El usuario ve todos sus pedidos previos, puede repetir ordenes y dejar reseñas

---

### 🔟 **Cambiar Contraseña (Usuario)**

**¿Qué hace?** El usuario actualiza su contraseña de acceso.

**Cómo se hace:** Envía la contraseña actual y la nueva

**Petición (POST):**
```json
POST /api/v1/auth/change-password
Content-Type: application/json
Authorization: Bearer {token_usuario}

{
  "current_password": "MySecurePass@2026",
  "new_password": "NewSecurePass@2026",
  "confirm_password": "NewSecurePass@2026"
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": {
    "user_id": "60d5ec49c1234567890abce4",
    "email": "maria.rodriguez@email.com",
    "password_updated_at": "2026-03-01T11:15:00Z",
    "message": "Se requiere iniciar sesión nuevamente con la nueva contraseña"
  }
}
```

**¿Resultado esperado?**
✅ La contraseña se actualiza y el usuario puede acceder con su nueva contraseña

---

## 📌 Resumen de Códigos de Respuesta

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| 200 | OK - Petición exitosa | Obtener datos, actualizar |
| 201 | Created - Recurso creado exitosamente | Crear usuario, pedido, etc |
| 400 | Bad Request - Error en los datos enviados | Datos incompletos o inválidos |
| 401 | Unauthorized - Token inválido o expirado | Token no proporcionado |
| 403 | Forbidden - Sin permiso para la acción | Admin intenta usar función de usuario |
| 404 | Not Found - Recurso no encontrado | Pedido o usuario inexistente |
| 409 | Conflict - Violación de restricción unique | Email ya registrado |
| 422 | Unprocessable Entity - Validación fallida | Formato de email inválido |
| 500 | Internal Server Error - Error del servidor | Error inesperado en la API |

---

## 🔐 Autenticación y Tokens

**Todos los endpoints protegidos requieren un token JWT en el header:**

```json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Duración de tokens:**
- Access Token: 30 minutos
- Refresh Token: 7 días

Si tu token expira, usa el refresh token para obtener uno nuevo:

```json
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Versión:** 1.0  
**Última actualización:** Marzo 2026
