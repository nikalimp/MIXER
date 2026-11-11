#!/bin/bash
# План 3 выкладки — вручную с Mac, когда в Actions не прошли ни SSH, ни FTP.
# Копия кладётся в проект как scripts/deploy-<app>.sh и заполняется под проект (website:update делает это сам).
# Запуск: bash scripts/deploy-site.sh            — собрать и залить
#         bash scripts/deploy-site.sh <папка>    — залить готовую сборку (например, скачанный артефакт site-build)
set -euo pipefail
HOST="uXXXX@serverNNN.hosting.reg.ru"                     # SSH_USER@SSH_HOST
DIR="/var/www/uXXXX/data/www/<домен>/"                    # SITE_DIR (+ app_path), со слешем
KEY="$HOME/.ssh/<project>_deploy"                         # ключ деплоя проекта
APP="$(cd "$(dirname "$0")/.." && pwd)"                   # папка приложения (монорепо: …/apps/site)
OUT="${1:-}"
EXCLUDE=(--exclude '.well-known/' --exclude 'cgi-bin/' --exclude '.ftp-deploy-sync-state.json')   # + подпапки других приложений: --exclude 'test/'

if [ -z "$OUT" ]; then
  cd "$APP"; [ -d node_modules ] || npm ci
  if npm run | grep -q "^  check$"; then npm run check; else npm run build; fi
  OUT="$APP/out"; [ -d "$OUT" ] || OUT="$APP/dist"
fi
ssh -i "$KEY" "$HOST" "mkdir -p '$DIR'"
rsync -az --delete --stats "${EXCLUDE[@]}" -e "ssh -i $KEY" "${OUT%/}/" "$HOST:$DIR"
echo "Готово: $DIR"
