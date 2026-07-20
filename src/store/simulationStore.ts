import { create } from 'zustand';
import {
  Simulation,
  Approval,
  ApprovalStatus,
  WorkflowPhase,
  SimulationEvent,
  MessageThread,
} from '@/types';
import { generateRevisedApproval, generateDeclineAlternative } from '@/lib/workflow/approvals';
import { 
  createApprovalThread, 
  addRevisionMessage, 
  addDeclineAlternativeMessage,
  markThreadAsRead 
} from '@/lib/comms/messaging';

interface SimulationStore {
  // Current simulation
  simulation: Simulation | null;
  
  // Actions
  startSimulation: (simulation: Simulation) => void;
  setPhase: (phase: WorkflowPhase) => void;
  addApproval: (approval: Approval) => void;
  decideApproval: (approvalId: string, status: ApprovalStatus, userResponse?: string) => void;
  declineApproval: (approvalId: string, userResponse?: string) => void;
  reviseApproval: (approvalId: string, revisionReasonId: string) => void;
  addEvent: (event: Omit<SimulationEvent, 'id' | 'timestamp'>) => void;
  updateMetrics: (metrics: Partial<Simulation['metrics']>) => void;
  completeSimulation: (finalScore: number) => void;
  markThreadRead: (threadId: string) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  simulation: null,
  
  startSimulation: (simulation) => {
    set({ simulation });
    get().addEvent({
      phase: simulation.currentPhase,
      type: 'STATE_CHANGE',
      description: `Simulation started for ${simulation.property.name}`,
    });
  },
  
  setPhase: (phase) => {
    const sim = get().simulation;
    if (!sim) return;
    
    set({
      simulation: {
        ...sim,
        currentPhase: phase,
      },
    });
    
    get().addEvent({
      phase,
      type: 'STATE_CHANGE',
      description: `Transitioned to phase: ${phase}`,
    });
  },
  
  addApproval: (approval) => {
    const sim = get().simulation;
    if (!sim) return;
    
    // Create message thread for this approval
    const thread = createApprovalThread(approval);
    
    set({
      simulation: {
        ...sim,
        approvals: [...sim.approvals, approval],
        pendingApprovals: [...sim.pendingApprovals, approval],
        messageThreads: [...sim.messageThreads, thread],
      },
    });
    
    get().addEvent({
      phase: approval.phase,
      type: 'APPROVAL_CREATED',
      description: `Approval created: ${approval.title}`,
      data: { approvalId: approval.id, type: approval.type },
    });
  },
  
  decideApproval: (approvalId, status, userResponse) => {
    const sim = get().simulation;
    if (!sim) return;
    
    const approval = sim.approvals.find((a) => a.id === approvalId);
    if (!approval) return;
    
    const decidedAt = new Date().toISOString();
    
    set({
      simulation: {
        ...sim,
        approvals: sim.approvals.map((a) =>
          a.id === approvalId
            ? { ...a, status, userResponse, decidedAt }
            : a
        ),
        pendingApprovals: sim.pendingApprovals.filter((a) => a.id !== approvalId),
      },
    });
    
    get().addEvent({
      phase: approval.phase,
      type: 'APPROVAL_DECIDED',
      description: `${approval.title}: ${status}`,
      data: { approvalId, status, userResponse },
    });
  },

  // FIX (spec §19): a decline never dead-ends — CREOS re-pends a concrete
  // alternative decision so the phase can still progress.
  declineApproval: (approvalId, userResponse) => {
    const sim = get().simulation;
    if (!sim) return;
    const original = sim.approvals.find((a) => a.id === approvalId);
    if (!original) return;

    const decidedAt = new Date().toISOString();
    const alternative = generateDeclineAlternative(original);
    
    // Find the thread for this approval and add the alternative message
    const threadIndex = sim.messageThreads.findIndex(t => 
      t.messages.some(m => m.relatedApprovalId === approvalId)
    );
    
    let updatedThreads = sim.messageThreads;
    if (threadIndex >= 0) {
      const thread = sim.messageThreads[threadIndex];
      const updatedThread = addDeclineAlternativeMessage(thread, alternative);
      updatedThreads = [
        ...sim.messageThreads.slice(0, threadIndex),
        updatedThread,
        ...sim.messageThreads.slice(threadIndex + 1),
      ];
    }

    set({
      simulation: {
        ...sim,
        approvals: sim.approvals
          .map((a) => (a.id === approvalId ? { ...a, status: 'DECLINED' as ApprovalStatus, userResponse, decidedAt } : a))
          .filter((a) => a.id !== approvalId)
          .concat(alternative),
        pendingApprovals: sim.pendingApprovals
          .filter((a) => a.id !== approvalId)
          .concat(alternative),
        messageThreads: updatedThreads,
      },
    });

    get().addEvent({
      phase: original.phase,
      type: 'APPROVAL_DECIDED',
      description: `${original.title}: DECLINED — alternative "${alternative.title}" prepared`,
      data: { approvalId, status: 'DECLINED', alternativeId: alternative.id, userResponse },
    });
  },

  // FIX (spec §20): Request Revisions produces a re-pended revised recommendation.
  reviseApproval: (approvalId, revisionReasonId) => {
    const sim = get().simulation;
    if (!sim) return;
    const original = sim.approvals.find((a) => a.id === approvalId);
    if (!original) return;

    const revised = generateRevisedApproval(original, revisionReasonId);
    
    // Find the thread for this approval and add the revision message
    const threadIndex = sim.messageThreads.findIndex(t => 
      t.messages.some(m => m.relatedApprovalId === approvalId)
    );
    
    let updatedThreads = sim.messageThreads;
    if (threadIndex >= 0) {
      const thread = sim.messageThreads[threadIndex];
      const updatedThread = addRevisionMessage(thread, revised);
      updatedThreads = [
        ...sim.messageThreads.slice(0, threadIndex),
        updatedThread,
        ...sim.messageThreads.slice(threadIndex + 1),
      ];
    }

    set({
      simulation: {
        ...sim,
        approvals: sim.approvals
          .filter((a) => a.id !== approvalId)
          .concat(revised),
        pendingApprovals: sim.pendingApprovals
          .filter((a) => a.id !== approvalId)
          .concat(revised),
        messageThreads: updatedThreads,
      },
    });

    get().addEvent({
      phase: original.phase,
      type: 'APPROVAL_CREATED',
      description: `${original.title}: REVISION REQUESTED — revised recommendation prepared`,
      data: { approvalId, revisedId: revised.id, revisionReasonId },
    });
  },
  
  addEvent: (eventData) => {
    const sim = get().simulation;
    if (!sim) return;
    
    const event: SimulationEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...eventData,
    };
    
    set({
      simulation: {
        ...sim,
        events: [...sim.events, event],
      },
    });
  },
  
  updateMetrics: (metrics) => {
    const sim = get().simulation;
    if (!sim) return;
    
    set({
      simulation: {
        ...sim,
        metrics: {
          ...sim.metrics,
          ...metrics,
        },
      },
    });
    
    get().addEvent({
      phase: sim.currentPhase,
      type: 'METRIC_COMPUTED',
      description: `Metrics updated: ${Object.keys(metrics).join(', ')}`,
      data: metrics,
    });
  },
  
  completeSimulation: (finalScore) => {
    const sim = get().simulation;
    if (!sim) return;
    
    const completedAt = new Date().toISOString();
    
    set({
      simulation: {
        ...sim,
        completed: true,
        completedAt,
        finalScore,
      },
    });
    
    get().addEvent({
      phase: 'FINAL_SCORECARD',
      type: 'STATE_CHANGE',
      description: `Simulation completed with score: ${finalScore}`,
      data: { finalScore },
    });
  },
  
  markThreadRead: (threadId) => {
    const sim = get().simulation;
    if (!sim) return;
    
    const threadIndex = sim.messageThreads.findIndex(t => t.id === threadId);
    if (threadIndex < 0) return;
    
    const thread = sim.messageThreads[threadIndex];
    const updatedThread = markThreadAsRead(thread);
    
    set({
      simulation: {
        ...sim,
        messageThreads: [
          ...sim.messageThreads.slice(0, threadIndex),
          updatedThread,
          ...sim.messageThreads.slice(threadIndex + 1),
        ],
      },
    });
  },
  
  reset: () => {
    set({ simulation: null });
  },
}));
