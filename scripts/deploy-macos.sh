#!/bin/bash
set -euo pipefail

repo=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
root=${TFT_RELEASE_ROOT:-"$HOME/Library/Application Support/tft-viet-meta"}
label=xyz.langpn.tft-viet-meta
domain="gui/$(id -u)"
plist="$HOME/Library/LaunchAgents/$label.plist"
node=$(command -v node)
bun=$(command -v bun)
origin=https://tft.langpn.xyz
mode=${1:-deploy}
case "$mode" in
  deploy|rollback) ;;
  *) echo 'Usage: deploy-macos.sh [deploy|rollback] [commit]' >&2; exit 2 ;;
esac
commit=$(git -C "$repo" rev-parse --verify "${2:-HEAD}^{commit}")
release="$root/releases/$commit"

mkdir -p "$root/releases" "$(dirname "$plist")"
mkdir "$root/.deploy-lock"
stage=''
switch_dir=''
candidate_pid=''
cleanup() {
  if [[ -n "$candidate_pid" ]]; then kill "$candidate_pid" 2>/dev/null || true; fi
  if [[ -n "$stage" ]]; then rm -rf -- "$stage"; fi
  if [[ -n "$switch_dir" ]]; then rm -rf -- "$switch_dir"; fi
  rmdir "$root/.deploy-lock"
}
trap cleanup EXIT

if [[ ! -f "$release/build/index.js" ]]; then
  [[ "$mode" == deploy ]] || { echo "Release unavailable: $commit" >&2; exit 2; }
  [[ ! -e "$release" ]] || { echo "Incomplete release directory: $release" >&2; exit 2; }
  stage=$(mktemp -d "$root/releases/.stage.XXXXXXXX")
  git -C "$repo" archive "$commit" | tar -x -C "$stage"
  (
    cd "$stage"
    "$bun" install --frozen-lockfile
    "$bun" run verify
    "$bun" test
    "$bun" run typecheck
    "$bun" run build
  )
  mv "$stage" "$release"
  stage=''
fi

smoke_release() {
  local script="$1/scripts/smoke-production.mjs"
  [[ -f "$script" ]] || script="$repo/scripts/smoke-production.mjs"
  "$node" "$script" "$2"
}

wait_for_app() {
  local url=$1
  for ((attempt=1; attempt<=30; attempt++)); do
    if curl --fail --silent --max-time 2 "$url/" -o /dev/null; then return 0; fi
    sleep 1
  done
  return 1
}

if lsof -tiTCP:4382 -sTCP:LISTEN >/dev/null; then
  echo 'Candidate port 4382 is in use' >&2
  exit 2
fi
HOST=127.0.0.1 PORT=4382 ORIGIN="$origin" "$node" "$release/build/index.js" > "$root/candidate.log" 2>&1 &
candidate_pid=$!
wait_for_app http://127.0.0.1:4382
smoke_release "$release" http://127.0.0.1:4382
kill "$candidate_pid"
wait "$candidate_pid" || true
candidate_pid=''

previous=$(readlink "$root/current" || true)
switch_dir=$(mktemp -d "$root/.switch.XXXXXXXX")
switch_release() {
  ln -s "$1" "$switch_dir/current" && mv -fh "$switch_dir/current" "$root/current"
}

if [[ ! -f "$plist" ]]; then
  /usr/bin/python3 - "$plist" "$node" "$root" "$label" "$origin" <<'PY'
import os, plistlib, sys
plist, node, root, label, origin = sys.argv[1:]
with open(plist, 'wb') as stream:
    plistlib.dump(dict(Label=label, ProgramArguments=[node, root + '/current/build/index.js'],
        EnvironmentVariables=dict(HOST='127.0.0.1', PORT='4381', ORIGIN=origin),
        RunAtLoad=True, KeepAlive=True, ThrottleInterval=10,
        StandardOutPath=root + '/app.log', StandardErrorPath=root + '/app.log'), stream)
PY
  plutil -lint "$plist"
fi

restart_app() {
  if launchctl print "$domain/$label" >/dev/null 2>&1; then
    launchctl kickstart -k "$domain/$label"
  else
    launchctl bootstrap "$domain" "$plist"
  fi
}

switch_release "$release"
if ! { restart_app && wait_for_app http://127.0.0.1:4381 && smoke_release "$release" http://127.0.0.1:4381; }; then
  if [[ -n "$previous" ]]; then
    if [[ ! -f "$previous/build/index.js" ]] || ! switch_release "$previous" ||
       ! restart_app || ! wait_for_app http://127.0.0.1:4381 || ! smoke_release "$previous" http://127.0.0.1:4381; then
      echo "Rollback could not verify recovery: $previous" >&2
      exit 1
    fi
    echo "Previous release restored: $previous" >&2
  else
    launchctl bootout "$domain/$label" 2>/dev/null || true
    rm "$root/current"
  fi
  echo 'Release failed production smoke' >&2
  exit 1
fi
echo "Current release: $commit"
