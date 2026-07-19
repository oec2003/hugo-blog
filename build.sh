#!/usr/bin/env bash

set -euo pipefail

HUGO_VERSION="0.163.2"
HUGO_COMMAND=""

if command -v hugo >/dev/null 2>&1; then
  HUGO_COMMAND="$(command -v hugo)"
else
  HUGO_INSTALL_DIR="${PWD}/.vercel/cache/hugo-${HUGO_VERSION}"
  HUGO_ARCHIVE="${HUGO_INSTALL_DIR}/hugo.tar.gz"
  HUGO_COMMAND="${HUGO_INSTALL_DIR}/hugo"

  if [[ ! -x "${HUGO_COMMAND}" ]]; then
    mkdir -p "${HUGO_INSTALL_DIR}"
    curl -fsSL \
      "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz" \
      -o "${HUGO_ARCHIVE}"
    tar -xzf "${HUGO_ARCHIVE}" -C "${HUGO_INSTALL_DIR}" hugo
  fi
fi

"${HUGO_COMMAND}" --gc --minify
