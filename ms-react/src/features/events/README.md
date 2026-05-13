# Events Feature

Módulo para mostrar eventos y ofertas vigentes del restaurante para los clientes.

## Componentes

### EventsPage
Página principal que muestra los eventos vigentes de un restaurante.
- Permite seleccionar un restaurante
- Consume el endpoint GET `/events/restaurant/{restaurantId}/vigentes`
- Muestra un grid responsive de eventos

### EventCard
Tarjeta individual de evento que muestra:
- Imagen del evento
- Nombre, descripción
- Fechas de inicio y fin
- Badge de estado (Activo, Próximamente, Utilizado)
- Botón para usar el evento (POST `/events/{eventId}/usar`)

## Store

### useEventStore
Estado centralizado para eventos usando Zustand:
- `fetchVicentesEvents(restaurantId)` - Obtiene eventos vigentes
- `fetchRestaurantEvents(restaurantId, page, limit)` - Obtiene todos los eventos
- `useEventAction(eventId)` - Usa un evento
- `events` - Lista de eventos
- `loading` - Estado de carga
- `error` - Mensajes de error

## API

Servicios en `shared/api/eventService.js`:
- `getVicentesEvents(restaurantId)` - GET /events/restaurant/{restaurantId}/vigentes
- `useEvent(eventId)` - POST /events/{eventId}/usar
- `getRestaurantEvents(restaurantId, params)` - GET /events/restaurant/{restaurantId}
- `getEventById(eventId)` - GET /events/{eventId}

## Rutas

- `/cliente/eventos` - Página de eventos para clientes
