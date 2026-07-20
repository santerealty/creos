'use client';

import { useSimulationStore } from '@/store/simulationStore';
import { useRouter } from 'next/navigation';

export default function AuditTrail() {
  const { simulation } = useSimulationStore();
  const router = useRouter();

  if (!simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Active Simulation</h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Return to Portfolio
          </button>
        </div>
      </div>
    );
  }

  const eventsByPhase = simulation.events.reduce((acc, event) => {
    if (!acc[event.phase]) {
      acc[event.phase] = [];
    }
    acc[event.phase].push(event);
    return acc;
  }, {} as Record<string, typeof simulation.events>);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'STATE_CHANGE':
        return '→';
      case 'APPROVAL_CREATED':
        return '📋';
      case 'APPROVAL_DECIDED':
        return '✓';
      case 'METRIC_COMPUTED':
        return '📊';
      case 'USER_ACTION':
        return '👤';
      default:
        return '•';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
              <p className="text-gray-600 mt-1">{simulation.property.name}</p>
            </div>
            <button
              onClick={() => router.push('/scorecard')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Back to Scorecard
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {Object.entries(eventsByPhase).map(([phase, events]) => (
            <div key={phase} className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {phase.replace(/_/g, ' ')}
              </h2>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 text-sm">
                    <div className="flex-shrink-0 w-8 text-center text-xl">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900">{event.description}</div>
                      {event.data && (
                        <details className="mt-1">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View data
                          </summary>
                          <pre className="mt-2 text-xs text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Audit Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-600 font-semibold">{simulation.events.length}</div>
              <div className="text-blue-800">Total Events</div>
            </div>
            <div>
              <div className="text-blue-600 font-semibold">{simulation.approvals.length}</div>
              <div className="text-blue-800">Approvals</div>
            </div>
            <div>
              <div className="text-blue-600 font-semibold">
                {Object.keys(eventsByPhase).length}
              </div>
              <div className="text-blue-800">Phases Completed</div>
            </div>
            <div>
              <div className="text-blue-600 font-semibold">
                {simulation.completedAt ? 
                  Math.round((new Date(simulation.completedAt).getTime() - new Date(simulation.createdAt).getTime()) / 60000) :
                  'N/A'
                } min
              </div>
              <div className="text-blue-800">Total Duration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
