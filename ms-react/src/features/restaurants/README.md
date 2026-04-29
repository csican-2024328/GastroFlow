# Módulo de Restaurantes (RestaurantsPage)

## Descripción General
Este módulo implementa la gestión completa de restaurantes (CRUD) para la aplicación GastroFlow. Permite a los administradores ver, crear, editar, eliminar y cambiar el estado de restaurantes.

## Estructura del Módulo

```
features/restaurants/
├── pages/
│   └── RestaurantsPage.jsx        # Página principal con grid de restaurantes
├── components/
│   └── RestaurantModal.jsx        # Modal para crear/editar restaurantes
├── store/
│   └── useRestaurantStore.js      # Store de Zustand para manejo de estado
└── index.js                       # Archivo de exportaciones
```

## Servicio de API

`shared/api/restaurantService.js` - Contiene todas las funciones de Axios:
- `getRestaurants(params)` - Obtener lista de restaurantes con paginación
- `getRestaurantById(id)` - Obtener un restaurante por ID
- `createRestaurant(data)` - Crear nuevo restaurante (multipart/form-data)
- `updateRestaurant(id, data)` - Actualizar restaurante (multipart/form-data)
- `deleteRestaurant(id)` - Eliminar restaurante
- `deleteRestaurant(id)` - Eliminar restaurante

## Campos del Formulario

### Requeridos:
- **Nombre**: Nombre del restaurante (máx 100 caracteres)
- **Email**: Email único del restaurante (validación de formato)
- **Teléfono**: Teléfono de contacto
- **Dirección**: Ubicación del restaurante
- **Ciudad**: Ciudad donde está ubicado
- **Horario de apertura**: Ej: "Lun-Vie 9:00-18:00"
- **Aforo máximo**: Capacidad máxima de personas

### Opcionales:
- **Categoría**: Tipo de comida (Italiana, Mexicana, etc.)
- **Descripción**: Descripción del restaurante (máx 1000 caracteres)
- **Precio promedio**: Precio promedio de platos
- **Fotos**: Múltiples imágenes que se suben a Cloudinary

## Uso del Store

```javascript
import { useRestaurantStore } from '@/features/restaurants/store/useRestaurantStore.js';

// Dentro de un componente
const restaurants = useRestaurantStore((s) => s.restaurants);
const loading = useRestaurantStore((s) => s.loading);
const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);
const createRestaurantAction = useRestaurantStore((s) => s.createRestaurantAction);
const updateRestaurantAction = useRestaurantStore((s) => s.updateRestaurantAction);
const deleteRestaurantAction = useRestaurantStore((s) => s.deleteRestaurantAction);

// Cargar restaurantes
await fetchRestaurants(1, 10); // página 1, 10 por página

// Crear restaurante
await createRestaurantAction(restaurantData);

// Actualizar restaurante
await updateRestaurantAction(id, restaurantData);

// Eliminar restaurante
await deleteRestaurantAction(id);

// (Nota: activación/desactivación gestionada por backend endpoints si fuese necesario)
```

## Rutas

- `GET /api/v1/restaurants/get` - Obtener restaurantes
- `POST /api/v1/restaurants/create` - Crear restaurante
- `GET /api/v1/restaurants/:id` - Obtener un restaurante
- `PUT /api/v1/restaurants/:id` - Actualizar restaurante
- `DELETE /api/v1/restaurants/:id` - Eliminar restaurante


## Características Implementadas

✅ **CRUD Completo**: Crear, leer, actualizar y eliminar restaurantes
✅ **Grid Responsivo**: Interfaz con Tailwind CSS que se adapta a todos los dispositivos
✅ **Modal de Formulario**: Formulario validado con react-hook-form
✅ **Manejo de Archivos**: Carga de múltiples imágenes a Cloudinary
✅ **Paginación**: Soporte para múltiples páginas de restaurantes
✅ **Gestión de Estado**: Zustand store para evitar llamadas innecesarias a la API
✅ **Notificaciones**: Toast automáticos para éxito y error
✅ **Validaciones**: Validaciones de campos requeridos y formatos
✅ **Estado Activo/Inactivo**: Soporte para activar y desactivar restaurantes
✅ **Diseño Consistente**: Sigue el esquema de colores y estilos del proyecto

## Criterios de Aceptación

✅ Todos los datos del CRUD son exactamente iguales a los de la base de datos
✅ Se pueden listar, agregar y editar restaurantes sin que la página se rompa
✅ El modal se cierra automáticamente y muestra un Toast verde al guardar exitosamente
✅ Las llamadas a Axios están en un archivo de servicios aparte (restaurantService.js)
✅ Sigue el patrón de los componentes existentes (ProfilePage con gestión de archivos)

## Próximos Pasos

1. **Integración con Dashboard T4**: Cuando Saul termine el Dashboard (T4), esta vista se puede renderizar dentro del mismo.
2. **Menús**: Dev 4 necesita que existan restaurantes para asignar menús. Una vez completado este módulo, pueden proceder con esa funcionalidad.
3. **Validaciones Adicionales**: Se pueden agregar validaciones más complejas como reglas de negocio específicas.
4. **Exportación/Importación**: Se puede agregar funcionalidad para exportar/importar restaurantes.

## Notas Técnicas

- El store utiliza `persist` de Zustand para mantener los datos en caché
- Las fotos se suben a Cloudinary y se almacenan solo las URLs
- Se utiliza `react-hot-toast` para notificaciones
- Los estilos utilizan Tailwind CSS con la paleta de colores del proyecto
- El código sigue las convenciones de naming y estructura del proyecto existente
