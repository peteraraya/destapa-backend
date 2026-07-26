# API Destapa

Backend orquestador para el proyecto **Destapa** (anteriormente Lupa Pública). Esta API se encarga de integrar y orquestar diversas fuentes de datos públicos para exponer un Dashboard centralizado sobre información relevante de distintas comunas de Chile.

## Características Principales

- **Dashboard Unificado**: Integra gastos de municipalidades, sismos e indicadores económicos.
- **Mercado Público**: Obtiene licitaciones y proveedores por comuna.
- **Indicadores Económicos**: Información actualizada de la UF, Dólar, IPC, etc. a través de mindicador.cl.
- **Sismos**: Últimos eventos sísmicos registrados en Chile.
- **Datos Abiertos**: Integración con datos.gob.cl para obtener códigos territoriales.
- **Caché en Memoria**: Resultados del Dashboard cacheados para optimizar rendimiento y reducir llamadas externas.
- **Documentación Swagger**: Endpoints documentados y listos para probar desde el navegador.

## Tecnologías Utilizadas

- [Node.js](https://nodejs.org/)
- [NestJS](https://nestjs.com/) v11
- [Swagger](https://swagger.io/) para documentación interactiva (`@nestjs/swagger`)
- [TypeScript](https://www.typescriptlang.org/) con tipado estricto
- Módulo de Caché de NestJS (`@nestjs/cache-manager`)
- **class-validator** y **class-transformer** para validación estricta de DTOs.

## Arquitectura y Mejores Prácticas (Senior Nivel)

El proyecto está diseñado siguiendo las directrices oficiales y buenas prácticas de NestJS:

- **DTOs (Data Transfer Objects):** Todos los endpoints utilizan clases DTO validadas estrictamente con `@IsString()`, `@IsNotEmpty()`, etc.
- **ValidationPipe Global:** Activado a nivel de la aplicación en `main.ts` con opciones `whitelist: true` y `forbidNonWhitelisted: true`, protegiendo la aplicación de inyecciones de propiedades no deseadas.
- **Respuestas Tipadas:** Todos los controladores y servicios retornan Clases/Interfaces exactas en lugar de `any`, proporcionando total seguridad de tipos (Type-safety) a lo largo del flujo de la aplicación.
- **Documentación Dinámica Diferida:** Uso de *lazy-evaluation* (`type: () => ClaseDto`) en decoradores de Swagger para evitar errores de inicialización temprana (`ReferenceError: Cannot access '...' before initialization`).
- **Resiliencia y Fallbacks:** Uso avanzado de `Promise.allSettled()` al consultar APIs externas. Si alguna API falla, la aplicación sigue funcionando devolviendo datos parciales o usando un fallback.

## Instalación

1. Clona este repositorio o descarga los archivos.
2. Abre la terminal en el directorio del proyecto y ejecuta:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto basándote en el archivo de ejemplo (si existe) o configurando tus variables de entorno. Puedes utilizar el siguiente comando en Linux/Mac o crearlo manualmente:

```bash
cp .env.example .env
```

### Variables de Entorno

Este proyecto utiliza variables de entorno para funcionar correctamente sin exponer claves privadas. Actualmente soporta las siguientes:

- `PORT`: (Opcional) Puerto donde correrá el servidor. Por defecto es `3000`.
- `MERCADO_PUBLICO_TICKET`: (Opcional) Tu ticket o API Key oficial para consumir datos de Mercado Público. Si **no** defines esta variable, el sistema arrojará un _Warning_ en la consola indicando que se usarán **datos simulados (mocks)** para fines de demostración.

## Flujo de Trabajo y CI/CD (GitHub Actions)

El proyecto utiliza **Git Flow** simplificado:
- **`main`**: Rama de producción. Solo recibe código testeado y revisado (vía Pull Requests).
- **`develop`**: Rama principal de desarrollo. Todas las nuevas *features* se desprenden y se fusionan aquí.
- **`feature/*`**: Ramas efímeras para trabajar en nuevas características.

### Integración y Despliegue Continuo (CI/CD)

Se ha configurado un *Pipeline* profesional utilizando **GitHub Actions** (`.github/workflows/ci-cd.yml`).
1. **Integración (CI)**: Al hacer `push` o abrir un PR hacia `main` o `develop`, se instalan las dependencias, se pasa el Linter estricto, se ejecutan las pruebas Unitarias y E2E, y se compila el proyecto.
2. **Despliegue (CD)**: Si todos los pasos del CI pasan en verde y se hace un `push` a la rama `main`, la aplicación inicia el proceso de despliegue continuo a producción.
*(Nota: Modifica el archivo `.yml` con los comandos específicos de tu proveedor como AWS, Railway o Render).*

## Ejecución del Proyecto

### Desarrollo (Watch Mode)
Es el modo recomendado para desarrollo, ya que recarga los cambios automáticamente.
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

## Documentación de la API (Swagger)

Una vez que el servidor esté en ejecución, puedes acceder a la interfaz interactiva de Swagger, donde encontrarás el detalle de todos los endpoints y podrás probar las peticiones directamente.

👉 **URL de Swagger**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### Endpoints Disponibles

- **Dashboard**
  - `GET /api/dashboard?comuna={nombre_comuna}`: Retorna un resumen de licitaciones, contexto económico y últimos sismos correspondientes a la comuna.
- **Sismos**
  - `GET /api/sismos/ultimos`: Listado de los últimos sismos en el país.
- **Indicadores Económicos**
  - `GET /api/indicadores`: Obtiene el valor actual de la UF, Dólar, Euro, IPC, entre otros.
- **Mercado Público**
  - `GET /api/mercado-publico/licitaciones?codigoComuna={codigo}`: Devuelve las licitaciones registradas para el código de comuna dado.
- **Datos Gob**
  - `GET /api/datos-gob/codigo-comuna?comuna={nombre}`: Resuelve el código territorial asociado al nombre de la comuna.
  - `GET /api/datos-gob/datasets`: Obtiene datasets de división territorial desde datos.gob.cl.

## Solución de Problemas Comunes

- **`EADDRINUSE: address already in use :::3000`**: Esto significa que otro proceso ya está usando el puerto 3000 (probablemente una instancia anterior de este mismo proyecto). Puedes solucionarlo cerrando la instancia anterior o deteniendo el proceso de Node.js que ocupa el puerto.
- **Cambios no se reflejan en Swagger**: Si instalaste un nuevo paquete o creaste un nuevo controlador y no se visualiza, asegúrate de **reiniciar el servidor** (Ctrl + C y luego `npm run start:dev` nuevamente).
