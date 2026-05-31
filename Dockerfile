# Etapa 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm (opcional, pero el proyecto parece usar pnpm o npm)
RUN npm install -g pnpm

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile || npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación frontend (Vite)
RUN npm run build

# Etapa 2: Producción
FROM node:22-alpine AS production

WORKDIR /app

# Instalar pnpm en producción también para correr los scripts
RUN npm install -g pnpm tsx

# Copiar package.json y dependencias
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod || npm install --omit=dev

# Copiar la build del frontend y el código del servidor backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts

# Crear base de datos sqlite en un volumen persistente si es necesario
# Por defecto better-sqlite3 creará el archivo en el directorio local.
# Asegúrate de mapear un volumen a la carpeta donde se guarde tu base de datos.

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Usamos tsx para ejecutar el server.ts en producción
CMD ["tsx", "server.ts"]
