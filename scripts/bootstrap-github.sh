#!/usr/bin/env bash
set -euo pipefail

OWNER="${1:-grogobot}"
REPO="${2:-dreamteam-backlog}"

create_label () {
  local name="$1" color="$2" desc="$3"
  gh label create "$name" --repo "$OWNER/$REPO" --color "$color" --description "$desc" --force >/dev/null
  echo "ok: $name"
}

# status
create_label "status:backlog" "6E7681" "Entrada do backlog"
create_label "status:todo" "1D76DB" "Pronto para iniciar"
create_label "status:doing" "FBCA04" "Em andamento"
create_label "status:review" "C2E0C6" "Em revisão"
create_label "status:blocked" "B60205" "Bloqueada"
create_label "status:done" "0E8A16" "Concluída"

# priority
create_label "priority:p1" "D93F0B" "Alta prioridade"
create_label "priority:p2" "FBCA04" "Média prioridade"
create_label "priority:p3" "0E8A16" "Baixa prioridade"

# projects
create_label "project:auditoria" "5319E7" "Projeto Auditoria"
create_label "project:ia" "0052CC" "Projeto IA"
create_label "project:crowdfunding" "C5DEF5" "Projeto Crowdfunding"
create_label "project:engenharia" "BFDADC" "Projeto Engenharia Civil"

# seed issues
create_issue () {
  local title="$1" body="$2" labels="$3"
  gh issue create --repo "$OWNER/$REPO" --title "$title" --body "$body" --label "$labels" >/dev/null
  echo "issue: $title"
}

create_issue "[Auditoria] Definir escopo mensal de checagens" "Primeira tarefa seed do projeto de auditoria." "project:auditoria,status:backlog,priority:p1"
create_issue "[IA] Planejar backlog trimestral de features" "Mapear épicos e entregas da vertical IA." "project:ia,status:todo,priority:p1"
create_issue "[Crowdfunding] Estruturar calendário de campanha" "Definir marcos semanais e entregáveis." "project:crowdfunding,status:backlog,priority:p2"
create_issue "[Engenharia] Organizar pipeline comercial e técnico" "Levantamento de propostas, prazos e visitas." "project:engenharia,status:todo,priority:p2"

echo "Bootstrap concluído para $OWNER/$REPO"
