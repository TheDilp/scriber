#!/bin/sh
set -euo pipefail

mkdir -p test-results/vitest/assets
bun run test || (echo "❌ Tests failed. Please fix failing tests before pushing." && exit 1)
