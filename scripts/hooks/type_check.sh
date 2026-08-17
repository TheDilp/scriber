#!/bin/sh
set -euo pipefail

bun tsgo || (echo "❌ Type check failed. Please fix TypeScript errors before pushing." && exit 1)
