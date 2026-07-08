FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.29.2

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias (incluyendo devDependencies como Vite)
RUN pnpm install --prod=false

# Copiar el resto del código
COPY . .

# Exponer el puerto de Vite dev server
EXPOSE 5173

# Correr el servidor de desarrollo exponiendo el host
CMD ["pnpm", "run", "dev", "--host"]
