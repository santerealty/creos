Build the CREOS AI-native commercial real estate investment simulation as a working
Next.js 15 + React + TypeScript + Tailwind app in the CURRENT directory (~/Desktop/creos).

CONSTRAINTS:
- A verified deterministic finance engine already exists at src/lib/finance/index.ts with a
  passing test suite (src/lib/finance/finance.test.ts). REUSE it. NEVER use an LLM for
  authoritative financial math — all money numbers come from these tested functions.
- App MUST run without any LLM key (templated agent messages, scripted transcripts).
- Focus on Milestone 1: the end-to-end golden-path VERTICAL SLICE for the featured property
  "Parkview Terrace Apartments" (120 units, Phoenix, 88% occ, ~$22M, value-add, 5yr hold).

BUILD ORDER (make each step actually work before moving on):
1. Core types + in-browser state store (Zustand or React context) for the Simulation entity.
2. Seeded Parkview scenario data (rent roll, operating statement, forecast, partnership terms).
3. Reusable ApprovalCard component + central Approval Queue (the primary gameplay screen).
4. Guest entry screen + light Portfolio Command Center (4 property cards).
5. Golden-path flow: synthetic data review -> underwriting -> due diligence (with the
   title/environmental branching exception) -> financing -> IC approval -> acquisition close
   -> one operating period + "While You Were Away" digest -> forecast revision ->
   hold/sell -> buyer selection -> sale close -> tax closeout -> waterfall/distributions ->
   dissolution -> final AI-native scorecard.
6. Workflow state machine with guarded transitions; audit trail of every action.

RULES:
- Keep it runnable at every commit: run `npm run build` and `npx vitest run` before each git commit.
- Commit frequently with clear messages.
- Label all data as synthetic; label all comms "Simulated communication".
- When done, write IMPLEMENTATION_NOTES.md summarizing what works.
Start now. Work autonomously through the build order.
