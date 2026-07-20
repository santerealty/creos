'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimulationStore } from '@/store/simulationStore';
import ApprovalCard from '@/components/ApprovalCard';
import DigestCard from '@/components/DigestCard';
import { useWorkflowOrchestrator } from '@/hooks/useWorkflowOrchestrator';
import { getTotalUnreadCount } from '@/lib/comms/messaging';
import { generateOperationsDigest } from '@/lib/comms/digest';

export default function ApprovalQueue() {
  const router = useRouter();
  const { simulation, decideApproval, declineApproval, reviseApproval } = useSimulationStore();
  const [showDigest, setShowDigest] = useState(false);
  
  // Orchestrate workflow (auto-generate approvals, auto-advance phases)
  useWorkflowOrchestrator();

  // Show digest when entering OPERATIONS phase
  useEffect(() => {
    if (simulation && simulation.currentPhase === 'OPERATIONS' && !showDigest) {
      setShowDigest(true);
    }
  }, [simulation?.currentPhase]);

  if (!simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Active Simulation</h2>
          <p className="text-gray-600">Start a simulation to begin.</p>
        </div>
      </div>
    );
  }

  const handleDecision = (approvalId: string, status: 'APPROVED' | 'DECLINED') => {
    if (status === 'DECLINED') {
      declineApproval(approvalId);
    } else {
      decideApproval(approvalId, status);
    }
  };

  const handleRevise = (approvalId: string, revisionReasonId: string) => {
    reviseApproval(approvalId, revisionReasonId);
  };

  const pendingCount = simulation.pendingApprovals.length;
  const totalCount = simulation.approvals.length;
  const completedCount = totalCount - pendingCount;
  const unreadMessages = getTotalUnreadCount(simulation.messageThreads);

  // Generate digest for OPERATIONS phase
  const digest = simulation.currentPhase === 'OPERATIONS' && showDigest
    ? generateOperationsDigest(simulation)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{simulation.property.name}</h1>
              <p className="text-gray-600 mt-1">
                {simulation.property.city}, {simulation.property.state} | {simulation.currentPhase.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/messages')}
                  className="px-3 py-2 text-sm font-medium text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 flex items-center gap-2"
                >
                  Messages
                  {unreadMessages > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => router.push('/forecast')}
                  className="px-3 py-2 text-sm font-medium text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-50"
                >
                  Forecast Lab
                </button>
                <button
                  onClick={() => router.push('/audit')}
                  className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Audit Trail
                </button>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{pendingCount}</div>
                <div className="text-sm text-gray-500">Pending Approvals</div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{completedCount} / {totalCount} decisions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Approval Cards */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Digest Card (OPERATIONS phase only) */}
        {digest && (
          <DigestCard 
            digest={digest} 
            onDismiss={() => setShowDigest(false)} 
          />
        )}

        {pendingCount === 0 && totalCount > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6 text-center">
            <div className="text-emerald-800 font-medium text-lg mb-2">
              ✓ All approvals handled
            </div>
            <p className="text-emerald-700">
              Phase complete. The simulation will advance to the next stage.
            </p>
          </div>
        )}

        {pendingCount === 0 && totalCount === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Approvals Yet</h3>
            <p className="text-gray-600">Approvals will appear as the simulation progresses.</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Pending approvals first */}
          {simulation.pendingApprovals.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onDecide={handleDecision}
              onRevise={handleRevise}
            />
          ))}

          {/* Then show completed approvals */}
          {simulation.approvals
            .filter((a) => a.status !== 'PENDING')
            .reverse() // Most recent decisions first
            .map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onDecide={handleDecision}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
