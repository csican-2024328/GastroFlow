# 🛒 Sistema de Órdenes - Guía de Implementación

## Descripción General

Se ha implementado un sistema completo de órdenes para que los clientes puedan hacer pedidos a través de la interfaz pública de GastroFlow. El sistema incluye:

1. **Flujo guiado de 3 pasos** con un stepper visual atractivo
2. **Validación de stock** antes de crear la orden
3. **Carrito de compras** con gestión de artículos
4. **Soporte para múltiples tipos de pedido**: En mesa, A domicilio, Para llevar
5. **Aplicación de cupones** (opcional)
6. **Cálculo automático de totales** con impuestos y descuentos
7. **Resumen visual** antes de confirmar

---

## 📁 Estructura de Carpetas

```
src/
├── features/
│   ├── orders/                           # ✨ Nuevo módulo de órdenes
│   │   ├── components/
│   │   │   ├── OrderFlowModal.jsx        # Modal principal del flujo
│   │   │   ├── StepperOrderFlow.jsx      # Stepper visual (3 pasos)
│   │   │   └── steps/
│   │   │       ├── StepSelectTable.jsx   # Paso 1: Seleccionar mesa
│   │   │       ├── StepBuildCart.jsx     # Paso 2: Armar carrito
│   │   │       └── StepConfirmOrder.jsx  # Paso 3: Confirmar pedido
│   │   ├── pages/
│   │   │   └── ClientOrdersPage.jsx      # Página principal de órdenes
│   │   ├── store/
│   │   │   ├── useOrderStore.js          # Store para estado de órdenes
│   │   │   └── useOrderCartStore.js      # Store para carrito temporal
│   │   └── index.js                      # Exportaciones
│   ├── dishes/
│   │   └── store/
│   │       └── useMenuStore.js           # ✨ Nuevo store para menús
│   └── ...
├── shared/
│   └── api/
│       ├── orderService.js               # ✨ Nuevo servicio de órdenes
│       ├── menuService.js                # ✨ Nuevo servicio de menús
│       └── ...
└── app/
    └── router/
        └── AppRoutes.jsx                 # ✨ Ruta agregada: /cliente/pedidos
```

---

## 🔌 Endpoints Consumidos

### Órdenes
- **POST `/api/v1/orders/check-stock`** - Valida disponibilidad de stock
- **POST `/api/v1/orders/create`** - Crea una nueva orden
- **GET `/api/v1/orders/mine`** - Obtiene órdenes del cliente autenticado
- **GET `/api/v1/orders/mine/:id`** - Obtiene detalle de una orden

### Menús (nuevo)
- **GET `/api/v1/menus/get`** - Obtiene menús del restaurante

### Platos (existente)
- **GET `/api/v1/platos/get`** - Obtiene platos del restaurante

### Mesas (existente)
- **GET `/api/v1/mesas`** - Obtiene mesas disponibles

---

## 🎯 Flujo de Órdenes (3 Pasos)

### **Paso 1: Seleccionar Mesa** 🪑
- Usuario selecciona tipo de pedido:
  - **En Mesa**: Requiere seleccionar una mesa disponible
  - **A Domicilio**: Requiere dirección (se solicita en paso 3)
  - **Para Llevar**: Requiere hora de retiro (se solicita en paso 3)
- El stepper indica progreso visual

### **Paso 2: Armar Pedido** 🛒
- Tabs separadas: **Platos** y **Menús**
- Carrito en tiempo real con:
  - Cantidad ajustable
  - Subtotal por artículo
  - Opción de remover artículos
- Resumen en vivo: Subtotal, Impuesto (19%), Total
- Validación: Mínimo 1 artículo requerido

### **Paso 3: Confirmar Pedido** ✓
- **Resumen completo**:
  - Tipo de pedido y mesa (si aplica)
  - Lista de artículos
  - Cálculo de totales
- **Información del cliente**:
  - Nombre * (obligatorio)
  - Teléfono * (obligatorio)
  - Email (opcional)
  - Dirección (solo A Domicilio)
  - Hora de retiro (solo Para Llevar)
- **Cupón** (opcional)
- **Notas especiales** (alergias, preferencias)
- **Validación de stock** antes de confirmar
- **Creación de orden** con confirmación

---

## 🎨 Componentes Principales

### `OrderFlowModal`
Modal principal que contiene todo el flujo. Props:
- `isOpen`: boolean - Controla visibilidad
- `onClose`: function - Callback al cerrar
- `restaurantId`: string - ID del restaurante seleccionado

### `StepperOrderFlow`
Indicador visual del progreso con 3 pasos. Se actualiza automáticamente según el step actual.

### `StepSelectTable`
Paso 1: Selección de mesa y tipo de pedido. Features:
- Filtrado automático de mesas disponibles
- Vista visual amigable
- Validación antes de continuar

### `StepBuildCart`
Paso 2: Construcción del carrito. Features:
- Tabs para platos y menús
- Scroll en grid de artículos
- Carrito con suma automática
- Cantidad editable directamente

### `StepConfirmOrder`
Paso 3: Confirmación final. Features:
- Resumen visual completo
- Campos de validación (nombre, teléfono)
- Campos condicionales (dirección, hora)
- Botones de acción: Validar Stock, Confirmar Pedido

---

## 📦 Stores Zustand

### `useOrderCartStore`
Gestiona el estado temporal del carrito durante la sesión:

```javascript
// Estado
currentStep         // 1, 2, o 3
selectedMesa        // Mesa seleccionada
restaurantId        // ID del restaurante
items[]             // Artículos en carrito
clientName          // Nombre del cliente
clientPhone         // Teléfono del cliente
couponCode          // Código de cupón
orderType           // EN_MESA, A_DOMICILIO, PARA_LLEVAR
discount            // Descuento aplicado
notes               // Notas especiales

// Métodos
addItem()           // Agregar artículo al carrito
removeItem()        // Remover artículo
updateItemQuantity()// Actualizar cantidad
setCurrentStep()    // Avanzar/retroceder pasos
getSubtotal()       // Calcular subtotal
getDiscount()       // Calcular descuento
getTax()            // Calcular impuestos
getTotal()          // Calcular total final
resetCart()         // Limpiar carrito
```

### `useOrderStore`
Gestiona órdenes y comunicación con backend:

```javascript
// Estado
orders[]            // Órdenes del cliente
selectedOrder       // Orden seleccionada
loading             // Estado de carga
error               // Mensaje de error
stockErrors[]       // Items sin stock
pagination          // Paginación de órdenes

// Métodos
checkStock()        // Validar disponibilidad
createOrderAction() // Crear nueva orden
fetchClientOrders() // Obtener órdenes del cliente
fetchOrderById()    // Obtener detalle de orden
clearError()        // Limpiar errores
```

---

## 🔑 Características Destacadas

### ✅ Validación de Stock
```javascript
// Se ejecuta antes de crear la orden
const response = await checkStock(restaurantId, items);
if (!response.success) {
  // Mostrar items sin stock
  const faltantes = response.faltantes;
}
```

### ✅ Cálculo de Totales
```javascript
Subtotal = sum(cantidad * precioUnitario)
Descuento = subtotal * (descuento%) o descuento fijo
Base Imponible = Subtotal - Descuento
Impuesto = Base * 19%
Total = Base Imponible + Impuesto
```

### ✅ Validación de Campos
- **Nombre**: 2-100 caracteres
- **Teléfono**: Requerido
- **Mesa**: Requerida solo para EN_MESA
- **Dirección**: Requerida solo para A_DOMICILIO
- **Hora de Retiro**: Requerida solo para PARA_LLEVAR
- **Mínimo de Artículos**: 1

### ✅ Tipos de Pedido
| Tipo | Requerimientos | Campos Adicionales |
|------|----------------|-------------------|
| EN_MESA | Mesa disponible | Mesa ID |
| A_DOMICILIO | Dirección de entrega | clienteDireccion |
| PARA_LLEVAR | Hora de retiro | horaProgramada |

---

## 🚀 Cómo Usar

### Para Usuarios (Clientes)
1. **Acceder a Pedidos**:
   - Ir a `/cliente` (Mi Cuenta)
   - Hacer clic en "🛒 Hacer un Pedido" o "📦 Mis Pedidos"

2. **Hacer un Pedido**:
   - Seleccionar restaurante
   - **Paso 1**: Elegir tipo de pedido y mesa (si aplica)
   - **Paso 2**: Agregar artículos al carrito
   - **Paso 3**: Confirmar datos y crear pedido

3. **Ver Mis Pedidos**:
   - Consultar estado de pedidos recientes
   - Ver historial completo

### Para Desarrolladores

#### Importar Componentes
```javascript
import { OrderFlowModal, ClientOrdersPage } from '@/features/orders';
import { useOrderCartStore, useOrderStore } from '@/features/orders';
```

#### Usar el Carrito en Otro Componente
```javascript
import { useOrderCartStore } from '@/features/orders';

function MyComponent() {
  const items = useOrderCartStore((s) => s.items);
  const addItem = useOrderCartStore((s) => s.addItem);
  
  return (
    <button onClick={() => addItem({
      tipo: 'PLATO',
      id: '123',
      nombre: 'Pizza',
      precioUnitario: 15.99,
      cantidad: 1
    })}>
      Agregar Artículo
    </button>
  );
}
```

#### Crear Una Orden Programáticamente
```javascript
import { useOrderStore } from '@/features/orders';

const orderStore = useOrderStore();

const result = await orderStore.createOrderAction({
  tipoPedido: 'EN_MESA',
  restaurantId: 'resto123',
  items: [...],
  clienteNombre: 'Juan',
  clienteTelefono: '+1234567890',
  mesaID: 'mesa5',
  total: 99.99
});

if (result.success) {
  console.log('Orden creada:', result.data.numeroOrden);
}
```

---

## 🎨 Estilos y Diseño

### Paleta de Colores
```
Principal (Gold):    #D4984E → #B8860B
Fondo (Beige):       #F8F5F0
Texto Claro:         #E2D4B7 → #D4C4A3
Texto Oscuro:        #1A1A1A
Texto Gris:          #4b4b4b
Acento (Light Gold): #FFF8F0
```

### Componentes Visuales
- Stepper con indicadores de progreso
- Cards con hover effects
- Botones con gradientes
- Modal con scroll interno
- Tablas/Grillas responsivas
- Validaciones con mensajes claros

---

## ⚙️ Dependencias

### Backend (Ya Existentes)
- `POST /orders/check-stock` - Valida stock
- `POST /orders/create` - Crea orden
- `GET /orders/mine` - Órdenes del cliente

### Frontend (Ya Existentes)
- React 18+
- Zustand (State Management)
- Axios (HTTP Client)
- React Router (Navigation)
- Tailwind CSS (Styling)

### Nuevas Dependencias
- Ninguna (Todo usa lo existente)

---

## 📝 Changelog

### ✨ Agregado
1. `/features/orders/` - Módulo completo de órdenes
2. `/api/orderService.js` - Servicio de órdenes
3. `/api/menuService.js` - Servicio de menús
4. `/dishes/store/useMenuStore.js` - Store de menús
5. Ruta `/cliente/pedidos` - Página de órdenes
6. Integración en ClientPage con botones navegables

### 🔧 Modificado
1. `ClientPage.jsx` - Agregados botones para acceder a pedidos
2. `AppRoutes.jsx` - Agregada ruta para página de órdenes

### 📚 Documentación
- Este README.md
- JSDoc comments en cada componente
- Validaciones y mensajes de error claros

---

## 🐛 Troubleshooting

### "No hay mesas disponibles"
- Verifica que haya mesas creadas en el restaurante
- Verifica que tengan estado `disponible`

### "Sin stock: [items]"
- Validar niveles de inventario en el restaurante
- Agregar stock desde gestión de inventario

### "Error al crear pedido"
- Verificar que todos los campos obligatorios estén completos
- Revisar la consola para detalles del error
- Verificar que el restaurante esté activo

### "Campos no se cargan"
- Limpiar caché del navegador
- Verificar token JWT válido
- Revisar que el usuario esté autenticado

---

## 🔐 Seguridad

- ✅ Validación de JWT en cada request
- ✅ Validación de stock en backend
- ✅ Cálculo de totales en backend
- ✅ Verificación de disponibilidad de mesas
- ✅ Sin exposición de precios internos

---

## 📞 Soporte

Para problemas, consulta:
1. Consola del navegador (F12)
2. Network tab en DevTools
3. Logs del backend en `gastroflow-mongo-service`
4. Base de datos de MongoDB para órdenes creadas

---

**Última actualización**: Mayo 2026
**Versión**: 1.0.0
**Estado**: ✅ Producción
