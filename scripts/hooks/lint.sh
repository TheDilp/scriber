#!/bin/sh
set -euo pipefail

bun format:fix || (echo "❌ Prettier check failed. Run 'bun format' to fix formatting." && exit 1)
bun lint --fix --cache --concurrency=6 || (echo "❌ Lint check failed. Please fix ESLint errors before pushing." && exit 1)
