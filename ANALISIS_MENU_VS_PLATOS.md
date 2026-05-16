# 📋 Análisis: Estructura Menú vs Platos en GastroFlow

## 1️⃣ Relación en Base de Datos (MongoDB)

### Estructura de Modelo Menu
```javascript
// gastroflow-mongo-service/src/Menu/menu.model.js

{
  nombre: String,                    // "Menú del Día"
  descripcion: String,
  precio: Number,                    // Calculado automáticamente
  tipo: enum ['ENTRADA', 'FUERTE', 'POSTRE', 'BEBIDA'],
  
  // ⭐ CAMPO CLAVE: Array de referencias a Platos
  platos: [{
    type: ObjectId,
    ref: 'Plato',
    required: true
  }],
  
  ingredientes: [ObjectId],          // Agregados de todos los platos
  foto: String,
  disponible: Boolean,               // Depende del stock de TODOS sus platos
  restaurantId: ObjectId (required),
  isActive: Boolean,
  schedule: [{dayNumber, startTime, endTime}],  // Horarios dinámicos
  availableFrom: Date,
  availableTo: Date
}
```

### Estructura de Modelo Plato
```javascript
// gastroflow-mongo-service/src/Platos/platos-model.js

{
  nombre: String,                    // "Spaghetti Carbonara"
  descripcion: String,
  precio: Number,                    // Precio individual
  categoria: enum ['ENTRADA', 'FUERTE', 'POSTRE', 'BEBIDA'],
  
  // ❌ NO tiene referencia a menús
  // Los platos son INDEPENDIENTES
  
  ingredientes: [ObjectId] (required),
  foto: String,
  disponible: Boolean,               // Depende de stock de ingredientes
  restaurantId: ObjectId (required),
  isActive: Boolean,
  timestamps: {createdAt, updatedAt}
}
```

## 2️⃣ Relación: ¿Un Menú Contiene Platos?

✅ **SÍ - UN MENÚ CONTIENE PLATOS**

**Ejemplo Real:**
```
Menú "Almuerzo Ejecutivo" ($24.50)
├── Plato 1: Spaghetti Carbonara ($15)
├── Plato 2: Ensalada César ($8)
└── Plato 3: Brownie Chocolate ($4.50)
```

**Relación en BD:**
- 1 Documento Menu contiene `platos: [plato_id_1, plato_id_2, plato_id_3]`
- Cada Plato es una entidad separada e INDEPENDIENTE
- Un plato puede estar en múltiples menús
- Pero un plato puede también venderse SOLO (sin menú)

**Cálculo Automático:**
```javascript
// Backend calcula al crear/actualizar menú
const { precio, tipo } = await calcularPrecioYTipoDePlatos(platosIds);
// precio = suma de precios de platos
// tipo = categoría predominante o primer plato
```

## 3️⃣ En el Sistema de Órdenes

**Modelo OrderItem:**
```javascript
{
  tipo: 'PLATO' | 'MENU',      // ⭐ Cliente elige UNO O OTRO
  
  // Si tipo === 'PLATO':
  plato: ObjectId,             // ID del plato individual
  
  // Si tipo === 'MENU':
  menu: ObjectId,              // ID del menú (que contiene múltiples platos)
  
  cantidad: Number,
  precioUnitario: Number,
  nombre: String,
  subtotal: Number
}
```

**Validación en Backend:**
```javascript
if (item.tipo === 'PLATO') {
  // Busca y valida plato individual
  const plato = await Plato.findById(item.plato);
  // Usa precio del plato
}
else if (item.tipo === 'MENU') {
  // Busca y valida menú
  const menu = await Menu.findById(item.menu);
  // Usa precio del menú
}
```

## 4️⃣ Carga en Frontend (ms-react)

### API Service: menuService.js
```javascript
export const getMenus = async (params = {}) => {
  // GET /menu/get?restaurantId=xxx
  // Retorna: menus con .populate('platos')
};
```

### Store: useMenuStore.js
```javascript
fetchMenus: async (restaurantId) => {
  const response = await getMenus({ restaurantId });
  // Retorna array con estructura:
  // [
  //   {
  //     _id: "menu_123",
  //     nombre: "Menú del Día",
  //     precio: 25.50,
  //     platos: [
  //       {_id: "plato_1", nombre: "Spaghetti", precio: 15, ...},
  //       {_id: "plato_2", nombre: "Ensalada", precio: 8, ...},
  //       ...
  //     ],
  //     disponible: true,
  //     restaurantId: "rest_123"
  //   }
  // ]
}
```

### Campos del Menú en Frontend
- `_id`: ID del menú
- `nombre`: Nombre del menú
- `descripcion`: Descripción
- `precio`: Precio total
- `tipo`: ENTRADA | FUERTE | POSTRE | BEBIDA
- `platos`: Array COMPLETO de platos con:
  - `nombre`, `descripcion`, `precio`, `categoria`
  - `foto`, `ingredientes`, `disponible`
- `disponible`: true/false (verifica stock de TODOS los platos)
- `restaurantId`: ID del restaurante

## 5️⃣ Estado Actual en Dashboard

✅ **EXISTE:**
- `/dashboard/platos` → DishesPage (gestiona platos individuales)
- `/dashboard/restaurantes`
- `/dashboard/ingredientes`
- `/dashboard/pedidos` (órdenes)

❌ **NO EXISTE:**
- `/dashboard/menus` (NO hay página de administración de menús)

**Conclusión:** Los menús se pueden crear vía API pero no se gestionan en el dashboard. Solo se cargan en el cliente para mostrar.

## 6️⃣ Disponibilidad y Stock

### Disponibilidad de Menú
```javascript
// Un menú está disponible SI Y SOLO SI:
// 1. isActive = true
// 2. Todos sus platos tienen stock de ingredientes
// 3. Todos sus platos están en estado "disponible"

// Backend ejecuta al obtener menús:
await actualizarDisponibilidadMenus(restaurantId);
// Revisa stock de cada plato
```

### Disponibilidad de Plato
```javascript
// Un plato está disponible SI Y SOLO SI:
// 1. isActive = true
// 2. Todos sus ingredientes tienen stock > 0
// 3. Cada ingrediente está en estado "disponible"
```

## 7️⃣ RECOMENDACIÓN: ¿Qué Mostrar en Selector?

### Para CLIENTE (ClientMakeOrderPage)

**OPCIÓN RECOMENDADA - Dos Secciones:**
```
┌─────────────────────────────────┐
│ MENÚS COMPLETOS (Bundled)       │
├─────────────────────────────────┤
│ □ Menú del Día ($24.50)         │
│   └─ Incluye: Spaghetti, Ensalada, Brownie
│ □ Menú Especial ($28.00)        │
│   └─ Incluye: Filete, Papas, Postre
│                                 │
├─────────────────────────────────┤
│ PLATOS SUELTOS                  │
├─────────────────────────────────┤
│ □ Spaghetti Carbonara ($15)     │
│ □ Ensalada César ($8)           │
│ □ Filete al Vino Tinto ($22)    │
└─────────────────────────────────┘
```

**NO MEZCLAR:** Evitar que en la misma orden haya items tipo 'MENU' y 'PLATO'

### Para ADMIN (Dashboard - No implementado)

**Si se crea MenusPage:**
```
1. CRUD de Menús (crear, editar, eliminar)
2. Editor de Platos dentro del Menú:
   - "Agregar Plato" → selector de platos disponibles
   - Drag-drop para reordenar platos
   - Mostrar precio automático calculado
3. Vista previa con platos expandidos
```

## 8️⃣ Respuesta Directa a Preguntas

| Pregunta | Respuesta |
|----------|-----------|
| ¿Cómo está relacionada la BD? | Un Menú CONTIENE múltiples Platos via array de ObjectIds |
| ¿Un menú contiene platos? | ✅ SÍ - La relación es 1-N (1 Menú → N Platos) |
| ¿O son independientes? | Parcialmente - Platos son independientes pero pueden estar en menús |
| ¿El modelo Menu tiene campo "platos"? | ✅ SÍ: `platos: [{type: ObjectId, ref: 'Plato'}]` |
| ¿En frontend cómo se cargan? | Via `useMenuStore.fetchMenus()` → API retorna menús con `.populate('platos')` |
| ¿Qué campos tiene? | nombre, descripcion, precio, tipo, platos[], ingredientes[], disponible, foto, schedule, etc. |
| ¿Selector debe mostrar MENÚS o PLATOS? | **AMBOS, pero SEPARADOS** → dos selectores / dos secciones |
| ¿Cómo se usan en órdenes? | orderItem puede tener `tipo:'MENU'` (con menu_id) O `tipo:'PLATO'` (con plato_id), NUNCA AMBOS |

## 9️⃣ Diagrama de Relación

```
┌──────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  1 - N  ┌──────────────┐              │
│  │   MENU      │◄────────│    PLATO     │              │
│  ├─────────────┤         ├──────────────┤              │
│  │ _id: M1     │         │ _id: P1      │              │
│  │ nombre      │         │ nombre       │              │
│  │ precio      │         │ precio       │              │
│  │ platos: [   │         │ categoria    │              │
│  │  P1, P2, P3 │         │ ingredientes │              │
│  │ ]           │         │ disponible   │              │
│  │ disponible  │         └──────────────┘              │
│  │ isActive    │                                        │
│  └─────────────┘              ┌──────────────┐         │
│                                │   PLATO      │         │
│                                ├──────────────┤         │
│                                │ _id: P2      │         │
│                                │ nombre       │         │
│                                │ precio       │         │
│                                │ ...          │         │
│                                └──────────────┘         │
│
│  NOTA: P1, P2, P3 son INDEPENDIENTES
│        Pueden existir sin estar en ningún menú
│        O estar en múltiples menús simultáneamente
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    ÓRDENES (ORDER)                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  orderItem: {                                            │
│    tipo: 'MENU' | 'PLATO',     ← Cliente elige UNO     │
│    menu: M1,                    ← Si tipo='MENU'        │
│    plato: P1,                   ← Si tipo='PLATO'       │
│    cantidad: 2,                                          │
│    precioUnitario: 24.50 ó 15                           │
│  }                                                       │
│                                                          │
│  ❌ NO PERMITIR: tipo='MENU' AND tipo='PLATO'          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 🎯 CONCLUSIÓN FINAL

### Estructura Clara:
1. **MENÚ = Bundled Collection de Platos**
   - Contiene múltiples platos
   - Precio es suma automática
   - Disponibilidad depende de TODOS sus platos

2. **PLATO = Entidad Independiente**
   - Puede venderse solo
   - Puede estar en 0, 1 o N menús
   - Precio individual

3. **En Órdenes:**
   - Cliente elige: "Quiero esto" → MENÚ o PLATO
   - Nunca ambos tipos en la misma orden
   - Backend valida que existan y estén disponibles

4. **Frontend Recomendado:**
   - Selector DUAL (Menús | Platos Sueltos)
   - Mostrar composición del menú (qué platos incluye)
   - Validar disponibilidad antes de permitir agregación

5. **Admin Dashboard (No implementado):**
   - Se necesita `/dashboard/menus` para gestionar menús
   - Actualmente solo existe gestión de platos individuales
