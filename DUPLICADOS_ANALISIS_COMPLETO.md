# 📋 ANÁLISIS DE DUPLICADOS - PROYECTO GASTROFLOW

**Fecha**: Mayo 14, 2026  
**Proyecto**: GastroFlow  
**Servicios Analizados**: 
- `gastroflow-mongo-service`
- `gastroflow-postgres-service`

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Cantidad | Detalles |
|-----------|----------|----------|
| **Archivos IDÉNTICOS** | 25 | Código 100% duplicado |
| **Archivos MUY SIMILARES** | 4 | 90-98% duplicado, pequeñas variaciones |
| **Archivos COMPLETAMENTE DIFERENTES** | 2 | Lógica diferente según BD |
| **Total de Duplicados** | **31** | Oportunidad de consolidación |

---

## 🔴 ARCHIVOS COMPLETAMENTE IDÉNTICOS (25)

### 📁 HELPERS (7 archivos)

#### 1. `generate-jwt.js`
- **MongoDB**: `gastroflow-mongo-service/helper/generate-jwt.js`
- **PostgreSQL**: `gastroflow-postgres-service/helper/generate-jwt.js`
- **Contenido**: Funciones `generateJWT()` y `verifyJWT()`

#### 2. `role-constants.js`
- **MongoDB**: `gastroflow-mongo-service/helper/role-constants.js`
- **PostgreSQL**: `gastroflow-postgres-service/helper/role-constants.js`
- **Contenido**: Constantes ADMIN_ROLE, USER_ROLE, ALLOWED_ROLES

#### 3. `uuid-generator.js`
- **MongoDB**: `gastroflow-mongo-service/helper/uuid-generator.js`
- **PostgreSQL**: `gastroflow-postgres-service/helper/uuid-generator.js`
- **Contenido**: Generador de UUIDs cortos y funciones de validación

#### 4. `email-service.js`
- **MongoDB**: `gastroflow-mongo-service/helper/email-service.js`
- **PostgreSQL**: `gastroflow-postgres-service/helper/email-service.js`
- **Contenido**: Servicio completo de email con nodemailer
- **Funciones**: 
  - `initializeEmailService()`
  - `verificarConexionSMTP()`
  - `enviarEmailVerificacion()`
  - `enviarEmailResetPassword()`
  - `enviarEmailContraseñaCambiada()`

#### 5. `session-token-store.js`
- **MongoDB**: `gastroflow-mongo-service/helper/session-token-store.js`
- **PostgreSQL**: `gastroflow-postgres-service/helper/session-token-store.js`
- **Contenido**: Almacén en memoria de tokens revocados
- **Funciones**: `revokeTokenByJti()`, `isTokenJtiRevoked()`

#### 6. `inventory-helpers.js`
- **MongoDB**: `gastroflow-mongo-service/helper/inventory-helpers.js`
- **PostgreSQL**: `gastroflow-postgres-service/helper/inventory-helpers.js`
- **Contenido**: Funciones de gestión de inventario y disponibilidad
- **Funciones**: 
  - `verificarStockIngredientes()`
  - `actualizarDisponibilidadPlatos()`
  - `actualizarPlatosPorIngrediente()`

#### 7. `stock-engine.js`
- **MongoDB**: `gastroflow-mongo-service/helper/stock-engine.js`
- **PostgreSQL**: `gastroflow-postgres-service/helper/stock-engine.js`
- **Contenido**: Motor de cálculo de stock y requisisitos de ingredientes
- **Funciones**: 
  - `buildOrderIngredientRequirements()`
  - `getStockShortages()`
  - `consumeStockForOrder()`
  - `undoOrderStockConsumption()`

---

### 📁 UTILS (3 archivos)

#### 8. `auth-helpers.js`
- **MongoDB**: `gastroflow-mongo-service/utils/auth-helpers.js`
- **PostgreSQL**: `gastroflow-postgres-service/utils/auth-helpers.js`
- **Contenido**: Generadores de tokens de verificación y reset

#### 9. `password-utils.js`
- **MongoDB**: `gastroflow-mongo-service/utils/password-utils.js`
- **PostgreSQL**: `gastroflow-postgres-service/utils/password-utils.js`
- **Contenido**: Funciones de hash y verificación de contraseñas (bcrypt)

#### 10. `user-helpers.js`
- **MongoDB**: `gastroflow-mongo-service/utils/user-helpers.js`
- **PostgreSQL**: `gastroflow-postgres-service/utils/user-helpers.js`
- **Contenido**: Constructor de respuestas de usuario

---

### 📁 MIDDLEWARES - ERROR HANDLING (3 archivos)

#### 11. `error.middleware.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/error.middleware.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/error.middleware.js`

#### 12. `request-limit.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/request-limit.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/request-limit.js`
- **Contenido**: Rate limiting con express-rate-limit

#### 13. `server-genericError-handler.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/server-genericError-handler.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/server-genericError-handler.js`
- **Funciones**: `asyncHandler()`, `errorHandler()`, `notFound()`

---

### 📁 MIDDLEWARES - VALIDADORES (11 archivos)

#### 14. `coupon.validator.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/coupon.validator.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/coupon.validator.js`
- **Validaciones**: `validateCreateCoupon`, `validateUpdateCoupon`

#### 15. `event.validator.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/event.validator.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/event.validator.js`
- **Validaciones**: `validateCreateEvent`, `validateUpdateEvent`

#### 16. `invoice.validator.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/invoice.validator.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/invoice.validator.js`
- **Validaciones**: `validateCreateInvoice`, `validateInvoiceId`, `validateUpdateInvoiceStatus`

#### 17. `inventory.validator.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/inventory.validator.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/inventory.validator.js`
- **Validaciones**: `validateCreateInventory`, `validateUpdateInventory`

#### 18. `menu.validator.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/menu.validator.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/menu.validator.js`

#### 19. `mesa.validator.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/mesa.validator.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/mesa.validator.js`

#### 20. `order.validator.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/order.validator.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/order.validator.js`

#### 21. `reservation.validator.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/reservation.validator.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/reservation.validator.js`

#### 22. `restaurant.validator.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/restaurant.validator.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/restaurant.validator.js`

#### 23. `stock.middleware.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/stock.middleware.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/stock.middleware.js`
- **Funciones**: `validateStockAvailability()`, `validateUpdateOrderStock()`

#### 24. `auth.middleware.js`
- **MongoDB**: `gastroflow-mongo-service/middlewares/auth.middleware.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/auth.middleware.js`
- **Funciones**: `autenticar()`, `autorizarRole()`, `autenticarOpcional()`, `isAdmin()`, `isPlatformAdmin()`

---

### 📁 CONFIGURACIÓN (2 archivos)

#### 25. `index.js`
- **MongoDB**: `gastroflow-mongo-service/index.js`
- **PostgreSQL**: `gastroflow-postgres-service/index.js`
- **Contenido**: Entry point idéntico que importa y ejecuta `initServer()`

#### 26. `helmet-configuration.js`
- **MongoDB**: `gastroflow-mongo-service/configs/helmet-configuration.js`
- **PostgreSQL**: `gastroflow-postgres-service/configs/helmet-configuration.js`
- **Contenido**: Configuración de seguridad HTTP headers

---

## 🟡 ARCHIVOS MUY SIMILARES (90-98% duplicado)

### 1. `auth-operations.js` - 95% SIMILAR
- **MongoDB**: `gastroflow-mongo-service/helper/auth-operations.js`
- **PostgreSQL**: `gastroflow-postgres-service/helper/auth-operations.js`

**DIFERENCIA CLAVE**:
```javascript
// Solo en PostgreSQL (línea ~63-70):
// Asignar automáticamente el rol CLIENT a nuevos usuarios
try {
  await assignRoleToUser(newUser.Id, 'CLIENT');
  console.log(`✅ Rol CLIENT asignado al usuario ${newUser.Email}`);
} catch (roleError) {
  console.error(`⚠️  Error asignando rol CLIENT a ${newUser.Email}:`, roleError.message);
}
```

---

### 2. `validate-JWT.js` - 80% SIMILAR
- **MongoDB**: `gastroflow-mongo-service/middlewares/validate-JWT.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/validate-JWT.js`

**DIFERENCIAS CLAVE**:

```javascript
// MongoDB: Confía directamente en el JWT decodificado
req.usuario = {
  sub: decoded.sub,
  email: decoded.email,
  name: decoded.name,
  role: decoded.role,
  phone: decoded.phone
};

// PostgreSQL: Valida la existencia del usuario en BD
const user = await findUserById(decoded.sub);
if (!user) {
  return res.status(401).json({...});
}
if (!user.Status) {
  return res.status(423).json({...}); // Cuenta desactivada
}
req.user = user;
req.userId = user.Id.toString();
```

---

### 3. `cors-configuration.js` - 98% SIMILAR
- **MongoDB**: `gastroflow-mongo-service/configs/cors-configuration.js`
- **PostgreSQL**: `gastroflow-postgres-service/configs/cors-configuration.js`

**DIFERENCIA**:
```javascript
// MongoDB:
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3006',
  'http://localhost:3007',
  'http://localhost:5173',
];

// PostgreSQL (añade):
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3006',
  'http://localhost:3007',
  'http://localhost:5173',
  'http://localhost:5174',  // ← ADICIONAL
];
```

---

### 4. `platos.validator.js` - 92% SIMILAR
- **MongoDB**: `gastroflow-mongo-service/middlewares/platos.validator.js`
- **PostgreSQL**: `gastroflow-postgres-service/middlewares/platos.validator.js`

**DIFERENCIA**:
- MongoDB tiene `normalizeIngredientes` y `.customSanitizer()` en `validateCreatePlato`
- PostgreSQL tiene esta lógica en `validateUpdatePlato` y sin el sanitizador

---

## 🔵 ARCHIVOS COMPLETAMENTE DIFERENTES

### 1. `profile-operations.js` - LÓGICA DIFERENTE
- **MongoDB**: `gastroflow-mongo-service/helper/profile-operations.js`
  ```javascript
  export const getUserProfileHelper = async (userId) => {
    const err = new Error('Función no disponible en MongoDB service. Use PostgreSQL service.');
    err.status = 501;
    throw err;
  };
  ```

- **PostgreSQL**: `gastroflow-postgres-service/helper/profile-operations.js`
  ```javascript
  export const getUserProfileHelper = async (userId) => {
    const user = await findUserById(userId);
    if (!user) throw Error('Usuario no encontrado');
    return buildUserResponse(user);
  };
  ```

---

### 2. `createPlatformAdmin.js` - NO EXISTE EN MONGODB
- **MongoDB**: NO EXISTE
- **PostgreSQL**: `gastroflow-postgres-service/helper/createPlatformAdmin.js`
  - Incluye `seedBaseRoles()`
  - Usa transacciones Sequelize
  - Crea usuario admin de plataforma

---

## 📦 IMPORTS DUPLICADOS EN ARCHIVOS

Se encontraron imports idénticos en múltiples archivos de configuración. Ejemplos:

### `app.js` en ambos servicios:
```javascript
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { errorHandler, notFound } from '../middlewares/server-genericError-handler.js';
import { errorMiddleware } from '../middlewares/error.middleware.js';
import { initializeEmailService, verificarConexionSMTP } from '../helper/email-service.js';
import { setupSwagger } from './swagger.js';
```

---

## 🚨 RUTAS DUPLICADAS

### Rutas en ambos servicios:
```
/api/v1/health - IDÉNTICA (endpoint de salud)
```

### Rutas base del app.js:
```javascript
// MongoDB service:
app.use(`${BASE_PATH}/restaurants`, restaurantRoutes);
app.use(`${BASE_PATH}/mesas`, mesaRoutes);
app.use(`${BASE_PATH}/platos`, platosRoutes);
// ... 14 rutas comerciales diferentes

// PostgreSQL service:
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/users`, userRoutes);
app.use(`${BASE_PATH}/staff`, staffRoutes);
// ... 3 rutas de gestión de usuarios
```

**Conclusión**: Las rutas NO son duplicadas, son complementarias (separación de responsabilidades)

---

## 💡 RECOMENDACIONES

### Prioridad 1️⃣ - Consolidación Inmediata
Crear carpeta `/shared-helpers/` con los 25 archivos completamente idénticos:
- 7 helpers
- 3 utils
- 3 middlewares de error handling
- 11 validadores
- 1 configuración

**Impacto**: Reducción de ~3,500 líneas de código duplicado

### Prioridad 2️⃣ - Refactoring de Similares
Para `auth-operations.js` y `validate-JWT.js`:
- Crear versión base con hooks/callbacks
- Parametrizar según tipo de BD

**Impacto**: Reducción de ~200 líneas adicionales

### Prioridad 3️⃣ - Unificar CORS
Crear configuración centralizada con soporte para múltiples origins según entorno

### Prioridad 4️⃣ - Documentación
- Mantener archivo de mapeo en `/shared-helpers/README.md`
- Actualizar references en ambos servicios

---

## 📝 NOTAS IMPORTANTES

1. **Servicios tienen responsabilidades distintas**:
   - MongoDB: Lógica comercial (restaurantes, platos, mesas, órdenes)
   - PostgreSQL: Gestión de usuarios y autenticación

2. **Los duplicados son por arquitectura de microservicios**:
   - No hay comunicación entre servicios para compartir código
   - Cada uno es completamente independiente

3. **Oportunidad de mejora**:
   - Crear paquete NPM compartido (`@gastroflow/shared`)
   - O usar monorepo structure (pnpm workspaces ya está configurado)

---

## 🔗 REFERENCIAS CRUZADAS

### Archivos que importan duplicados:
- `configs/app.js` en ambos servicios
- Múltiples rutas en `/src/*/` importan desde helpers

### Configuración duplicada:
- `package.json` tiene dependencias idénticas en ambos servicios
- `pnpm-lock.yaml` es similar en estructura

---

**Fin del análisis**
