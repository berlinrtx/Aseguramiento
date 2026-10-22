import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AuthScreen from './AuthScreen';
import { supabase } from './lib/supabase';
import { addWorkspaceMember, loadCloudWorkspace, upsertCloudTask } from './lib/workspace';
import {
  Activity, Archive, ArrowDown, ArrowUp, BookOpen, CalendarDays, Check,
  ChevronDown, CircleHelp, Clock3, Command, FileCheck2, FileText, Filter,
  FolderKanban, Inbox, LayoutDashboard, LayoutList, Menu, MoreHorizontal,
  PanelRight, Plus, Search, Settings2, Sparkles, Tag, Target, UserRound,
  X, Zap,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'atlas-workspace-v1';
const TODAY = () => new Date().toISOString().slice(0, 10);

const initialData = {
  pages: [
    { id: 'overview', title: 'Visión general', icon: 'spark', type: 'page', eyebrow: 'Workspace / Aseguramiento', blocks: [
      { id: 'b1', type: 'callout', text: 'La calidad se diseña desde el primer bloque, no se revisa al final.' },
      { id: 'b2', type: 'heading', text: 'Proyecto final' },
      { id: 'b3', type: 'paragraph', text: 'Atlas organiza requisitos, tareas y evidencia de calidad en un solo espacio de trabajo. Usa el tablero para mover el trabajo y la vista de página para documentar decisiones.' },
      { id: 'b4', type: 'check', text: 'Definir alcance y roles', checked: true },
      { id: 'b5', type: 'check', text: 'Preparar el plan de pruebas', checked: false },
    ]},
    { id: 'requirements', title: 'Requisitos del sistema', icon: 'file', type: 'page', eyebrow: 'Documentación / Requisitos', blocks: [
      { id: 'r1', type: 'heading', text: 'Mapa funcional' },
      { id: 'r2', type: 'paragraph', text: 'El sistema debe permitir crear proyectos, tableros, estados, tareas y subtareas, manteniendo trazabilidad sobre cada cambio.' },
      { id: 'r3', type: 'bullet', text: 'Autenticación con roles diferenciados' },
      { id: 'r4', type: 'bullet', text: 'Estados controlados: Por hacer, En progreso, En revisión y Completado' },
      { id: 'r5', type: 'bullet', text: 'Dashboard con métricas basadas en datos reales' },
    ]},
    { id: 'tests', title: 'Plan de pruebas', icon: 'check', type: 'page', eyebrow: 'Calidad / Evidencia', blocks: [
      { id: 't1', type: 'heading', text: 'Estrategia de validación' },
      { id: 't2', type: 'paragraph', text: 'Documentaremos ocho casos de prueba, cubriendo autenticación, creación de tareas, cambios de estado y manejo de subtareas.' },
      { id: 't3', type: 'callout', text: 'Criterio de salida: todos los casos críticos deben estar en estado PASÓ.' },
    ]},
  ],
  tasks: [
    { id: 'task-1', title: 'Diseñar modelo de datos', description: 'Definir las relaciones entre proyectos, tableros, tareas y subtareas.', status: 'done', priority: 'high', assignee: 'PV', tag: 'Arquitectura', createdAt: '2026-10-10', startDate: '2026-10-11', due: '2026-10-18', subtasks: [{ id: 's1', text: 'Tablas principales', done: true }, { id: 's2', text: 'Políticas de acceso', done: true }], activity: [{ text: 'Paul creó la tarea', at: '2026-10-10T09:00:00' }, { text: 'Paul la movió a Completado', at: '2026-10-18T16:30:00' }], comments: [] },
    { id: 'task-2', title: 'Construir tablero Kanban', description: 'Implementar las cuatro columnas y las reglas de transición controladas.', status: 'progress', priority: 'high', assignee: 'PV', tag: 'Frontend', createdAt: '2026-10-12', startDate: '2026-10-13', due: '2026-10-25', subtasks: [{ id: 's3', text: 'Columnas de estado', done: true }, { id: 's4', text: 'Mover con teclado', done: false }], activity: [{ text: 'Paul creó la tarea', at: '2026-10-12T09:00:00' }, { text: 'Paul la movió a En progreso', at: '2026-10-13T10:00:00' }], comments: [] },
    { id: 'task-3', title: 'Validar recuperación de contraseña', description: 'Confirmar validaciones, mensajes de error y retorno al flujo de autenticación.', status: 'review', priority: 'medium', assignee: 'AR', tag: 'QA', createdAt: '2026-10-14', startDate: '2026-10-15', due: '2026-10-21', subtasks: [{ id: 's5', text: 'Correo inválido', done: true }, { id: 's6', text: 'Correo de recuperación', done: false }], activity: [{ text: 'Ana creó la tarea', at: '2026-10-14T09:00:00' }, { text: 'Ana la movió a En revisión', at: '2026-10-15T12:00:00' }], comments: [] },
    { id: 'task-4', title: 'Crear casos de prueba', description: 'Documentar los ocho escenarios mínimos exigidos por el proyecto.', status: 'backlog', priority: 'medium', assignee: 'MC', tag: 'Calidad', createdAt: '2026-10-16', startDate: '', due: '2026-10-30', subtasks: [{ id: 's7', text: 'Autenticación', done: false }, { id: 's8', text: 'Subtareas', done: false }], activity: [{ text: 'Marco creó la tarea', at: '2026-10-16T09:00:00' }], comments: [] },
    { id: 'task-5', title: 'Registrar defecto de permisos', description: 'Crear evidencia del defecto encontrado en el flujo de colaboradores.', status: 'backlog', priority: 'high', assignee: 'AR', tag: 'Bug', createdAt: '2026-10-17', startDate: '', due: '2026-10-19', subtasks: [], activity: [{ text: 'Ana creó la tarea', at: '2026-10-17T09:00:00' }], comments: [] },
  ],
  selectedPage: 'overview',
};

const columns = [
  { id: 'backlog', label: 'Por hacer', hint: 'Priorizado', tone: 'neutral' },
  { id: 'progress', label: 'En progreso', hint: 'En desarrollo', tone: 'teal' },
  { id: 'review', label: 'En revisión', hint: 'Validación QA', tone: 'gold' },
  { id: 'done', label: 'Completado', hint: 'Cerrado', tone: 'violet' },
];

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return initialData;
    return { ...initialData, ...saved, tasks: saved.tasks.map((task) => ({ ...task, createdAt: task.createdAt || TODAY(), startDate: task.startDate || '', comments: task.comments || [], activity: (task.activity || []).map((item) => typeof item === 'string' ? { text: item, at: new Date().toISOString() } : item) })) };
  } catch { return initialData; }
}

function Icon({ name, size = 16 }) {
  const props = { size, strokeWidth: 1.8 };
  const icons = { spark: Sparkles, file: FileText, check: FileCheck2, activity: Activity, board: FolderKanban, dashboard: LayoutDashboard };
  const Component = icons[name] || FileText;
  return <Component {...props} />;
}

function Avatar({ initials, tone = 'teal' }) { return <span className={`avatar avatar-${tone}`}>{initials}</span>; }

function App() {
  const [data, setData] = useState(loadData);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState('page');
  const [selectedTaskId, setSelectedTaskId] = useState('task-2');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [cloud, setCloud] = useState({ ready: false, boardId: null, error: '' });
  const [memberModal, setMemberModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => { if (mounted) { setSession(currentSession); setAuthLoading(false); } });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setAuthLoading(false); });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    let active = true;
    loadCloudWorkspace(session.user.id, loadData().tasks).then((remote) => {
      if (!active) return;
      setData((current) => ({ ...current, tasks: remote.tasks.length ? remote.tasks : current.tasks }));
      setCloud({ ready: true, boardId: remote.boardId, workspaceId: remote.workspaceId, error: '' });
    }).catch((error) => { if (active) setCloud({ ready: false, boardId: null, error: error.message || 'No se pudo conectar con Supabase' }); });
    return () => { active = false; };
  }, [session?.user?.id]);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data]);
  useEffect(() => {
    const handleKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setModal('command'); }
      if (event.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
  }, []);
  useEffect(() => { if (toast) { const timeout = setTimeout(() => setToast(''), 3000); return () => clearTimeout(timeout); } }, [toast]);

  const currentPage = data.pages.find((page) => page.id === data.selectedPage) || data.pages[0];
  const selectedTask = data.tasks.find((task) => task.id === selectedTaskId) || data.tasks[0];
  const filteredPages = data.pages.filter((page) => page.title.toLowerCase().includes(search.toLowerCase()));
  const actorName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Usuario';
  const stats = useMemo(() => ({ total: data.tasks.length, done: data.tasks.filter((task) => task.status === 'done').length, progress: data.tasks.filter((task) => task.status === 'progress').length, overdue: data.tasks.filter((task) => task.due && task.due < TODAY() && task.status !== 'done').length }), [data.tasks]);

  const notify = (message) => { setToast(message); };
  const updateData = (recipe) => setData((current) => recipe({ ...current, pages: current.pages.map((page) => ({ ...page, blocks: page.blocks.map((block) => ({ ...block })) })), tasks: current.tasks.map((task) => ({ ...task, subtasks: task.subtasks.map((subtask) => ({ ...subtask })), activity: [...task.activity] })) }));

  function selectPage(id) { setData((current) => ({ ...current, selectedPage: id })); setView('page'); setSidebarOpen(false); }
  function updatePage(patch) { setData((current) => ({ ...current, pages: current.pages.map((page) => page.id === current.selectedPage ? { ...page, ...patch } : page) })); }
  function updateTask(id, patch, activity) {
    setData((current) => {
      const tasks = current.tasks.map((task) => task.id === id ? { ...task, ...patch, activity: activity ? [...task.activity, { text: activity, at: new Date().toISOString() }] : task.activity } : task);
      const changed = tasks.find((task) => task.id === id);
      if (cloud.ready && changed?.cloudId) upsertCloudTask(changed, cloud.boardId, session.user.id).catch((error) => setCloud((value) => ({ ...value, error: error.message })));
      return { ...current, tasks };
    });
  }
  function moveTask(task, nextStatus) {
    const from = columns.find((column) => column.id === task.status)?.label;
    const to = columns.find((column) => column.id === nextStatus)?.label;
    if (task.status === 'backlog' && nextStatus === 'review') { notify('La tarea debe pasar primero por En progreso'); return; }
    if (task.status === 'progress' && nextStatus === 'done') { notify('QA debe aprobar antes de completar la tarea'); return; }
    updateTask(task.id, { status: nextStatus, startDate: task.startDate || (nextStatus !== 'backlog' ? TODAY() : '') }, `${actorName} movió la tarea de ${from} a ${to}`); notify(`Movida a ${to}`);
  }
  function addPage() { const page = { id: `page-${Date.now()}`, title: 'Nueva página', icon: 'file', type: 'page', eyebrow: 'Workspace / Sin clasificar', blocks: [{ id: `block-${Date.now()}`, type: 'paragraph', text: 'Empieza a escribir aquí…' }] }; setData((current) => ({ ...current, pages: [...current.pages, page], selectedPage: page.id })); setView('page'); notify('Página creada'); }
  async function addTask(payload) { const task = { ...payload, id: `task-${Date.now()}`, createdAt: TODAY(), startDate: '', activity: [{ text: `${actorName} creó la tarea`, at: new Date().toISOString() }], comments: [], subtasks: [] }; if (cloud.ready) { try { const saved = await upsertCloudTask(task, cloud.boardId, session.user.id); Object.assign(task, saved); } catch (error) { setCloud((value) => ({ ...value, error: error.message })); } } setData((current) => ({ ...current, tasks: [...current.tasks, task] })); setSelectedTaskId(task.id); setModal(null); setInspectorOpen(true); notify('Tarea creada'); }

  if (authLoading) return <div className="auth-loading"><div className="brand-mark">A</div><span>Preparando tu espacio…</span></div>;
  if (!session) return <AuthScreen />;

  const signedInUser = session.user;
  const displayName = signedInUser.user_metadata?.full_name || signedInUser.email?.split('@')[0] || 'Usuario';
  const initials = displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  async function signOut() { await supabase.auth.signOut(); notify('Sesión cerrada'); }

  return <div className="app-shell">
    <Sidebar pages={filteredPages} activePage={data.selectedPage} search={search} setSearch={setSearch} onSelect={selectPage} onAdd={addPage} open={sidebarOpen} setOpen={setSidebarOpen} userName={displayName} userEmail={signedInUser.email} initials={initials} onSignOut={signOut} onManageMembers={() => setMemberModal(true)} />
    <main className="main-shell">
      <Topbar currentPage={currentPage} view={view} setView={setView} onMenu={() => setSidebarOpen(true)} onCommand={() => setModal('command')} inspectorOpen={inspectorOpen} setInspectorOpen={setInspectorOpen} />
      <div className="workspace-content">
        {view === 'page' && <PageCanvas page={currentPage} updatePage={updatePage} />}
        {view === 'board' && <BoardView tasks={data.tasks} setSelectedTaskId={(id) => { setSelectedTaskId(id); setInspectorOpen(true); }} onMove={moveTask} onAdd={() => setModal('task')} />}
        {view === 'dashboard' && <Dashboard stats={stats} tasks={data.tasks} />}
      </div>
    </main>
    {inspectorOpen && <Inspector task={selectedTask} actorName={actorName} onClose={() => setInspectorOpen(false)} onMove={moveTask} updateTask={updateTask} />}
    {toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}
    {modal === 'task' && <TaskModal onClose={() => setModal(null)} onCreate={addTask} />}
    {modal === 'command' && <CommandPalette onClose={() => setModal(null)} onPage={selectPage} onBoard={() => { setView('board'); setModal(null); }} onDashboard={() => { setView('dashboard'); setModal(null); }} />}
    {memberModal && <MemberModal workspaceId={cloud.workspaceId} onClose={() => setMemberModal(false)} onAdded={() => notify('Usuario agregado al espacio')} />}
  </div>;
}

function Sidebar({ pages, activePage, search, setSearch, onSelect, onAdd, open, setOpen, userName, userEmail, initials, onSignOut, onManageMembers }) {
  return <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
    <div className="sidebar-top"><div className="brand-mark">A</div><div><div className="brand-name">Atlas</div><div className="brand-meta">Aseguramiento</div></div><button className="icon-button mobile-close" aria-label="Cerrar menú" onClick={() => setOpen(false)}><X size={17} /></button></div>
    <button className="workspace-switch" onClick={onManageMembers} title="Compartir espacio de trabajo"><div className="workspace-dot">A</div><span className="workspace-name">Aseguramiento</span><UserRound size={14} /></button>
    <div className="sidebar-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar páginas" aria-label="Buscar páginas" />{search && <button onClick={() => setSearch('')} aria-label="Limpiar búsqueda"><X size={13} /></button>}<kbd>⌘ K</kbd></div>
    <div className="nav-label">Espacio de trabajo</div>
    <nav className="primary-nav"><button className="nav-item" onClick={() => onSelect('overview')}><Inbox size={16} />Inicio</button><button className="nav-item" onClick={() => onSelect('tests')}><Target size={16} />Mi trabajo<span className="nav-count">4</span></button></nav>
    <div className="pages-heading"><span className="nav-label">Páginas</span><button className="icon-button tiny" onClick={onAdd} aria-label="Crear página"><Plus size={15} /></button></div>
    <nav className="page-list">{pages.map((page) => <button key={page.id} className={`page-link ${activePage === page.id ? 'active' : ''}`} onClick={() => onSelect(page.id)}><Icon name={page.icon} size={15} /><span>{page.title}</span><MoreHorizontal size={14} className="page-more" /></button>)}</nav>
    <div className="sidebar-spacer" />
    <div className="sidebar-footer"><button className="nav-item" disabled aria-disabled="true"><Settings2 size={16} />Configuración</button><div className="profile"><Avatar initials={initials || 'US'} tone="coral" /><div><strong>{userName}</strong><span>{userEmail}</span></div><button className="icon-button tiny" onClick={onSignOut} aria-label="Cerrar sesión"><ArrowDown size={15} /></button></div></div>
  </aside>;
}

function Topbar({ currentPage, view, setView, onMenu, onCommand, inspectorOpen, setInspectorOpen }) {
  return <header className="topbar"><button className="icon-button menu-button" onClick={onMenu} aria-label="Abrir menú"><Menu size={19} /></button><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{currentPage.title}</strong></div><div className="topbar-actions"><button className="command-button" onClick={onCommand}><Command size={14} /><span>Comandos</span><kbd>⌘ K</kbd></button><div className="view-switcher"><button className={view === 'page' ? 'selected' : ''} onClick={() => setView('page')}><BookOpen size={15} />Página</button><button className={view === 'board' ? 'selected' : ''} onClick={() => setView('board')}><LayoutList size={15} />Tablero</button><button className={view === 'dashboard' ? 'selected' : ''} onClick={() => setView('dashboard')}><LayoutDashboard size={15} />Resumen</button></div><button className={`icon-button ${inspectorOpen ? 'active-icon' : ''}`} onClick={() => setInspectorOpen((value) => !value)} aria-label="Mostrar panel de actividad"><PanelRight size={17} /></button></div></header>;
}

function PageCanvas({ page, updatePage }) {
  function updateBlock(id, text) { updatePage({ blocks: page.blocks.map((block) => block.id === id ? { ...block, text } : block) }); }
  function addBlock() { updatePage({ blocks: [...page.blocks, { id: `block-${Date.now()}`, type: 'paragraph', text: '' }] }); }
  return <div className="page-canvas"><div className="page-cover"><div className="cover-grid" /></div><article className="document"><div className="document-eyebrow"><span className="eyebrow-dot" />{page.eyebrow}<span className="saved-state"><Check size={12} />Guardado</span></div><input className="page-title" value={page.title} onChange={(event) => updatePage({ title: event.target.value })} aria-label="Título de la página" /><div className="document-meta"><span><CalendarDays size={14} />Actualizado hoy</span><span><UserRound size={14} />Paul Verlaine</span><button className="subtle-button" disabled aria-disabled="true"><Tag size={13} />Añadir etiqueta</button></div><div className="evidence-line">{page.blocks.map((block) => <div key={block.id} className="evidence-node" />)}</div><section className="blocks">{page.blocks.map((block) => <Block key={block.id} block={block} onChange={(text) => updateBlock(block.id, text)} />)}<button className="add-block" onClick={addBlock}><Plus size={15} />Añadir bloque</button></section><div className="document-footer"><span>Última edición hace 2 min</span><span className="mono">ATLAS / {page.id.toUpperCase()}</span></div></article></div>;
}

function Block({ block, onChange }) {
  if (block.type === 'callout') return <div className="callout-block"><div className="callout-icon"><Sparkles size={16} /></div><textarea className="resize-none" value={block.text} onChange={(event) => onChange(event.target.value)} aria-label="Callout" /></div>;
  if (block.type === 'heading') return <input className="block-heading" value={block.text} onChange={(event) => onChange(event.target.value)} aria-label="Título de bloque" />;
  if (block.type === 'check') return <label className="check-block"><input type="checkbox" checked={block.checked} onChange={(event) => onChange(event.target.checked ? '✓ ' + block.text.replace(/^✓ /, '') : block.text.replace(/^✓ /, ''))} /><span>{block.text}</span></label>;
  if (block.type === 'bullet') return <div className="bullet-block"><span>•</span><input value={block.text} onChange={(event) => onChange(event.target.value)} aria-label="Elemento de lista" /></div>;
  return <textarea className="paragraph-block resize-none" value={block.text} onChange={(event) => onChange(event.target.value)} aria-label="Texto de bloque" />;
}

function BoardView({ tasks, setSelectedTaskId, onMove, onAdd }) {
  const [dragged, setDragged] = useState(null);
  return <section className="board-view"><div className="section-heading"><div><div className="eyebrow">Ejecución / tablero</div><h1>Flujo de calidad</h1><p>Convierte el plan en evidencia visible.</p></div><button className="primary-button" onClick={onAdd}><Plus size={16} />Nueva tarea</button></div><div className="board-toolbar"><div className="toolbar-filter"><Filter size={15} />Todas las tareas</div><div className="board-legend"><span><i className="legend-dot overdue" />Vencida</span><span><i className="legend-dot review" />En revisión</span></div></div><div className="kanban">{columns.map((column) => { const columnTasks = tasks.filter((task) => task.status === column.id); return <div className="kanban-column" key={column.id} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged) onMove(dragged, column.id); setDragged(null); }}><div className="column-heading"><div><h2>{column.label}</h2><span>{column.hint}</span></div><span className={`column-count count-${column.tone}`}>{columnTasks.length}</span></div><div className="column-cards">{columnTasks.map((task) => <TaskCard key={task.id} task={task} onClick={() => setSelectedTaskId(task.id)} draggable onDragStart={() => setDragged(task)} />)}</div><button className="column-add" onClick={onAdd}><Plus size={14} />Añadir tarea</button></div>; })}</div></section>;
}

function TaskCard({ task, onClick, draggable, onDragStart }) {
  const completed = task.subtasks.filter((item) => item.done).length;
  const overdue = task.due && task.due < TODAY() && task.status !== 'done';
  return <button className={`task-card ${overdue ? 'is-overdue' : ''}`} onClick={onClick} draggable={draggable} onDragStart={onDragStart}><div className="task-card-top"><span className={`priority priority-${task.priority}`}><Zap size={11} />{task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}</span><MoreHorizontal size={16} /></div><strong>{task.title}</strong><p>{task.description}</p><div className="task-card-meta"><span className="task-tag">{task.tag}</span>{task.subtasks.length > 0 && <span className="subtask-count"><Check size={12} />{completed}/{task.subtasks.length}</span>}<Avatar initials={task.assignee} /></div>{overdue && <div className="overdue-label"><Clock3 size={12} />Vencida · {formatDate(task.due)}</div>}</button>;
}

function Inspector({ task, actorName, onClose, onMove, updateTask }) {
  if (!task) return null;
  const completed = task.subtasks.filter((item) => item.done).length;
  function toggleSubtask(id) { const subtasks = task.subtasks.map((item) => item.id === id ? { ...item, done: !item.done } : item); updateTask(task.id, { subtasks }, `${actorName} actualizó una subtarea`); }
  function setField(field, value) { updateTask(task.id, { [field]: value }, `${actorName} actualizó ${field === 'due' ? 'la fecha límite' : field === 'startDate' ? 'la fecha de inicio' : 'la tarea'}`); }
  function addSubtask(event) { if (event.key !== 'Enter' || !event.currentTarget.value.trim()) return; const subtasks = [...task.subtasks, { id: `sub-${Date.now()}`, text: event.currentTarget.value.trim(), done: false }]; updateTask(task.id, { subtasks }, `${actorName} agregó una subtarea`); event.currentTarget.value = ''; }
  function addComment(event) { if (event.key !== 'Enter' || !event.currentTarget.value.trim()) return; const comments = [...(task.comments || []), { author: actorName, text: event.currentTarget.value.trim(), at: new Date().toISOString() }]; updateTask(task.id, { comments }, `${actorName} agregó un comentario`); event.currentTarget.value = ''; }
  const overdue = task.due && task.due < TODAY() && task.status !== 'done';
  return <aside className="inspector"><div className="inspector-head"><div><span className="eyebrow">Tarea seleccionada</span><strong>Propiedades</strong></div><button className="icon-button" onClick={onClose} aria-label="Cerrar panel"><X size={17} /></button></div><div className="inspector-scroll"><div className="inspector-title"><div className={`status-pip pip-${task.status}`} /><h2>{task.title}</h2><button className="icon-button tiny" disabled aria-label="Más opciones"><MoreHorizontal size={15} /></button></div><p className="inspector-description">{task.description}</p><div className="property-list"><label><span>Estado</span><select value={task.status} onChange={(event) => onMove(task, event.target.value)}>{columns.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}</select></label><div className="property-row"><span>Prioridad</span><strong className={`priority priority-${task.priority}`}>{task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}</strong></div><div className="property-row"><span>Responsable</span><span className="person"><Avatar initials={task.assignee} />{task.assignee === 'PV' ? 'Paul Verlaine' : task.assignee === 'AR' ? 'Ana Ruiz' : 'Marco Chen'}</span></div><label><span>Creada</span><input type="date" value={task.createdAt || ''} onChange={(event) => setField('createdAt', event.target.value)} /></label><label><span>Inicio</span><input type="date" value={task.startDate || ''} onChange={(event) => setField('startDate', event.target.value)} /></label><label><span>Fecha límite</span><input className={overdue ? 'danger-text' : ''} type="date" value={task.due || ''} onChange={(event) => setField('due', event.target.value)} /></label></div><div className="inspector-section"><div className="section-label"><span>Subtareas / checklist</span><span>{completed}/{task.subtasks.length} · {task.subtasks.length ? Math.round((completed / task.subtasks.length) * 100) : 0}%</span></div><div className="progress-track"><span style={{ width: task.subtasks.length ? `${(completed / task.subtasks.length) * 100}%` : '0%' }} /></div><div className="subtask-list">{task.subtasks.length ? task.subtasks.map((subtask) => <label key={subtask.id} className={`subtask ${subtask.done ? 'done' : ''}`}><input type="checkbox" checked={subtask.done} onChange={() => toggleSubtask(subtask.id)} /><span>{subtask.text}</span></label>) : <span className="empty-note">No hay subtareas todavía.</span>}<input className="inline-add" placeholder="Agregar subtarea + Enter" onKeyDown={addSubtask} /></div></div><div className="inspector-section"><div className="section-label"><span>Comentarios</span><span>{(task.comments || []).length}</span></div><div className="comment-list">{(task.comments || []).map((comment, index) => <div className="comment" key={`${comment.at}-${index}`}><strong>{comment.author}</strong><span>{comment.text}</span><small>{formatDateTime(comment.at)}</small></div>)}</div><input className="inline-add" placeholder="Escribir comentario + Enter" onKeyDown={addComment} /></div><div className="inspector-section activity-section"><div className="section-label"><span>Actividad / trazabilidad</span><Activity size={14} /></div><div className="activity-list">{task.activity.map((item, index) => <div className="activity-item" key={`${item.text}-${index}`}><div className="activity-dot" /><div><strong>{item.text}</strong><span>{formatDateTime(item.at)}</span></div></div>)}</div></div></div></aside>;
}

function Dashboard({ stats, tasks }) {
  const completion = Math.round((stats.done / stats.total) * 100);
  return <section className="dashboard-view"><div className="section-heading"><div><div className="eyebrow">Workspace / evidencia</div><h1>Resumen de calidad</h1><p>Una lectura rápida del estado real del proyecto.</p></div><button className="secondary-button" onClick={() => window.print()}><Archive size={15} />Exportar resumen</button></div><div className="stats-grid"><StatCard label="Tareas totales" value={stats.total} detail="en el proyecto" icon={<LayoutList size={17} />} tone="neutral" /><StatCard label="Completadas" value={stats.done} detail={`${completion}% del total`} icon={<Check size={17} />} tone="teal" /><StatCard label="En progreso" value={stats.progress} detail="en desarrollo activo" icon={<Zap size={17} />} tone="violet" /><StatCard label="Vencidas" value={stats.overdue} detail="requieren atención" icon={<Clock3 size={17} />} tone="coral" /></div><div className="dashboard-grid"><div className="insight-card"><div className="card-heading"><div><span className="eyebrow">Ritmo de entrega</span><h2>Avance del proyecto</h2></div><span className="big-percent">{completion}%</span></div><div className="big-progress"><span style={{ width: `${completion}%` }} /></div><div className="progress-labels"><span>Inicio</span><span>Meta: 100%</span></div><div className="evidence-note"><Sparkles size={15} /><span>La mayor concentración está en construcción y revisión QA.</span></div></div><div className="insight-card activity-summary"><div className="card-heading"><div><span className="eyebrow">Señales</span><h2>Atención inmediata</h2></div><CircleHelp size={18} /></div>{tasks.filter((task) => task.due && task.due < TODAY() && task.status !== 'done').map((task) => <div className="signal-row" key={task.id}><span className="signal-icon"><Clock3 size={14} /></span><div><strong>{task.title}</strong><span>Venció el {formatDate(task.due)}</span></div><ArrowUp size={15} /></div>)}{stats.overdue === 0 && <div className="empty-dashboard"><Check size={18} />No hay tareas vencidas</div>}</div></div></section>;
}

function StatCard({ label, value, detail, icon, tone }) { return <div className={`stat-card stat-${tone}`}><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }

function TaskModal({ onClose, onCreate }) {
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [priority, setPriority] = useState('medium'); const [tag, setTag] = useState('Frontend'); const [due, setDue] = useState('2026-10-31'); const [assignee, setAssignee] = useState('PV');
  const submit = (event) => { event.preventDefault(); if (!title.trim()) return; onCreate({ title: title.trim(), description: description.trim() || 'Sin descripción todavía.', priority, tag, due, status: 'backlog', assignee }); };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title"><div className="modal-head"><div><span className="eyebrow">Nueva entrada</span><h2 id="task-modal-title">Crear tarea</h2></div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div><form onSubmit={submit} noValidate><label className="field"><span>Título</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Diseñar flujo de autenticación" required /></label><label className="field"><span>Descripción</span><textarea className="resize-none" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="¿Qué debe quedar listo?" /></label><div className="field-grid"><label className="field"><span>Prioridad</span><select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select></label><label className="field"><span>Fecha límite</span><input type="date" value={due} onChange={(event) => setDue(event.target.value)} /></label></div><div className="field-grid"><label className="field"><span>Responsable</span><select value={assignee} onChange={(event) => setAssignee(event.target.value)}><option value="PV">Paul Verlaine</option><option value="AR">Ana Ruiz</option><option value="MC">Marco Chen</option></select></label><label className="field"><span>Etiqueta / categoría</span><input value={tag} onChange={(event) => setTag(event.target.value)} /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit"><Plus size={16} />Crear tarea</button></div></form></div></div>;
}

function MemberModal({ workspaceId, onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) { event.preventDefault(); if (!email.trim() || !workspaceId) return; setBusy(true); setMessage(''); try { await addWorkspaceMember(workspaceId, email); onAdded(); onClose(); } catch (error) { setMessage(error.message?.includes('No registered user') ? 'Ese correo todavía no tiene una cuenta registrada.' : error.message || 'No se pudo agregar el usuario.'); } finally { setBusy(false); } }
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="member-modal-title"><div className="modal-head"><div><span className="eyebrow">Espacio compartido</span><h2 id="member-modal-title">Agregar colaborador</h2></div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button></div><p className="modal-copy">Agrega el correo de un usuario registrado para compartir este tablero y permitirle editar tareas.</p>{message && <div className="auth-message auth-error">{message}</div>}<form onSubmit={submit} noValidate><label className="field"><span>Correo del colaborador</span><input autoFocus type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="colaborador@correo.com" required /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" disabled={busy}>{busy ? 'Agregando…' : 'Compartir tablero'}</button></div></form></div></div>;
}

function CommandPalette({ onClose, onPage, onBoard, onDashboard }) { return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="command-palette" role="dialog" aria-modal="true"><div className="palette-search"><Search size={17} /><input autoFocus placeholder="Buscar una acción…" /><kbd>Esc</kbd></div><div className="palette-section"><span className="eyebrow">Navegar</span><button onClick={() => onPage('overview')}><BookOpen size={16} /><span>Ir a Visión general</span><kbd>↵</kbd></button><button onClick={onBoard}><LayoutList size={16} /><span>Abrir tablero</span><kbd>↵</kbd></button><button onClick={onDashboard}><LayoutDashboard size={16} /><span>Ver resumen</span><kbd>↵</kbd></button></div></div></div>; }

function formatDate(value) { return value ? new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : 'Sin fecha'; }
function formatDateTime(value) { return value ? new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : 'Sin fecha'; }

export default App;

try {
  createRoot(document.getElementById('root')).render(<App />);
} catch (error) {
  document.getElementById('root').innerHTML = `<pre style="padding:24px;color:#b84a48;white-space:pre-wrap">${String(error?.stack || error)}</pre>`;
}
