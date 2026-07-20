'use client';

import { useState } from 'react';
import { OperationsDigest } from '@/lib/comms/digest';
import { PERSONAS } from '@/lib/comms/personas';
import { withThousands } from '@/lib/format';

interface DigestCardProps {
  digest: OperationsDigest;
  onDismiss: () => void;
}

export default function DigestCard({ digest, onDismiss }: DigestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const assetManager = PERSONAS.ASSET_MANAGER;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${assetManager.avatarColor} flex items-center justify-center text-white font-semibold`}>
          {assetManager.initials}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{digest.periodDescription}</h3>
            <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">
              While You Were Away
            </span>
          </div>
          <div className="text-sm text-gray-700 mb-1">
            {assetManager.name}, {assetManager.role}
          </div>
          <div className="text-xs text-blue-600 font-medium">
            Simulated communication
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss digest"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-800 mb-4">{withThousands(digest.summary)}</p>

      {/* Key Metrics */}
      {digest.metricChanges.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 mb-2">Key Metrics</div>
          <div className="grid grid-cols-3 gap-3">
            {digest.metricChanges.map((metric, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">{metric.title}</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-gray-900">{withThousands(metric.value)}</div>
                  {metric.impact === 'positive' && <span className="text-green-600 text-sm">↑</span>}
                  {metric.impact === 'negative' && <span className="text-red-600 text-sm">↓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle details */}
      {(digest.operatingEvents.length > 0 || digest.pendingDecisions.length > 0) && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-sm text-blue-700 hover:text-blue-800 font-medium"
        >
          {expanded ? '▼' : '▶'} {expanded ? 'Hide' : 'Show'} Details
        </button>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {digest.operatingEvents.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">Operating Events</div>
              <ul className="space-y-1">
                {digest.operatingEvents.map((event, idx) => (
                  <li key={idx} className="text-sm text-gray-700 bg-white rounded px-3 py-2 border border-gray-200">
                    • {event.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {digest.pendingDecisions.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">Pending Decisions</div>
              <ul className="space-y-1">
                {digest.pendingDecisions.map((decision, idx) => (
                  <li key={idx} className="text-sm text-gray-700 bg-white rounded px-3 py-2 border border-gray-200">
                    • {decision.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
