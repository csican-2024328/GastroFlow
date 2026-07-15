# GastroFlow - Sistema Unificado de Microservicios y Clientes

GastroFlow es una plataforma integrada para la gestión de restaurantes, reservaciones, pedidos y reseñas en tiempo real. Está compuesta por microservicios backend especializados, un cliente web de administración y un cliente móvil para los comensales.

> [!IMPORTANT]
> **Peticiones 100% en Línea**: En el entorno de producción, todas las peticiones entre los clientes (Web y Móvil) y los microservicios backend se realizan de forma totalmente en línea a través de las URLs públicas desplegadas en Render (`.onrender.com`), conectándose de forma segura a bases de datos en la nube (MongoDB Atlas y Neon PostgreSQL).

## 🏗️ Arquitectura del Proyecto

1. **`gastroflow-postgres-service`**: Microservicio backend (Puerto `3007`) que gestiona la autenticación de usuarios, roles, seguridad y perfiles de personal. Utiliza **Neon PostgreSQL** en la nube.
2. **`gastroflow-mongo-service`**: Microservicio backend (Puerto `3006`) enfocado en el dominio de negocio (restaurantes, mesas, pedidos, menús, facturas). Utiliza **MongoDB Atlas** y almacena archivos en **Cloudinary**.
3. **`ms-react`**: Cliente Web frontend (Puerto `5173`) construido con React, Vite y Tailwind CSS, utilizado por administradores de la plataforma y administradores de sucursales.
4. **`ms-Android`**: Cliente Móvil frontend (Puerto `8081`) desarrollado en React Native con Expo para los clientes de GastroFlow.

---

## 🚀 Guía de Inicio Rápido (Levantar con Docker)

El proyecto está completamente contenedorizado y listo para ser levantado en un solo comando mediante Docker Compose.

### 1. Requisitos Previos
Asegúrate de tener instalado en tu máquina:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (debe estar abierto y ejecutándose).
* [Node.js](https://nodejs.org/) (Recomendado v20+).
* [pnpm](https://pnpm.io/) (instalado globalmente ejecutando `npm install -g pnpm`).

### 2. Configurar Archivos `.env`
> [!NOTE]
> La plantilla y descripción del contenido de las variables `.env` de cada componente se encuentran documentadas dentro del respectivo archivo `README.md` de cada microservicio/cliente.

Antes de levantar, asegúrate de crear los archivos `.env` en cada uno de los directorios siguiendo las plantillas de configuración:
* **Postgres Service**: Copiar los valores del template a [gastroflow-postgres-service/.env](file:///c:/IN6BV/GastroFlow/gastroflow-postgres-service/.env).
* **Mongo Service**: Copiar los valores del template a [gastroflow-mongo-service/.env](file:///c:/IN6BV/GastroFlow/gastroflow-mongo-service/.env).
* **Web Frontend**: Asegúrate de tener las URLs correctas de los backends en [ms-react/.env](file:///c:/IN6BV/GastroFlow/ms-react/.env).
* **App Móvil (Android)**: Configura las variables en [ms-Android/.env](file:///c:/IN6BV/GastroFlow/ms-Android/.env).

### 3. Levantar los Contenedores
Abre tu consola/terminal en la raíz del proyecto y ejecuta:

```powershell
# Descargar dependencias e iniciar los contenedores
docker compose up -d --build
```

Esto compilará y ejecutará todos los servicios de forma paralela en tu máquina local.

### 4. Puertos y Enlaces de Acceso
* **Vite Web Frontend**: [http://localhost:5173](http://localhost:5173)
* **Expo Metro Server (Móvil)**: [http://localhost:8081](http://localhost:8081)
* **Postgres Microservice**: [http://localhost:3007/api/v1](http://localhost:3007/api/v1)
* **Mongo Microservice**: [http://localhost:3006/api/v1](http://localhost:3006/api/v1)

---

## 🛠️ Ejecución Local para Desarrollo (Sin Docker)

Si prefieres ejecutar los servicios por separado directamente en tu máquina:

### 1. Iniciar los Backends
Abre terminales independientes para cada servicio:

```powershell
# En la carpeta /gastroflow-postgres-service
pnpm install
pnpm run dev

# En la carpeta /gastroflow-mongo-service
pnpm install
pnpm run dev
```

### 2. Iniciar el Frontend Web
```powershell
# En la carpeta /ms-react
pnpm install
pnpm run dev
```

### 3. Iniciar la App Móvil
```powershell
# En la carpeta /ms-Android
pnpm install
pnpm run android
```
*(Nota: Si usas emulador o un celular físico, asegúrate de que el `.env` de `ms-Android` apunte a la IP de tu máquina en tu red local en lugar de `localhost`).*

---

## 📧 Envío de Correos (Brevo HTTP API)

Para superar los bloqueos de puertos SMTP en plataformas en la nube (como Render), el envío de correos de verificación y restablecimiento de contraseña está configurado a través de la API HTTP de Brevo en lugar del protocolo SMTP clásico.

Para que funcione, asegúrate de proveer una clave API válida:
```env
BREVO_API_KEY=tu_clave_api_aquí
EMAIL_FROM=tu_correo_verificado_en_brevo@dominio.com
EMAIL_FROM_NAME=GastroFlow
```
Si la variable `BREVO_API_KEY` está presente, el sistema omitirá SMTP y usará la API HTTP de forma automática.
