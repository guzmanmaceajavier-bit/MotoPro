# MotoPro — Taller de Motos

Sistema de gestión integral para talleres de motocicletas. Cubre administración de catálogo, ventas, taller, inventario, CRM, CMS y punto de venta.

## Módulos

- **Catálogo** — productos, categorías, marcas, servicios, reseñas, ofertas, FAQs
- **Taller** — órdenes de trabajo, diagnósticos, cotizaciones, línea de tiempo, recepción, control de calidad
- **Ventas** — carrito, checkout (Mercado Pago), facturación, caja registradora, cupones, envíos, métodos de pago, ventas directas (POS)
- **Inventario** — movimientos, compras, proveedores, conteos físicos, alertas de stock
- **CRM** — clientes, vehículos, garantías, devoluciones, notificaciones, historial de servicio
- **CMS** — secciones de inicio, navbar, footer, blog, galería, antes/después, equipo, hero, SEO, configuración del sitio
- **Administración** — usuarios, roles con permisos, logs de auditoría, sucursales, respaldos de base de datos
- **Comunicación** — formulario de contacto, WhatsApp, plantillas de correo, recordatorios automáticos
- **Fidelización** — programa de puntos
- **Reportes** — reporte ejecutivo, ventas por período, productos más vendidos, ingresos mensuales
- **Encuestas** — satisfacción post-servicio

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    taller-motos/                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ frontend │  │  admin   │  │  client  │  │backend │  │
│  │ (tienda) │  │ (panel)  │  │(portal)  │  │ (API)  │  │
│  │ :3000    │  │ :3002    │  │ :3003    │  │ :4000  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       └──────────────┴──────────────┴────────────┘       │
│                                │ HTTP/JSON               │
│                        ┌───────┴───────┐                 │
│                        │   SQLite DB   │                 │
│                        └───────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

Monorepo con cuatro aplicaciones independientes. El backend expone una API REST con Express. Los tres frontends son SPA con React + Vite y se comunican con la API vía HTTP.

## Tecnologías

### Backend
- **Runtime:** Node.js
- **Framework:** Express 4
- **Base de datos:** SQLite (sql.js — SQLite en WebAssembly, embebido)
- **Autenticación:** JWT + bcrypt
- **Roles:** RBAC con permisos por recurso
- **Pagos:** Mercado Pago SDK
- **Archivos:** Multer + Cloudinary
- **Seguridad:** Helmet, CORS, rate-limit
- **Programación:** Scheduler interno (recordatorios, expiración de cotizaciones, encuestas)

### Frontend (público) — `frontend/`
React 19, Vite, React Router 7, Framer Motion, Swiper, Lenis, Tailwind CSS

### Admin — `admin/`
React 19, Vite, React Router 6, Axios, Lucide React, Framer Motion, Tailwind CSS

### Portal cliente — `client/`
React 19, Vite, React Router 6, Framer Motion, Lucide React, Tailwind CSS

### Shared — `shared/`
Componentes de UI (Button, Modal, DataTable, Badge, etc.), theme system con tokens CSS, tipos compartidos, utilidades

## Estructura del proyecto

```
taller-motos/
├── admin/                  # Panel de administración
│   ├── src/
│   │   ├── pages/          # 30+ páginas (productos, categorías, taller, etc.)
│   │   ├── components/     # DataTable, EmptyState, Header, Sidebar, etc.
│   │   ├── context/        # AuthContext, ThemeContext
│   │   ├── api/client.ts   # Cliente HTTP (axios)
│   │   └── types/
│   └── ...
├── backend/                # API REST
│   ├── src/
│   │   ├── config/         # database.js (inicialización SQLite)
│   │   ├── controllers/    # 50+ controladores por dominio
│   │   ├── middleware/     # auth.js, cache.js, upload.js
│   │   ├── routes/         # 9 rutas consolidadas + 8 legacy
│   │   ├── services/       # cms.service.js, media.service.js
│   │   ├── utils/          # helpers, settings, scheduler, email templates, etc.
│   │   └── index.js        # Entry point
│   ├── data/               # Base de datos SQLite
│   └── uploads/
├── client/                 # Portal del cliente
│   └── src/pages/          # Dashboard, vehículos, servicios, citas, etc.
├── frontend/               # Tienda pública
│   └── src/
│       ├── pages/          # Home, Tienda, Blog, Contacto, etc.
│       ├── features/       # Componentes por sección (HeroSection, etc.)
│       ├── components/     # Layout (Navbar, Footer), UI
│       └── providers/      # Auth, Cart, CMS, Theme, Toast
├── shared/                 # Componentes UI, theme, tipos, utilidades
│   ├── components/ui/      # 25 componentes (Button, Modal, Select, etc.)
│   ├── theme/              # Tokens, colores, tipografía, preset Tailwind
│   ├── types/
│   └── utils/
├── package.json            # Scripts raíz (concurrently)
└── iniciar.bat             # Script de inicio para Windows
```

## Instalación

```bash
# Clonar repositorio
git clone <url>
cd taller-motos

# Instalar dependencias de todos los proyectos
npm run install:all

# Sembrar base de datos (crea admin por defecto)
npm run seed
```

## Variables de entorno

`backend/.env`:

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor API | `4000` |
| `JWT_SECRET` | Secreto para firmar tokens | — |
| `DB_PATH` | Ruta a la base de datos SQLite | `../data/database.sqlite` |
| `UPLOAD_DIR` | Directorio de subida local | `./uploads` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | — |
| `MERCADO_PAGO_ACCESS_TOKEN` | Token de Mercado Pago | — |
| `FRONTEND_URL` | URL del frontend público (CORS) | `http://localhost:3000` |
| `BACKEND_URL` | URL del backend | `http://localhost:4000` |

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia frontend, admin y API concurrentemente |
| `npm run dev:frontend` | Solo frontend público |
| `npm run dev:admin` | Solo panel admin |
| `npm run dev:api` | Solo API (con nodemon) |
| `npm run seed` | Pobla la base de datos inicial |
| `npm run build` | Compila el frontend público |
| `npm run install:all` | Instala dependencias de todos los proyectos |

### Usuario por defecto

- **Email:** `admin@motopro.com`
- **Password:** `admin123`
- **Rol:** `superadmin`

## Ejecución

```bash
# Desarrollo (todo junto)
npm run dev

# Desarrollo (solo backend)
npm run dev:api

# Producción (backend)
cd backend
npm start
```

## API

La API se sirve en `http://localhost:4000/api`. Endpoints agrupados por módulo:

### Catálogo
```
GET    /api/products           # Listar productos activos
GET    /api/products/:id       # Producto por ID
GET    /api/products/slug/:slug
GET    /api/products/featured
GET    /api/products/stock-alerts
GET    /api/products/physical-count
POST   /api/products           # Crear (admin)
PUT    /api/products/:id       # Actualizar (admin)
DELETE /api/products/:id       # Eliminar (admin)
POST   /api/products/:id/adjust-stock

GET    /api/categories         # Listar categorías
GET    /api/categories/:slug   # Por slug
GET    /api/brands
GET    /api/services
```

### Taller
```
GET    /api/orders             # Órdenes de trabajo
POST   /api/orders             # Crear orden
PUT    /api/orders/:id/status  # Cambiar estado
PUT    /api/orders/:id/reception  # Recepción de vehículo
PUT    /api/orders/:id/start-repair
PUT    /api/orders/:id/quality-check
POST   /api/orders/:id/deliver

GET    /api/diagnostics
POST   /api/diagnostics
GET    /api/quotes
POST   /api/quotes
POST   /api/quotes/:id/approve
POST   /api/quotes/:id/reject
GET    /api/appointments/slots  # Slots disponibles
POST   /api/appointments        # Agendar cita
```

### Ventas
```
GET    /api/cart
POST   /api/cart
POST   /api/checkout
GET    /api/invoices
GET    /api/invoices/:id/pdf
GET    /api/coupons
POST   /api/coupons/validate
GET    /api/shipping
GET    /api/payment-methods
GET    /api/direct-sales
POST   /api/direct-sales
GET    /api/cash-register
POST   /api/cash-register       # Apertura
POST   /api/cash-register/:id/close
GET    /api/cash-transactions
```

### Clientes
```
GET    /api/customers
POST   /api/customers
POST   /api/customer-auth/login
POST   /api/customer-auth/register
POST   /api/customer-auth/forgot-password
GET    /api/vehicles
GET    /api/warranties
POST   /api/returns
GET    /api/notifications
```

### CMS
```
GET    /api/cms/homepage
PUT    /api/cms/homepage/:sectionKey
GET    /api/cms/navbar
POST   /api/cms/navbar
GET    /api/cms/footer
POST   /api/cms/footer
GET    /api/blog
GET    /api/blog/:slug
POST   /api/blog
GET    /api/gallery
POST   /api/gallery
GET    /api/testimonials
GET    /api/hero
GET    /api/legal
GET    /api/media
POST   /api/media
```

### Sistema
```
GET    /api/dashboard           # KPIs del panel
GET    /api/logs
POST   /api/backups
GET    /api/backups
GET    /api/system-config
PUT    /api/system-config
POST   /api/contact
GET    /api/health
```

### Autenticación
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me
GET    /api/users
POST   /api/users
GET    /api/roles
POST   /api/roles
```

Los endpoints que modifican datos requieren autenticación JWT y permisos específicos según el rol del usuario.

## Base de datos

SQLite embebido vía sql.js. La base de datos se crea automáticamente al iniciar el servidor con todas las tablas necesarias (~40 tablas). El archivo se guarda en `backend/data/database.sqlite` por defecto (configurable vía `DB_PATH`).

La base de datos incluye migraciones progresivas (ALTER TABLE) para incorporar campos añadidos en distintas fases del desarrollo, manteniendo compatibilidad hacia atrás.

## Licencia

Propietario. Proyecto interno para uso del taller.
# pweb-TAM
