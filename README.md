# CREOS

**AI-Native Commercial Real Estate Investment Simulation**

Experience the complete lifecycle of a $21.6M multifamily acquisition — from data review through underwriting, due diligence, financing, operations, disposition, and final waterfall distribution.

![CREOS](https://img.shields.io/badge/Status-Demo%20Ready-brightgreen) ![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passing-brightgreen) ![No API Keys Required](https://img.shields.io/badge/API%20Keys-None%20Required-blue)

## 🎯 What is CREOS?

CREOS demonstrates **AI-native workflow orchestration** for commercial real estate investment management. It simulates the decision-making journey of a real estate sponsor from initial underwriting through final investor distributions.

**Key Features**:
- ✅ **No LLM API keys required** — all agent messages are scripted, financial calculations are deterministic
- ✅ **Complete investment lifecycle** — 11 workflow phases with 15+ approval decisions
- ✅ **Realistic financial modeling** — powered by a tested deterministic finance engine
- ✅ **Full audit trail** — every decision and state change is logged
- ✅ **AI-native scoring** — performance evaluated on decision quality and financial outcomes

**Featured Property**: Parkview Terrace Apartments (120 units, Phoenix, AZ)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Complete the Golden Path (~5 minutes)

1. Enter your name
2. Click "Start Simulation" on Parkview Terrace
3. Review and approve each decision as the workflow progresses
4. Watch the simulation auto-advance through 11 phases
5. View your final AI-native performance score

## 📊 The Workflow

**11 Phases, 15+ Decisions**:

1. **Data Review** — Validate rent roll and operating statements
2. **Underwriting** — Review 5-year cashflow projections and return metrics
3. **Due Diligence** — Navigate title exceptions and environmental findings
4. **Financing** — Approve $15M loan term sheet
5. **IC Approval** — Investment Committee final vote
6. **Acquisition Close** — Close escrow
7. **Operations** — Year 1 performance review
8. **Hold Decision** — Decide: refinance and hold, or sell?
9. **Disposition** — Select winning buyer from 3 competing offers
10. **Sale Close** — Close sale transaction
11. **Tax Closeout** — Review gain recognition and K-1 preparation
12. **Waterfall Distribution** — Final distributions per operating agreement

All financial calculations use the **deterministic finance engine** (`src/lib/finance/index.ts`) — no LLMs for math, ever.

## 🧪 Testing

```bash
# Run all tests
npx vitest run

# Watch mode
npx vitest

# Build verification
npm run build
```

**Test Coverage**: 20/20 tests passing
- Income & valuation metrics
- Debt & return calculations
- XIRR (internal rate of return)
- Tax basis & gain recognition
- Waterfall distributions

## 🏗️ Architecture

**Stack**:
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand (state management)
- Vitest (testing)

**Key Directories**:
```
src/
├── app/              # Routes (/, /simulation, /scorecard, /audit)
├── components/       # UI components
├── data/            # Seed data (Parkview property)
├── lib/
│   ├── finance/     # Deterministic finance engine (20 tests)
│   └── workflow/    # Orchestration logic
├── store/           # Zustand state management
└── types/           # TypeScript definitions
```

## 📖 Documentation

- **[IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md)** — Complete technical documentation
- **[BUILD_DIRECTIVE.md](./BUILD_DIRECTIVE.md)** — Original build requirements

## 🎓 Learn More

**How It Works**:
1. User decisions trigger state changes in Zustand store
2. Workflow orchestrator (`useWorkflowOrchestrator`) watches for completed phases
3. When phase completes, orchestrator auto-advances to next phase
4. Each phase generates scripted approvals with real financial data
5. All calculations use deterministic finance engine
6. Audit trail logs every event
7. Final scorecard evaluates performance

**Why Scripted Messages?**
- Demonstrates AI-native workflow without requiring LLM API keys
- Ensures consistent, accurate financial communication
- Allows instant testing of full workflow
- Production version can swap scripted messages for real LLM calls

## 🔒 Data & Privacy

**All data is SYNTHETIC**. No real property information, no real investors, no real transactions. This is a demonstration of workflow orchestration patterns.

## 🚧 Roadmap

**Milestone 1** (✅ Complete):
- Single property (Parkview Terrace)
- Linear golden-path workflow
- Scripted agent messages
- Client-side state only
- Desktop-first UI

**Future Milestones**:
- [ ] Multiple properties with different strategies
- [ ] Branching workflows (hold vs. sell, negotiate vs. accept)
- [ ] Real LLM integration for agent messages
- [ ] Backend API + persistence
- [ ] "While You Were Away" operating digest
- [ ] Document generation (Excel pro formas, PDF reports)
- [ ] Mobile-responsive design
- [ ] Multi-user collaboration

## 🤝 Contributing

This is a demonstration project. For questions or feedback, see IMPLEMENTATION_NOTES.md.

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with**:
- Deterministic financial calculations (never LLMs for math)
- Scripted agent messages (swap for real LLMs in production)
- Complete audit trail (event sourcing ready)
- AI-native workflow orchestration

**No API keys required. No data harvesting. No cloud dependencies.**

Just `npm install && npm run dev` and experience the future of AI-native CRE operations.
