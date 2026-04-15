#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   export NETLIFY_AUTH_TOKEN=...
#   ./scripts/deploy-netlify-api.sh [site-name]

SITE_NAME="${1:-dreamteam-backlog}"
API="https://api.netlify.com/api/v1"

if [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
  echo "Erro: defina NETLIFY_AUTH_TOKEN"
  exit 1
fi

WORKDIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP_ZIP="/tmp/dreamteam-backlog-deploy.zip"

cd "$WORKDIR"
python3 - <<'PY'
import os, zipfile
root='/root/dreamteam-backlog'
out='/tmp/dreamteam-backlog-deploy.zip'
include=['index.html','styles.css','app.js','netlify.toml']
func_root=os.path.join(root,'netlify','functions')
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
    for f in include:
        z.write(os.path.join(root,f),f)
    for fn in os.listdir(func_root):
        p=os.path.join(func_root,fn)
        if os.path.isfile(p):
            z.write(p,os.path.join('netlify','functions',fn))
print('zip_ok')
PY

SITE_JSON=$(curl -sS -X POST "$API/sites" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$SITE_NAME\"}")

SITE_ID=$(python3 - <<PY
import json,sys
obj=json.loads('''$SITE_JSON''')
print(obj.get('id',''))
PY
)

if [ -z "$SITE_ID" ]; then
  echo "Falha ao criar site: $SITE_JSON"
  exit 1
fi

# Deploy zip
DEPLOY_JSON=$(curl -sS -X POST "$API/sites/$SITE_ID/deploys" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary @"$TMP_ZIP")

DEPLOY_URL=$(python3 - <<PY
import json
obj=json.loads('''$DEPLOY_JSON''')
print(obj.get('ssl_url') or obj.get('url') or '')
PY
)

echo "SITE_ID=$SITE_ID"
echo "URL=$DEPLOY_URL"

echo "Agora configure variáveis de ambiente no Netlify UI:"
echo "  GITHUB_TOKEN"
echo "  REPO_OWNER=DREAMTEAMBRA"
echo "  REPO_NAME=dreamteam-backlog"
