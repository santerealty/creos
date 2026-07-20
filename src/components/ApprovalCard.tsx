'use client';

import { useState } from 'react';
import { Approval } from '@/types';
import { REVISION_REASONS } from '@/lib/workflow/approvals';
import { getPersonaForApproval, getPersonaById } from '@/lib/comms/personas';
import { getTranscriptForApproval } from '@/lib/comms/transcripts';
import { withThousands } from '@/lib/format';

interface ApprovalCardProps {
  approval: Approval;
  onDecide: (approvalId: string, status: 'APPROVED' | 'DECLINED') => void;
  onRevise?: (approvalId: string, revisionReasonId: string) => void;
}

export default function ApprovalCard({ approval, onDecide, onRevise }: ApprovalCardProps) {
  const [showRevise, setShowRevise] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [reasonId, setReasonId] = useState(REVISION_REASONS[0]?.id ?? '');

  const statusColors = {
    PENDING: 'bg-amber-50 border-amber-200',
    APPROVED: 'bg-emerald-50 border-emerald-200',
    DECLINED: 'bg-red-50 border-red-200',
    DEFERRED: 'bg-gray-50 border-gray-200',
  };

  const isPending = approval.status === 'PENDING';
  const persona = getPersonaForApproval(approval.type, approval.phase);
  const transcript = getTranscriptForApproval(approval.type, approval.phase);

  return (
    <div className={`border-2 rounded-lg p-6 ${statusColors[approval.status]}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">
            {approval.type.replace(/_/g, ' ')}
            {approval.currentRevision ? ` \u00b7 rev ${approval.currentRevision}` : ''}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{approval.title}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          approval.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
          approval.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
          approval.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {approval.status}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4">{withThousands(approval.description)}</p>

      {/* Agent Message (Simulated AI Communication) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          {/* Persona avatar */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${persona.avatarColor} flex items-center justify-center text-white font-semibold text-sm`}>
            {persona.initials}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-sm font-semibold text-gray-900">{persona.name}</div>
              <div className="text-xs text-gray-600">{persona.role}</div>
            </div>
            <div className="text-xs text-blue-600 font-medium mb-2">
              Simulated communication
            </div>
            <div className="text-sm text-gray-800 whitespace-pre-line">{withThousands(approval.agentMessage)}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {approval.keyMetrics && approval.keyMetrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {approval.keyMetrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
              <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {withThousands(metric.value)}
                {metric.trend === 'up' && <span className="text-green-600 text-sm">↑</span>}
                {metric.trend === 'down' && <span className="text-red-600 text-sm">↓</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revision History */}
      {approval.revisionHistory && approval.revisionHistory.length > 0 && (
        <div className="mb-4 border border-indigo-200 bg-indigo-50 rounded-lg p-3">
          <div className="text-xs font-medium text-indigo-700 mb-2">
            Revision history ({approval.revisionHistory.length})
          </div>
          <ul className="space-y-1">
            {approval.revisionHistory.map((r, idx) => (
              <li key={idx} className="text-xs text-gray-700">
                <span className="font-mono text-indigo-600">rev {r.revisionNumber}</span> — {r.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Attachments */}
      {approval.attachments && approval.attachments.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Attachments (SYNTHETIC DATA)</div>
          <div className="space-y-2">
            {approval.attachments.map((att, idx) => (
              <a
                key={idx}
                href={att.url ?? `/documents/${att.type}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-700 bg-white rounded px-3 py-2 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                </svg>
                <span className="flex-1 underline">{att.name}</span>
                <span className="text-xs text-gray-500">{att.type}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* User Response */}
      {approval.userResponse && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <div className="text-xs text-gray-500 mb-1">Your Response</div>
          <div className="text-sm text-gray-800">{approval.userResponse}</div>
        </div>
      )}

      {/* Team Discussion Transcript */}
      {transcript && (
        <div className="mb-4">
          <button
            onClick={() => setShowTranscript(v => !v)}
            className="text-sm font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            {showTranscript ? '▼' : '▶'} View Team Discussion
          </button>
          
          {showTranscript && (
            <div className="mt-3 border border-gray-300 bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span>💬</span>
                <span>{transcript.title}</span>
                <span className="text-blue-600">Simulated multi-turn conversation</span>
              </div>
              
              <div className="space-y-3">
                {transcript.turns.map((turn, idx) => {
                  const turnPersona = getPersonaById(turn.personaId);
                  if (!turnPersona) return null;
                  
                  return (
                    <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-200">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${turnPersona.avatarColor} flex items-center justify-center text-white font-semibold text-xs`}>
                        {turnPersona.initials}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-900 mb-1">
                          {turnPersona.name} <span className="text-gray-500 font-normal">({turnPersona.role})</span>
                        </div>
                        <div className="text-sm text-gray-700">{withThousands(turn.message)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Summary:</span> {transcript.summary}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revision picker */}
      {isPending && showRevise && onRevise && (
        <div className="mb-4 border border-indigo-300 bg-indigo-50 rounded-lg p-4">
          <div className="text-sm font-medium text-indigo-800 mb-2">Request a revision</div>
          <select
            aria-label="Revision reason"
            value={reasonId}
            onChange={(e) => setReasonId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-gray-800 bg-white"
          >
            {REVISION_REASONS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mb-3">
            {REVISION_REASONS.find((r) => r.id === reasonId)?.description}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { onRevise(approval.id, reasonId); setShowRevise(false); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Submit revision request
            </button>
            <button
              onClick={() => setShowRevise(false)}
              className="text-sm text-gray-600 hover:text-gray-800 py-2 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isPending && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => onDecide(approval.id, 'APPROVED')}
            className="flex-1 min-w-[8rem] bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {approval.primaryAction}
          </button>
          {onRevise && (
            <button
              onClick={() => setShowRevise((v) => !v)}
              className="flex-1 min-w-[8rem] bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Request Revisions
            </button>
          )}
          {approval.secondaryAction && (
            <button
              onClick={() => onDecide(approval.id, 'DECLINED')}
              className="flex-1 min-w-[8rem] bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {approval.secondaryAction}
            </button>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-gray-400 mt-3">
        {approval.decidedAt ?
          `Decided: ${new Date(approval.decidedAt).toLocaleString()}` :
          `Created: ${new Date(approval.timestamp).toLocaleString()}`
        }
      </div>
    </div>
  );
}
