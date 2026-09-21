#!/usr/bin/env bash
set -euo pipefail

ENGINE="${1:-auto}"
NO_CACHE="${NO_CACHE:-false}"

has_command() {
  command -v "$1" >/dev/null 2>&1
}

compose_works() {
  "$@" version >/dev/null 2>&1
}

if [[ "$ENGINE" == "auto" || "$ENGINE" == "docker" ]] && has_command docker && compose_works docker compose; then
  COMPOSE=(docker compose)
elif [[ "$ENGINE" == "auto" || "$ENGINE" == "podman" ]] && has_command podman && compose_works podman compose; then
  COMPOSE=(podman compose)
elif [[ "$ENGINE" == "auto" || "$ENGINE" == "podman" ]] && has_command podman-compose; then
  COMPOSE=(podman-compose)
else
  echo "No supported container engine found. Install Docker Desktop or Podman with Compose support." >&2
  exit 1
fi

BUILD_ARGS=(build)
if [[ "$NO_CACHE" == "true" || "${2:-}" == "--no-cache" ]]; then
  BUILD_ARGS+=(--no-cache)
fi

echo "Building containers with ${COMPOSE[*]}..."
"${COMPOSE[@]}" "${BUILD_ARGS[@]}"
echo "Container build completed successfully."
