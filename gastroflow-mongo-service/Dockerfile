FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.29.2

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código del microservicio
COPY . .

# Exponer el puerto del microservicio
EXPOSE 3006

# Comando para iniciar la aplicación
CMD ["pnpm", "start"]
