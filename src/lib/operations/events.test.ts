// Tests for operating events deterministic outcomes
import { describe, it, expect } from 'vitest';
import { Simulation } from '@/types';
import {
  applyInsuranceRenewal,
  applyPropertyTaxReassessment,
  applyRenovationDelay,
  applyVendorUnderperformance,
  applyTenantDelinquency,
  applyRefinanceOffer,
  applyLenderCovenantWarning,
  applyRentGrowthOpportunity,
  OPERATING_EVENTS,
  OUTCOME_APPLICATORS,
} from './events';

// Mock simulation fixture
const mockSim: Simulation = {
  id: 'test-sim',
  propertyId: 'test-prop',
  createdAt: new Date().toISOString(),
  currentPhase: 'OPERATIONS',
  property: {
    id: 'test-prop',
    name: 'Test Property',
    address: '123 Test St',
    city: 'Test City',
    state: 'TX',
    zip: '12345',
    propertyType: 'Multifamily',
    units: 100,
    builtYear: 2010,
    strategy: 'Value-Add',
    currentOccupancy: 0.95,
    avgRentPerUnit: 1400,
    marketRentPerUnit: 1500,
    purchasePrice: 15000000,
    closingCosts: 300000,
    annualGrossPotentialRent: 1680000,
    annualOtherIncome: 50000,
    annualVacancy: 84000,
    annualConcessions: 20000,
    annualBadDebt: 20000,
    annualOperatingExpenses: 650000,
    loanAmount: 11500000,
    interestRate: 0.0525,
    loanTermYears: 10,
    equityRequired: 3800000,
    holdPeriodYears: 5,
    exitCapRate: 0.055,
  },
  units: [],
  operatingStatements: [],
  partnershipTerms: {
    investorEquity: 3040000,
    sponsorEquity: 760000,
    preferredReturn: 0.08,
    catchUpPercentage: 1.0,
    investorSplit: 0.7,
    sponsorSplit: 0.3,
  },
  approvals: [],
  pendingApprovals: [],
  events: [],
  metrics: {},
  completed: false,
};

describe('Operating Events', () => {
  it('should have 8 registered events', () => {
    expect(OPERATING_EVENTS).toHaveLength(8);
  });

  it('should have an outcome applicator for each event', () => {
    OPERATING_EVENTS.forEach((event) => {
      expect(OUTCOME_APPLICATORS[event.id]).toBeDefined();
    });
  });

  describe('Insurance Renewal', () => {
    it('should increase OpEx by $32K when accepting renewal', () => {
      const outcome = applyInsuranceRenewal(mockSim, 'accept-renewal');
      expect(outcome.propertyDeltas?.annualOperatingExpenses).toBe(650000 + 32000);
      expect(outcome.financialImpact).toContain('$32,000');
    });

    it('should increase OpEx by $17K when negotiating retention', () => {
      const outcome = applyInsuranceRenewal(mockSim, 'negotiate-retention');
      expect(outcome.propertyDeltas?.annualOperatingExpenses).toBe(650000 + 17000);
      expect(outcome.financialImpact).toContain('$17,000');
    });
  });

  describe('Property Tax Reassessment', () => {
    it('should increase OpEx by $28K when accepting assessment', () => {
      const outcome = applyPropertyTaxReassessment(mockSim, 'accept-assessment');
      expect(outcome.propertyDeltas?.annualOperatingExpenses).toBe(650000 + 28000);
      expect(outcome.outcomeDescription).toContain('Accepted county reassessment');
    });

    it('should increase OpEx by $14K when filing appeal', () => {
      const outcome = applyPropertyTaxReassessment(mockSim, 'file-appeal');
      expect(outcome.propertyDeltas?.annualOperatingExpenses).toBe(650000 + 14000);
      expect(outcome.outcomeDescription).toContain('Filed appeal');
    });
  });

  describe('Renovation Delay', () => {
    it('should reduce GPR by $18K when waiting for materials', () => {
      const outcome = applyRenovationDelay(mockSim, 'wait-for-materials');
      expect(outcome.propertyDeltas?.annualGrossPotentialRent).toBe(1680000 - 18000);
      expect(outcome.financialImpact).toContain('-$18,000');
    });

    it('should preserve GPR when expediting with alternates', () => {
      const outcome = applyRenovationDelay(mockSim, 'expedite-alternates');
      expect(outcome.propertyDeltas?.annualGrossPotentialRent).toBe(1680000);
      expect(outcome.financialImpact).toContain('preserved');
    });
  });

  describe('Vendor Underperformance', () => {
    it('should increase vacancy by $8K when retaining vendor', () => {
      const outcome = applyVendorUnderperformance(mockSim, 'retain-vendor');
      expect(outcome.propertyDeltas?.annualVacancy).toBe(84000 + 8000);
      expect(outcome.propertyDeltas?.annualOperatingExpenses).toBe(650000);
    });

    it('should increase OpEx by $7.2K when replacing vendor', () => {
      const outcome = applyVendorUnderperformance(mockSim, 'replace-vendor');
      expect(outcome.propertyDeltas?.annualOperatingExpenses).toBe(650000 + 7200);
      expect(outcome.propertyDeltas?.annualVacancy).toBe(84000);
    });
  });

  describe('Tenant Delinquency', () => {
    it('should increase bad debt by $8K with aggressive collections', () => {
      const outcome = applyTenantDelinquency(mockSim, 'aggressive-collections');
      expect(outcome.propertyDeltas?.annualBadDebt).toBe(20000 + 8000);
      expect(outcome.outcomeDescription).toContain('Pursued collections');
    });

    it('should increase bad debt by $22K with payment plans', () => {
      const outcome = applyTenantDelinquency(mockSim, 'payment-plans');
      expect(outcome.propertyDeltas?.annualBadDebt).toBe(20000 + 22000);
      expect(outcome.outcomeDescription).toContain('payment plans');
    });
  });

  describe('Refinance Offer', () => {
    it('should provide equity return when accepting refi', () => {
      const outcome = applyRefinanceOffer(mockSim, 'accept-refi');
      expect(outcome.outcomeDescription).toContain('$1.3M equity');
      expect(outcome.financialImpact).toContain('$42K');
    });

    it('should preserve existing terms when declining refi', () => {
      const outcome = applyRefinanceOffer(mockSim, 'decline-refi');
      expect(outcome.financialImpact).toContain('No change');
    });
  });

  describe('Lender Covenant Warning', () => {
    it('should reduce OpEx by $25K with expense reduction', () => {
      const outcome = applyLenderCovenantWarning(mockSim, 'expense-reduction');
      expect(outcome.propertyDeltas?.annualOperatingExpenses).toBe(650000 - 25000);
      expect(outcome.financialImpact).toContain('-$25,000');
    });

    it('should preserve OpEx with equity injection', () => {
      const outcome = applyLenderCovenantWarning(mockSim, 'equity-injection');
      expect(outcome.propertyDeltas?.annualOperatingExpenses).toBe(650000);
      expect(outcome.outcomeDescription).toContain('$150K equity reserve');
    });
  });

  describe('Rent Growth Opportunity', () => {
    it('should increase GPR by $95K and vacancy by $12K with aggressive push', () => {
      const outcome = applyRentGrowthOpportunity(mockSim, 'aggressive-rent-push');
      expect(outcome.propertyDeltas?.annualGrossPotentialRent).toBe(1680000 + 95000);
      expect(outcome.propertyDeltas?.annualVacancy).toBe(84000 + 12000);
      expect(outcome.financialImpact).toContain('+$95,000');
    });

    it('should increase GPR by $68K with no vacancy change for conservative increase', () => {
      const outcome = applyRentGrowthOpportunity(mockSim, 'conservative-increase');
      expect(outcome.propertyDeltas?.annualGrossPotentialRent).toBe(1680000 + 68000);
      expect(outcome.propertyDeltas?.annualVacancy).toBe(84000);
      expect(outcome.financialImpact).toContain('+$68,000');
    });
  });
});
