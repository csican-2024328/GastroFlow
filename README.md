

- Username: admin
- Email: admin@gastroflow.local
- Password: Admin@1234!

## Configuración Importante
⚠️ **IMPORTANTE**: Crear archivo `.env` con las credenciales necesarias (no se sube al repositorio por seguridad)

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
SMTP_USERNAME=kinalsports@gmail.com
SMTP_PASSWORD=yrsd prvf kwat toee
EMAIL_FROM=kinalsports@gmail.com
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


## Exportación PDF

12. GET http://localhost:3006/api/v1/reports/exportar/reporte/demanda-restaurantes/pdf
13. GET http://localhost:3006/api/v1/reports/exportar/reporte/top-platos/pdf
14. GET http://localhost:3006/api/v1/reports/exportar/reporte/ingresos/pdf
15. GET http://localhost:3006/api/v1/reports/exportar/reporte/horas-pico/pdf
16. GET http://localhost:3006/api/v1/reports/exportar/reporte/reservaciones/pdf

17. GET http://localhost:3006/api/v1/reports/exportar/reporte/desempeno-restaurante/pdf (requiere restaurantID)
18. GET http://localhost:3006/api/v1/reports/exportar/reporte/ocupacion/pdf (requiere restaurantID)
19. GET http://localhost:3006/api/v1/reports/exportar/reporte/clientes-frecuentes/pdf (requiere restaurantID)
20. GET http://localhost:3006/api/v1/reports/exportar/reporte/pedidos-recurrentes/pdf (requiere restaurantID)

## Exportación Excel (CSV compatible)

21. GET http://localhost:3006/api/v1/reports/exportar/reporte/demanda-restaurantes/excel
22. GET http://localhost:3006/api/v1/reports/exportar/reporte/top-platos/excel
23. GET http://localhost:3006/api/v1/reports/exportar/reporte/ingresos/excel
24. GET http://localhost:3006/api/v1/reports/exportar/reporte/horas-pico/excel
25. GET http://localhost:3006/api/v1/reports/exportar/reporte/reservaciones/excel

26. GET http://localhost:3006/api/v1/reports/exportar/reporte/desempeno-restaurante/excel (requiere restaurantID)
27. GET http://localhost:3006/api/v1/reports/exportar/reporte/ocupacion/excel (requiere restaurantID)
28. GET http://localhost:3006/api/v1/reports/exportar/reporte/clientes-frecuentes/excel (requiere restaurantID)
29. GET http://localhost:3006/api/v1/reports/exportar/reporte/pedidos-recurrentes/excel (requiere restaurantID)