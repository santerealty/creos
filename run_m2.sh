#!/usr/bin/env bash
cd /root/Desktop/creos || exit 1
export HERMES_ACCEPT_HOOKS=1
echo "=== M2 BUILD START $(date -Is) in $(pwd) ==="
hermes chat --yolo --accept-hooks --max-turns 200 \
  -m anthropic/claude-sonnet-4.5 --provider openrouter \
  -q "Your working directory is /root/Desktop/creos, which contains an existing WORKING Next.js app (CREOS) plus a build directive file MILESTONE2.md. First run 'pwd && ls -la && wc -c MILESTONE2.md' to confirm you see the app and a non-empty directive. Then read MILESTONE2.md and execute it fully. Follow its HARD RULES exactly: reuse src/lib/finance, run 'npm run build && npx vitest run' before every commit, and make small incremental git commits prefixed feat(m2)/test(m2). Make your FIRST commit early so progress shows in git log. Begin now."
echo "=== M2 BUILD EXIT code=$? $(date -Is) ==="
