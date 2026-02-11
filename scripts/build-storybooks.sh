#!/bin/bash
# Build all Storybooks into a combined output directory for static hosting (e.g., AWS Amplify)
#
# Output structure:
#   storybook-dist/
#   ├── index.html          ← Landing page with links to all 4
#   ├── interfaces/         ← ui-interfaces Storybook
#   ├── form/               ← ui-form Storybook
#   ├── table/              ← ui-table Storybook
#   └── collections/        ← ui-collections Storybook

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="${ROOT_DIR}/apps/storybook-host/public/storybook"

echo "🏗️  Building all Storybooks..."
echo "   Output: ${OUTPUT_DIR}"
echo ""

# Clean output directory
rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

# Build ui-interfaces Storybook
echo "📦 [1/4] Building ui-interfaces Storybook..."
cd "${ROOT_DIR}/packages/ui-interfaces"
npx storybook build -o "${OUTPUT_DIR}/interfaces" --quiet 2>&1 || {
  echo "❌ ui-interfaces Storybook build failed"
  exit 1
}
echo "   ✅ ui-interfaces done"

# Build ui-form Storybook
echo "📦 [2/4] Building ui-form Storybook..."
cd "${ROOT_DIR}/packages/ui-form"
npx storybook build -o "${OUTPUT_DIR}/form" --quiet 2>&1 || {
  echo "❌ ui-form Storybook build failed"
  exit 1
}
echo "   ✅ ui-form done"

# Build ui-table Storybook
echo "📦 [3/4] Building ui-table Storybook..."
cd "${ROOT_DIR}/packages/ui-table"
npx storybook build -o "${OUTPUT_DIR}/table" --quiet 2>&1 || {
  echo "❌ ui-table Storybook build failed"
  exit 1
}
echo "   ✅ ui-table done"

# Build ui-collections Storybook
echo "📦 [4/4] Building ui-collections Storybook..."
cd "${ROOT_DIR}/packages/ui-collections"
npx storybook build -o "${OUTPUT_DIR}/collections" --quiet 2>&1 || {
  echo "❌ ui-collections Storybook build failed"
  exit 1
}
echo "   ✅ ui-collections done"

# No landing page needed — the Next.js host app serves as the landing page

echo ""
echo "🎉 All Storybooks built successfully!"
echo "   📁 ${OUTPUT_DIR}/"
echo "   ├── interfaces/      (40+ field components)"
echo "   ├── form/            (VForm dynamic form)"
echo "   ├── table/           (VTable dynamic table)"
echo "   └── collections/     (CollectionForm & CollectionList)"
echo ""
echo "   Served by the Next.js host app at /storybook/*"
echo "   To preview: pnpm build:host && pnpm start:host"
