# Reservations Feature

Módulo completo para crear y gestionar reservaciones de restaurantes para clientes.

## Componentes

### ReservationsPage
Página principal que gestiona todo el flujo de reservaciones:
- Selección de restaurante
- Formulario de reserva con 3 pasos
- Historial de reservaciones

### ReservationForm
Formulario guiado con 3 pasos:
1. **Paso 1**: Datos básicos (fecha, hora, personas, notas)
2. **Paso 2**: Selección de mesa disponible
3. **Paso 3**: Confirmación de detalles

Características:
- Validación de fechas futuras
- Verificación de disponibilidad de mesas
- Prevención de dobles reservas
- Interfaz intuitiva con navegación entre pasos

### ReservationHistory
Componente que muestra:
- Historial completo de reservaciones
- Filtros por estado (Confirmada, Completada, Cancelada)
- Detalles expandibles de cada reserva
- Opción para cancelar reservas
- Estado de tiempo (próximamente, pasada)

### ReservationConfirmation
Modal de confirmación que muestra:
- Resumen de la reserva creada
- Número de confirmación
- Instrucciones importantes
- Auto-cierre después de 5 segundos

## Store

### useReservationStore
Estado centralizado con Zustand:
- `createReservationAction()` - Crear nueva reserva (POST)
- `fetchUserReservations()` - Obtener historial del usuario (GET)
- `fetchAvailableTables()` - Obtener mesas disponibles
- `cancelReservationAction()` - Cancelar reserva
- `updateReservationAction()` - Actualizar reserva
- Manejo de loading, error y paginación

## API

Servicios en `shared/api/reservationService.js`:
- `POST /reservation` - Crear reserva
- `GET /reservation` - Obtener reservas del usuario
- `GET /reservation/{id}` - Obtener detalle de reserva
- `GET /reservation/available` - Obtener mesas disponibles
- `PUT /reservation/{id}` - Actualizar reserva
- `DELETE /reservation/{id}` - Cancelar reserva

## Validaciones

- ✅ Fecha no puede ser en el pasado
- ✅ Hora de fin > hora de inicio
- ✅ Mínimo 1 persona, máximo 20
- ✅ Validación de disponibilidad de mesas
- ✅ Prevención de doble reserva en mismo horario/mesa
- ✅ Campos requeridos validados antes de enviar

## Rutas

- `/cliente/reservaciones` - Página de reservaciones para clientes

## Paleta de Colores

Mantiene la identidad visual completa del proyecto GastroFlow:
- Fondos: cream (#F8F5F0)
- Textos: graphite (#1A1A1A), beige (#E2D4B7)
- Acentos: terracotta (#C87A55), dorado (#C49A2B), verde (#2C4035)
