# CREOS — MILESTONE 2 BUILD DIRECTIVE: Operating Depth

You are extending an EXISTING, WORKING Next.js 15 + TypeScript + Tailwind app (CREOS,
an AI-native commercial real estate investment simulation). Milestone 1 is complete,
committed, and verified (app builds, 20/20 finance tests pass, full golden path playable
to a populated scorecard). DO NOT rewrite or regress Milestone 1. Build ON TOP of it.

## HARD RULES (do not violate)
1. Reuse the tested deterministic finance engine in `src/lib/finance/index.ts`. NEVER
   compute financial results ad hoc in components. All money math flows through that module.
2. Keep the app runnable at EVERY commit. After each unit of work run:
   `npm run build && npx vitest run` — both MUST pass before you `git commit`.
3. Commit in small increments with clear messages prefixed `feat(m2):` / `test(m2):` /
   `refactor(m2):`. Make your FIRST commit early (even a small scaffolding commit) so
   progress is visible in `git log`.
4. Do not introduce an LLM dependency. All new content is deterministic/templated.
5. Match the existing code style and the real types in `src/types/index.ts`.

## EXISTING STRUCTURE (real — reference these, do not invent paths)
- `src/types/index.ts` — WorkflowPhase, ApprovalType, Approval, SimulationEvent,
  Simulation (note metrics shape), Property, Unit, OperatingStatement, PartnershipTerms.
- `src/lib/finance/index.ts` — effectiveGrossIncome, netOperatingIncome, capRate,
  impliedValue, dscr, debtYield, cashOnCash, moic, netSaleProceeds, xirr, adjustedTaxBasis,
  taxableGain, depreciationRecapture, waterfall.
- `src/lib/finance/finance.test.ts` — Vitest suite (currently 20 passing). ADD to it.
- `src/lib/workflow/approvals.ts` — phase approval generators (generate*Approvals).
- `src/lib/workflow/orchestrator.ts` — PHASE_SEQUENCE, PHASE_CONFIGS state machine.
- `src/store/simulationStore.ts` — Zustand store: startSimulation, setPhase, addApproval,
  decideApproval, addEvent, updateMetrics, completeSimulation, reset.
- `src/data/parkview.ts` — the featured Parkview Terrace scenario data.
- `src/components/` — ApprovalCard, ApprovalQueue, AuditTrail, FinalScorecard, PortfolioView.

## WHAT TO BUILD (Milestone 2 = operating depth)

### 1. Operating-events library  -> new file src/lib/operations/events.ts
A deterministic, seedable library of operating-period events that fire during the
OPERATIONS phase. Each event is a typed object with: id, title, category, narrative
(templated string), the AI agent responsible, one or more player options, and a pure
applyOutcome(sim, optionId) that returns metric/state deltas (NO direct mutation —
return deltas the store applies via updateMetrics/addEvent).
Implement at least these 8 events:
  - Insurance renewal spike (premium +X%)   -> NOI/expense impact
  - Property-tax reassessment                -> NOI/expense impact
  - Renovation delay                         -> schedule + CAPEX timing impact
  - Vendor underperformance (replace/retain) -> expense + risk impact
  - Tenant delinquency spike                 -> bad debt / EGI impact
  - Refinance offer                          -> debt terms + proceeds impact
  - Lender covenant warning (DSCR/debt yield breach risk) -> risk/compliance
  - Rent-growth opportunity                  -> EGI/NOI upside
Each event's financial impact MUST be computed with the finance engine functions.

### 2. Forecast / scenario lab -> new file src/lib/forecast/scenarios.ts + a UI page
Deterministic base / upside / downside cases plus a custom case. Editable assumptions:
rent growth, vacancy, expense growth, exit cap rate, hold period. Recompute NOI, value
(impliedValue), levered cash flows, IRR (xirr) and MOIC per case using the finance engine.
Add a page at src/app/forecast/page.tsx with three preset cards + a custom-assumptions
panel showing recomputed IRR/MOIC/value side by side. Reuse existing UI/Tailwind patterns.

### 3. Agent-disagreement scenario -> wire into HOLD_DECISION
At the hold/sell decision, present at least three agents with DIFFERING recommendations
(e.g. Asset Mgmt: hold; Capital Markets: sell; Tax: delay), shown side by side, and let
the player resolve it. Use deterministic logic; record each as an audit SimulationEvent.

### 4. Expanded revision loop
When the player chooses "Request Revisions" on an operating approval, offer predefined
revision reasons (lower rent growth, raise exit cap, reduce leverage, add downside case,
get another vendor bid, increase contingency) and regenerate a revised recommendation
with original-vs-revised values, preserving both. Deterministic only.

### 5. Tests -> extend src/lib/finance/finance.test.ts (or add *.test.ts beside new libs)
Add deterministic unit tests for: every operating event's applyOutcome delta, each
forecast case's IRR/MOIC/value, and the agent-disagreement resolution logic. Keep ALL
prior tests green.

## DEFINITION OF DONE (M2)
- npm run build succeeds; npx vitest run all green (>= prior 20, plus new tests).
- OPERATIONS phase surfaces multiple new operating events with real financial consequences.
- /forecast page renders base/upside/downside + custom with engine-computed IRR/MOIC.
- HOLD_DECISION shows 3 disagreeing agents the player resolves.
- Revision loop shows original-vs-revised on at least one operating approval.
- Work committed in small feat(m2): commits, app runnable at each.

At the end, print a short summary: files added/changed, test count, and how to view the
new features in the running app.
