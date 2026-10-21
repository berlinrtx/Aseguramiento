# UX Contract

## Product context

- **Audience:** equipo universitario desarrollando y presentando una aplicación de gestión de tareas.
- **Primary jobs:** organizar páginas y proyectos, ejecutar tareas, revisar evidencia y demostrar calidad.
- **Target market(s):** Guatemala; contexto académico.
- **Active locales:** es-GT.
- **Language/content register:** español claro, sentence case, sin mensajes técnicos innecesarios.
- **Timezone/calendar policy:** America/Guatemala; fechas visibles en formato local y almacenadas en ISO.
- **Accessibility target:** WCAG 2.2 AA.

## Business-context sources

| Domain / scope | Authoritative source | Source type | Reviewed date |
|---|---|---|---|
| Functional requirements | `Proyecto final - CALIDAD DEL SOFTWARE-1.pdf` | Course brief | 2026-10-21 |
| Permission model | Course brief, section Autenticación | Course brief | 2026-10-21 |
| Task lifecycle | Course brief, section Estados | Course brief | 2026-10-21 |
| Quality evidence | Course brief, section Aseguramiento de calidad | Course brief | 2026-10-21 |

## Visual contract

- **Project `DESIGN.md`:** `DESIGN.md`
- **Token ownership model:** `DESIGN.md` intent/tokens → `src/styles/tokens.css` runtime → shared components.
- **Supported themes:** claro en primera versión; oscuro preparado pero no obligatorio.
- **Design-context owner:** cambios de sistema deben actualizar ambos archivos y ser revisados junto con una pantalla representativa.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | native select for first MVP | `DESIGN.md` + this contract | native | keyboard + visual |
| Date | native date input for first MVP | this contract | native | locale + validation |
| Form | `FormField` + schema adapter | this contract | create / edit | invalid focus + submit |
| Scrollbar | global application stylesheet | `DESIGN.md` | none | computed style |
| Toast | `ToastProvider` | this contract | success / warning / error | aria-live |
| CRUD | page service + route behavior | course brief | return to canvas | full-flow test |
| Drag & drop | task board interaction + move menu | course brief | drag / keyboard menu | keyboard alternative |

## Component behavior

| Component | Default | Hover | Focus | Active | Disabled | Busy | Error |
|---|---|---|---|---|---|---|---|
| Button | clear label | tonal lift | 2px teal ring | pressed | muted + explanation | stable width + spinner | inline message |
| Icon button | tooltip | surface tint | 2px teal ring | pressed | muted | preserve icon box | tooltip/message |
| Input | visible label | border teal | ring + aria | n/a | muted | preserve value | message under field |
| Search | clear button when non-empty | border teal | ring | Enter commits | n/a | debounce 300ms | retry message |
| Textarea | min 6rem, resize none | border teal | ring | n/a | muted | preserve draft | message under field |
| Task card | title + state | surface tint | outline | selected | read-only | skeleton | overdue indicator |

## Dataset navigation

- **Lists:** páginas, proyectos, tareas y actividad.
- **URL state:** committed search, view, filters and selected page; drafts remain local until saved.
- **Empty/loading/error:** empty states explain the next action; skeletons reserve layout; failures preserve entered data and offer retry.
- **Selection:** single task selection for the inspector; bulk actions are deferred until needed.

## Flow ledger

| Operation | Trigger | Pending | Success destination | Success feedback | Failure recovery | Focus outcome |
|---|---|---|---|---|---|---|
| Create page | `Nueva página` | button busy | new page canvas | toast “Página creada” | keep modal values | title field |
| Edit block | inline typing + save | saving label | same canvas | subtle saved state | preserve draft + retry | edited block |
| Move task | drag or move menu | card pending | same board | activity entry + toast | return card + explain rule | moved card |
| Delete | menu → dialog | confirm busy | parent page | toast with undo when possible | remain in context | next logical item |
| Search | type / Enter | debounce | filtered list | result count | retry | search field |

## Navigation and responsive behavior

- **Route document title:** `{page} — Atlas`.
- **Sidebar:** persistent on desktop, drawer on narrow screens.
- **Inspector:** persistent when a task is selected; drawer on narrow screens.
- **Keyboard:** `Cmd/Ctrl+K` opens command palette; `Esc` closes overlays; arrow keys navigate task lists.
- **Focus:** restore focus to the trigger after closing dialogs and to the created/edited item after mutation.

## Overlays and feedback

- **Dialog primitive:** app-owned dialog with focus trap and Escape dismissal.
- **Destructive confirmation:** required for deleting pages, projects or tasks.
- **Toast:** one message per mutation, deduplicated, 4 seconds maximum.
- **Layer order:** dialog > drawer > popover > toast.
- **Unsaved changes:** warn before leaving a dirty page; preserve draft locally.

## Async and resilience

- **Mutation default:** optimistic for local block edits and task moves; pessimistic for destructive actions.
- **Duplicate submits:** disabled while pending; server operations must be idempotent.
- **Draft recovery:** local draft with explicit “Restaurar borrador” action.
- **Session expiry:** preserve pending work, show reauthentication banner and retry after session recovery.

## Validation

- **Schema layer:** shared validation helpers; server remains authoritative.
- **Trigger timing:** inline after blur for fields, full summary on submit.
- **Error policy:** field message plus summary when multiple fields fail.
- **Sensitive values:** never log passwords, tokens or full credentials.
- **Forms:** `noValidate`, first-invalid focus, duplicate-submit prevention.

## Permission and clipboard

- **Permission UI:** hide irrelevant admin navigation; disable visible actions with an explanation; direct forbidden routes show a 403 state.
- **Roles:** admin manages workspaces, projects, users and boards; collaborator manages assigned tasks.
- **Clipboard:** copy buttons show confirmation without exposing sensitive values in toast text.

## Verification

- **Static:** premium project audit and token lint.
- **Browser/device:** desktop laptop width, 900px tablet, 390px mobile.
- **Accessibility:** keyboard-only pass, focus visibility, aria-live feedback, reduced motion.
- **Visual:** inspect canvas, board, task inspector, dialog and empty state in light theme.
