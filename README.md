# The Hub

The Hub es una aplicación web construida con React y Vite para ofrecer una experiencia de e-commerce moderna. Incluye una landing comercial, catálogo filtrable, carrito persistente y un panel administrativo para gestionar productos y métricas.

## Características principales
- **Landing page animada** con secciones de héroe, confianza, equipo y destacados, utilizando animaciones de Framer Motion.
- **Catálogo de productos filtrable** con búsqueda en vivo, categorías dinámicas y ordenamiento por precio o fecha.
- **Carrito lateral persistente** controlado mediante contexto de React, con totales calculados automáticamente y acciones rápidas.
- **Autenticación y sesiones** gestionadas con `AuthContext` para proteger rutas administrativas y mantener tokens en almacenamiento local.
- **Panel administrativo** con diseño dedicado, navegación lateral y vistas para dashboard, listado de productos y alta de nuevos items.
- **Integración con APIs Xano** a través de un cliente reutilizable (`src/api`) y capa de caché (`src/services/productsStore.js`).

## Stack tecnológico
- [Vite](https://vitejs.dev/) + React 18
- React Router 7 para enrutamiento público y privado
- Context API + Hooks personalizados para estado global
- Bootstrap 5 y Font Awesome para UI responsiva
- Framer Motion para transiciones y animaciones

## Estructura relevante
```
src/
├── App.jsx                # Configuración de rutas principales
├── admin/                 # Layout y vistas protegidas del panel admin
├── api/                   # Clientes HTTP y envoltorios para Xano
├── components/            # Componentes reutilizables (Navbar, Hero, etc.)
├── context/               # Providers de autenticación y carrito
├── pages/                 # Páginas públicas (Home, Productos, Cart, Login)
├── services/              # Capa de datos con cache en memoria
└── styles.css             # Estilos globales y utilidades
```

## Requisitos previos
- Node.js 18 o superior
- npm 9 o superior

## Scripts disponibles
```bash
npm install          # Instala dependencias
npm run dev          # Inicia el entorno de desarrollo en http://localhost:5173
npm run build        # Genera la build de producción en dist/
npm run preview      # Sirve la build de producción para pruebas locales
```

## Variables de entorno
Crear un archivo `.env.local` (o copiar el existente) con las siguientes claves:

```ini
VITE_XANO_AUTH_BASE=URL_BASE_AUTH
VITE_XANO_CORE_BASE=URL_BASE_CORE
VITE_TOKEN_KEY=THEHUB_TOKEN
VITE_CART_KEY=THEHUB_CART_ID
```

- `VITE_XANO_AUTH_BASE`: endpoint base del servicio de autenticación en Xano.
- `VITE_XANO_CORE_BASE`: endpoint base para productos y carrito.
- `VITE_TOKEN_KEY`: clave usada para almacenar el token JWT en `localStorage`.
- `VITE_CART_KEY`: identificador persistido del carrito activo.

Consulta `docs/xano-test-notes.md` para ejemplos de peticiones HTTP a las APIs.

## Pruebas y buenas prácticas
- Ejecuta `npm run build` antes de desplegar para asegurar que la compilación finaliza sin errores.
- Mantén el formato y patrones de componentes siguiendo los existentes (hooks en `/hooks`, providers en `/context`).
- Aplica estilos reutilizando las utilidades de Bootstrap y las clases definidas en `src/styles.css`.

## Contribución
1. Haz fork del repositorio y crea una rama descriptiva.
2. Instala dependencias y levanta el entorno con `npm run dev`.
3. Asegura que el linting y build pasan antes de abrir un PR.
4. Describe los cambios realizados y pasos de prueba en la descripción del PR.

¡Gracias por contribuir a The Hub Stack!
