# 📋 TAREA: Implementar Creación de Pedidos en Admin Restaurantes

## Estado
🔄 **Pendiente de Implementación**

## Descripción
La funcionalidad de crear pedidos ha sido removida del **Admin General** (solo lectura de pedidos). Ahora necesita ser implementada en el módulo de **Admin Restaurantes** donde tiene más sentido desde un punto de vista de permisos y flujo de negocio.

## ¿Qué se debe hacer?

### 1. Analizar componentes reutilizables
Revisar `OrderManagement.jsx` en `/features/orders/views/` para identificar:
- ✅ `handleVerifyStock()` - Verifica disponibilidad de ingredientes
- ✅ `handleCreateOrder()` - Crea el pedido en la BD
- ✅ `handlePayOrder()` - Procesa pagos
- ✅ Cálculo de totales con impuestos (18%)

### 2. Crear componente RestaurantOrderCreation
Ubicación sugerida: `/features/restaurants/views/RestaurantOrderCreation.jsx`

Debe incluir:
- Selección de restaurante (preseleccionado si es Admin del restaurante)
- Selección de mesa
- Selección de platos/menus
- Verificación automática de stock
- Cálculo de totales en tiempo real
- Creación del pedido

### 3. Implementación
```jsx
// Componentes a reutilizar:
import { handleVerifyStock } from '../../../shared/utils/orderHelpers';
import { checkOrderStock, createOrder } from '../../../shared/api/orderService';

// El formulario debe:
- Mantener el mismo diseño visual
- Validaciones previas a crear pedido
- Manejo de errores de stock
- Feedback visual (toast notifications)
```

## Diferencias con Admin General
| Aspecto | Admin General | Admin Restaurantes |
|--------|---|---|
| Ver Pedidos | ✅ Sí | ✅ Sí |
| Crear Pedidos | ❌ No | ✅ Sí |
| Editar Pedidos | ✅ Ver estado | ✅ Completo |
| Eliminar Pedidos | ✅ Sí | ✅ Sí |
| Procesar Pagos | ✅ Sí | ✅ Sí |
| Restaurantes | 📋 Todos | 🍽️ Solo suyo |

## Archivos Relacionados
- `/features/orders/views/OrderManagement.jsx` - Referencia de código
- `/shared/api/orderService.js` - Servicios API
- `/shared/api/mesaService.js` - Obtener mesas
- `/shared/api/dishService.js` - Obtener platos

## Notas
- Las mesas deben cargarse según el restaurante seleccionado
- El stock se verifica automáticamente al hacer clic en "Crear Pedido"
- Los errores de stock deben ser claros al usuario (qué ingredientes faltan)
- Mantener la misma estructura de datos que en OrderManagement

## Prioridad
🔴 **Alta** - Necesario para flujo completo de creación de pedidos
