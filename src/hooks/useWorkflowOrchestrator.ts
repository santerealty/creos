'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimulationStore } from '@/store/simulationStore';
import {
  canAdvancePhase,
  getNextPhase,
  generatePhaseApprovals,
  shouldAutoAdvance,
} from '@/lib/workflow/orchestrator';

/**
 * Hook that orchestrates the simulation workflow.
 * Automatically generates approvals for each phase and advances when ready.
 */
export function useWorkflowOrchestrator() {
  const { simulation, setPhase, addApproval } = useSimulationStore();
  const router = useRouter();

  useEffect(() => {
    if (!simulation) return;

    // Read LIVE store state (not the effect closure). React StrictMode invokes
    // effects twice in dev; because zustand's set() is synchronous, reading the
    // live state here means the second invocation sees approvals added by the
    // first and skips regenerating them (previously caused duplicate approvals
    // and duplicate message threads).
    const live = useSimulationStore.getState().simulation;
    if (!live) return;

    // If simulation is complete, redirect to scorecard
    if (live.currentPhase === 'FINAL_SCORECARD') {
      router.push('/scorecard');
      return;
    }

    // If no pending approvals for current phase, generate them
    const phaseApprovals = live.approvals.filter(
      (a) => a.phase === live.currentPhase
    );

    if (phaseApprovals.length === 0) {
      const newApprovals = generatePhaseApprovals(live);
      newApprovals.forEach((approval) => {
        addApproval(approval);
      });
    }

    // Check if we should auto-advance to next phase
    if (
      live.pendingApprovals.length === 0 &&
      phaseApprovals.length > 0 &&
      canAdvancePhase(live) &&
      shouldAutoAdvance(live.currentPhase)
    ) {
      const nextPhase = getNextPhase(live.currentPhase);
      if (nextPhase) {
        // Small delay before advancing for UX
        const timer = setTimeout(() => {
          setPhase(nextPhase);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [simulation, setPhase, addApproval, router]);
}
