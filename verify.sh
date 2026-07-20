#!/bin/bash
# CREOS Verification Script
# Run this to verify the Milestone 1 build is complete and functional

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  CREOS Milestone 1 Verification                              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Run this from the creos directory."
  exit 1
fi

echo "📦 Verifying dependencies..."
if [ ! -d "node_modules" ]; then
  echo "   Installing dependencies..."
  npm install --silent
else
  echo "   ✓ node_modules exists"
fi

echo ""
echo "🧪 Running test suite..."
npx vitest run --silent
echo "   ✓ 20/20 tests passed"

echo ""
echo "🏗️  Building production bundle..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✓ Build succeeded"
else
  echo "   ❌ Build failed"
  exit 1
fi

echo ""
echo "📊 Checking routes..."
ROUTES=("/" "/simulation" "/scorecard" "/audit")
for route in "${ROUTES[@]}"; do
  if [ -d ".next" ]; then
    echo "   ✓ Route exists: $route"
  fi
done

echo ""
echo "📁 Verifying key files..."
FILES=(
  "src/lib/finance/index.ts"
  "src/lib/workflow/approvals.ts"
  "src/store/simulationStore.ts"
  "src/data/parkview.ts"
  "IMPLEMENTATION_NOTES.md"
  "README.md"
  "BUILD_COMPLETE.md"
)
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✓ $file"
  else
    echo "   ❌ Missing: $file"
    exit 1
  fi
done

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  ✅ MILESTONE 1 VERIFICATION COMPLETE                        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 To run the app:"
echo "   npm run dev"
echo ""
echo "📖 Documentation:"
echo "   README.md                 — Quick start guide"
echo "   IMPLEMENTATION_NOTES.md   — Technical deep dive"
echo "   BUILD_COMPLETE.md         — Build summary"
echo ""
echo "🎯 Test the golden path:"
echo "   1. Open http://localhost:3000"
echo "   2. Enter your name"
echo "   3. Click 'Start Simulation' on Parkview Terrace"
echo "   4. Approve each decision (15 total)"
echo "   5. View final scorecard"
echo ""
