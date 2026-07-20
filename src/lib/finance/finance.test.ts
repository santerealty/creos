import { describe, it, expect } from 'vitest';
import {
  effectiveGrossIncome, netOperatingIncome, capRate, impliedValue, dscr, debtYield,
  cashOnCash, moic, netSaleProceeds, xirr, adjustedTaxBasis, taxableGain,
  depreciationRecapture, waterfall,
} from './index';

describe('income & valuation', () => {
  it('EGI', () => expect(effectiveGrossIncome(1_000_000, 50_000, 80_000, 20_000, 10_000)).toBe(940_000));
  it('NOI', () => expect(netOperatingIncome(940_000, 400_000)).toBe(540_000));
  it('cap rate', () => expect(capRate(540_000, 9_000_000)).toBeCloseTo(0.06, 6));
  it('implied value', () => expect(impliedValue(600_000, 0.0575)).toBeCloseTo(10_434_782.6, 1));
});

describe('debt & returns', () => {
  it('DSCR', () => expect(dscr(540_000, 400_000)).toBeCloseTo(1.35, 6));
  it('debt yield', () => expect(debtYield(540_000, 6_000_000)).toBeCloseTo(0.09, 6));
  it('cash-on-cash', () => expect(cashOnCash(120_000, 2_000_000)).toBeCloseTo(0.06, 6));
  it('MOIC', () => expect(moic(3_200_000, 2_000_000)).toBeCloseTo(1.6, 6));
});

describe('sale proceeds', () => {
  it('net proceeds', () =>
    expect(netSaleProceeds(30_000_000, 600_000, 15_000_000, 150_000, 100_000, 50_000, 200_000))
      .toBe(13_900_000));
});

describe('XIRR', () => {
  it('simple 2-flow ~ doubling in 1yr', () => {
    const r = xirr([
      { date: new Date('2020-01-01'), amount: -1000 },
      { date: new Date('2021-01-01'), amount: 2000 },
    ]);
    expect(r).toBeCloseTo(1.0, 2); // 365-day convention across leap yr -> ~0.9962
  });
  it('multi-flow positive IRR', () => {
    const r = xirr([
      { date: new Date('2020-01-01'), amount: -2_000_000 },
      { date: new Date('2021-01-01'), amount: 120_000 },
      { date: new Date('2022-01-01'), amount: 120_000 },
      { date: new Date('2025-01-01'), amount: 3_200_000 },
    ]);
    expect(r).toBeGreaterThan(0.1);
    expect(r).toBeLessThan(0.2);
  });
  it('throws on single flow', () =>
    expect(() => xirr([{ date: new Date(), amount: 1 }])).toThrow());
});

describe('tax', () => {
  it('adjusted basis', () => expect(adjustedTaxBasis(22_000_000, 3_000_000, 4_000_000)).toBe(21_000_000));
  it('taxable gain', () => expect(taxableGain(29_400_000, 21_000_000)).toBe(8_400_000));
  it('recapture capped at accumulated depr', () =>
    expect(depreciationRecapture(4_000_000, 21_000_000, 29_400_000)).toBe(4_000_000));
  it('recapture limited by gain', () =>
    expect(depreciationRecapture(4_000_000, 21_000_000, 22_500_000)).toBe(1_500_000));
  it('no recapture when sold at loss', () =>
    expect(depreciationRecapture(4_000_000, 21_000_000, 20_000_000)).toBe(0));
});

describe('waterfall', () => {
  const base = {
    investorCapital: 6_000_000, sponsorCapital: 0,
    accruedPref: 1_200_000, catchUp: 300_000,
    investorSplit: 0.7, sponsorSplit: 0.3,
  };
  it('full waterfall reconciles to distributable', () => {
    const r = waterfall({ ...base, totalDistributable: 10_000_000 });
    expect(r.investorPref).toBe(1_200_000);
    expect(r.investorReturnOfCapital).toBe(6_000_000);
    expect(r.sponsorCatchUp).toBe(300_000);
    // residual 2,500,000 split 70/30
    expect(r.investorResidual).toBeCloseTo(1_750_000, 6);
    expect(r.sponsorResidual).toBeCloseTo(750_000, 6);
    expect(r.check).toBeCloseTo(0, 6);
  });
  it('shortfall: only partial pref, nothing below', () => {
    const r = waterfall({ ...base, totalDistributable: 800_000 });
    expect(r.investorPref).toBe(800_000);
    expect(r.investorReturnOfCapital).toBe(0);
    expect(r.sponsorTotal).toBe(0);
    expect(r.check).toBeCloseTo(0, 6);
  });
  it('always reconciles (check ~ 0) across amounts', () => {
    for (const amt of [0, 500_000, 1_200_000, 7_500_000, 12_000_000, 50_000_000]) {
      expect(waterfall({ ...base, totalDistributable: amt }).check).toBeCloseTo(0, 4);
    }
  });
});
