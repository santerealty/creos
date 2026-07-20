// Operating-period events for CREOS OPERATIONS phase
// Each event is deterministic, seedable, with typed outcomes and financial impacts

import { Simulation } from '@/types';

export type EventCategory =
  | 'INSURANCE'
  | 'PROPERTY_TAX'
  | 'CAPITAL_PROJECTS'
  | 'VENDOR_MANAGEMENT'
  | 'REVENUE'
  | 'DEBT'
  | 'COMPLIANCE';

export interface EventOption {
  id: string;
  label: string;
  description: string;
}

export interface OperatingEvent {
  id: string;
  title: string;
  category: EventCategory;
  narrative: string;
  agentResponsible: string;
  options: EventOption[];
}

export interface EventOutcome {
  // Metric deltas (store will apply these via updateMetrics)
  metricDeltas?: Record<string, number>;
  // Property state changes
  propertyDeltas?: {
    annualOperatingExpenses?: number;
    annualVacancy?: number;
    annualBadDebt?: number;
    annualGrossPotentialRent?: number;
    exitCapRate?: number;
  };
  // Narrative result
  outcomeDescription: string;
  financialImpact: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT 1: Insurance Renewal Spike
// ═══════════════════════════════════════════════════════════════════════════
export const insuranceRenewalEvent: OperatingEvent = {
  id: 'insurance-renewal-spike',
  title: 'Insurance Premium Increase',
  category: 'INSURANCE',
  narrative: `Your property insurance carrier is renewing at a 22% premium increase due to 
regional weather events and reinsurance market hardening. Current annual premium: $145,000. 
Proposed renewal: $177,000 (+$32,000/year). This directly impacts operating expenses and NOI.`,
  agentResponsible: 'Risk Management AI',
  options: [
    {
      id: 'accept-renewal',
      label: 'Accept Renewal',
      description: 'Lock in coverage at new rate; NOI decreases $32K/year',
    },
    {
      id: 'negotiate-retention',
      label: 'Negotiate Higher Retention',
      description: 'Accept $5K deductible increase to cap premium at +12% (+$17K/year)',
    },
  ],
};

export const applyInsuranceRenewal = (
  sim: Simulation,
  optionId: string,
): EventOutcome => {
  const currentExpenses = sim.property.annualOperatingExpenses;
  let expenseDelta = 0;
  let outcomeDescription = '';
  let financialImpact = '';

  if (optionId === 'accept-renewal') {
    expenseDelta = 32000;
    outcomeDescription =
      'Accepted 22% premium increase. Full coverage maintained with no deductible change.';
    financialImpact = 'OpEx +$32,000/year → NOI -$32,000/year';
  } else if (optionId === 'negotiate-retention') {
    expenseDelta = 17000;
    outcomeDescription =
      'Negotiated with carrier: accepted $5K deductible increase, capped premium at +12%.';
    financialImpact = 'OpEx +$17,000/year → NOI -$17,000/year (saved $15K vs. full increase)';
  }

  const newExpenses = currentExpenses + expenseDelta;
  // (NOI impact captured via propertyDeltas below)

  return {
    propertyDeltas: { annualOperatingExpenses: newExpenses },
    outcomeDescription,
    financialImpact,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// EVENT 2: Property Tax Reassessment
// ═══════════════════════════════════════════════════════════════════════════
export const propertyTaxReassessmentEvent: OperatingEvent = {
  id: 'property-tax-reassessment',
  title: 'Property Tax Reassessment Notice',
  category: 'PROPERTY_TAX',
  narrative: `County assessor has reassessed the property at $17.2M (up from $15.8M acquisition basis). 
Projected annual tax increase: $28,000. You can accept the assessment or file an appeal (3-6 month 
process, 60% historical success rate for multifamily in this jurisdiction).`,
  agentResponsible: 'Tax & Compliance AI',
  options: [
    {
      id: 'accept-assessment',
      label: 'Accept Assessment',
      description: 'Pay increased taxes immediately; OpEx +$28K/year',
    },
    {
      id: 'file-appeal',
      label: 'File Appeal',
      description:
        'Contest assessment (assume 50% reduction = +$14K/year if successful)',
    },
  ],
};

export const applyPropertyTaxReassessment = (
  sim: Simulation,
  optionId: string,
): EventOutcome => {
  const currentExpenses = sim.property.annualOperatingExpenses;
  let expenseDelta = 0;
  let outcomeDescription = '';
  let financialImpact = '';

  if (optionId === 'accept-assessment') {
    expenseDelta = 28000;
    outcomeDescription = 'Accepted county reassessment. Taxes effective immediately.';
    financialImpact = 'OpEx +$28,000/year → NOI -$28,000/year';
  } else if (optionId === 'file-appeal') {
    expenseDelta = 14000;
    outcomeDescription =
      'Filed appeal with county. Assumed 50% reduction based on comps; final ruling in 4 months.';
    financialImpact =
      'OpEx +$14,000/year → NOI -$14,000/year (mitigated $14K via appeal)';
  }

  const newExpenses = currentExpenses + expenseDelta;

  return {
    propertyDeltas: { annualOperatingExpenses: newExpenses },
    outcomeDescription,
    financialImpact,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// EVENT 3: Renovation Delay
// ═══════════════════════════════════════════════════════════════════════════
export const renovationDelayEvent: OperatingEvent = {
  id: 'renovation-delay',
  title: 'Unit Renovation Delay',
  category: 'CAPITAL_PROJECTS',
  narrative: `Your contractor reports supply-chain delays on cabinetry for 12 unit renovations. 
Options: (1) wait 8 weeks (delays rent increases, pushes $60K CAPEX into next quarter); 
(2) source alternate materials for +$12K premium, stay on schedule.`,
  agentResponsible: 'Asset Management AI',
  options: [
    {
      id: 'wait-for-materials',
      label: 'Wait for Original Materials',
      description: 'Delay 8 weeks; defer rent increases 2 months (EGI impact)',
    },
    {
      id: 'expedite-alternates',
      label: 'Expedite with Alternates',
      description: 'Pay $12K premium to stay on schedule; preserve rent timeline',
    },
  ],
};

export const applyRenovationDelay = (
  sim: Simulation,
  optionId: string,
): EventOutcome => {
  const currentGpr = sim.property.annualGrossPotentialRent;
  let gprDelta = 0;
  let outcomeDescription = '';
  let financialImpact = '';

  if (optionId === 'wait-for-materials') {
    gprDelta = -18000; // 12 units * $150/mo rent increase * 2 months delay / 2 (annualized impact)
    outcomeDescription =
      'Waited for original materials. 8-week delay pushed rent increases into next quarter.';
    financialImpact =
      'GPR -$18,000/year (delayed rent increases) → EGI -$18K → NOI -$18K';
  } else if (optionId === 'expedite-alternates') {
    gprDelta = 0; // On schedule
    outcomeDescription =
      'Sourced alternate materials for $12K premium. Renovations on schedule, rent increases preserved.';
    financialImpact = 'CAPEX +$12K one-time; rent timeline preserved (no GPR impact)';
  }

  const newGpr = currentGpr + gprDelta;

  return {
    propertyDeltas: { annualGrossPotentialRent: newGpr },
    outcomeDescription,
    financialImpact,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// EVENT 4: Vendor Underperformance
// ═══════════════════════════════════════════════════════════════════════════
export const vendorUnderperformanceEvent: OperatingEvent = {
  id: 'vendor-underperformance',
  title: 'Landscaping Vendor Underperformance',
  category: 'VENDOR_MANAGEMENT',
  narrative: `Your landscaping vendor has consistently missed SLA targets (response time >48h, 
quality issues reported by 3 tenants). Current contract: $3,200/mo. Replacement vendor quotes 
$3,800/mo but guarantees 24h response. Retention risks tenant satisfaction decline.`,
  agentResponsible: 'Operations AI',
  options: [
    {
      id: 'retain-vendor',
      label: 'Retain Current Vendor',
      description:
        'Keep existing rate; risk tenant satisfaction decline (potential vacancy impact)',
    },
    {
      id: 'replace-vendor',
      label: 'Replace Vendor',
      description: 'Pay $7,200/year more for premium service; mitigate vacancy risk',
    },
  ],
};

export const applyVendorUnderperformance = (
  sim: Simulation,
  optionId: string,
): EventOutcome => {
  const currentExpenses = sim.property.annualOperatingExpenses;
  const currentVacancy = sim.property.annualVacancy;
  let expenseDelta = 0;
  let vacancyDelta = 0;
  let outcomeDescription = '';
  let financialImpact = '';

  if (optionId === 'retain-vendor') {
    expenseDelta = 0;
    vacancyDelta = 8000; // Assumed tenant dissatisfaction → 1% vacancy increase
    outcomeDescription =
      'Retained existing vendor. Tenant satisfaction declined; observed +1% vacancy.';
    financialImpact = 'OpEx unchanged; Vacancy +$8,000/year → EGI -$8K → NOI -$8K';
  } else if (optionId === 'replace-vendor') {
    expenseDelta = 7200;
    vacancyDelta = 0;
    outcomeDescription =
      'Replaced vendor. Premium service restored tenant confidence; vacancy stable.';
    financialImpact =
      'OpEx +$7,200/year → NOI -$7.2K (but mitigated potential $8K vacancy impact)';
  }

  const newExpenses = currentExpenses + expenseDelta;
  const newVacancy = currentVacancy + vacancyDelta;

  return {
    propertyDeltas: {
      annualOperatingExpenses: newExpenses,
      annualVacancy: newVacancy,
    },
    outcomeDescription,
    financialImpact,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// EVENT 5: Tenant Delinquency Spike
// ═══════════════════════════════════════════════════════════════════════════
export const tenantDelinquencyEvent: OperatingEvent = {
  id: 'tenant-delinquency-spike',
  title: 'Tenant Payment Delinquency Increase',
  category: 'REVENUE',
  narrative: `Bad debt has increased from 1.2% to 2.8% over the past quarter (regional employer 
layoffs). Property Manager recommends: (1) aggressive collections (legal action, may lose 2 tenants); 
(2) payment plans (preserve tenancy, accept delayed cash flow).`,
  agentResponsible: 'Property Management AI',
  options: [
    {
      id: 'aggressive-collections',
      label: 'Aggressive Collections',
      description:
        'Pursue legal remedies; recover 80% of arrears but risk 2 move-outs (+$15K turnover)',
    },
    {
      id: 'payment-plans',
      label: 'Flexible Payment Plans',
      description: 'Preserve tenancy; accept delayed recovery (+$22K bad debt this year)',
    },
  ],
};

export const applyTenantDelinquency = (
  sim: Simulation,
  optionId: string,
): EventOutcome => {
  const currentBadDebt = sim.property.annualBadDebt;
  let badDebtDelta = 0;
  let outcomeDescription = '';
  let financialImpact = '';

  if (optionId === 'aggressive-collections') {
    badDebtDelta = 8000; // Net effect: recovered some, but turnover costs
    outcomeDescription =
      'Pursued collections. Recovered $18K but incurred $15K turnover costs for 2 units.';
    financialImpact = 'Bad Debt +$8,000 (net) → EGI -$8K → NOI -$8K';
  } else if (optionId === 'payment-plans') {
    badDebtDelta = 22000;
    outcomeDescription =
      'Implemented flexible payment plans. Preserved 100% occupancy; accepted delayed recovery.';
    financialImpact = 'Bad Debt +$22,000 → EGI -$22K → NOI -$22K';
  }

  const newBadDebt = currentBadDebt + badDebtDelta;

  return {
    propertyDeltas: { annualBadDebt: newBadDebt },
    outcomeDescription,
    financialImpact,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// EVENT 6: Refinance Offer
// ═══════════════════════════════════════════════════════════════════════════
export const refinanceOfferEvent: OperatingEvent = {
  id: 'refinance-offer',
  title: 'Refinance Opportunity',
  category: 'DEBT',
  narrative: `Lender offers refinance: current loan $11.5M at 5.25%; new terms $12.8M at 4.75% 
(NOI increased, property appraised higher). Extract $1.3M equity, reduce debt service $42K/year, 
but pay $85K in closing costs and prepayment penalty.`,
  agentResponsible: 'Capital Markets AI',
  options: [
    {
      id: 'accept-refi',
      label: 'Accept Refinance',
      description:
        'Extract $1.3M equity, save $42K/year debt service; pay $85K closing costs',
    },
    {
      id: 'decline-refi',
      label: 'Decline Refinance',
      description: 'Keep existing loan; preserve existing debt service and terms',
    },
  ],
};

export const applyRefinanceOffer = (
  sim: Simulation,
  optionId: string,
): EventOutcome => {
  let outcomeDescription = '';
  let financialImpact = '';

  if (optionId === 'accept-refi') {
    outcomeDescription =
      'Refinanced to $12.8M at 4.75%. Extracted $1.3M equity return to partners, reduced annual debt service by $42K.';
    financialImpact =
      'Debt service -$42K/year → Cash Flow +$42K; one-time costs $85K; equity distribution $1.3M';
  } else if (optionId === 'decline-refi') {
    outcomeDescription = 'Declined refinance. Maintained existing loan terms and amortization schedule.';
    financialImpact = 'No change to debt service or capital structure';
  }

  return {
    outcomeDescription,
    financialImpact,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// EVENT 7: Lender Covenant Warning
// ═══════════════════════════════════════════════════════════════════════════
export const lenderCovenantWarningEvent: OperatingEvent = {
  id: 'lender-covenant-warning',
  title: 'Lender Covenant Warning',
  category: 'COMPLIANCE',
  narrative: `Your quarterly compliance report triggered a soft warning: DSCR dropped to 1.28x 
(covenant floor: 1.25x) and Debt Yield at 8.7% (covenant floor: 8.5%). Lender requests remediation 
plan. Options: reduce expenses, defer CAPEX, or inject equity cushion.`,
  agentResponsible: 'Asset Management AI',
  options: [
    {
      id: 'expense-reduction',
      label: 'Reduce Discretionary Expenses',
      description: 'Cut $25K/year non-critical OpEx to boost DSCR',
    },
    {
      id: 'equity-injection',
      label: 'Inject Equity Reserve',
      description: 'Sponsor injects $150K reserve to improve Debt Yield metric',
    },
  ],
};

export const applyLenderCovenantWarning = (
  sim: Simulation,
  optionId: string,
): EventOutcome => {
  const currentExpenses = sim.property.annualOperatingExpenses;
  let expenseDelta = 0;
  let outcomeDescription = '';
  let financialImpact = '';

  if (optionId === 'expense-reduction') {
    expenseDelta = -25000;
    outcomeDescription =
      'Reduced discretionary operating expenses by $25K/year. DSCR improved to 1.34x; lender satisfied.';
    financialImpact = 'OpEx -$25,000/year → NOI +$25K → DSCR improved';
  } else if (optionId === 'equity-injection') {
    expenseDelta = 0;
    outcomeDescription =
      'Sponsor injected $150K equity reserve. Debt Yield improved to 9.2%; covenant compliance restored.';
    financialImpact =
      'No OpEx change; equity cushion improves Debt Yield calculation';
  }

  const newExpenses = currentExpenses + expenseDelta;

  return {
    propertyDeltas: { annualOperatingExpenses: newExpenses },
    outcomeDescription,
    financialImpact,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// EVENT 8: Rent Growth Opportunity
// ═══════════════════════════════════════════════════════════════════════════
export const rentGrowthOpportunityEvent: OperatingEvent = {
  id: 'rent-growth-opportunity',
  title: 'Market Rent Growth Opportunity',
  category: 'REVENUE',
  narrative: `Market analysis shows rents in your submarket increased 6.2% YoY (vs. your 3.5% budgeted 
increase). 18 leases expiring next quarter. Push for market rents (risk 8% of expirations walking) or 
conservative 4.5% increases (retain 100%, leave upside on table).`,
  agentResponsible: 'Revenue Management AI',
  options: [
    {
      id: 'aggressive-rent-push',
      label: 'Aggressive Rent Push',
      description: 'Push to market (6.2% increase); assume 8% move-out rate',
    },
    {
      id: 'conservative-increase',
      label: 'Conservative Increase',
      description:
        'Moderate 4.5% increase; retain 100% of renewing tenants',
    },
  ],
};

export const applyRentGrowthOpportunity = (
  sim: Simulation,
  optionId: string,
): EventOutcome => {
  const currentGpr = sim.property.annualGrossPotentialRent;
  const currentVacancy = sim.property.annualVacancy;
  let gprDelta = 0;
  let vacancyDelta = 0;
  let outcomeDescription = '';
  let financialImpact = '';

  if (optionId === 'aggressive-rent-push') {
    gprDelta = 95000; // 6.2% on 18 units (assume $1400 avg rent)
    vacancyDelta = 12000; // 8% of 18 units moved out
    outcomeDescription =
      'Pushed rents to market rate (6.2% increase). Captured $95K annualized GPR increase; 8% of expiring tenants did not renew.';
    financialImpact =
      'GPR +$95,000/year; Vacancy +$12,000 → Net EGI +$83K → NOI +$83K';
  } else if (optionId === 'conservative-increase') {
    gprDelta = 68000; // 4.5% on 18 units
    vacancyDelta = 0;
    outcomeDescription =
      'Applied conservative 4.5% rent increase. Retained 100% of renewing tenants.';
    financialImpact = 'GPR +$68,000/year; Vacancy unchanged → EGI +$68K → NOI +$68K';
  }

  const newGpr = currentGpr + gprDelta;
  const newVacancy = currentVacancy + vacancyDelta;

  return {
    propertyDeltas: {
      annualGrossPotentialRent: newGpr,
      annualVacancy: newVacancy,
    },
    outcomeDescription,
    financialImpact,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRY: All events available during OPERATIONS phase
// ═══════════════════════════════════════════════════════════════════════════
export const OPERATING_EVENTS: OperatingEvent[] = [
  insuranceRenewalEvent,
  propertyTaxReassessmentEvent,
  renovationDelayEvent,
  vendorUnderperformanceEvent,
  tenantDelinquencyEvent,
  refinanceOfferEvent,
  lenderCovenantWarningEvent,
  rentGrowthOpportunityEvent,
];

// Outcome applicators (key = event.id)
export const OUTCOME_APPLICATORS: Record<
  string,
  (sim: Simulation, optionId: string) => EventOutcome
> = {
  'insurance-renewal-spike': applyInsuranceRenewal,
  'property-tax-reassessment': applyPropertyTaxReassessment,
  'renovation-delay': applyRenovationDelay,
  'vendor-underperformance': applyVendorUnderperformance,
  'tenant-delinquency-spike': applyTenantDelinquency,
  'refinance-offer': applyRefinanceOffer,
  'lender-covenant-warning': applyLenderCovenantWarning,
  'rent-growth-opportunity': applyRentGrowthOpportunity,
};
