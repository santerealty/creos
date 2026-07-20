import { Property, Unit, OperatingStatement, PartnershipTerms, Simulation } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// PARKVIEW TERRACE APARTMENTS - SEED DATA
// Phoenix, AZ | 120 Units | Value-Add | $21.6M Purchase
// ═══════════════════════════════════════════════════════════════════════════

export const PARKVIEW_PROPERTY: Property = {
  id: 'prop_parkview_001',
  name: 'Parkview Terrace Apartments',
  address: '4250 East Camelback Road',
  city: 'Phoenix',
  state: 'AZ',
  zip: '85018',
  propertyType: 'Multifamily',
  units: 120,
  builtYear: 1998,
  strategy: 'Value-Add',
  
  // Current state (SYNTHETIC DATA)
  currentOccupancy: 0.88, // 88%
  avgRentPerUnit: 1350, // Below market
  marketRentPerUnit: 1650, // Strong upside
  
  // Acquisition
  purchasePrice: 21_600_000,
  closingCosts: 324_000, // 1.5% of purchase
  
  // Operations (Year 1 - Stabilization)
  annualGrossPotentialRent: 2_376_000, // 120 units × $1,650/mo × 12
  annualOtherIncome: 84_000, // Parking, laundry, pet fees
  annualVacancy: 240_000, // ~10% (transitional)
  annualConcessions: 48_000, // Move-in specials during lease-up
  annualBadDebt: 24_000, // ~1% of GPR
  annualOperatingExpenses: 960_000, // $8k/unit
  
  // Capital structure
  loanAmount: 15_000_000, // ~69% LTV
  interestRate: 0.0575, // 5.75% (2024 bridge/agency)
  loanTermYears: 5,
  equityRequired: 6_924_000, // Purchase + closing - loan
  
  // Exit
  holdPeriodYears: 5,
  exitCapRate: 0.055, // Compression from improved NOI
};

// Generate realistic unit mix
export const PARKVIEW_UNITS: Unit[] = [
  // 1BR units (40 units, #101-140)
  ...Array.from({ length: 40 }, (_, i) => ({
    unitNumber: `${Math.floor(i / 10) + 1}${(i % 10).toString().padStart(2, '0')}`,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 650,
    currentRent: Math.random() > 0.12 ? 1250 + Math.floor(Math.random() * 150) : 0,
    marketRent: 1500,
    leaseEndDate: Math.random() > 0.3 ? 
      new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] :
      null,
    tenantName: Math.random() > 0.12 ? `Tenant ${i + 1}` : null,
    occupied: Math.random() > 0.12,
  })),
  
  // 2BR units (60 units, #201-260)
  ...Array.from({ length: 60 }, (_, i) => ({
    unitNumber: `2${(i + 1).toString().padStart(2, '0')}`,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 950,
    currentRent: Math.random() > 0.12 ? 1400 + Math.floor(Math.random() * 200) : 0,
    marketRent: 1700,
    leaseEndDate: Math.random() > 0.3 ?
      new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] :
      null,
    tenantName: Math.random() > 0.12 ? `Tenant ${i + 41}` : null,
    occupied: Math.random() > 0.12,
  })),
  
  // 3BR units (20 units, #301-320)
  ...Array.from({ length: 20 }, (_, i) => ({
    unitNumber: `3${(i + 1).toString().padStart(2, '0')}`,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    currentRent: Math.random() > 0.12 ? 1500 + Math.floor(Math.random() * 250) : 0,
    marketRent: 1850,
    leaseEndDate: Math.random() > 0.3 ?
      new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] :
      null,
    tenantName: Math.random() > 0.12 ? `Tenant ${i + 101}` : null,
    occupied: Math.random() > 0.12,
  })),
];

// Operating forecast (5-year hold with value-add execution)
export const PARKVIEW_OPERATING_STATEMENTS: OperatingStatement[] = [
  {
    period: 'Year 1 (Acquisition + Stabilization)',
    grossPotentialRent: 2_376_000,
    otherIncome: 84_000,
    vacancy: 240_000,
    concessions: 48_000,
    badDebt: 24_000,
    effectiveGrossIncome: 2_148_000,
    operatingExpenses: 960_000,
    netOperatingIncome: 1_188_000,
    debtService: 863_000, // 5.75% on $15M
    cashFlow: 325_000,
  },
  {
    period: 'Year 2 (Stabilized)',
    grossPotentialRent: 2_400_000, // Renovated units at market
    otherIncome: 90_000,
    vacancy: 120_000, // 5% stabilized
    concessions: 24_000,
    badDebt: 24_000,
    effectiveGrossIncome: 2_322_000,
    operatingExpenses: 984_000,
    netOperatingIncome: 1_338_000,
    debtService: 863_000,
    cashFlow: 475_000,
  },
  {
    period: 'Year 3 (Organic Growth)',
    grossPotentialRent: 2_472_000, // 3% rent growth
    otherIncome: 96_000,
    vacancy: 124_000,
    concessions: 12_000, // Minimal concessions
    badDebt: 25_000,
    effectiveGrossIncome: 2_407_000,
    operatingExpenses: 1_008_000,
    netOperatingIncome: 1_399_000,
    debtService: 863_000,
    cashFlow: 536_000,
  },
  {
    period: 'Year 4 (Peak Performance)',
    grossPotentialRent: 2_546_000,
    otherIncome: 102_000,
    vacancy: 127_000,
    concessions: 12_000,
    badDebt: 26_000,
    effectiveGrossIncome: 2_483_000,
    operatingExpenses: 1_033_000,
    netOperatingIncome: 1_450_000,
    debtService: 863_000,
    cashFlow: 587_000,
  },
  {
    period: 'Year 5 (Hold Decision Period)',
    grossPotentialRent: 2_622_000,
    otherIncome: 108_000,
    vacancy: 131_000,
    concessions: 12_000,
    badDebt: 26_000,
    effectiveGrossIncome: 2_561_000,
    operatingExpenses: 1_059_000,
    netOperatingIncome: 1_502_000,
    debtService: 863_000,
    cashFlow: 639_000,
  },
];

// Partnership structure: 90/10 LP/GP with 8% pref + catch-up
export const PARKVIEW_PARTNERSHIP: PartnershipTerms = {
  investorEquity: 6_231_600, // 90% of equity
  sponsorEquity: 692_400, // 10% of equity (sponsor co-invest)
  preferredReturn: 0.08, // 8% annual pref to LPs
  catchUpPercentage: 1.0, // 100% to sponsor until LP gets 8% IRR
  investorSplit: 0.70, // 70/30 promote after catch-up
  sponsorSplit: 0.30,
};

// Factory function to create initial simulation
export function createParkviewSimulation(): Simulation {
  return {
    id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    propertyId: PARKVIEW_PROPERTY.id,
    createdAt: new Date().toISOString(),
    currentPhase: 'DATA_REVIEW', // Start at first meaningful phase
    
    property: PARKVIEW_PROPERTY,
    units: PARKVIEW_UNITS,
    operatingStatements: PARKVIEW_OPERATING_STATEMENTS,
    partnershipTerms: PARKVIEW_PARTNERSHIP,
    
    approvals: [],
    pendingApprovals: [],
    events: [],
    messageThreads: [],
    metrics: {},
    
    completed: false,
  };
}
