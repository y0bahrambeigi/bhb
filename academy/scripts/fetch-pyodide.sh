#!/usr/bin/env bash
set -euo pipefail

PYODIDE_VERSION="314.0.2"
TARGET_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/pyodide"
BASE_URL="https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full"

mkdir -p "$TARGET_DIR"

for file in pyodide.js pyodide.asm.mjs pyodide.asm.wasm python_stdlib.zip pyodide-lock.json; do
  curl --fail --location --retry 3 --show-error \
    "${BASE_URL}/${file}" --output "${TARGET_DIR}/${file}"
done

printf 'Pyodide %s downloaded to %s\n' "$PYODIDE_VERSION" "$TARGET_DIR"
