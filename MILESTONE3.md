MILESTONE 3 — COMMUNICATIONS DEPTH

Build on the EXISTING, verified CREOS app in this directory (~/Desktop/creos). Do NOT
rewrite what works. Milestones 1 and 2 are complete and verified:
- Deterministic finance engine: src/lib/finance/index.ts (+ finance.test.ts). REUSE it.
  NEVER use an LLM for authoritative math — every money number comes from these functions.
- Operating events library: src/lib/operations/events.ts (wired into the OPERATIONS phase).
- Forecast/scenario lab: src/lib/forecast/scenarios.ts (+ /forecast page).
- Approval queue + decline-never-dead-ends + Request Revisions loop.
- App runs with NO LLM key. All comms are scripted and labeled "Simulated communication".

GOAL: give the sim a believable, multi-agent COMMUNICATIONS layer so the player feels like
they're working with a team of AI specialists, not one generic voice. Stays scripted/deterministic.

BUILD (make each item work, keep app runnable, commit frequently):

1. AGENT PERSONAS (src/lib/comms/personas.ts)
   - Distinct personas: id, name, role, bio, initials/avatar, voice/tone. At minimum:
     Acquisitions Analyst, Underwriter, Debt/Capital Markets Broker, Due-Diligence Lead,
     Asset Manager, Tax Advisor, Orchestrator/Chief of Staff.
   - Attribute each approval/agentMessage to the right persona (map by ApprovalType/phase).
     Update ApprovalCard to show persona (name + role + initials) instead of generic
     "AI Assistant", keeping the "Simulated communication" label.

2. MESSAGE / INBOX CENTER (src/components/MessageCenter.tsx + route /messages)
   - Threaded inbox: every approval, revision, decline-alternative, operating event produces
     a message from its persona, grouped into threads by topic/phase.
   - Unread badge in the sim header; clicking a thread shows the transcript.
   - Add header nav button "Messages" next to "Forecast Lab"/"Audit Trail".
   - Use client-side navigation (router.push); store is in-memory — never force a full reload.

3. "WHILE YOU WERE AWAY" DIGEST (src/lib/comms/digest.ts + UI)
   - On advancing through the OPERATIONS hold period, generate a digest: operating events
     fired, metric deltas (NOI, DSCR, occupancy, cash), items now needing a decision.
   - All numbers from the finance engine / operating events, not invented.
   - Surface as a dismissible digest card atop the queue when entering OPERATIONS.

4. RICHER TRANSCRIPTS (src/lib/comms/transcripts.ts)
   - For key decisions, a short multi-turn scripted transcript (2-4 turns) between personas
     showing reasoning/disagreement (e.g. Underwriter vs. Debt Broker on leverage). Reuse
     existing agent-disagreement scenarios where present.
   - Viewable from the message thread or an expandable section on the approval card.

RULES:
- REUSE existing types, store, finance engine, events, scenarios. Extend, don't fork.
- Keep it runnable at EVERY commit: run `npx vitest run` and `npm run build` BEFORE each
  git commit. Do not commit if either fails.
- Add unit tests for new pure logic (personas mapping, digest computation, transcript lookup).
- Do NOT run `rm -rf .next`. Do NOT start a second dev server (one is already running).
- All data labeled SYNTHETIC; all comms labeled "Simulated communication".
- Commit frequently with clear messages (prefix: feat(m3)/fix(m3)/test(m3)).
- When done, write M3_COMPLETE.md summarizing what works and how to reach each feature.

Start now and work autonomously through the build list.
