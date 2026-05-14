# Prueba del Workflow de Reservación Pendiente

## Cambios Realizados

### 1. ✅ Mensaje de Respuesta Mejorado
**Archivo:** `gastroflow-mongo-service/src/Reservation/reservation.controller.js`
**Línea:** ~334

El mensaje de respuesta ahora dice:
```
"Tu reservación está siendo observada por un administrador. Recibirás un email de confirmación cuando sea aprobada."
```

Antes decía: "Reservación creada exitosamente"

### 2. ✅ Email de Reservación Pendiente Mejorado
**Archivo:** `gastroflow-mongo-service/helper/email-service.js`
**Función:** `enviarEmailReservacionPendiente()`

**Cambios en el email:**
- **Asunto actualizado:** "⏳ Tu Reservación Está Siendo Observada por un Administrador"
- **Contenido:** Mensaje claro indicando que está "siendo observada por un administrador"
- **Status visible:** Muestra "EN OBSERVACIÓN DEL ADMIN"
- **Llamada a la acción:** Claramente dice "Recibirás un email cuando tu reservación sea APROBADA"

### 3. ✅ Logs Mejorados
**Archivo:** `gastroflow-mongo-service/src/Reservation/reservation.controller.js`

Ahora muestra en consola:
```
======================================================================
📧 EMAIL DE RESERVACIÓN PENDIENTE
======================================================================
📤 Destinatario: usuario@email.com
👤 Cliente: Juan Pérez
🏢 Restaurante: Mi Restaurante
======================================================================
```

## Pasos para Probar

### 1. Reiniciar el servidor MongoDB service
```bash
# En la carpeta gastroflow-mongo-service
npm run dev
# O
pnpm dev
```

### 2. Crear una nueva reservación
**Método:** POST `/api/v1/reservations`

**Body ejemplo:**
```json
{
  "restaurantID": "66a7f1234567890123456789",
  "mesaID": "66a7f1234567890123456788",
  "clienteNombre": "Juan Pérez",
  "clienteTelefono": "+34 666 777 888",
  "fechaReserva": "2024-12-20",
  "horaInicio": "20:00",
  "horaFin": "21:30",
  "cantidadPersonas": 4,
  "notas": "Sin alergias"
}
```

### 3. Observar el Console Log
Deberías ver en la terminal del servidor:
```
📧 EMAIL DE RESERVACIÓN PENDIENTE
📤 Destinatario: usuario@email.com
👤 Cliente: Juan Pérez
🏢 Restaurante: Mi Restaurante
```

### 4. Verificar la Respuesta HTTP
**Response status:** 201
```json
{
  "success": true,
  "message": "Tu reservación está siendo observada por un administrador. Recibirás un email de confirmación cuando sea aprobada.",
  "data": {
    "estado": "PENDIENTE",
    "proximosPasos": "Un administrador del restaurante revisará tu solicitud. Tiempo estimado: 15 minutos a 2 horas. Recibirás un email cuando sea confirmada.",
    ...
  }
}
```

### 5. Verificar el Email
**Si SMTP está configurado (Gmail):**
- Revisa el email del usuario
- Deberías recibir un email con:
  - Asunto: "⏳ Tu Reservación Está Siendo Observada por un Administrador"
  - Contenido explicando que está bajo observación del admin
  - Instrucciones de esperar el email de confirmación

**Si SMTP está en DEVELOPMENT (sin SMTP real):**
- Verás el log en consola:
```
📧 [DEVELOPMENT] Reservación Pendiente de Aprobación
✉️  Destinatario: usuario@email.com
👤 Cliente: Juan Pérez
🏢 Restaurante: Mi Restaurante
...
```

## Troubleshooting

### Si NO ves el log de email
**Posible causa:** El email del usuario no se está extrayendo correctamente del JWT

**Verificar:**
1. Asegúrate de que estás autenticado (JWT válido)
2. Verifica que el JWT contiene el campo `email`
3. Revisa que no hay errores de autenticación

### Si ves el log pero no llega el email
**Posible causa:** SMTP no está configurado o las credenciales son incorrectas

**Verificar archivo .env:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=narutoshippude745@gmail.com
SMTP_PASSWORD=rhcs dgno ywts egrt    # ⚠️ Debe ser APP PASSWORD, no contraseña regular
NODE_ENV=production
```

### Si ves "[DEVELOPMENT]" en los logs
**Motivo:** El SMTP no está configurado

**Soluciones:**
1. Agregar credenciales SMTP a .env
2. Cambiar NODE_ENV a "production"

## Endpoints de Prueba

### Crear Reservación (PENDIENTE)
```
POST /api/v1/reservations
Headers: Authorization: Bearer [JWT_TOKEN]
Body: { restaurantID, mesaID, clienteNombre, ... }
Response: 201 - "Tu reservación está siendo observada..."
```

### Aprobar/Rechazar Reservación (Admin)
```
POST /api/v1/reservations/:id/approve-or-reject
Headers: Authorization: Bearer [JWT_TOKEN_ADMIN]
Body: { 
  "accion": "APROBAR",  // o "RECHAZAR"
  "clienteEmail": "usuario@email.com"
}
Response: 200 - Reservación aprobada/rechazada
         Email de confirmación enviado al cliente
```

## Cambios de Código Realizados

### archivo: reservation.controller.js
- ✅ Mensaje de respuesta: "exitosamente" → "siendo observada por admin"
- ✅ Logging mejorado con emojis y separadores
- ✅ Respuesta incluye "proximosPasos" para UX clara

### archivo: email-service.js
- ✅ Asunto: "Pendiente de Aprobación" → "Siendo Observada por un Administrador"
- ✅ Contenido: "revisada" → "siendo observada"
- ✅ Incluye status visible "EN OBSERVACIÓN DEL ADMIN"
- ✅ Instrucciones claras de esperar email de confirmación

## Notas Importantes

✅ **Cambios completados:**
- Mensaje de respuesta
- Contenido del email
- Logs en consola mejorados
- Sin errores de compilación

🔄 **Próximo paso si emails no llegan:**
- Verificar credenciales SMTP en .env
- Probar con un email test directo
- Revisar permisos de la app de Gmail

📧 **Email flow esperado:**
1. Cliente crea reservación → Email "PENDIENTE" enviado
2. Admin aprueba → Email "APROBADA" enviado
3. Admin rechaza → Email "RECHAZADA" enviado
