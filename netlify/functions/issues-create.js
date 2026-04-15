const { getConfig, ghFetch, json } = require('./_github');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { owner, repo } = getConfig();
    const payload = JSON.parse(event.body || '{}');

    if (!payload.title || !payload.project) {
      return json(400, { error: 'title e project são obrigatórios' });
    }

    const labels = [
      `project:${payload.project}`,
      payload.status || 'status:backlog',
      payload.priority || 'priority:p2'
    ];

    const issue = await ghFetch(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: {
        title: payload.title,
        body: payload.body || '',
        labels
      }
    });

    return json(200, { number: issue.number, html_url: issue.html_url });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
