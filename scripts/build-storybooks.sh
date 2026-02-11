#!/bin/bash
# Build all Storybooks into a combined output directory for static hosting (e.g., AWS Amplify)
#
# Output structure:
#   storybook-dist/
#   ├── index.html          ← Landing page with links to all 3
#   ├── interfaces/         ← ui-interfaces Storybook
#   ├── form/               ← ui-form Storybook
#   └── table/              ← ui-table Storybook

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="${ROOT_DIR}/storybook-dist"

echo "🏗️  Building all Storybooks..."
echo "   Output: ${OUTPUT_DIR}"
echo ""

# Clean output directory
rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

# Build ui-interfaces Storybook
echo "📦 [1/3] Building ui-interfaces Storybook..."
cd "${ROOT_DIR}/packages/ui-interfaces"
npx storybook build -o "${OUTPUT_DIR}/interfaces" --quiet 2>&1 || {
  echo "❌ ui-interfaces Storybook build failed"
  exit 1
}
echo "   ✅ ui-interfaces done"

# Build ui-form Storybook
echo "📦 [2/3] Building ui-form Storybook..."
cd "${ROOT_DIR}/packages/ui-form"
npx storybook build -o "${OUTPUT_DIR}/form" --quiet 2>&1 || {
  echo "❌ ui-form Storybook build failed"
  exit 1
}
echo "   ✅ ui-form done"

# Build ui-table Storybook
echo "📦 [3/3] Building ui-table Storybook..."
cd "${ROOT_DIR}/packages/ui-table"
npx storybook build -o "${OUTPUT_DIR}/table" --quiet 2>&1 || {
  echo "❌ ui-table Storybook build failed"
  exit 1
}
echo "   ✅ ui-table done"

# Copy landing page
echo "📄 Copying landing page..."
cp "${ROOT_DIR}/scripts/storybook-landing.html" "${OUTPUT_DIR}/index.html"

echo ""
echo "🎉 All Storybooks built successfully!"
echo "   📁 ${OUTPUT_DIR}/"
echo "   ├── index.html       (landing page)"
echo "   ├── interfaces/      (40+ field components)"
echo "   ├── form/            (VForm dynamic form)"
echo "   └── table/           (VTable dynamic table)"
echo ""
echo "   To preview locally: npx serve storybook-dist"
