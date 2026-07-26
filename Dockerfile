# ==========================================
# 1. Etapa de Desarrollo y Build
# ==========================================
FROM node:20-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Compilar la aplicación NestJS
RUN npm run build

# ==========================================
# 2. Etapa de Producción (Imagen Ligera)
# ==========================================
FROM node:20-alpine AS production

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar solo los archivos necesarios de dependencias
COPY package*.json ./

# Instalar SÓLO las dependencias de producción (hace la imagen mucho más ligera)
RUN npm ci --only=production

# Copiar los archivos compilados desde la etapa "builder"
COPY --from=builder /usr/src/app/dist ./dist

# Crear un usuario no root por seguridad (Mejor práctica en Docker)
USER node

# Exponer el puerto
EXPOSE $PORT

# Comando para iniciar la aplicación
CMD ["node", "dist/main"]
