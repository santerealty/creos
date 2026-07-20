import { Simulation, WorkflowPhase, Approval } from '@/types';
import {
  generateDataReviewApprovals,
  generateUnderwritingApprovals,
  generateDueDiligenceApprovals,
  generateFinancingApprovals,
  generateIcApprovalApprovals,
  generateOperationsApprovals,
  generateHoldDecisionApprovals,
  generateDispositionApprovals,
  generateTaxApprovals,
  generateWaterfallApprovals,
} from './approvals';

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW STATE MACHINE
// Orchestrates phase transitions and approval generation for the golden path
// ═══════════════════════════════════════════════════════════════════════════

export const PHASE_SEQUENCE: WorkflowPhase[] = [
  'GUEST_ENTRY',
  'PORTFOLIO_VIEW',
  'DATA_REVIEW',
  'UNDERWRITING',
  'DUE_DILIGENCE',
  'FINANCING',
  'IC_APPROVAL',
  'ACQUISITION_CLOSE',
  'OPERATIONS',
  'HOLD_DECISION',
  'DISPOSITION',
  'SALE_CLOSE',
  'TAX_CLOSEOUT',
  'WATERFALL_DISTRIBUTION',
  'DISSOLUTION',
  'FINAL_SCORECARD',
];

export interface PhaseConfig {
  phase: WorkflowPhase;
  generateApprovals: (sim: Simulation) => Approval[];
  requiresAllApproved: boolean; // Must all approvals be approved before advancing?
  autoAdvance: boolean; // Automatically advance when approvals complete?
}

export const PHASE_CONFIGS: Record<WorkflowPhase, PhaseConfig> = {
  GUEST_ENTRY: {
    phase: 'GUEST_ENTRY',
    generateApprovals: () => [],
    requiresAllApproved: false,
    autoAdvance: false,
  },
  PORTFOLIO_VIEW: {
    phase: 'PORTFOLIO_VIEW',
    generateApprovals: () => [],
    requiresAllApproved: false,
    autoAdvance: false,
  },
  DATA_REVIEW: {
    phase: 'DATA_REVIEW',
    generateApprovals: generateDataReviewApprovals,
    requiresAllApproved: true,
    autoAdvance: true,
  },
  UNDERWRITING: {
    phase: 'UNDERWRITING',
    generateApprovals: generateUnderwritingApprovals,
    requiresAllApproved: true,
    autoAdvance: true,
  },
  DUE_DILIGENCE: {
    phase: 'DUE_DILIGENCE',
    generateApprovals: generateDueDiligenceApprovals,
    requiresAllApproved: true,
    autoAdvance: true,
  },
  FINANCING: {
    phase: 'FINANCING',
    generateApprovals: generateFinancingApprovals,
    requiresAllApproved: true,
    autoAdvance: true,
  },
  IC_APPROVAL: {
    phase: 'IC_APPROVAL',
    generateApprovals: generateIcApprovalApprovals,
    requiresAllApproved: true,
    autoAdvance: true,
  },
  ACQUISITION_CLOSE: {
    phase: 'ACQUISITION_CLOSE',
    generateApprovals: () => [],
    requiresAllApproved: false,
    autoAdvance: true,
  },
  OPERATIONS: {
    phase: 'OPERATIONS',
    generateApprovals: generateOperationsApprovals,
    requiresAllApproved: true,
    autoAdvance: true,
  },
  HOLD_DECISION: {
    phase: 'HOLD_DECISION',
    generateApprovals: generateHoldDecisionApprovals,
    requiresAllApproved: true,
    autoAdvance: true,
  },
  DISPOSITION: {
    phase: 'DISPOSITION',
    generateApprovals: generateDispositionApprovals,
    requiresAllApproved: true,
    autoAdvance: true,
  },
  SALE_CLOSE: {
    phase: 'SALE_CLOSE',
    generateApprovals: () => [],
    requiresAllApproved: false,
    autoAdvance: true,
  },
  TAX_CLOSEOUT: {
    phase: 'TAX_CLOSEOUT',
    generateApprovals: generateTaxApprovals,
    requiresAllApproved: true,
    autoAdvance: true,
  },
  WATERFALL_DISTRIBUTION: {
    phase: 'WATERFALL_DISTRIBUTION',
    generateApprovals: generateWaterfallApprovals,
    requiresAllApproved: true,
    autoAdvance: true,
  },
  DISSOLUTION: {
    phase: 'DISSOLUTION',
    generateApprovals: () => [],
    requiresAllApproved: false,
    autoAdvance: true,
  },
  FINAL_SCORECARD: {
    phase: 'FINAL_SCORECARD',
    generateApprovals: () => [],
    requiresAllApproved: false,
    autoAdvance: false,
  },
};

/**
 * Get the next phase in the workflow sequence
 */
export function getNextPhase(currentPhase: WorkflowPhase): WorkflowPhase | null {
  const currentIndex = PHASE_SEQUENCE.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === PHASE_SEQUENCE.length - 1) {
    return null;
  }
  return PHASE_SEQUENCE[currentIndex + 1];
}

/**
 * Check if a phase can transition to the next phase
 */
export function canAdvancePhase(sim: Simulation): boolean {
  const config = PHASE_CONFIGS[sim.currentPhase];
  
  // If phase requires all approvals to be approved
  if (config.requiresAllApproved) {
    const phaseApprovals = sim.approvals.filter((a) => a.phase === sim.currentPhase);
    const allApproved = phaseApprovals.every((a) => a.status === 'APPROVED');
    return phaseApprovals.length > 0 && allApproved;
  }
  
  // Otherwise, can always advance
  return true;
}

/**
 * Generate approvals for the current phase
 */
export function generatePhaseApprovals(sim: Simulation): Approval[] {
  const config = PHASE_CONFIGS[sim.currentPhase];
  return config.generateApprovals(sim);
}

/**
 * Check if phase should auto-advance after approvals complete
 */
export function shouldAutoAdvance(phase: WorkflowPhase): boolean {
  return PHASE_CONFIGS[phase].autoAdvance;
}
