# 🚀 GastroFlow - Instrucciones de Inicio

## Configuración de Servicios
- **PostgreSQL**: Docker (docker-compose)
- **MongoDB**: Local (ya corriendo en tu máquina)

---

## 1️⃣ Verificar que MongoDB está corriendo

```powershell
# Abre PowerShell y verifica que MongoDB esté corriendo
mongo --eval "db.adminCommand('ping')"
# Debe responder: { "ok" : 1 }
```

Si no está corriendo, inicia MongoDB:
```powershell
# Si está registrado como servicio Windows
net start MongoDB

# O ejecuta mongod.exe directamente
C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe
```

---

## 2️⃣ Levantar PostgreSQL con Docker

```powershell
# Navega a la carpeta del servicio PostgreSQL
cd C:\GastroFlow\gastroflow-postgres-service

# Levanta el contenedor con espera hasta que esté healthy
docker compose up -d --wait

# Verifica que está corriendo
docker compose ps
```

**Credenciales PostgreSQL:**
- Host: localhost
- Puerto: 5435
- Base de datos: GastroFlowPostgres
- Usuario: root
- Contraseña: admin

**Primera vez: Crear la base de datos**
```powershell
# Conectar a PostgreSQL
psql -h localhost -p 5435 -U root -d postgres

# En la consola de psql, ejecutar:
CREATE DATABASE "GastroFlow";
\q  # Salir
```

O usar una herramienta como DBeaver/pgAdmin para crear la DB.

---

## 3️⃣ Instalar Dependencias

```powershell
# En gastroflow-postgres-service
cd C:\GastroFlow\gastroflow-postgres-service
pnpm install

# En gastroflow-mongo-service
cd C:\GastroFlow\gastroflow-mongo-service
pnpm install
```

---

## 4️⃣ Ejecutar los Servicios

### Opción A: Servicios Secuenciales (Un terminal por servicio)

**Terminal 1 - PostgreSQL Service:**
```powershell
cd C:\GastroFlow\gastroflow-postgres-service
pnpm dev
# Estará disponible en http://localhost:3006
```

**Terminal 2 - MongoDB Service:**
```powershell
cd C:\GastroFlow\gastroflow-mongo-service
pnpm dev
# Necesitarás cambiar el puerto en .env (ej: 3007)
# Editando: PORT=3007
```

### Opción B: Ejecutar uno a la vez

Si solo necesitas un servicio en el momento, usa el mismo puerto 3006 en .env para ambos.

---

## 5️⃣ Verificar que Todo Funciona

```powershell
# Test PostgreSQL Service
curl http://localhost:3006/api/v1/auth

# Test MongoDB Service (si está en 3007)
curl http://localhost:3007/api/v1/restaurants
```

---

## 📋 Checklist Rápido

- [ ] MongoDB corriendo localmente
- [ ] Docker Desktop activo
- [ ] `docker compose up -d` ejecutado en gastroflow-postgres-service
- [ ] `pnpm install` completado en ambos servicios
- [ ] `pnpm dev` iniciado en los servicios que necesites
- [ ] Postman configurado con `GastroFlow T3 T4 - Unificada.postman_environment.json`

---

## 🛑 Detener Servicios

```powershell
# Detener PostgreSQL Docker
cd C:\GastroFlow\gastroflow-postgres-service
docker compose down

# Detener Node.js (Ctrl+C en cada terminal)
```

---

## 🔧 Troubleshooting

**PostgreSQL no conecta:**
```powershell
docker compose logs postgres
```

**MongoDB error:**
```powershell
# Verifica puerto 27017
netstat -ano | findstr :27017
```

**Dependencias errores:**
```powershell
# Limpia cache y reinstala
rm node_modules pnpm-lock.yaml
pnpm install
```
