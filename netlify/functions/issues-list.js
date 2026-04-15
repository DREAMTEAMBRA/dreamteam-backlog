const { getConfig, ghFetch, json } = require('./_github');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  try {
    const { owner, repo } = getConfig();
    const project = event.queryStringParameters?.project;
    const state = event.queryStringParameters?.state || 'open';

    const issues = await ghFetch(`/repos/${owner}/${repo}/issues?state=${state}&per_page=100`);
    const filtered = issues
      .filter((i) => !i.pull_request)
      .filter((i) => {
        if (!project || project === 'all') return true;
        return i.labels.some((l) => l.name === `project:${project}`);
      })
      .map((i) => {
        const labelNames = i.labels.map((l) => l.name);
        const status = labelNames.find((n) => n.startsWith('status:')) || 'status:backlog';
        const priority = labelNames.find((n) => n.startsWith('priority:')) || 'priority:p2';
        const projectLabel = labelNames.find((n) => n.startsWith('project:')) || 'project:geral';
        return {
          number: i.number,
          title: i.title,
          body: i.body || '',
          html_url: i.html_url,
          state: i.state,
          assignees: i.assignees.map((a) => a.login),
          labels: labelNames,
          status,
          priority,
          project: projectLabel.replace('project:', ''),
          updated_at: i.updated_at,
          created_at: i.created_at
        };
      });

    return json(200, { items: filtered });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
