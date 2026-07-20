// Tests for forecast scenarios
import { describe, it, expect } from 'vitest';
import { Property, PartnershipTerms } from '@/types';
import {
  computeForecast,
  getBaseCase,
  getUpsideCase,
  getDownsideCase,
  BASE_CASE,
  UPSIDE_CASE,
  DOWNSIDE_CASE,
} from './scenarios';

const mockProperty: Property = {
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
};

const mockPartnership: PartnershipTerms = {
  investorEquity: 3040000,
  sponsorEquity: 760000,
  preferredReturn: 0.08,
  catchUpPercentage: 1.0,
  investorSplit: 0.7,
  sponsorSplit: 0.3,
};

describe('Forecast Scenarios', () => {
  describe('Base Case', () => {
    it('should compute base case with 3% rent growth and 5.5% exit cap', () => {
      const result = getBaseCase(mockProperty, mockPartnership);
      
      expect(result.label).toBe('Base Case');
      expect(result.assumptions.rentGrowthRate).toBe(0.03);
      expect(result.assumptions.exitCapRate).toBe(0.055);
      expect(result.year5Noi).toBeGreaterThan(0);
      expect(result.year5Value).toBeGreaterThan(mockProperty.purchasePrice);
      expect(result.irr).toBeGreaterThan(0);
      expect(result.moic).toBeGreaterThan(1);
    });
  });

  describe('Upside Case', () => {
    it('should compute upside case with 5% rent growth and 5.0% exit cap', () => {
      const result = getUpsideCase(mockProperty, mockPartnership);
      
      expect(result.label).toBe('Upside Case');
      expect(result.assumptions.rentGrowthRate).toBe(0.05);
      expect(result.assumptions.exitCapRate).toBe(0.05);
      expect(result.year5Noi).toBeGreaterThan(0);
      expect(result.year5Value).toBeGreaterThan(mockProperty.purchasePrice);
      expect(result.irr).toBeGreaterThan(0);
      expect(result.moic).toBeGreaterThan(1);
    });

    it('should have better returns than base case', () => {
      const base = getBaseCase(mockProperty, mockPartnership);
      const upside = getUpsideCase(mockProperty, mockPartnership);
      
      expect(upside.year5Noi).toBeGreaterThan(base.year5Noi);
      expect(upside.year5Value).toBeGreaterThan(base.year5Value);
      expect(upside.irr).toBeGreaterThan(base.irr);
      expect(upside.moic).toBeGreaterThan(base.moic);
    });
  });

  describe('Downside Case', () => {
    it('should compute downside case with 1% rent growth and 6.5% exit cap', () => {
      const result = getDownsideCase(mockProperty, mockPartnership);
      
      expect(result.label).toBe('Downside Case');
      expect(result.assumptions.rentGrowthRate).toBe(0.01);
      expect(result.assumptions.exitCapRate).toBe(0.065);
      expect(result.year5Noi).toBeGreaterThan(0);
      expect(result.year5Value).toBeGreaterThan(0);
      expect(result.irr).toBeDefined();
      expect(result.moic).toBeGreaterThan(0);
    });

    it('should have lower returns than base case', () => {
      const base = getBaseCase(mockProperty, mockPartnership);
      const downside = getDownsideCase(mockProperty, mockPartnership);
      
      expect(downside.year5Noi).toBeLessThan(base.year5Noi);
      expect(downside.year5Value).toBeLessThan(base.year5Value);
      expect(downside.irr).toBeLessThan(base.irr);
      expect(downside.moic).toBeLessThan(base.moic);
    });
  });

  describe('Custom Forecast', () => {
    it('should compute custom forecast with arbitrary assumptions', () => {
      const customAssumptions = {
        rentGrowthRate: 0.025,
        vacancyRate: 0.06,
        expenseGrowthRate: 0.03,
        exitCapRate: 0.06,
        holdPeriodYears: 7,
      };

      const result = computeForecast(mockProperty, mockPartnership, customAssumptions);
      
      expect(result.assumptions).toEqual(customAssumptions);
      expect(result.year5Noi).toBeGreaterThan(0);
      expect(result.year5Value).toBeGreaterThan(0);
      expect(result.irr).toBeDefined();
      expect(result.moic).toBeGreaterThan(0);
    });
  });

  describe('Preset Assumptions', () => {
    it('should have correct base case assumptions', () => {
      expect(BASE_CASE.rentGrowthRate).toBe(0.03);
      expect(BASE_CASE.vacancyRate).toBe(0.05);
      expect(BASE_CASE.expenseGrowthRate).toBe(0.025);
      expect(BASE_CASE.exitCapRate).toBe(0.055);
      expect(BASE_CASE.holdPeriodYears).toBe(5);
    });

    it('should have correct upside case assumptions', () => {
      expect(UPSIDE_CASE.rentGrowthRate).toBe(0.05);
      expect(UPSIDE_CASE.vacancyRate).toBe(0.03);
      expect(UPSIDE_CASE.exitCapRate).toBe(0.05);
    });

    it('should have correct downside case assumptions', () => {
      expect(DOWNSIDE_CASE.rentGrowthRate).toBe(0.01);
      expect(DOWNSIDE_CASE.vacancyRate).toBe(0.08);
      expect(DOWNSIDE_CASE.exitCapRate).toBe(0.065);
    });
  });
});
