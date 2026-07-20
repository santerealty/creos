// Deterministic forecast scenarios for CREOS
// Base, Upside, Downside, and Custom cases with engine-computed metrics

import { Property, PartnershipTerms } from '@/types';
import {
  effectiveGrossIncome,
  netOperatingIncome,
  impliedValue,
  xirr,
  moic,
  type CashFlow,
} from '@/lib/finance';

export interface ForecastAssumptions {
  rentGrowthRate: number; // Annual rate (e.g., 0.03 = 3%)
  vacancyRate: number; // As decimal (e.g., 0.05 = 5%)
  expenseGrowthRate: number; // Annual rate
  exitCapRate: number; // As decimal (e.g., 0.055 = 5.5%)
  holdPeriodYears: number; // Years to hold
}

export interface ForecastResult {
  label: string;
  assumptions: ForecastAssumptions;
  year5Noi: number;
  year5Value: number;
  irr: number;
  moic: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESET SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════
export const BASE_CASE: ForecastAssumptions = {
  rentGrowthRate: 0.03, // 3% annually
  vacancyRate: 0.05, // 5% vacancy
  expenseGrowthRate: 0.025, // 2.5% expense growth
  exitCapRate: 0.055, // 5.5% exit cap
  holdPeriodYears: 5,
};

export const UPSIDE_CASE: ForecastAssumptions = {
  rentGrowthRate: 0.05, // 5% annually (strong market)
  vacancyRate: 0.03, // 3% vacancy (high retention)
  expenseGrowthRate: 0.02, // 2% expense growth (controlled)
  exitCapRate: 0.05, // 5.0% exit cap (compression)
  holdPeriodYears: 5,
};

export const DOWNSIDE_CASE: ForecastAssumptions = {
  rentGrowthRate: 0.01, // 1% annually (soft market)
  vacancyRate: 0.08, // 8% vacancy (elevated churn)
  expenseGrowthRate: 0.04, // 4% expense growth (inflation spike)
  exitCapRate: 0.065, // 6.5% exit cap (cap rate expansion)
  holdPeriodYears: 5,
};

// ═══════════════════════════════════════════════════════════════════════════
// FORECAST ENGINE
// ═══════════════════════════════════════════════════════════════════════════
export const computeForecast = (
  property: Property,
  partnershipTerms: PartnershipTerms,
  assumptions: ForecastAssumptions,
): ForecastResult => {
  const { rentGrowthRate, vacancyRate, expenseGrowthRate, exitCapRate, holdPeriodYears } =
    assumptions;

  // Project cash flows year by year
  const cashFlows: CashFlow[] = [];
  let projectedNoi = 0;

  // Initial investment (negative cash flow at t=0)
  cashFlows.push({
    date: new Date(2024, 0, 1), // Acquisition date
    amount: -(partnershipTerms.investorEquity + partnershipTerms.sponsorEquity),
  });

  // Annual debt service (interest-only approximation for simplicity)
  const annualDebtService = property.loanAmount * property.interestRate;

  for (let year = 1; year <= holdPeriodYears; year++) {
    // Project rent growth
    const yearGpr =
      property.annualGrossPotentialRent * Math.pow(1 + rentGrowthRate, year);
    const yearOtherIncome =
      property.annualOtherIncome * Math.pow(1 + rentGrowthRate, year);

    // Project vacancy as % of GPR
    const yearVacancy = yearGpr * vacancyRate;
    const yearConcessions = property.annualConcessions; // Hold flat
    const yearBadDebt = property.annualBadDebt; // Hold flat

    // Project expenses
    const yearExpenses =
      property.annualOperatingExpenses * Math.pow(1 + expenseGrowthRate, year);

    const yearEgi = effectiveGrossIncome(
      yearGpr,
      yearOtherIncome,
      yearVacancy,
      yearConcessions,
      yearBadDebt,
    );
    const yearNoi = netOperatingIncome(yearEgi, yearExpenses);

    // Cash flow after debt service
    const yearCashFlow = yearNoi - annualDebtService;

    cashFlows.push({
      date: new Date(2024 + year, 0, 1),
      amount: yearCashFlow,
    });

    // Store Year 5 NOI for exit value calc
    if (year === holdPeriodYears) {
      projectedNoi = yearNoi;
    }
  }

  // Exit: implied value from Year 5 NOI and exit cap rate
  const exitValue = impliedValue(projectedNoi, exitCapRate);
  const netSaleProceeds = exitValue - property.loanAmount; // Simplified (ignoring selling costs)

  // Add exit proceeds to final year cash flow
  cashFlows[cashFlows.length - 1].amount += netSaleProceeds;

  // Compute IRR and MOIC
  const totalEquity = partnershipTerms.investorEquity + partnershipTerms.sponsorEquity;
  const totalDistributed = cashFlows
    .slice(1)
    .reduce((sum, cf) => sum + cf.amount, 0);

  const computedIrr = xirr(cashFlows);
  const computedMoic = moic(totalDistributed, totalEquity);

  return {
    label: '', // Caller will set this
    assumptions,
    year5Noi: projectedNoi,
    year5Value: exitValue,
    irr: computedIrr,
    moic: computedMoic,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESET RESULT GENERATORS
// ═══════════════════════════════════════════════════════════════════════════
export const getBaseCase = (
  property: Property,
  partnershipTerms: PartnershipTerms,
): ForecastResult => {
  const result = computeForecast(property, partnershipTerms, BASE_CASE);
  return { ...result, label: 'Base Case' };
};

export const getUpsideCase = (
  property: Property,
  partnershipTerms: PartnershipTerms,
): ForecastResult => {
  const result = computeForecast(property, partnershipTerms, UPSIDE_CASE);
  return { ...result, label: 'Upside Case' };
};

export const getDownsideCase = (
  property: Property,
  partnershipTerms: PartnershipTerms,
): ForecastResult => {
  const result = computeForecast(property, partnershipTerms, DOWNSIDE_CASE);
  return { ...result, label: 'Downside Case' };
};
