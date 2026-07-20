import { describe, it, expect } from 'vitest';
import { createParkviewSimulation } from '@/data/parkview';
import { generatePhaseApprovals, canAdvancePhase } from './orchestrator';
import { generateDeclineAlternative, generateRevisedApproval, REVISION_REASONS } from './approvals';
import { Simulation } from '@/types';

describe('BRANCH REGRESSION: decline & revise never dead-end (spec §19, §20)', () => {
  it('raw canAdvancePhase still requires resolution (documents original constraint)', () => {
    const sim = createParkviewSimulation();
    const approvals = generatePhaseApprovals(sim);
    expect(approvals.length).toBeGreaterThan(0);
    const declined = approvals.map((a) => ({ ...a, status: 'DECLINED' as const }));
    const simAfter: Simulation = { ...sim, approvals: declined, pendingApprovals: [] };
    // With only a declined approval and nothing pending, the phase must NOT advance.
    expect(canAdvancePhase(simAfter)).toBe(false);
  });

  it('FIX: generateDeclineAlternative produces a fresh PENDING alternative (no dead-end)', () => {
    const sim = createParkviewSimulation();
    const [original] = generatePhaseApprovals(sim);
    const alt = generateDeclineAlternative(original);
    expect(alt.status).toBe('PENDING');
    expect(alt.id).not.toBe(original.id);
    expect(alt.id.startsWith(original.id)).toBe(true);
    expect((alt.currentRevision ?? 0)).toBeGreaterThan(original.currentRevision ?? 0);
    expect(alt.revisionHistory && alt.revisionHistory.length).toBeGreaterThan(0);
  });

  it('FIX: after decline+approve-alternative, phase CAN advance', () => {
    const sim = createParkviewSimulation();
    const approvals = generatePhaseApprovals(sim);
    // Simulate store: decline each original, replace with an approved alternative
    const resolved = approvals.map((a) => ({ ...generateDeclineAlternative(a), status: 'APPROVED' as const }));
    const simAfter: Simulation = { ...sim, approvals: resolved, pendingApprovals: [] };
    expect(canAdvancePhase(simAfter)).toBe(true);
  });

  it('FIX: Request Revisions produces a PENDING revised recommendation', () => {
    const sim = createParkviewSimulation();
    const [original] = generatePhaseApprovals(sim);
    const revised = generateRevisedApproval(original, REVISION_REASONS[0].id);
    expect(revised.status).toBe('PENDING');
    expect(revised.id).not.toBe(original.id);
  });
});
