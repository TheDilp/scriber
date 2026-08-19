#!/bin/sh
set -euo pipefail

bun tsc || (echo "❌ Type check failed. Please fix TypeScript errors before pushing." && exit 1)
