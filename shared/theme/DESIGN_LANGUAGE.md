# MotoPro Admin — Design Language

> Un sistema de diseño único para todo el panel administrativo.
> Inspirado en la claridad de Linear, la densidad de Stripe y la solidez de Vercel.
> No copia a ninguno — es MotoPro.

---

## 1. Filosofía

- **Claridad > Decoración.** Cada elemento tiene un propósito.
- **Datos primero.** Las tablas, listas y grids son el centro de la experiencia.
- **Consistencia implacable.** Un mismo componente luce igual en todos los módulos.
- **Jerarquía visual clara.** Header → Toolbar → Contenido → Paginación.
- **Premium sin ruido.** Sombras sutiles, espaciado generoso, micro-interacciones.

---

## 2. Principios Visuales

### Color
- Fondo: `--surface-primary` (dark: casi negro #0A1017 / light: gris claro #F1F5F9)
- Superficies: `--surface-secondary` (tarjetas), `--surface-tertiary` (hover/filas)
- Acento: Teal `--interactive-accent` (#14B8A6) — único, nunca compite.
- Texto: 3 niveles — primary (alta), secondary (media), tertiary (baja)
- Bordes: `--border` para contenedores, `--border-subtle` para separaciones internas
- Status: Success (green), Warning (amber), Error (red), Info (blue)

### Tipografía
- Headings: **Space Grotesk** (display, h1-h6) — peso 600-700, tracking tight
- Body: **Inter** (body, body-sm, caption, tiny) — peso 400-500
- Mono: **JetBrains Mono** para datos numéricos, SKU, IDs
- Escala: 72px (display) → 12px (tiny), con line-height y peso definidos

### Espaciado (escala 4px)
- `space-2`: 8px (gap interno compacto)
- `space-4`: 16px (padding tarjetas)
- `space-6`: 24px (separación entre secciones)
- `space-8`: 32px (márgenes de página)
- `space-12`: 48px (separación de módulos)

### Bordes
- `radius-sm`: 6px (tablas, inputs, botones)
- `radius-lg`: 12px (tarjetas, modales)
- Inputs: sin border-radius (estilo moderno / flat)

### Sombras (elevación)
- `elevation-1`: hover en filas de tabla, tarjetas ligeras
- `elevation-3`: modales, dropdowns
- `elevation-5`: toasts, tooltips

### Motion
- `duration-fast` (100ms): hover, active
- `duration-base` (200ms): transiciones generales
- `duration-slow` (300ms): paneles laterales, modales
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` — natural, no lineal

---

## 3. Layout del Admin

```
┌──────────────────────────────────────────────┐
│ Sidebar (w-60) │  Header (h-14)              │
│                ├──────────────────────────────┤
│                │  Breadcrumbs                  │
│                │  Page Title + Actions         │
│   Navegación   ├──────────────────────────────┤
│   jerárquica   │  Toolbar (búsqueda, filtros,  │
│   por grupos   │           orden, vista)       │
│                ├──────────────────────────────┤
│                │  CONTENIDO PRINCIPAL          │
│                │  (Tabla / Grid / Formulario)  │
│                │                               │
│                ├──────────────────────────────┤
│                │  Paginación                   │
└────────────────┴──────────────────────────────┘
```

- Sidebar: fixed, 240px, scroll interno, overlay en mobile
- Header: h-14, hamburger menú en mobile, search + notifs + avatar
- Content: max-w-[1440px], padding responsive

---

## 4. Patrones de Página

### Página de Listado (CRUD)
```
┌──────────────────────────────────────────────┐
│ [Breadcrumbs]                                 │
│ Título                    [Acción Principal]  │
│ Subtítulo / descripción                       │
├──────────────────────────────────────────────┤
│ 🔍 Buscador      [Filtros]  [Orden]  [Vista] │
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ DataTable (o Grid)                        │ │
│ │                                           │ │
│ │ • Loading: 4-6 filas skeleton animado     │ │
│ │ • Empty: icono + mensaje + CTA           │ │
│ │ • Error: mensaje + botón reintentar       │ │
│ │ • Data: filas con hover, select, actions  │ │
│ └──────────────────────────────────────────┘ │
│ Pagination: "X registros — Pág Y de Z"       │
└──────────────────────────────────────────────┘
```

### Página de Formulario
```
┌──────────────────────────────────────────────┐
│ [Breadcrumbs]  ← Volver                      │
│ Título del Formulario   [Cancelar] [Guardar] │
├──────────────────────────────────────────────┤
│ ┌─────────── SectionCard ──────────────────┐ │
│ │ Label                    [Input]          │ │
│ │ Label                    [Input]          │ │
│ │ Label                    [Select]         │ │
│ └──────────────────────────────────────────┘ │
│ ┌─────────── SectionCard ──────────────────┐ │
│ │ Label                    [Textarea]       │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## 5. Componentes

### DataTable
- Desktop: tabla con cabecera sticky, hover en filas, checkbox select
- Mobile: tarjetas apiladas con etiquetas, optimizado para toque
- Sort: indicador visual en cabecera (flecha up/down)
- Paginación integrada con `pageSize` configurable
- Estados: loading (skeleton), empty, error
- Columnas configurables: `sortable`, `numeric`, `hiddenOnMobile`, `render`

### Botones
- `primary`: teal sólido con hover más oscuro
- `secondary`: borde sutil, sin relleno
- `ghost`: solo texto, para acciones contextuales
- `danger`: rojo para eliminar
- Loading state con spinner
- Active state con scale(0.97)

### Inputs
- Borde sutil, sin border-radius, altura 40px (density)
- Focus: ring teal de 2px
- Variantes: outline (default), filled
- Estados: error (borde rojo), success (borde verde)
- Iconos: leftIcon (búsqueda), rightIcon

### Badges
- Rounded-full, altura fija 22px, texto tiny
- Variantes: default, success, warning, danger, info, accent
- Uso: estados, etiquetas, contadores

### Cards
- `base`: borde sutil, bg secondary
- `interactive`: hover con lift + border accent
- `elevated`: sombra para modales/drawers

### Modal
- Backdrop con blur + bg oscuro 60%
- Variantes: confirmation, information, form
- Focus trap, escape to close
- Animación: fade + scale

### Empty State
- Icono grande centrado + título + descripción + CTA opcional
- Versión "rich" con decoración de fondo sutil (grid pattern)

### Skeleton
- Variantes: text, title, avatar, image, button, card, table-row
- Animación pulse suave

---

## 6. Micro-interacciones

- Hover en filas de tabla: `bg-surface-tertiary` con 150ms
- Hover en botones: 100ms, cambio de bg
- Focus visible: ring de 2px teal
- Active en botones: scale(0.97) instantáneo
- Apertura de modal: fade 200ms + scale
- Cambio de pestaña: fade 150ms
- Sidebar en mobile: slide 300ms con overlay
- Toast: slide-in desde arriba-derecha, auto-dismiss

---

## 7. Responsive

| Breakpoint | Comportamiento |
|-----------|---------------|
| ≥ 1024px (lg) | Sidebar visible, layout completo |
| 768-1023px (md) | Sidebar overlay, tabla con menos columnas |
| < 768px (sm) | Sidebar overlay, tabla → cards, toolbar apilado |
| < 480px | Inputs full-width, padding reducido |

---

## 8. Accesibilidad

- Todos los botones: `type="button"` y `aria-label` cuando solo tienen icono
- Focus visible: siempre presente y visible
- Contraste: ratio ≥ 4.5:1 para texto normal
- Roles ARIA en componentes interactivos
- `prefers-reduced-motion`: todas las animaciones se desactivan
- Texto alternativo en iconos decorativos

---

## 9. Consistencia

**Reglas de oro:**
1. Toda página de listado usa `PageHeader` + toolbar + `DataTable`
2. Todo formulario usa `PageHeader` + `SectionCard`(s)
3. Toda acción destructiva requiere confirmación en `Modal`
4. Todo loading muestra `Skeleton` (no spinners)
5. Todo estado vacío muestra `EmptyState` con CTA
6. Toda página usa la misma fuente, espaciado y colores
7. No hay estilos inline — solo Tailwind + CSS vars
8. Los breadcrumbs están presentes en toda página anidada
