const state = { items: [], project: 'all' };

const board = document.getElementById('board');
const projectFilter = document.getElementById('projectFilter');
const refreshBtn = document.getElementById('refreshBtn');
const newIssueBtn = document.getElementById('newIssueBtn');
const issueDialog = document.getElementById('issueDialog');
const issueForm = document.getElementById('issueForm');
const cancelDialog = document.getElementById('cancelDialog');

async function api(path, method = 'GET', body) {
  const res = await fetch(`/.netlify/functions/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na API');
  return data;
}

function byPriority(items) {
  const score = { 'priority:p1': 1, 'priority:p2': 2, 'priority:p3': 3 };
  return [...items].sort((a, b) => (score[a.priority] || 99) - (score[b.priority] || 99));
}

function renderSummary() {
  const top3 = byPriority(state.items.filter((i) => i.status !== 'status:done')).slice(0, 3);
  document.getElementById('top3').innerHTML = top3.length
    ? top3.map((i) => `<li>#${i.number} ${i.title}</li>`).join('')
    : '<li>Sem tarefas prioritárias.</li>';

  const blocked = state.items.filter((i) => i.status === 'status:blocked');
  document.getElementById('blockedList').innerHTML = blocked.length
    ? blocked.map((i) => `<li>#${i.number} ${i.title}</li>`).join('')
    : '<li>Nada bloqueado 🎉</li>';

  const counts = ['status:backlog','status:todo','status:doing','status:review','status:blocked','status:done']
    .map((s) => `${s.replace('status:','')}: ${state.items.filter((i) => i.status === s).length}`);
  document.getElementById('summary').innerHTML = counts.map((c) => `<li>${c}</li>`).join('');
}

function renderBoard() {
  board.querySelectorAll('.cards').forEach((col) => (col.innerHTML = ''));
  const tpl = document.getElementById('cardTemplate');

  state.items.forEach((issue) => {
    const col = board.querySelector(`.column[data-status="${issue.status}"] .cards`);
    if (!col) return;

    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.number = issue.number;
    node.querySelector('.issue-number').textContent = `#${issue.number}`;
    node.querySelector('.priority').textContent = issue.priority.replace('priority:', '').toUpperCase();
    node.querySelector('h4').textContent = issue.title;
    node.querySelector('.project-pill').textContent = issue.project;
    const link = node.querySelector('a');
    link.href = issue.html_url;

    node.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', issue.number);
    });

    col.appendChild(node);
  });

  renderSummary();
}

async function loadIssues() {
  const data = await api(`issues-list?project=${encodeURIComponent(state.project)}`);
  state.items = data.items;
  renderBoard();
}

board.querySelectorAll('.column').forEach((col) => {
  col.addEventListener('dragover', (e) => {
    e.preventDefault();
    col.classList.add('drag-over');
  });
  col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
  col.addEventListener('drop', async (e) => {
    e.preventDefault();
    col.classList.remove('drag-over');
    const number = Number(e.dataTransfer.getData('text/plain'));
    const status = col.dataset.status;
    await api('issues-update', 'POST', { number, status });
    await loadIssues();
  });
});

projectFilter.addEventListener('change', async () => {
  state.project = projectFilter.value;
  await loadIssues();
});

refreshBtn.addEventListener('click', loadIssues);

newIssueBtn.addEventListener('click', () => issueDialog.showModal());
cancelDialog.addEventListener('click', () => issueDialog.close());

issueForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(issueForm);
  const payload = Object.fromEntries(formData.entries());
  await api('issues-create', 'POST', payload);
  issueDialog.close();
  issueForm.reset();
  await loadIssues();
});

loadIssues().catch((err) => {
  alert(`Erro ao carregar backlog: ${err.message}`);
});
