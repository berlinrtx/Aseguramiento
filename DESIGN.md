---
version: alpha
name: "Aseguramiento — Atlas"
description: "Un espacio de trabajo editorial para convertir requisitos, tareas y evidencia de calidad en un proyecto demostrable."
colors:
  primary: "#2F8F83"
  background: "#F7F4EE"
  ink: "#20272B"
  paper: "#F7F4EE"
  paper-warm: "#EFE9DE"
  surface: "#FFFCF7"
  teal: "#2F8F83"
  teal-dark: "#246F67"
  coral: "#DF765C"
  violet: "#7568B5"
  gold: "#C49A52"
  line: "#D9D3C8"
  muted: "#7A817E"
  danger: "#B84A48"
  success: "#327B5D"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "2.25rem"
    lineHeight: "1.08"
  sans:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    lineHeight: "1.5"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.75rem"
    lineHeight: "1.4"
rounded:
  DEFAULT: "0.5rem"
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.875rem"
  pill: "999px"
spacing:
  unit: "0.25rem"
  sidebar: "17rem"
  inspector: "20rem"
  page-max: "88rem"
  canvas-max: "54rem"
components:
  button: { height: "2.5rem", rounded: "0.5rem", backgroundColor: "#246F67", textColor: "#FFFCF7" }
  icon-button: { size: "2.25rem", rounded: "0.5rem", backgroundColor: "#FFFCF7" }
  card: { rounded: "0.875rem", backgroundColor: "#FFFCF7" }
  input: { height: "2.75rem", rounded: "0.5rem", backgroundColor: "#FFFCF7" }
  dialog: { rounded: "0.875rem", width: "32rem", backgroundColor: "#FFFCF7" }
  block: { height: "2.5rem", rounded: "0.5rem", backgroundColor: "#F7F4EE" }
---

# Atlas — Design System

## Overview

### Creative North Star

Atlas se inspira en un cuaderno de laboratorio de calidad: páginas claras, notas marginales, sellos de evidencia y una columna vertebral que hace visible la trazabilidad. La interfaz debe sentirse como una mesa de trabajo enfocada, no como un panel corporativo genérico.

### Product context and register

- **Audience and primary job:** equipos universitarios que necesitan planificar, ejecutar y demostrar el desarrollo de una aplicación de gestión de tareas con calidad incorporada.
- **Target market(s) and evidence:** Guatemala; el brief académico exige una demostración con datos reales, historial y casos de prueba.
- **Locale(s) and language policy:** español de Guatemala como idioma principal; fechas en formato local y textos de interfaz en sentence case.
- **Usage scene:** laptop durante desarrollo y presentación en clase; debe sostener densidad de información sin perder lectura a distancia.
- **Register:** producto; expresivo en el canvas y sobrio en formularios, estados y evidencia.
- **Memorable signature:** la “línea de evidencia”: una guía vertical teal que conecta bloques, actividad y estados de calidad; los puntos coral señalan decisiones o defectos.
- **Restraint:** navegación, permisos, formularios y estados de error deben ser predecibles y silenciosos.
- **Anti-references:** no parecer una copia de Notion, un dashboard SaaS con tarjetas flotantes por todas partes, ni un tablero Kanban infantil.
- **Token ownership/runtime mapping:** `DESIGN.md` es la fuente de intención y tokens; el runtime se mapeará a `src/styles/tokens.css` y a componentes compartidos. Cualquier cambio de token se actualiza aquí y en el runtime en el mismo cambio.

## Colors

El fondo `paper` crea una superficie de lectura cálida; `surface` reserva el blanco para áreas activas y formularios. `ink` es el texto principal. `teal` representa avance, navegación activa y acciones primarias. `coral` marca atención, defectos y tareas vencidas; nunca se usa como decoración dominante. `violet` identifica referencias, notas y contexto; `gold` se reserva para estados de revisión o evidencia pendiente. Las líneas son finas y de bajo contraste, pero el texto siempre debe alcanzar WCAG 2.2 AA. Selección: teal al 12% de opacidad con borde teal.

La aplicación tendrá tema claro primero. Un tema oscuro futuro conserva la jerarquía semántica: ink y paper se invierten por roles, pero teal/coral mantienen su significado y se ajustan por contraste.

## Typography

`Fraunces` se usa con moderación para títulos de página y nombres de documentos: aporta carácter editorial sin volver ornamental la herramienta. `Inter` sostiene controles, navegación y lectura continua. `IBM Plex Mono` se usa para IDs, fechas, eventos de actividad y pequeños datos de QA. Los títulos no deben superar dos líneas en el canvas principal; el texto de ayuda se mantiene entre 55 y 75 caracteres por línea.

## Layout

La aplicación usa una composición de tres zonas:

```text
┌────────────── sidebar ──────────────┬──────────── canvas ────────────┬── inspector ──┐
│ workspace + páginas + favoritos      │ breadcrumb + título             │ actividad     │
│ navegación estable                   │ bloques / tablero / contenido   │ propiedades   │
│                                      │ línea de evidencia              │ comentarios   │
└─────────────────────────────────────┴─────────────────────────────────┴───────────────┘
```

El sidebar mide 17rem en escritorio y se convierte en drawer en pantallas menores a 900px. El inspector mide 20rem y puede ocultarse; el canvas conserva un ancho máximo de 54rem para lectura. El producto completo usa un máximo de 88rem. En móvil, la navegación y el inspector se convierten en hojas inferiores; nunca se comprime el canvas hasta hacerlo ilegible.

## Elevation & Depth

La jerarquía se comunica primero con tonos de superficie y líneas, no con sombras. Las páginas y bloques descansan sobre `paper`; el bloque seleccionado usa `surface` y una línea teal. Las sombras solo aparecen en menús, diálogos y hojas superpuestas, con una sombra corta y suave. No usar sombras en cada tarjeta del tablero.

## Shapes

Los contenedores de trabajo usan `lg`; controles y bloques usan `DEFAULT`; etiquetas de estado usan `pill`. Los separadores son líneas de 1px. Los iconos son lineales, de 1.75px, con cajas ópticas de 20px. Los elementos arrastrables tienen un área de agarre visible, pero también una alternativa de menú para moverlos sin drag & drop.

## Components

### Foundational visual states

Todo control tiene estados default, hover, focus-visible teal de 2px, active, selected, disabled, busy, success, warning y error. El foco nunca depende solo del color. Los estados ocupan el mismo espacio que su estado normal para evitar saltos de layout.

### Buttons and actions

La acción primaria es teal sólido con texto claro. Las acciones secundarias son `surface` con borde. Las acciones destructivas usan coral oscuro o danger y requieren confirmación dentro de un diálogo propio. Los icon buttons siempre tienen nombre accesible y tooltip al pasar el cursor.

### Navigation and data display

La navegación principal muestra workspace, páginas, tableros y favoritos. El canvas tiene breadcrumb compacto, título editable y una barra de comandos contextual. Las tareas pueden verse como lista, tablero o documento; el cambio de vista conserva filtros y selección. Las métricas del dashboard usan números grandes con una etiqueta breve, no tarjetas decorativas.

### Forms and overlays

Los formularios usan labels visibles, mensajes inline y `noValidate`; el primer error recibe foco. La búsqueda tiene botón de limpiar y debounce de 300ms. Dialogs tienen título, descripción, foco inicial y retorno de foco. Toasts aparecen abajo a la derecha en escritorio y arriba en móvil, dentro de una región aria-live.

### Iconography

Usar una familia lineal consistente, preferentemente Lucide. Los iconos acompañan al texto en acciones importantes; no sustituyen labels en navegación primaria ni en cambios de estado.

### Motion

El movimiento comunica organización: el sidebar entra con 180ms, los bloques se reordenan con 220ms y los estados de guardado muestran una transición breve. No animar cada hover. Respetar `prefers-reduced-motion` y reducir todo a cambios instantáneos de estado.

### Content and data visualization

La voz es directa y útil: “Crear página”, “Mover a revisión”, “Guardar cambios”. Los estados usan sustantivos consistentes: Por hacer, En progreso, En revisión, Completado. Los gráficos del dashboard deben tener una alternativa textual y no depender solo del color.

## Do's and Don'ts

- **Do:** hacer visible la relación entre una tarea, su evidencia y su historial.
- **Do:** mantener el canvas como el centro de trabajo y la navegación como soporte.
- **Don't:** llenar la pantalla de tarjetas, gradientes o badges sin función.
- **Don't:** ocultar reglas de transición o permisos detrás de interacciones ambiguas.
