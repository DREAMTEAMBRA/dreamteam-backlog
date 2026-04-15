const { getConfig, ghFetch, json } = require('./_github');

function normalizeLabels(currentLabels, { project, status, priority }) {
  const keep = currentLabels.filter(
    (l) => !l.startsWith('project:') && !l.startsWith('status:') && !l.startsWith('priority:')
  );

  if (project) keep.push(`project:${project}`);
  if (status) keep.push(status.startsWith('status:') ? status : `status:${status}`);
  if (priority) keep.push(priority.startsWith('priority:') ? priority : `priority:${priority}`);

  return [...new Set(keep)];
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { owner, repo } = getConfig();
    const payload = JSON.parse(event.body || '{}');

    if (!payload.number) {
      return json(400, { error: 'number é obrigatório' });
    }

    const current = await ghFetch(`/repos/${owner}/${repo}/issues/${payload.number}`);
    const currentLabels = current.labels.map((l) => l.name);

    const labels = normalizeLabels(currentLabels, {
      project: payload.project,
      status: payload.status,
      priority: payload.priority
    });

    const body = {
      labels
    };

    if (typeof payload.title === 'string' && payload.title.trim()) body.title = payload.title.trim();
    if (typeof payload.body === 'string') body.body = payload.body;
    if (payload.state === 'open' || payload.state === 'closed') body.state = payload.state;

    const updated = await ghFetch(`/repos/${owner}/${repo}/issues/${payload.number}`, {
      method: 'PATCH',
      body
    });

    return json(200, { ok: true, html_url: updated.html_url, labels });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
