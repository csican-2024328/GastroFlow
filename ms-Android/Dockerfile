FROM node:20-alpine

# Instalar dependencias del sistema requeridas
RUN apk add --no-cache bash git

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.29.2

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --prod=false

# Copiar el código fuente
COPY . .

# Exponer el puerto de Metro bundler (8081)
EXPOSE 8081

# Iniciar expo en modo web
CMD ["pnpm", "run", "web"]
