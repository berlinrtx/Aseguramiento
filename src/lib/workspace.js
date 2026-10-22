import { supabase } from './supabase';

export async function loadCloudWorkspace(userId, seedTasks = []) {
  let { data: workspace, error } = await supabase.from('atlas_workspaces').select('id').eq('owner_id', userId).limit(1).maybeSingle();
  if (error) throw error;
  if (!workspace) {
    ({ data: workspace, error } = await supabase.from('atlas_workspaces').insert({ owner_id: userId }).select('id').single());
    if (error) throw error;
  }
  let { data: project, error: projectError } = await supabase.from('atlas_projects').select('id').eq('workspace_id', workspace.id).limit(1).maybeSingle();
  if (projectError) throw projectError;
  if (!project) {
    ({ data: project, error: projectError } = await supabase.from('atlas_projects').insert({ workspace_id: workspace.id }).select('id').single());
    if (projectError) throw projectError;
  }
  let { data: board, error: boardError } = await supabase.from('atlas_boards').select('id').eq('project_id', project.id).limit(1).maybeSingle();
  if (boardError) throw boardError;
  if (!board) {
    ({ data: board, error: boardError } = await supabase.from('atlas_boards').insert({ project_id: project.id }).select('id').single());
    if (boardError) throw boardError;
  }
  let { data: rows, error: tasksError } = await supabase.from('atlas_tasks').select('*').eq('board_id', board.id).order('created_at', { ascending: true });
  if (tasksError) throw tasksError;
  if (!rows.length && seedTasks.length) {
    const inserts = seedTasks.map((task) => ({ board_id: board.id, created_by: userId, title: task.title, description: task.description, priority: task.priority, assignee: task.assignee, tag: task.tag, status: task.status, created_at: task.createdAt || new Date().toISOString().slice(0, 10), start_date: task.startDate || null, due_date: task.due || null, subtasks: task.subtasks || [], comments: task.comments || [], activity: task.activity || [] }));
    const { data: seeded, error: seedError } = await supabase.from('atlas_tasks').insert(inserts).select('*');
    if (seedError) throw seedError;
    rows = seeded;
  }
  return { workspaceId: workspace.id, projectId: project.id, boardId: board.id, tasks: rows.map(fromRow) };
}

export async function upsertCloudTask(task, boardId, userId) {
  const row = { board_id: boardId, created_by: userId, title: task.title, description: task.description, priority: task.priority, assignee: task.assignee, tag: task.tag, status: task.status, created_at: task.createdAt || new Date().toISOString().slice(0, 10), start_date: task.startDate || null, due_date: task.due || null, subtasks: task.subtasks || [], comments: task.comments || [], activity: task.activity || [] };
  const { data, error } = await supabase.from('atlas_tasks').upsert({ ...(task.cloudId ? { id: task.cloudId } : {}), ...row }).select('*').single();
  if (error) throw error;
  return fromRow(data);
}

function fromRow(row) { return { id: row.id, cloudId: row.id, title: row.title, description: row.description, priority: row.priority, assignee: row.assignee, tag: row.tag, status: row.status, createdAt: row.created_at, startDate: row.start_date || '', due: row.due_date || '', subtasks: row.subtasks || [], comments: row.comments || [], activity: row.activity || [] }; }
