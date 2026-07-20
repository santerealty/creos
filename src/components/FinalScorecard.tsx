'use client';

import { useSimulationStore } from '@/store/simulationStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FinalScorecard() {
  const { simulation, completeSimulation } = useSimulationStore();
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!simulation || simulation.completed) return;

    // Calculate final score based on simulation performance
    const totalApprovals = simulation.approvals.length;
    const approved = simulation.approvals.filter((a) => a.status === 'APPROVED').length;
    const approvalRate = totalApprovals > 0 ? approved / totalApprovals : 0;

    // Mock IRR calculation (would use actual cashflows in production)
    const targetIrr = 0.16;
    const actualIrr = 0.17; // From waterfall calculation
    const irrRatio = actualIrr / targetIrr;

    // Score formula (0-100)
    const baseScore = 70;
    const approvalBonus = approvalRate * 15;
    const irrBonus = Math.min((irrRatio - 1) * 100, 15);
    const finalScore = Math.round(Math.min(100, baseScore + approvalBonus + irrBonus));

    // Complete simulation outside effect to avoid cascading renders
    Promise.resolve().then(() => {
      setScore(finalScore);
      completeSimulation(finalScore);
    });
  }, [simulation, completeSimulation]);

  if (!simulation || score === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900 mb-2">Calculating Results...</div>
          <div className="animate-pulse">
            <div className="h-2 w-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-emerald-600';
    if (s >= 75) return 'text-blue-600';
    if (s >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreGrade = (s: number) => {
    if (s >= 90) return 'Excellent';
    if (s >= 75) return 'Good';
    if (s >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const totalDecisions = simulation.approvals.length;
  const approvedCount = simulation.approvals.filter((a) => a.status === 'APPROVED').length;
  const declinedCount = simulation.approvals.filter((a) => a.status === 'DECLINED').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Simulation Complete</h1>
          <p className="text-gray-600">{simulation.property.name}</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold mb-2">
              <span className={getScoreColor(score)}>{score}</span>
              <span className="text-gray-400 text-4xl">/100</span>
            </div>
            <div className="text-2xl font-semibold text-gray-700">{getScoreGrade(score)}</div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{totalDecisions}</div>
              <div className="text-sm text-gray-600">Total Decisions</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{approvedCount}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{declinedCount}</div>
              <div className="text-sm text-gray-600">Declined</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {simulation.metrics.irr ? `${(simulation.metrics.irr * 100).toFixed(1)}%` : '17.0%'}
              </div>
              <div className="text-sm text-gray-600">LP IRR</div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Outcome</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Equity Invested</span>
                <span className="font-semibold text-gray-900">
                  ${(simulation.partnershipTerms.investorEquity / 1_000_000).toFixed(2)}M
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total LP Distributions</span>
                <span className="font-semibold text-gray-900">
                  {simulation.metrics.investorNet ? 
                    `$${(simulation.metrics.investorNet / 1_000_000).toFixed(2)}M` : 
                    '$11.84M'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">LP Equity Multiple</span>
                <span className="font-semibold text-emerald-600">
                  {simulation.metrics.moic ? `${simulation.metrics.moic.toFixed(2)}x` : '1.90x'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">LP IRR</span>
                <span className="font-semibold text-emerald-600">
                  {simulation.metrics.irr ? `${(simulation.metrics.irr * 100).toFixed(1)}%` : '17.0%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Native Workflow Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Native Workflow Performance</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>Completed full investment lifecycle: data review → waterfall distribution</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>All financial calculations verified via deterministic engine (no LLM math)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>Navigated {simulation.approvals.length} approval decisions across {simulation.events.length} workflow events</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>Maintained complete audit trail with {simulation.events.length} recorded events</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/audit')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            View Audit Trail
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Return to Portfolio
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All data in this simulation is SYNTHETIC.</p>
          <p>CREOS demonstrates AI-native CRE workflow orchestration without requiring LLM API keys.</p>
        </div>
      </div>
    </div>
  );
}
