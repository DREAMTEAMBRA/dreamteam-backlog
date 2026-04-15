const GH_API = 'https://api.github.com';

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER || 'grogobot';
  const repo = process.env.REPO_NAME || 'dreamteam-backlog';

  if (!token) {
    throw new Error('Missing GITHUB_TOKEN environment variable');
  }

  return { token, owner, repo };
}

async function ghFetch(path, { method = 'GET', body } = {}) {
  const { token } = getConfig();
  const res = await fetch(`${GH_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.message || `GitHub API error ${res.status}`;
    throw new Error(message);
  }

  return data;
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(payload)
  };
}

module.exports = { getConfig, ghFetch, json };
