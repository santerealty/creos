import { ApprovalType, WorkflowPhase } from '@/types';
import { PERSONAS } from './personas';

// ═══════════════════════════════════════════════════════════════════════════
// RICHER TRANSCRIPTS
// Multi-turn scripted conversations showing reasoning and disagreement
// ═══════════════════════════════════════════════════════════════════════════

export interface TranscriptTurn {
  personaId: string;
  message: string;
}

export interface Transcript {
  id: string;
  title: string;
  approvalType: ApprovalType;
  turns: TranscriptTurn[];
  summary: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCRIPT LIBRARY
// ═══════════════════════════════════════════════════════════════════════════

export const TRANSCRIPTS: Record<string, Transcript> = {
  // Underwriting leverage debate
  UNDERWRITING_LEVERAGE_DEBATE: {
    id: 'underwriting-leverage-debate',
    title: 'Leverage Strategy Discussion',
    approvalType: 'UNDERWRITING_OPINION',
    turns: [
      {
        personaId: PERSONAS.UNDERWRITER.id,
        message: `I'm recommending we cap leverage at 65% LTV on this deal. The pro forma shows strong exit returns at that level, and it gives us meaningful cushion against downside scenarios.`,
      },
      {
        personaId: PERSONAS.DEBT_BROKER.id,
        message: `Sarah, I hear you on risk management, but we're leaving money on the table. The debt market is wide open right now—I can get us 75% LTV at 5.2%, which materially improves cash-on-cash and IRR. The property's fundamentals support it.`,
      },
      {
        personaId: PERSONAS.UNDERWRITER.id,
        message: `James, the spread between 65% and 75% LTV adds $1.5M in debt service annually. If we hit occupancy headwinds or OpEx surprises, that becomes a real problem. I'd rather optimize for resilience than maximize leverage in this environment.`,
      },
      {
        personaId: PERSONAS.DEBT_BROKER.id,
        message: `Fair point. What if we structure it with a floating rate and interest rate cap? That gives us the leverage upside with downside protection. I can price that out and show you the DSCR sensitivity.`,
      },
    ],
    summary: 'Underwriter advocates for conservative 65% LTV; Debt Broker proposes 75% LTV with rate cap for enhanced returns while managing risk.',
  },

  // Due diligence environmental exception
  ENVIRONMENTAL_EXCEPTION_DEBATE: {
    id: 'environmental-exception-debate',
    title: 'Environmental Report Discussion',
    approvalType: 'ENVIRONMENTAL_EXCEPTION',
    turns: [
      {
        personaId: PERSONAS.DUE_DILIGENCE_LEAD.id,
        message: `Phase I came back with a CREC—Controlled Recognized Environmental Condition. Historical dry cleaner on the adjacent parcel. No known soil or groundwater impacts to our site, but it's flagged.`,
      },
      {
        personaId: PERSONAS.ACQUISITIONS_ANALYST.id,
        message: `Patricia, is this a deal-killer? The seller is pushing for a fast close. Can we proceed with an indemnity clause or escrow?`,
      },
      {
        personaId: PERSONAS.DUE_DILIGENCE_LEAD.id,
        message: `Not a deal-killer, but we need to be smart. I recommend we do a Phase II to confirm there's no subsurface impact, and require the seller to escrow $150K for potential remediation. Our counsel can draft indemnity language.`,
      },
      {
        personaId: PERSONAS.ORCHESTRATOR.id,
        message: `Agreed. Let's run the Phase II in parallel with other diligence to keep timeline intact. Patricia, get me a Phase II scope and budget by EOD. Marcus, loop the seller's broker on the escrow requirement.`,
      },
    ],
    summary: 'Phase I flags historical contamination risk on adjacent parcel. Team agrees to Phase II assessment and $150K seller escrow to mitigate risk.',
  },

  // Financing terms negotiation
  LOAN_TERMS_NEGOTIATION: {
    id: 'loan-terms-negotiation',
    title: 'Loan Terms Negotiation',
    approvalType: 'LOAN_TERMS',
    turns: [
      {
        personaId: PERSONAS.DEBT_BROKER.id,
        message: `We have three term sheets on the table. Agency is cheapest at 4.85% but requires full recourse on the guaranty. The life company is 5.1% with partial recourse carved out after stabilization. CMBS is 5.4%, non-recourse from day one.`,
      },
      {
        personaId: PERSONAS.UNDERWRITER.id,
        message: `James, what's the sponsor's appetite for recourse risk? We're projecting 18 months to stabilization. The life company option gives us the best of both worlds—competitive rate with recourse carveout at stabilization.`,
      },
      {
        personaId: PERSONAS.DEBT_BROKER.id,
        message: `I agree. The life company also offers prepayment flexibility with a 1% declining penalty after year 3, which is valuable if we want optionality on exit timing. Agency locks us in for the full term.`,
      },
      {
        personaId: PERSONAS.ORCHESTRATOR.id,
        message: `Let's proceed with the life company. James, negotiate the 18-month stabilization trigger down to 12 months if possible. If they hold firm, we can live with 18 months.`,
      },
    ],
    summary: 'Team evaluates agency, life company, and CMBS options. Life company selected for competitive rate, partial recourse carveout, and prepayment flexibility.',
  },

  // Hold vs sell decision
  HOLD_SELL_TIMING: {
    id: 'hold-sell-timing',
    title: 'Hold vs. Sell Decision',
    approvalType: 'HOLD_SELL_DECISION',
    turns: [
      {
        personaId: PERSONAS.ASSET_MANAGER.id,
        message: `We're at year 5, which was the original planned hold period. The property is performing well—95% occupancy, NOI up 22% from acquisition. But cap rates have compressed 75 bps, so our exit valuation is materially higher than pro forma.`,
      },
      {
        personaId: PERSONAS.ACQUISITIONS_ANALYST.id,
        message: `David, I'm tracking buyer appetite in this submarket. We've seen 3 comps trade in the last 6 months at sub-5% caps. If we go to market now, I think we can achieve a 4.5% exit cap, which blows away our original 5.5% assumption.`,
      },
      {
        personaId: PERSONAS.ASSET_MANAGER.id,
        message: `True, but we also have two more years of NOI growth baked into the business plan—rents are still 8% below market. If we hold another 2 years, we could add another $200K to NOI. That might offset cap rate expansion risk.`,
      },
      {
        personaId: PERSONAS.ORCHESTRATOR.id,
        message: `This is a classic "bird in hand" question. Given where we are in the cycle and the compression we've already captured, I'm inclined to take the win. Let's run a formal sell-vs-hold analysis and bring it to the IC next week.`,
      },
    ],
    summary: 'Asset Manager notes strong performance and remaining upside. Acquisitions Analyst sees favorable exit window. Team to run formal analysis before IC decision.',
  },

  // Tax strategy for exit
  TAX_STRATEGY_EXIT: {
    id: 'tax-strategy-exit',
    title: 'Tax Optimization Strategy',
    approvalType: 'TAX_STRATEGY',
    turns: [
      {
        personaId: PERSONAS.TAX_ADVISOR.id,
        message: `We're looking at a taxable gain of $8.2M on the sale, which breaks down as $3.1M in depreciation recapture at 25%, and $5.1M in capital gain at 20%. That's a total federal tax hit of $1.8M before considering investor-level state taxes.`,
      },
      {
        personaId: PERSONAS.ORCHESTRATOR.id,
        message: `Elena, what are our options to defer or mitigate? Some of our investors are in high-tax states.`,
      },
      {
        personaId: PERSONAS.TAX_ADVISOR.id,
        message: `We have two main paths: a 1031 exchange, which defers 100% of the gain if we reinvest proceeds within 180 days, or a cost segregation study on the replacement property to accelerate depreciation. The challenge with 1031 is timeline and finding suitable replacement properties.`,
      },
      {
        personaId: PERSONAS.ORCHESTRATOR.id,
        message: `Given the compressed timeline and lack of ready replacement assets in our pipeline, let's plan for a taxable sale but layer in cost seg on the next deal to offset future gains. Elena, prepare a full distribution waterfall analysis with tax estimates for investor letters.`,
      },
    ],
    summary: 'Tax Advisor outlines $1.8M federal tax impact. Team considers 1031 exchange vs. taxable sale. Taxable sale recommended with cost segregation strategy for future deals.',
  },
};

/**
 * Get transcript for an approval type (if one exists)
 */
export function getTranscriptForApproval(
  approvalType: ApprovalType,
  phase: WorkflowPhase
): Transcript | null {
  // Map approval types to transcripts
  const transcriptMap: Partial<Record<ApprovalType, string>> = {
    UNDERWRITING_OPINION: 'UNDERWRITING_LEVERAGE_DEBATE',
    ENVIRONMENTAL_EXCEPTION: 'ENVIRONMENTAL_EXCEPTION_DEBATE',
    LOAN_TERMS: 'LOAN_TERMS_NEGOTIATION',
    HOLD_SELL_DECISION: 'HOLD_SELL_TIMING',
    TAX_STRATEGY: 'TAX_STRATEGY_EXIT',
  };

  const transcriptKey = transcriptMap[approvalType];
  return transcriptKey ? TRANSCRIPTS[transcriptKey] : null;
}

/**
 * Get all available transcripts
 */
export function getAllTranscripts(): Transcript[] {
  return Object.values(TRANSCRIPTS);
}
