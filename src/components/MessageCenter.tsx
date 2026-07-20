'use client';

import { useState } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { MessageThread } from '@/types';
import { getPersonaById } from '@/lib/comms/personas';
import { withThousands } from '@/lib/format';

export default function MessageCenter() {
  const { simulation, markThreadRead } = useSimulationStore();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  if (!simulation) {
    return (
      <div className="p-8 text-center text-gray-500">
        No active simulation. Start a simulation to see messages.
      </div>
    );
  }

  const threads = simulation.messageThreads;
  const selectedThread = threads.find(t => t.id === selectedThreadId);

  const handleThreadClick = (thread: MessageThread) => {
    setSelectedThreadId(thread.id);
    if (thread.unreadCount > 0) {
      markThreadRead(thread.id);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Thread List */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <p className="text-xs text-gray-500 mt-1">
            Threaded communications from your AI team
          </p>
        </div>

        <div className="p-2">
          {threads.length === 0 && (
            <p className="text-sm text-gray-500 p-4 text-center">
              No messages yet. Messages appear as approvals and events occur.
            </p>
          )}

          {threads.map(thread => {
            const firstMessage = thread.messages[0];
            const persona = firstMessage ? getPersonaById(firstMessage.personaId) : null;
            const isSelected = thread.id === selectedThreadId;

            return (
              <button
                key={thread.id}
                onClick={() => handleThreadClick(thread)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  isSelected
                    ? 'bg-blue-100 border border-blue-300'
                    : thread.unreadCount > 0
                    ? 'bg-white border border-blue-200 hover:bg-blue-50'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {persona && (
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${persona.avatarColor} flex items-center justify-center text-white font-semibold text-xs`}>
                      {persona.initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-semibold text-gray-900 truncate flex-1">
                        {thread.title}
                      </div>
                      {thread.unreadCount > 0 && (
                        <span className="flex-shrink-0 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {persona?.name} · {thread.phase.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {firstMessage?.content.substring(0, 60)}...
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(thread.lastMessageAt).toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message Thread View */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedThread ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{selectedThread.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  {selectedThread.phase.replace(/_/g, ' ')}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {selectedThread.category}
                </span>
                <span className="text-xs text-gray-500">
                  {selectedThread.messages.length} message{selectedThread.messages.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedThread.messages.map(message => {
                const persona = getPersonaById(message.personaId);
                if (!persona) return null;

                return (
                  <div key={message.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
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
                        <div className="text-sm text-gray-800 whitespace-pre-line">{withThousands(message.content)}</div>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-sm">Select a thread to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
