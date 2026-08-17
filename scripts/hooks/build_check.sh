#!/bin/sh
set -euo pipefail

bun run build:client || (echo "❌ Build check failed. Please fix build errors before pushing." && exit 1)
