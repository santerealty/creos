import { Approval, ApprovalType, WorkflowPhase, Simulation } from '@/types';
import { OPERATING_EVENTS } from '@/lib/operations/events';
import { 
  effectiveGrossIncome, 
  netOperatingIncome, 
  capRate, 
  impliedValue, 
  dscr,
  waterfall,
  netSaleProceeds,
  adjustedTaxBasis,
  taxableGain,
  depreciationRecapture,
} from '@/lib/finance';

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW ORCHESTRATION ENGINE
// Generates scripted approvals for the golden-path simulation flow
// ═══════════════════════════════════════════════════════════════════════════

let approvalCounter = 0;

function createApproval(
  phase: WorkflowPhase,
  type: Approval['type'],
  title: string,
  description: string,
  agentMessage: string,
  propertyId: string,
  options: {
    primaryAction?: string;
    secondaryAction?: string;
    keyMetrics?: Approval['keyMetrics'];
    attachments?: Approval['attachments'];
  } = {}
): Approval {
  approvalCounter++;
  return {
    id: `appr_${Date.now()}_${approvalCounter}`,
    type,
    phase,
    propertyId,
    timestamp: new Date().toISOString(),
    title,
    description,
    agentMessage,
    primaryAction: options.primaryAction || 'Approve',
    secondaryAction: options.secondaryAction || 'Decline',
    status: 'PENDING',
    keyMetrics: options.keyMetrics,
    attachments: options.attachments,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

export function generateDataReviewApprovals(sim: Simulation): Approval[] {
  const prop = sim.property;
  
  // Calculate Year 1 metrics
  const egi = effectiveGrossIncome(
    prop.annualGrossPotentialRent,
    prop.annualOtherIncome,
    prop.annualVacancy,
    prop.annualConcessions,
    prop.annualBadDebt
  );
  const noi = netOperatingIncome(egi, prop.annualOperatingExpenses);
  const cap = capRate(noi, prop.purchasePrice);
  
  return [
    createApproval(
      'DATA_REVIEW',
      'DATA_VALIDATION',
      'Rent Roll & Operating Data Validation',
      'Review the provided rent roll and trailing 12-month operating statement for Parkview Terrace Apartments.',
      `I've completed initial validation of the property data package for ${prop.name}.

Key observations:
• Current occupancy at ${(prop.currentOccupancy * 100).toFixed(0)}% with ${prop.units} total units
• In-place rents averaging $${prop.avgRentPerUnit}/unit vs. market comps at $${prop.marketRentPerUnit}/unit
• Significant rent upside opportunity: ${(((prop.marketRentPerUnit - prop.avgRentPerUnit) / prop.avgRentPerUnit) * 100).toFixed(0)}%
• Year 1 Stabilized NOI projected at $${(noi / 1000).toFixed(0)}K
• Entry cap rate: ${(cap * 100).toFixed(2)}%

The data appears internally consistent. T-12 operating statement reconciles with rent roll. However, I recommend:
1. Third-party verification of tenant ledger
2. Site inspection to validate unit conditions
3. Market study to confirm rent growth assumptions

All data labeled as SYNTHETIC per simulation protocol.

Do you approve proceeding to formal underwriting?`,
      prop.id,
      {
        primaryAction: 'Approve & Proceed',
        secondaryAction: 'Request Additional Data',
        keyMetrics: [
          { label: 'Units', value: prop.units },
          { label: 'Occupancy', value: `${(prop.currentOccupancy * 100).toFixed(0)}%` },
          { label: 'Year 1 NOI', value: `$${(noi / 1000).toFixed(0)}K` },
          { label: 'Entry Cap', value: `${(cap * 100).toFixed(2)}%`, trend: 'neutral' },
        ],
        attachments: [
          { name: 'Rent Roll - Current.xlsx', type: 'RENT_ROLL' },
          { name: 'T-12 Operating Statement.pdf', type: 'T12' },
        ],
      }
    ),
  ];
}

export function generateUnderwritingApprovals(sim: Simulation): Approval[] {
  const prop = sim.property;
  const ops = sim.operatingStatements;
  const terms = sim.partnershipTerms;
  
  // Calculate 5-year return metrics
  const year5Noi = ops[4].netOperatingIncome;
  const exitValue = impliedValue(year5Noi, prop.exitCapRate);
  const annualDebtService = prop.loanAmount * prop.interestRate; // Simplified
  const year1Dscr = dscr(ops[0].netOperatingIncome, annualDebtService);
  
  return [
    createApproval(
      'UNDERWRITING',
      'UNDERWRITING_OPINION',
      'Investment Committee Underwriting Package',
      'Review the complete underwriting analysis including 5-year cashflow forecast, sensitivity analysis, and return metrics.',
      `Underwriting complete for ${prop.name}.

CAPITAL STRUCTURE:
• Purchase Price: $${(prop.purchasePrice / 1_000_000).toFixed(1)}M
• Loan Amount: $${(prop.loanAmount / 1_000_000).toFixed(1)}M @ ${(prop.interestRate * 100).toFixed(2)}% (${(prop.loanAmount / prop.purchasePrice * 100).toFixed(0)}% LTV)
• Equity Required: $${(prop.equityRequired / 1_000_000).toFixed(2)}M
  - LP Capital: $${(terms.investorEquity / 1_000_000).toFixed(2)}M (${(terms.investorEquity / prop.equityRequired * 100).toFixed(0)}%)
  - GP Co-Invest: $${(terms.sponsorEquity / 1_000_000).toFixed(2)}M (${(terms.sponsorEquity / prop.equityRequired * 100).toFixed(0)}%)

PROJECTED RETURNS (5-year hold):
• Year 1 DSCR: ${year1Dscr.toFixed(2)}x
• Year 5 NOI: $${(year5Noi / 1000).toFixed(0)}K
• Stabilized Exit Value: $${(exitValue / 1_000_000).toFixed(1)}M @ ${(prop.exitCapRate * 100).toFixed(2)}% cap
• Estimated Gross IRR: 16-18% (pending final close calcs)
• Target MOIC: 1.8-2.0x

VALUE-ADD STRATEGY:
• Renovate 60 units over 18 months ($8K/unit capex)
• Lease-up vacant units to 95% occupancy
• Implement revenue management and expense controls
• Rent growth to market within 24 months

The deal meets IC hurdles. Debt coverage is healthy. Downside case still pencils at 12% IRR.

Recommend proceeding to due diligence.`,
      prop.id,
      {
        primaryAction: 'Approve Underwriting',
        secondaryAction: 'Revise Assumptions',
        keyMetrics: [
          { label: 'Equity Required', value: `$${(prop.equityRequired / 1_000_000).toFixed(2)}M` },
          { label: 'Year 1 DSCR', value: `${year1Dscr.toFixed(2)}x`, trend: 'up' },
          { label: 'Exit Value (Y5)', value: `$${(exitValue / 1_000_000).toFixed(1)}M`, trend: 'up' },
        ],
        attachments: [
          { name: 'Underwriting Model v3.xlsx', type: 'FORECAST' },
          { name: 'Market Comparables Analysis.pdf', type: 'APPRAISAL' },
        ],
      }
    ),
  ];
}

export function generateDueDiligenceApprovals(sim: Simulation): Approval[] {
  return [
    createApproval(
      'DUE_DILIGENCE',
      'TITLE_EXCEPTION',
      'Title Commitment Review - Exception Noted',
      'The title company has flagged an easement encumbrance that requires approval to proceed.',
      `Title review complete for Parkview Terrace.

The preliminary title commitment shows clear title EXCEPT:

EXCEPTION #7: Utility easement (10ft) along eastern property boundary, recorded 1997. Grants city perpetual access for underground infrastructure maintenance.

IMPACT ANALYSIS:
• Easement affects < 2% of total land area
• Does not impact any building structures or parking
• Standard for this submarket
• Does not materially affect property value or operations
• Legal counsel advises this is acceptable and typical

RECOMMENDATION: Accept the exception and proceed to close. Easement is properly disclosed in the PSA and does not trigger a termination right.

Do you approve proceeding with this title exception?`,
      sim.property.id,
      {
        primaryAction: 'Accept Exception',
        secondaryAction: 'Negotiate with Seller',
        attachments: [
          { name: 'Preliminary Title Commitment.pdf', type: 'TITLE_REPORT' },
        ],
      }
    ),
    createApproval(
      'DUE_DILIGENCE',
      'ENVIRONMENTAL_EXCEPTION',
      'Phase I ESA - Minor Issue Identified',
      'Environmental consultant identified a recognized environmental condition requiring decision.',
      `Phase I Environmental Site Assessment results received.

FINDINGS:
The Phase I ESA identified one (1) Recognized Environmental Condition (REC):

• Former underground storage tank (UST) removed in 2003, properly closed per state records
• Soil samples from 2003 closure showed petroleum hydrocarbon concentrations below regulatory thresholds
• No evidence of ongoing contamination
• Lender will require environmental insurance ($15K premium)

CONSULTANT RECOMMENDATION:
"The historical UST removal was properly remediated and closed. No further investigation warranted. Environmental insurance recommended for lender comfort."

DECISION OPTIONS:
1. ACCEPT: Proceed with $15K E&O insurance (reduces equity returns by <0.1%)
2. NEGOTIATE: Request seller credit for insurance premium

Given immaterial impact, I recommend accepting and proceeding to maintain deal momentum.`,
      sim.property.id,
      {
        primaryAction: 'Accept & Add Insurance',
        secondaryAction: 'Request Seller Credit',
        keyMetrics: [
          { label: 'Insurance Cost', value: '$15K', trend: 'neutral' },
          { label: 'Impact on Returns', value: '<0.1%', trend: 'down' },
        ],
        attachments: [
          { name: 'Phase I ESA Report.pdf', type: 'ENV_REPORT' },
        ],
      }
    ),
  ];
}

export function generateFinancingApprovals(sim: Simulation): Approval[] {
  const prop = sim.property;
  const ops = sim.operatingStatements;
  const year1Dscr = dscr(ops[0].netOperatingIncome, prop.loanAmount * prop.interestRate);
  
  return [
    createApproval(
      'FINANCING',
      'LOAN_TERMS',
      'Loan Term Sheet Approval',
      'Lender has issued final loan commitment. Review and approve terms to proceed to close.',
      `Financing secured for ${prop.name}.

LOAN TERMS:
• Lender: Freddie Mac SBLL Program
• Loan Amount: $${(prop.loanAmount / 1_000_000).toFixed(1)}M
• Interest Rate: ${(prop.interestRate * 100).toFixed(2)}% (5yr fixed)
• Amortization: 30 years
• Term: ${prop.loanTermYears} years (balloon at maturity)
• LTV: ${(prop.loanAmount / prop.purchasePrice * 100).toFixed(0)}%
• Year 1 DSCR: ${year1Dscr.toFixed(2)}x (exceeds ${1.25}x minimum)

COVENANTS:
• Minimum DSCR: 1.25x (trailing 90 days)
• Annual budget approval required
• Replacement reserves: $300/unit/year
• Standard non-recourse carveouts (fraud, environmental, unpaid taxes)

FEES & COSTS:
• Origination: 1.00% ($${(prop.loanAmount * 0.01 / 1000).toFixed(0)}K)
• Third-party reports: ~$25K
• Total financing costs: ~$${((prop.loanAmount * 0.01 + 25000) / 1000).toFixed(0)}K

Terms are in line with market. Rate is competitive for 5yr agency financing. Loan proceeds fund ${(prop.loanAmount / prop.purchasePrice * 100).toFixed(0)}% of purchase, with ${(prop.equityRequired / prop.purchasePrice * 100).toFixed(0)}% equity.

Recommend accepting and proceeding to close.`,
      prop.id,
      {
        primaryAction: 'Accept Loan Terms',
        secondaryAction: 'Negotiate Rate',
        keyMetrics: [
          { label: 'Loan Amount', value: `$${(prop.loanAmount / 1_000_000).toFixed(1)}M` },
          { label: 'Interest Rate', value: `${(prop.interestRate * 100).toFixed(2)}%` },
          { label: 'Year 1 DSCR', value: `${year1Dscr.toFixed(2)}x`, trend: 'up' },
        ],
        attachments: [
          { name: 'Loan Term Sheet - Final.pdf', type: 'LOAN_TERM_SHEET' },
        ],
      }
    ),
  ];
}

export function generateIcApprovalApprovals(sim: Simulation): Approval[] {
  return [
    createApproval(
      'IC_APPROVAL',
      'IC_DECISION',
      'Investment Committee Final Approval',
      'All due diligence complete. IC vote required to authorize acquisition.',
      `INVESTMENT COMMITTEE MEMORANDUM

RECOMMENDATION: APPROVE acquisition of ${sim.property.name}

TRANSACTION SUMMARY:
• Property: ${sim.property.units}-unit multifamily, ${sim.property.city}, ${sim.property.state}
• Strategy: ${sim.property.strategy}
• Purchase Price: $${(sim.property.purchasePrice / 1_000_000).toFixed(1)}M
• Equity: $${(sim.property.equityRequired / 1_000_000).toFixed(2)}M | Debt: $${(sim.property.loanAmount / 1_000_000).toFixed(1)}M

DUE DILIGENCE STATUS:
✓ Financial validation complete
✓ Title commitment accepted (standard easement exception)
✓ Phase I ESA clear (historical UST properly remediated)
✓ Property inspection complete, $480K capex reserve funded
✓ Financing committed: ${(sim.property.interestRate * 100).toFixed(2)}% fixed, 5-year term

TARGET RETURNS:
• Equity IRR: 16-18%
• Equity Multiple: 1.8-2.0x
• Average Cash Yield: 6-8%

KEYS TO SUCCESS:
• Execute unit renovations on schedule and budget
• Achieve 95% stabilized occupancy within 12 months
• Capture $300/unit rent growth to market

All IC members have reviewed the underwriting package. Financial, legal, and asset management teams recommend APPROVAL.

Close date: 14 days from IC approval.

VOTE: Do you approve this acquisition?`,
      sim.property.id,
      {
        primaryAction: 'Approve Acquisition',
        secondaryAction: 'Decline / Exit',
        keyMetrics: [
          { label: 'Total Investment', value: `$${(sim.property.purchasePrice / 1_000_000).toFixed(1)}M` },
          { label: 'Target IRR', value: '16-18%', trend: 'up' },
          { label: 'Target Equity Multiple', value: '1.8-2.0x', trend: 'up' },
        ],
      }
    ),
  ];
}

export function generateOperationsApprovals(sim: Simulation): Approval[] {
  const ops = sim.operatingStatements;
  
  // MILESTONE 2: Source operating events from the deterministic, unit-tested
  // events library (src/lib/operations/events.ts) so the flow and the tests
  // exercise the same definitions.
  const operatingEvents = OPERATING_EVENTS.map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category as string,
    narrative: e.narrative,
    options: e.options.map((o) => o.label),
  }));

  const approvals: Approval[] = [
    // Original Year 1 performance review
    createApproval(
      'OPERATIONS',
      'OPERATIONAL_DECISION',
      'Year 1 Operations Complete - Performance Review',
      'First year of operations complete. Review performance and approve continuation of business plan.',
      `YEAR 1 PERFORMANCE REVIEW - ${sim.property.name}

OPERATIONAL HIGHLIGHTS:
✓ Acquired and closed on schedule
✓ Renovated 45 units (75% of Year 1 target)
✓ Occupancy increased from 88% to 92%
✓ Average rent increased from $1,350 to $1,475/unit
✓ NOI: $${(ops[0].netOperatingIncome / 1000).toFixed(0)}K vs. $${(ops[0].netOperatingIncome / 1000).toFixed(0)}K underwritten (on target)

FINANCIAL PERFORMANCE:
• Gross Revenue: $${(ops[0].effectiveGrossIncome / 1000).toFixed(0)}K
• Operating Expenses: $${(ops[0].operatingExpenses / 1000).toFixed(0)}K (${(ops[0].operatingExpenses / ops[0].effectiveGrossIncome * 100).toFixed(0)}% of EGI)
• Net Operating Income: $${(ops[0].netOperatingIncome / 1000).toFixed(0)}K
• Cash Flow After Debt Service: $${(ops[0].cashFlow / 1000).toFixed(0)}K

BUSINESS PLAN STATUS:
• On track for 95% stabilization by Q3 Year 2
• Renovation pipeline: 15 units remaining
• Market rents trending up 3-4% annually
• Operating expenses well-controlled

No major issues. Recommend continuing business plan execution.

Approve Year 1 results and proceed to Year 2?`,
      sim.property.id,
      {
        primaryAction: 'Approve & Continue',
        secondaryAction: 'Request Changes',
        keyMetrics: [
          { label: 'Occupancy', value: '92%', trend: 'up' },
          { label: 'Year 1 NOI', value: `$${(ops[0].netOperatingIncome / 1000).toFixed(0)}K`, trend: 'up' },
          { label: 'Year 1 Cash Flow', value: `$${(ops[0].cashFlow / 1000).toFixed(0)}K`, trend: 'up' },
        ],
      }
    ),
  ];
  
  // Add 2-3 operating events as approvals
  operatingEvents.slice(0, 3).forEach((event) => {
    approvals.push(
      createApproval(
        'OPERATIONS',
        'OPERATIONAL_DECISION',
        event.title,
        event.narrative,
        `OPERATING DECISION REQUIRED - ${event.category}

${event.narrative}

This decision will impact property operations and financial performance. Review the options carefully and select your preferred course of action.

Note: This is a deterministic simulation event. Each option produces specific, quantified financial impacts calculated using the finance engine.`,
        sim.property.id,
        {
          primaryAction: event.options[0],
          secondaryAction: event.options[1],
          keyMetrics: [
            { label: 'Event Type', value: event.category, trend: 'neutral' },
            { label: 'Decision Required', value: 'Yes', trend: 'neutral' },
          ],
        }
      )
    );
  });

  return approvals;
}

export function generateHoldDecisionApprovals(sim: Simulation): Approval[] {
  const ops = sim.operatingStatements;
  const year5Noi = ops[4].netOperatingIncome;
  const exitValue = impliedValue(year5Noi, sim.property.exitCapRate);
  
  // MILESTONE 2: Agent disagreement scenario - three agents with DIFFERING recommendations
  return [
    createApproval(
      'HOLD_DECISION',
      'HOLD_SELL_DECISION',
      'Year 5 Hold/Sell Decision - Agent Disagreement',
      'Business plan complete. Loan matures in 6 months. THREE AI agents have analyzed the decision and reached DIFFERENT conclusions. Review each recommendation and make your decision.',
      `YEAR 5 - HOLD/SELL ANALYSIS

CURRENT STATUS:
• Business plan COMPLETE ✓
• Occupancy: 95% (stabilized)
• In-place NOI: $${(year5Noi / 1000).toFixed(0)}K
• Loan Balance: $${(sim.property.loanAmount / 1_000_000).toFixed(1)}M (matures in 6 months)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 ASSET MANAGEMENT AI RECOMMENDATION: HOLD (Refinance)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RATIONALE:
• Property is now a core stabilized asset generating $${(year5Noi / 1000).toFixed(0)}K NOI
• Refinance at 65% LTV → Extract $${((exitValue * 0.65 - sim.property.loanAmount) / 1_000_000).toFixed(1)}M equity for LPs (partial liquidity)
• Retain upside: Phoenix multifamily fundamentals remain strong (population growth, job market)
• Hold 3-5 more years → Capture additional rent growth and NOI expansion
• Current 5.5% exit cap assumption may compress to 5.0% by 2029 → Additional $${((year5Noi / 0.05 - exitValue) / 1_000_000).toFixed(1)}M value creation

RISK MITIGATION:
• Refinance locks in low rate and returns ~35% of equity to LPs NOW
• Diversifies exit timing (not forced seller in one moment)
• Maintains cashflow stream for portfolio

PROJECTED EXTENDED HOLD RETURNS (3-year extension):
• Total MOIC: 2.3x (vs. 1.9x if sold today)
• Total IRR: 16.5% (extended hold period moderates IRR slightly but increases absolute dollars)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 CAPITAL MARKETS AI RECOMMENDATION: SELL NOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RATIONALE:
• We are at PEAK valuation: Cap rates at historic lows (5.5%)
• Strong buyer demand TODAY for stabilized Phoenix multifamily (4 groups already expressed interest)
• Market cycle risk: Fed rate uncertainty, potential cap rate expansion to 6.0-6.5% = $${((year5Noi / 0.06 - exitValue) / 1_000_000).toFixed(1)}M value loss
• Business plan COMPLETE → Mission accomplished, time to harvest gains
• Certainty of execution: Lock in ~17% IRR and 1.9x MOIC NOW vs. hope for better in 3 years

MARKET INTELLIGENCE:
• Similar comps selling at 5.0-5.3% caps (we're conservative at 5.5%)
• Institutional capital aggressively bidding for quality assets
• 2026-2027 economic slowdown risk (market consensus)
• "Sell the sizzle, not the steak" - exit while story is hot

NET PROCEEDS:
• Sale: $${(exitValue / 1_000_000).toFixed(1)}M @ 5.5% cap
• Less costs: ~$${(exitValue * 0.03 / 1_000_000).toFixed(1)}M (3%)
• Less loan payoff: $${(sim.property.loanAmount / 1_000_000).toFixed(1)}M
• NET TO EQUITY: ~$${((exitValue - sim.property.loanAmount) * 0.97 / 1_000_000).toFixed(1)}M (full liquidity)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟡 TAX & STRUCTURING AI RECOMMENDATION: DELAY SALE 6 MONTHS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RATIONALE:
• CRITICAL TAX ISSUE: Property was acquired in January 2020 → Held 5 years
• If sold NOW: Short-term holding for several LPs who entered in late 2020 = higher tax rate
• DELAY 6 months → ALL LPs qualify for long-term capital gains treatment
• Tax efficiency matters: Deferred 1031 exchange opportunities for LPs increase in H2 2025

TAX IMPACT ANALYSIS:
• Gain on sale: $${(((exitValue - sim.property.loanAmount) * 0.97 - (sim.partnershipTerms.investorEquity + sim.partnershipTerms.sponsorEquity)) / 1_000_000).toFixed(1)}M
• Depreciation recapture: ~$${(sim.property.purchasePrice * 0.28 * 5 / 27.5 / 1_000_000).toFixed(1)}M @ 25% rate
• For LPs in 37% bracket: Delay saves ~$${((exitValue * 0.12) / 1_000_000).toFixed(1)}M in taxes collectively

COMPROMISE RECOMMENDATION:
• Bridge loan for 6 months to push sale into late 2025
• Engage 1031 exchange facilitator NOW so LPs can identify replacement properties
• Launch sale process in 4 months (Q3 2025) → Close by year-end
• Market risk is manageable for 6-month delay vs. substantial tax savings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  DECISION REQUIRED: Three agents, three different recommendations.
You must resolve this disagreement. Which path do you choose?`,
      sim.property.id,
      {
        primaryAction: 'Approve Sale Now',
        secondaryAction: 'Refinance & Hold',
        keyMetrics: [
          { label: 'Capital Markets: SELL', value: `$${(exitValue / 1_000_000).toFixed(1)}M`, trend: 'up' },
          { label: 'Asset Mgmt: HOLD', value: '2.3x MOIC', trend: 'up' },
          { label: 'Tax AI: DELAY', value: 'Save $1M+ tax', trend: 'neutral' },
        ],
      }
    ),
  ];
}

export function generateDispositionApprovals(sim: Simulation): Approval[] {
  return [
    createApproval(
      'DISPOSITION',
      'BUYER_SELECTION',
      'Buyer Selection - Multiple Offers Received',
      'Property marketing complete. Review competing offers and select winning bidder.',
      `OFFER SUMMARY - ${sim.property.name}

Marketing results: 3 qualified offers received

OFFER A - Regional REIT:
• Price: $29.2M (5.15% cap on Y5 NOI)
• Terms: All cash, 45-day close, no contingencies
• Strength: Fast close, certainty of execution

OFFER B - Private Investor (1031 Exchange):
• Price: $30.0M (5.01% cap)
• Terms: All cash, 30-day close, subject to partner approval
• Strength: Highest price
• Risk: 1031 timeline pressure, approval contingency

OFFER C - Institutional Fund:
• Price: $29.5M (5.09% cap)
• Terms: All cash, 60-day close, standard due diligence
• Strength: Strong buyer, institutional reputation
• Risk: Longer timeline

RECOMMENDATION: SELECT OFFER A

While Offer B is $800K higher, the 1031 contingency and partner approval create execution risk. Offer A provides certainty, quick close, and strong value realization.

Net proceeds (Offer A): $29.2M sale - $600K costs - $15.0M loan payoff = ~$13.6M to equity

Select winning bidder?`,
      sim.property.id,
      {
        primaryAction: 'Select Offer A',
        secondaryAction: 'Counter Offer B',
        keyMetrics: [
          { label: 'Offer A', value: '$29.2M' },
          { label: 'Offer B (highest)', value: '$30.0M', trend: 'up' },
          { label: 'Offer C', value: '$29.5M' },
        ],
      }
    ),
  ];
}

export function generateTaxApprovals(sim: Simulation): Approval[] {
  const salePrice = 29_200_000;
  const sellingCosts = salePrice * 0.03;
  const netProceeds = netSaleProceeds(
    salePrice,
    sellingCosts,
    sim.property.loanAmount,
    0, // no prepayment penalty
    0,
    0,
    0
  );
  
  // Tax basis calc
  const originalBasis = sim.property.purchasePrice + sim.property.closingCosts;
  const improvements = 480_000; // Capex from renovation
  const accumDepr = 4_000_000; // 5 years depreciation
  const adjBasis = adjustedTaxBasis(originalBasis, improvements, accumDepr);
  const gain = taxableGain(salePrice - sellingCosts, adjBasis);
  const recapture = depreciationRecapture(accumDepr, adjBasis, salePrice - sellingCosts);
  
  return [
    createApproval(
      'TAX_CLOSEOUT',
      'TAX_STRATEGY',
      'Tax Closing - Gain Allocation & Reporting',
      'Sale closed. Review tax consequences and approve K-1 preparation.',
      `TAX CLOSEOUT - ${sim.property.name}

SALE ECONOMICS:
• Gross Sale Price: $${(salePrice / 1_000_000).toFixed(2)}M
• Selling Costs: $${(sellingCosts / 1000).toFixed(0)}K
• Net Sale Proceeds to Equity: $${(netProceeds / 1_000_000).toFixed(2)}M

TAX POSITION:
• Adjusted Basis: $${(adjBasis / 1_000_000).toFixed(2)}M
  (Original cost + improvements - accumulated depreciation)
• Taxable Gain: $${(gain / 1_000_000).toFixed(2)}M
• Depreciation Recapture: $${(recapture / 1_000_000).toFixed(2)}M (ordinary income @ 25%)
• Capital Gain: $${((gain - recapture) / 1_000_000).toFixed(2)}M (long-term @ 20%)

ESTIMATED TAX LIABILITY (entity-level):
• Federal (blended): ~$${((recapture * 0.25 + (gain - recapture) * 0.20) / 1_000_000).toFixed(2)}M
• State (AZ): ~$${(gain * 0.045 / 1_000_000).toFixed(2)}M
• Total Est. Tax: ~$${(((recapture * 0.25 + (gain - recapture) * 0.20) + gain * 0.045) / 1_000_000).toFixed(2)}M

Tax counsel will prepare partnership K-1s allocating gains per operating agreement (70/30 after promotes). LPs receive K-1s within 75 days of year-end.

Approve tax position and authorize K-1 distribution?`,
      sim.property.id,
      {
        primaryAction: 'Approve Tax Closing',
        secondaryAction: 'Request Tax Review',
        keyMetrics: [
          { label: 'Taxable Gain', value: `$${(gain / 1_000_000).toFixed(2)}M` },
          { label: 'Est. Tax Liability', value: `$${(((recapture * 0.25 + (gain - recapture) * 0.20) + gain * 0.045) / 1_000_000).toFixed(2)}M`, trend: 'down' },
        ],
      }
    ),
  ];
}

export function generateWaterfallApprovals(sim: Simulation): Approval[] {
  const salePrice = 29_200_000;
  const sellingCosts = salePrice * 0.03;
  const netProceeds = netSaleProceeds(
    salePrice,
    sellingCosts,
    sim.property.loanAmount,
    0,
    0,
    0,
    0
  );
  
  const totalCash = netProceeds + (325_000 + 475_000 + 536_000 + 587_000 + 639_000); // Sale proceeds + 5yr cashflows
  
  // Calculate waterfall
  const accruedPref = sim.partnershipTerms.investorEquity * 0.08 * 5; // 5 years @ 8%
  const catchUp = accruedPref * 0.25; // 25% of pref
  
  const wf = waterfall({
    totalDistributable: totalCash,
    investorCapital: sim.partnershipTerms.investorEquity,
    sponsorCapital: sim.partnershipTerms.sponsorEquity,
    accruedPref,
    catchUp,
    investorSplit: sim.partnershipTerms.investorSplit,
    sponsorSplit: sim.partnershipTerms.sponsorSplit,
  });
  
  const investorIrr = 0.17; // Computed elsewhere
  const investorMoic = wf.investorTotal / sim.partnershipTerms.investorEquity;
  const sponsorMoic = wf.sponsorTotal / sim.partnershipTerms.sponsorEquity;
  
  return [
    createApproval(
      'WATERFALL_DISTRIBUTION',
      'DISSOLUTION_VOTE',
      'Final Distribution & Partnership Dissolution',
      'All assets liquidated. Approve final waterfall distribution and partnership dissolution.',
      `FINAL DISTRIBUTION CALCULATION

TOTAL DISTRIBUTABLE PROCEEDS: $${(totalCash / 1_000_000).toFixed(2)}M
(Sale proceeds + cumulative operating cashflow)

WATERFALL DISTRIBUTION:

Tier 1 - LP Preferred Return (8% annual):
  → LPs: $${(wf.investorPref / 1_000_000).toFixed(2)}M ✓

Tier 2 - Return of Capital:
  → LPs: $${(wf.investorReturnOfCapital / 1_000_000).toFixed(2)}M ✓
  → GP: $${(sim.partnershipTerms.sponsorEquity / 1_000_000).toFixed(2)}M ✓

Tier 3 - GP Catch-Up (to 8% IRR hurdle):
  → GP: $${(wf.sponsorCatchUp / 1_000_000).toFixed(2)}M ✓

Tier 4 - Residual Split (70/30):
  → LPs (70%): $${(wf.investorResidual / 1_000_000).toFixed(2)}M
  → GP (30%): $${(wf.sponsorResidual / 1_000_000).toFixed(2)}M

FINAL DISTRIBUTIONS:
• LP Total: $${(wf.investorTotal / 1_000_000).toFixed(2)}M (${investorMoic.toFixed(2)}x MOIC, ${(investorIrr * 100).toFixed(1)}% IRR)
• GP Total: $${(wf.sponsorTotal / 1_000_000).toFixed(2)}M (${sponsorMoic.toFixed(2)}x MOIC)

All waterfall tiers reconcile perfectly (check: $${(wf.check / 1000).toFixed(0)}K variance).

Wire instructions confirmed with all LPs. Funds will be distributed within 5 business days.

Upon approval, partnership will be formally dissolved and final tax returns filed.

Approve final distribution and dissolution?`,
      sim.property.id,
      {
        primaryAction: 'Approve & Dissolve',
        secondaryAction: 'Review Calculations',
        keyMetrics: [
          { label: 'LP Total', value: `$${(wf.investorTotal / 1_000_000).toFixed(2)}M`, trend: 'up' },
          { label: 'LP MOIC', value: `${investorMoic.toFixed(2)}x`, trend: 'up' },
          { label: 'LP IRR', value: `${(investorIrr * 100).toFixed(1)}%`, trend: 'up' },
        ],
      }
    ),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONE 2: REVISION MECHANISM
// ═══════════════════════════════════════════════════════════════════════════

export interface RevisionReason {
  id: string;
  label: string;
  description: string;
}

export const REVISION_REASONS: RevisionReason[] = [
  {
    id: 'lower-rent-growth',
    label: 'Lower Rent Growth Assumption',
    description: 'Reduce rent growth from 3% to 2% to be more conservative',
  },
  {
    id: 'raise-exit-cap',
    label: 'Raise Exit Cap Rate',
    description: 'Increase exit cap from 5.5% to 6.0% for downside protection',
  },
  {
    id: 'reduce-leverage',
    label: 'Reduce Leverage',
    description: 'Lower LTV from 75% to 70% to improve debt coverage',
  },
  {
    id: 'add-downside-case',
    label: 'Add Downside Scenario',
    description: 'Include stress test with 8% vacancy and 6.5% exit cap',
  },
  {
    id: 'get-vendor-bid',
    label: 'Get Additional Vendor Bid',
    description: 'Obtain competitive bids to validate pricing',
  },
  {
    id: 'increase-contingency',
    label: 'Increase Contingency Reserve',
    description: 'Raise CAPEX contingency from 5% to 10%',
  },
];

/**
 * Generate a revised approval based on a revision reason.
 * Preserves original values and shows side-by-side comparison.
 */
export function generateRevisedApproval(
  originalApproval: Approval,
  revisionReasonId: string,
): Approval {
  const reason = REVISION_REASONS.find((r) => r.id === revisionReasonId);
  if (!reason) throw new Error(`Unknown revision reason: ${revisionReasonId}`);

  const revisionNumber = (originalApproval.currentRevision ?? 0) + 1;
  const originalMetrics = originalApproval.keyMetrics;
  let revisedMetrics: Approval['keyMetrics'] = originalMetrics;
  let revisedMessage = '';

  // Apply deterministic revisions based on reason
  if (revisionReasonId === 'lower-rent-growth') {
    revisedMetrics = [
      { label: 'Rent Growth (Original)', value: '3.0%', trend: 'neutral' },
      { label: 'Rent Growth (Revised)', value: '2.0%', trend: 'down' },
      { label: 'Year 5 NOI Impact', value: '-$45K', trend: 'down' },
      { label: 'IRR Impact', value: '-0.8%', trend: 'down' },
    ];
    revisedMessage = `REVISION ${revisionNumber}: Reduced rent growth assumption from 3.0% to 2.0% annually.

IMPACT ANALYSIS:
• Year 5 NOI: Reduced by ~$45K (conservative market view)
• Exit Value: Reduced by ~$800K (at 5.5% cap)
• Projected IRR: Reduced from 17.0% to 16.2% (-80bps)
• Projected MOIC: Reduced from 1.9x to 1.85x

This more conservative assumption provides downside protection if market fundamentals soften.
Revised underwriting still meets IC hurdle of 15% IRR.`;

  } else if (revisionReasonId === 'raise-exit-cap') {
    revisedMetrics = [
      { label: 'Exit Cap (Original)', value: '5.5%', trend: 'neutral' },
      { label: 'Exit Cap (Revised)', value: '6.0%', trend: 'up' },
      { label: 'Exit Value Impact', value: '-$1.5M', trend: 'down' },
      { label: 'IRR Impact', value: '-1.2%', trend: 'down' },
    ];
    revisedMessage = `REVISION ${revisionNumber}: Increased exit cap rate from 5.5% to 6.0%.

IMPACT ANALYSIS:
• Exit Value: Reduced from $29.0M to $27.5M (-$1.5M or -5%)
• Net Proceeds to Equity: Reduced by ~$1.5M
• Projected IRR: Reduced from 17.0% to 15.8% (-120bps)
• Projected MOIC: Reduced from 1.9x to 1.8x

Conservative exit cap provides cushion against market deterioration. 6.0% cap is still within historical range for Phoenix multifamily.
Deal still pencils at attractive returns even with cap rate expansion.`;

  } else if (revisionReasonId === 'reduce-leverage') {
    revisedMetrics = [
      { label: 'LTV (Original)', value: '75%', trend: 'neutral' },
      { label: 'LTV (Revised)', value: '70%', trend: 'down' },
      { label: 'Equity Required', value: '+$750K', trend: 'up' },
      { label: 'DSCR Improvement', value: '+0.15x', trend: 'up' },
    ];
    revisedMessage = `REVISION ${revisionNumber}: Reduced leverage from 75% LTV to 70% LTV.

IMPACT ANALYSIS:
• Loan Amount: Reduced from $11.5M to $10.75M (-$750K)
• Equity Required: Increased from $3.8M to $4.55M (+$750K)
• Year 1 DSCR: Improved from 1.42x to 1.57x (+0.15x)
• Annual Debt Service: Reduced by ~$39K
• IRR: Reduced slightly (higher equity base) but improved risk profile

Lower leverage improves debt coverage and reduces refinance/extension risk. More conservative structure may appeal to LPs and lenders.`;

  } else if (revisionReasonId === 'add-downside-case') {
    revisedMetrics = [
      { label: 'Base Case IRR', value: '17.0%', trend: 'up' },
      { label: 'Downside Case IRR', value: '12.5%', trend: 'down' },
      { label: 'Downside Assumptions', value: '8% vac / 6.5% cap', trend: 'neutral' },
      { label: 'Downside MOIC', value: '1.5x', trend: 'neutral' },
    ];
    revisedMessage = `REVISION ${revisionNumber}: Added stress-test downside scenario.

DOWNSIDE CASE ASSUMPTIONS:
• Vacancy: 8% (vs. 5% base case) - elevated churn
• Expense Growth: 4% (vs. 2.5% base) - inflation spike
• Exit Cap: 6.5% (vs. 5.5% base) - cap rate expansion
• Rent Growth: 1% (vs. 3% base) - soft market

DOWNSIDE CASE RESULTS:
• Projected IRR: 12.5% (still above 12% minimum)
• Projected MOIC: 1.5x (positive but compressed)
• Break-even occupancy: 88% (healthy margin)

Even in stressed scenario, deal delivers acceptable returns and maintains positive equity value. Downside protection is adequate.`;

  } else {
    // Generic revision for other reasons
    revisedMessage = `REVISION ${revisionNumber}: ${reason.description}

Original recommendation has been updated to address your concern. Please review revised analysis.`;
  }

  const revisionHistory = [
    ...(originalApproval.revisionHistory ?? []),
    {
      revisionNumber,
      timestamp: new Date().toISOString(),
      reason: reason.label,
      originalMetrics,
      revisedMetrics,
      originalMessage: originalApproval.agentMessage,
      revisedMessage,
    },
  ];

  return {
    ...originalApproval,
    id: `${originalApproval.id}_rev${revisionNumber}`,
    agentMessage: revisedMessage,
    keyMetrics: revisedMetrics,
    revisionHistory,
    currentRevision: revisionNumber,
    status: 'PENDING', // Re-pend the revised approval
    decidedAt: undefined,
    userResponse: undefined,
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// MILESTONE 2 FIX: DECLINE -> REALISTIC ALTERNATIVE PATH (spec §19)
// A decline never dead-ends the sim; CREOS proposes a concrete alternative
// re-pended for a fresh decision.
// ═══════════════════════════════════════════════════════════════════════════

const DECLINE_ALTERNATIVES: Partial<Record<ApprovalType, { title: string; message: string; metrics: NonNullable<Approval['keyMetrics']> }>> = {
  DATA_VALIDATION: {
    title: 'Re-Underwrite on Verified Data',
    message: `You declined the initial data package. CREOS has commissioned third-party verification of the tenant ledger and a site inspection, then re-run the numbers on the verified figures.`,
    metrics: [
      { label: 'Data Source', value: 'Third-party verified', trend: 'up' },
      { label: 'Delay', value: '+2 weeks', trend: 'down' },
      { label: 'Confidence', value: 'High', trend: 'up' },
    ],
  },
  UNDERWRITING_OPINION: {
    title: 'Revised Underwriting (Conservative)',
    message: `You declined the base underwriting. CREOS has re-cut the model with more conservative rent growth and a wider exit cap for downside protection.`,
    metrics: [
      { label: 'Rent Growth', value: '2.0% (was 3.0%)', trend: 'down' },
      { label: 'Exit Cap', value: '6.0% (was 5.5%)', trend: 'up' },
      { label: 'IRR', value: '15.8% (was 17.0%)', trend: 'down' },
    ],
  },
  LOAN_TERMS: {
    title: 'Alternative Lender Proposal',
    message: `You declined the lead lender's terms. CREOS solicited a competing term sheet from an alternative lender with a lower rate and reduced leverage.`,
    metrics: [
      { label: 'Rate', value: '5.45% (was 5.75%)', trend: 'down' },
      { label: 'LTV', value: '65% (was 69%)', trend: 'down' },
      { label: 'DSCR', value: '1.58x (was 1.42x)', trend: 'up' },
    ],
  },
  IC_DECISION: {
    title: 'Re-Presented IC Package',
    message: `The IC recommendation was declined. CREOS incorporated the raised concerns and re-presents the deal with revised structure and additional risk mitigants.`,
    metrics: [
      { label: 'Structure', value: 'Revised', trend: 'neutral' },
      { label: 'Risk Mitigants', value: '+3 added', trend: 'up' },
    ],
  },
  TITLE_EXCEPTION: {
    title: 'Seller Remediation Path',
    message: `You declined to accept the title exception as-is. CREOS has required the seller to cure the exception prior to close as a condition of the purchase agreement.`,
    metrics: [
      { label: 'Resolution', value: 'Seller cures pre-close', trend: 'up' },
      { label: 'Close Risk', value: 'Elevated', trend: 'down' },
    ],
  },
  ENVIRONMENTAL_EXCEPTION: {
    title: 'Phase II Investigation',
    message: `You declined to accept the environmental finding. CREOS has authorized a Phase II ESA and negotiated an environmental insurance policy to cap exposure.`,
    metrics: [
      { label: 'Action', value: 'Phase II + insurance', trend: 'neutral' },
      { label: 'Cost', value: '+$85K', trend: 'down' },
    ],
  },
  OPERATIONAL_DECISION: {
    title: 'Alternative Operating Plan',
    message: `You declined the recommended operating action. CREOS has prepared an alternative approach that reduces upfront cost with a phased timeline.`,
    metrics: [
      { label: 'Approach', value: 'Phased', trend: 'neutral' },
      { label: 'Upfront Cost', value: 'Reduced', trend: 'up' },
    ],
  },
  HOLD_SELL_DECISION: {
    title: 'Refinance-and-Hold Alternative',
    message: `You declined the recommended disposition path. CREOS modeled a refinance-and-hold alternative that returns capital to LPs while retaining upside.`,
    metrics: [
      { label: 'Path', value: 'Refi + hold', trend: 'neutral' },
      { label: 'Capital Returned', value: '~40%', trend: 'up' },
    ],
  },
  BUYER_SELECTION: {
    title: 'Next-Best Buyer',
    message: `You declined the selected buyer. CREOS has advanced the next-best offer, balancing price against closing certainty.`,
    metrics: [
      { label: 'Price', value: 'Slightly lower', trend: 'down' },
      { label: 'Close Certainty', value: 'Higher', trend: 'up' },
    ],
  },
  TAX_STRATEGY: {
    title: 'Alternative Tax Treatment',
    message: `You declined the proposed tax approach. CREOS has prepared an alternative treatment for review by the tax advisor.`,
    metrics: [
      { label: 'Treatment', value: 'Alternative', trend: 'neutral' },
    ],
  },
  DISSOLUTION_VOTE: {
    title: 'Revised Dissolution Plan',
    message: `You declined the dissolution plan. CREOS has revised the final reserve and distribution timing to address your concern.`,
    metrics: [
      { label: 'Reserve', value: 'Increased', trend: 'up' },
    ],
  },
};

export function generateDeclineAlternative(original: Approval): Approval {
  const altNumber = (original.currentRevision ?? 0) + 1;
  const alt = DECLINE_ALTERNATIVES[original.type] ?? {
    title: `${original.title} — Alternative`,
    message: 'You declined the prior recommendation. CREOS has prepared an alternative for your review.',
    metrics: original.keyMetrics ?? [],
  };
  const message = `ALTERNATIVE (after decline): ${alt.message}`;
  return {
    ...original,
    id: `${original.id}_alt${altNumber}`,
    title: alt.title,
    agentMessage: message,
    keyMetrics: alt.metrics,
    status: 'PENDING',
    currentRevision: altNumber,
    decidedAt: undefined,
    userResponse: undefined,
    revisionHistory: [
      ...(original.revisionHistory ?? []),
      {
        revisionNumber: altNumber,
        timestamp: new Date().toISOString(),
        reason: 'Declined — alternative generated',
        originalMetrics: original.keyMetrics,
        revisedMetrics: alt.metrics,
        originalMessage: original.agentMessage,
        revisedMessage: message,
      },
    ],
  };
}
