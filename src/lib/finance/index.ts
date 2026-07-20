// CREOS deterministic financial engine. No LLM involvement — pure, tested math.

export const effectiveGrossIncome = (
  grossPotentialRent: number, otherIncome: number,
  vacancy: number, concessions: number, badDebt: number,
): number => grossPotentialRent + otherIncome - vacancy - concessions - badDebt;

export const netOperatingIncome = (egi: number, operatingExpenses: number): number =>
  egi - operatingExpenses;

export const capRate = (noi: number, value: number): number => noi / value;
export const impliedValue = (forwardNoi: number, exitCapRate: number): number =>
  forwardNoi / exitCapRate;
export const dscr = (noi: number, annualDebtService: number): number =>
  noi / annualDebtService;
export const debtYield = (noi: number, loanBalance: number): number =>
  noi / loanBalance;
export const cashOnCash = (annualCashDistribution: number, investedEquity: number): number =>
  annualCashDistribution / investedEquity;
export const moic = (totalDistributions: number, totalContributions: number): number =>
  totalDistributions / totalContributions;

export const netSaleProceeds = (
  grossPrice: number, sellingCosts: number, loanPayoff: number,
  prepaymentCosts: number, closingCosts: number, prorations: number, finalReserves: number,
): number => grossPrice - sellingCosts - loanPayoff - prepaymentCosts - closingCosts - prorations - finalReserves;

// Date-based XIRR (Newton's method w/ bisection fallback).
export interface CashFlow { date: Date; amount: number; }
export const xirr = (flows: CashFlow[], guess = 0.1): number => {
  if (flows.length < 2) throw new Error('xirr needs >= 2 cash flows');
  const t0 = flows[0].date.getTime();
  const yrs = (d: Date) => (d.getTime() - t0) / (365 * 24 * 3600 * 1000);
  const npv = (r: number) => flows.reduce((s, f) => s + f.amount / Math.pow(1 + r, yrs(f.date)), 0);
  const dnpv = (r: number) => flows.reduce((s, f) => {
    const t = yrs(f.date);
    return s - (t * f.amount) / Math.pow(1 + r, t + 1);
  }, 0);
  let r = guess;
  for (let i = 0; i < 100; i++) {
    const v = npv(r); const d = dnpv(r);
    if (Math.abs(v) < 1e-7) return r;
    if (d === 0) break;
    const next = r - v / d;
    if (!isFinite(next)) break;
    r = next;
  }
  // Bisection fallback
  let lo = -0.9999, hi = 10, flo = npv(lo);
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2, fm = npv(mid);
    if (Math.abs(fm) < 1e-7) return mid;
    if (flo * fm < 0) hi = mid; else { lo = mid; flo = fm; }
  }
  return r;
};

// Tax
export const adjustedTaxBasis = (
  originalBasis: number, capitalizedImprovements: number, accumulatedDepreciation: number,
): number => originalBasis + capitalizedImprovements - accumulatedDepreciation;
export const taxableGain = (amountRealized: number, adjBasis: number): number =>
  amountRealized - adjBasis;
export const depreciationRecapture = (
  accumulatedDepreciation: number, adjBasis: number, amountRealized: number,
): number => Math.max(0, Math.min(accumulatedDepreciation, amountRealized - adjBasis));

// Waterfall: pref -> return of capital -> sponsor catch-up -> residual split.
export interface WaterfallInput {
  totalDistributable: number; investorCapital: number; sponsorCapital: number;
  accruedPref: number; catchUp: number; investorSplit: number; sponsorSplit: number;
}
export interface WaterfallResult {
  investorPref: number; investorReturnOfCapital: number; sponsorCatchUp: number;
  investorResidual: number; sponsorResidual: number;
  investorTotal: number; sponsorTotal: number; check: number;
}
export const waterfall = (i: WaterfallInput): WaterfallResult => {
  let rem = i.totalDistributable;
  const investorPref = Math.min(rem, i.accruedPref); rem -= investorPref;
  const investorReturnOfCapital = Math.min(rem, i.investorCapital); rem -= investorReturnOfCapital;
  const sponsorCatchUp = Math.min(rem, i.catchUp); rem -= sponsorCatchUp;
  const investorResidual = rem * i.investorSplit;
  const sponsorResidual = rem * i.sponsorSplit;
  const investorTotal = investorPref + investorReturnOfCapital + investorResidual;
  const sponsorTotal = sponsorCatchUp + sponsorResidual;
  return {
    investorPref, investorReturnOfCapital, sponsorCatchUp, investorResidual, sponsorResidual,
    investorTotal, sponsorTotal,
    check: i.totalDistributable - (investorTotal + sponsorTotal),
  };
};
