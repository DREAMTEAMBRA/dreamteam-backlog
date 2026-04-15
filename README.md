# DreamTeam Backlog (Linear-lite)

Kanban visual para gerenciar múltiplos projetos em paralelo usando GitHub Issues como backend.

## Stack
- Frontend estático: HTML/CSS/JS
- Backend: Netlify Functions
- Fonte de verdade: GitHub Issues

## Projetos padrão
- auditoria
- ia
- crowdfunding
- engenharia

## Requisitos
- Node 20+
- `gh` autenticado
- Conta Netlify

## Rodando local
```bash
npm install
export GITHUB_TOKEN=seu_token
export REPO_OWNER=grogobot
export REPO_NAME=dreamteam-backlog
npm run dev
```

## Deploy Netlify
```bash
netlify login
netlify init
netlify env:set GITHUB_TOKEN seu_token
netlify env:set REPO_OWNER grogobot
netlify env:set REPO_NAME dreamteam-backlog
netlify deploy --prod
```

## Bootstrap do GitHub (labels + seed)
```bash
chmod +x scripts/bootstrap-github.sh
./scripts/bootstrap-github.sh grogobot dreamteam-backlog
```

## Fluxo diário sugerido (com Hermes)
1. Abrir board e filtrar projeto.
2. Revisar Top 3 e Bloqueadas.
3. Mover cartões por status.
4. Criar novas tarefas com critérios claros.
5. Fechar dia limpando `doing` e `blocked`.

## Endpoints (Netlify Functions)
- `/.netlify/functions/issues-list`
- `/.netlify/functions/issues-create`
- `/.netlify/functions/issues-update`
