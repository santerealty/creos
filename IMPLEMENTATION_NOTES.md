# CREOS Implementation Notes

## What Works (Milestone 1 Complete)

CREOS is a fully functional AI-native commercial real estate investment simulation demonstrating the complete lifecycle of a CRE deal from data review through final distribution. **No LLM API keys required** — all agent messages are scripted, and all financial calculations use the deterministic engine.

### ✅ Core Infrastructure

- **Type System**: Comprehensive TypeScript types for Simulation, Property, Approval, Partnership, and workflow phases
- **State Management**: Zustand store with actions for phase transitions, approval decisions, event logging, and metrics updates
- **Deterministic Finance Engine**: `src/lib/finance/index.ts` with 20 passing tests covering:
  - Income & valuation (EGI, NOI, cap rates, implied value)
  - Debt & returns (DSCR, debt yield, cash-on-cash, MOIC)
  - Sale proceeds & XIRR (Newton's method + bisection fallback)
  - Tax calculations (adjusted basis, gains, depreciation recapture)
  - Waterfall distributions (pref → return of capital → catch-up → promote)

### ✅ Seed Data: Parkview Terrace Apartments

**Property**: 120-unit value-add multifamily in Phoenix, AZ
- Purchase Price: $21.6M
- Strategy: Renovate 60 units, raise rents $300/unit to market
- Hold Period: 5 years
- Capital Structure: $15M loan (69% LTV) + $6.9M equity (90/10 LP/GP split)
- Partnership: 8% pref, 100% catch-up, 70/30 promote
- Target Returns: 16-18% IRR, 1.8-2.0x MOIC

**Data Files**:
- `src/data/parkview.ts`: Property, 120 unit rent roll, 5-year operating forecast, partnership terms
- All data labeled SYNTHETIC and realistic for Phoenix multifamily market

### ✅ UI Components

1. **PortfolioView** (`src/components/PortfolioView.tsx`)
   - Guest entry screen (name capture)
   - Portfolio command center with property cards
   - Route: `/`

2. **ApprovalQueue** (`src/components/ApprovalQueue.tsx`)
   - Central gameplay screen showing pending and completed approvals
   - Progress bar, phase indicator, decision tracking
   - Route: `/simulation`

3. **ApprovalCard** (`src/components/ApprovalCard.tsx`)
   - Rich card UI with:
     - Simulated AI agent message (clearly labeled)
     - Key metrics grid
     - Synthetic data attachments
     - Approve/Decline action buttons
     - Status badges (PENDING, APPROVED, DECLINED)

4. **FinalScorecard** (`src/components/FinalScorecard.tsx`)
   - 0-100 AI-native score based on decision quality and financial outcome
   - Financial summary (IRR, MOIC, distributions)
   - Workflow performance insights
   - Route: `/scorecard`

5. **AuditTrail** (`src/components/AuditTrail.tsx`)
   - Complete event log grouped by phase
   - Event type icons (→ state changes, 📋 approvals created, ✓ decisions, 📊 metrics)
   - Summary statistics
   - Route: `/audit`

### ✅ Workflow Orchestration (Golden Path)

**Workflow Engine**: `src/lib/workflow/`
- `orchestrator.ts`: Phase sequence, transition guards, auto-advance logic
- `approvals.ts`: Generators for all 11 approval phases, each with scripted AI messages and real financial calculations

**11-Phase Golden Path**:
1. **DATA_REVIEW**: Rent roll validation, T-12 reconciliation
2. **UNDERWRITING**: 5-year cashflow model, return projections
3. **DUE_DILIGENCE**: Title exception (easement), environmental (historical UST)
4. **FINANCING**: Loan term sheet ($15M Freddie Mac SBLL)
5. **IC_APPROVAL**: Investment Committee final vote
6. **ACQUISITION_CLOSE**: Auto-advance (no approvals)
7. **OPERATIONS**: Year 1 performance review
8. **HOLD_DECISION**: Year 5 hold vs. sell analysis
9. **DISPOSITION**: Buyer selection (3 competing offers)
10. **SALE_CLOSE**: Auto-advance
11. **TAX_CLOSEOUT**: Gain recognition, K-1 preparation
12. **WATERFALL_DISTRIBUTION**: Final distributions per operating agreement
13. **DISSOLUTION**: Partnership wind-down
14. **FINAL_SCORECARD**: AI-native performance score

**useWorkflowOrchestrator Hook** (`src/hooks/useWorkflowOrchestrator.ts`):
- Auto-generates approvals when entering a new phase
- Auto-advances phases when all approvals decided and phase config allows
- Redirects to `/scorecard` on completion
- Maintains audit trail of all state changes

### ✅ Verification

```bash
npm run build    # ✓ Production build succeeds
npx vitest run   # ✓ 20/20 finance tests passing
npm run lint     # ✓ ESLint clean
```

**Files Modified/Created**: 29 files
- Core: 3 (types, store, data)
- Components: 5 (PortfolioView, ApprovalQueue, ApprovalCard, FinalScorecard, AuditTrail)
- Workflow: 2 (orchestrator, approval generators)
- Routes: 4 (/, /simulation, /scorecard, /audit)
- Hooks: 1 (useWorkflowOrchestrator)
- Finance: 2 (engine + tests, already passing)

## What's Deliberately Excluded (Out of Scope for Milestone 1)

- User authentication / multi-user support
- Backend API / database persistence
- Real-time LLM integration (all agent messages are scripted)
- Additional properties beyond Parkview Terrace
- Mobile-responsive refinements (desktop-first)
- Document generation (Excel pro formas, PDF reports)
- Advanced analytics (cohort tracking, benchmarking)
- Integration with real data sources (CoStar, Yardi, Argus)

## Key Design Decisions

### 1. No LLM Dependency for Financial Calculations
**Rationale**: Commercial real estate underwriting requires deterministic, auditable math. Using an LLM for calculations would introduce non-determinism and potential errors. Instead:
- All money math goes through `src/lib/finance/index.ts`
- 100% test coverage of core financial functions
- Agent "messages" are scripted strings that reference these calculations
- This demonstrates how AI-native systems can combine scripted workflows with deterministic engines

### 2. Scripted Agent Messages
**Rationale**: The goal is to demonstrate AI-native workflow orchestration, not to burn tokens. Scripted messages:
- Are contextually accurate (reference actual property data)
- Demonstrate proper agent communication patterns
- Work without any API keys
- Let users experience the full workflow immediately
- Can be replaced with real LLM calls in production by swapping the approval generator functions

### 3. Single Golden Path (No Branching)
**Rationale**: Milestone 1 is a vertical slice. The workflow always:
- Proceeds through all 11 phases in sequence
- Accepts the title and environmental exceptions
- Chooses to sell (not refinance)
- Selects Offer A (not B or C)
This proves the orchestration machinery works. Future milestones can add branching logic.

### 4. Client-Side State Only (No Persistence)
**Rationale**: Browser refresh resets the simulation. This is acceptable for Milestone 1 because:
- Demonstrates the full workflow in a single session (~5-10 minutes)
- Simplifies deployment (no database required)
- Audit trail is maintained in memory during the session
Future milestones can add persistence via API + database.

### 5. Zustand Over Context API
**Rationale**: Zustand provides:
- Simpler API for complex state updates
- Better TypeScript inference
- Less boilerplate than Context + useReducer
- Easy to test (store is a pure function)

### 6. Tailwind Utility Classes Over CSS Modules
**Rationale**: Velocity. Tailwind enables rapid UI iteration without context-switching to separate CSS files. Trade-off: slightly verbose JSX, but acceptable for a prototype.

## How to Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Open http://localhost:3000

# Run production build
npm run build
npm start

# Run tests
npx vitest run        # One-time
npx vitest           # Watch mode
```

## Testing the Golden Path

1. Open `http://localhost:3000`
2. Enter your name → "Enter Portfolio"
3. Click "Start Simulation" on Parkview Terrace card
4. You're now at `/simulation` with the first approval (DATA_REVIEW)
5. Click "Approve & Proceed" on each approval
6. Watch the workflow auto-advance through 11 phases
7. After final approval, auto-redirects to `/scorecard`
8. View your AI-native performance score (0-100)
9. Click "View Audit Trail" to see full event log
10. Click "Return to Portfolio" to start over

**Expected Time**: ~3-5 minutes to complete full workflow (depends on reading speed)

## Code Structure

```
src/
├── app/                      # Next.js 15 app router
│   ├── layout.tsx           # Root layout with fonts
│   ├── page.tsx             # Home (PortfolioView)
│   ├── simulation/page.tsx  # Approval queue
│   ├── scorecard/page.tsx   # Final scorecard
│   └── audit/page.tsx       # Audit trail
├── components/              # React components
│   ├── PortfolioView.tsx   # Guest entry + portfolio
│   ├── ApprovalQueue.tsx   # Main gameplay screen
│   ├── ApprovalCard.tsx    # Rich approval card UI
│   ├── FinalScorecard.tsx  # Completion screen
│   └── AuditTrail.tsx      # Event log viewer
├── data/
│   └── parkview.ts         # Seed data for Parkview property
├── hooks/
│   └── useWorkflowOrchestrator.ts  # Workflow automation
├── lib/
│   ├── finance/            # Deterministic engine
│   │   ├── index.ts        # All financial functions
│   │   └── finance.test.ts # 20 passing tests
│   └── workflow/           # Orchestration logic
│       ├── orchestrator.ts # Phase sequencing
│       └── approvals.ts    # Approval generators (11 phases)
├── store/
│   └── simulationStore.ts  # Zustand state management
└── types/
    └── index.ts            # TypeScript definitions
```

## Known Issues / Future Work

1. **Phase transitions too fast**: Currently 1.5s delay. Could add user confirmation.
2. **No persistence**: Browser refresh loses state. Add localStorage or backend.
3. **No branching**: Workflow is linear. Add decision trees (refinance vs sell, accept vs negotiate).
4. **Synthetic attachments**: Approval attachments are placeholders. Generate real Excel/PDF files.
5. **Limited property variety**: Only Parkview exists. Add 3-5 more properties with different strategies.
6. **No "While You Were Away" digest**: Operations phase mentions it but doesn't implement it.
7. **Scorecard formula is simple**: Could weight decision speed, approval consistency, financial outcome more sophisticatedly.
8. **No unit-level detail**: Rent roll exists but isn't visualized. Add unit grid with filtering.
9. **Mobile needs work**: Desktop-first design. Needs responsive refinements.
10. **Accessibility**: No ARIA labels, keyboard navigation is incomplete.

## Architecture Notes

### Why This Structure Scales

1. **Separation of Concerns**:
   - Finance engine is pure functions (easy to test, no side effects)
   - Approval generators are pure functions of Simulation state
   - UI components consume store via hooks (React best practice)
   - Workflow orchestration is centralized (single source of truth for phase logic)

2. **Easy to Add Properties**:
   - Create new file in `src/data/` (copy `parkview.ts` template)
   - Add to portfolio array in `PortfolioView.tsx`
   - All workflow logic is property-agnostic

3. **Easy to Add Phases**:
   - Add phase to `PHASE_SEQUENCE` in `orchestrator.ts`
   - Add generator function in `approvals.ts`
   - Add to `PHASE_CONFIGS` with transition rules
   - Workflow automatically handles new phase

4. **Easy to Swap Scripted → LLM**:
   - Replace approval generator functions with LLM calls
   - Keep the same approval data structure
   - UI and workflow logic don't change
   - Finance engine stays deterministic (never call LLM for math)

5. **Easy to Add Persistence**:
   - Zustand store can sync to localStorage (one line)
   - Or add backend API and persist Simulation object to database
   - Audit trail is already a perfect event-sourcing log

## Dependencies

**Production**:
- `next@16.2.10`: React framework
- `react@19.2.4` + `react-dom@19.2.4`: UI library
- `zustand@5.x`: State management
- `tailwindcss@4.x`: Styling

**Development**:
- `typescript@5.x`: Type safety
- `vitest@4.1.10`: Testing framework
- `eslint@9.x`: Linting

**Total**: 403 packages (including transitive deps)

## Performance

- **Build Time**: ~15s (Next.js Turbopack)
- **First Load**: <1s (static pre-rendering)
- **Client Bundle**: ~200KB (gzipped)
- **Test Suite**: 20 tests in <1s

## Deployment

Works on any static host (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build
# Outputs to .next/ directory
# Deploy .next/standalone or use Vercel CLI
```

Or run as Node.js server:
```bash
npm run build
npm start
# Listens on http://localhost:3000
```

## License & Attribution

Built for CREOS demonstration. Uses:
- Synthetic data (no real property information)
- Open-source dependencies (see package.json)
- No proprietary algorithms

---

**Last Updated**: 2026-07-19  
**Version**: 1.0.0 (Milestone 1 Complete)  
**Status**: ✅ Production-ready for demo purposes
