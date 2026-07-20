import { 
  Message, 
  MessageThread, 
  Approval, 
  SimulationEvent,
  WorkflowPhase 
} from '@/types';
import { getPersonaForApproval } from './personas';

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE THREADING
// Converts approvals, events, and decisions into threaded communications
// ═══════════════════════════════════════════════════════════════════════════

let messageCounter = 0;
let threadCounter = 0;

function createMessage(
  threadId: string,
  personaId: string,
  content: string,
  options: {
    relatedApprovalId?: string;
    relatedEventId?: string;
  } = {}
): Message {
  messageCounter++;
  return {
    id: `msg_${Date.now()}_${messageCounter}`,
    threadId,
    personaId,
    timestamp: new Date().toISOString(),
    content,
    relatedApprovalId: options.relatedApprovalId,
    relatedEventId: options.relatedEventId,
    read: false,
  };
}

function createThread(
  title: string,
  phase: WorkflowPhase,
  category: MessageThread['category'],
  initialMessage: Message
): MessageThread {
  threadCounter++;
  return {
    id: `thread_${Date.now()}_${threadCounter}`,
    title,
    phase,
    category,
    messages: [initialMessage],
    lastMessageAt: initialMessage.timestamp,
    unreadCount: 1,
  };
}

/**
 * Create a message thread for a new approval
 */
export function createApprovalThread(approval: Approval): MessageThread {
  const persona = getPersonaForApproval(approval.type, approval.phase);
  
  const initialMessage = createMessage(
    '', // Will be set by thread
    persona.id,
    approval.agentMessage,
    { relatedApprovalId: approval.id }
  );
  
  const thread = createThread(
    approval.title,
    approval.phase,
    'APPROVAL',
    initialMessage
  );
  
  // Update message with thread ID
  initialMessage.threadId = thread.id;
  
  return thread;
}

/**
 * Add a revision message to an existing thread
 */
export function addRevisionMessage(
  thread: MessageThread,
  revisedApproval: Approval
): MessageThread {
  const persona = getPersonaForApproval(revisedApproval.type, revisedApproval.phase);
  
  const revisionNum = revisedApproval.currentRevision ?? 0;
  const revisionPrefix = `[Revision ${revisionNum}]\n\n`;
  
  const message = createMessage(
    thread.id,
    persona.id,
    revisionPrefix + revisedApproval.agentMessage,
    { relatedApprovalId: revisedApproval.id }
  );
  
  return {
    ...thread,
    category: 'REVISION',
    messages: [...thread.messages, message],
    lastMessageAt: message.timestamp,
    unreadCount: thread.unreadCount + 1,
  };
}

/**
 * Add a decline alternative message to a thread
 */
export function addDeclineAlternativeMessage(
  thread: MessageThread,
  alternativeApproval: Approval
): MessageThread {
  const persona = getPersonaForApproval(alternativeApproval.type, alternativeApproval.phase);
  
  const declinePrefix = "[Original option declined — alternative prepared]\n\n";
  
  const message = createMessage(
    thread.id,
    persona.id,
    declinePrefix + alternativeApproval.agentMessage,
    { relatedApprovalId: alternativeApproval.id }
  );
  
  return {
    ...thread,
    category: 'DECLINE',
    messages: [...thread.messages, message],
    lastMessageAt: message.timestamp,
    unreadCount: thread.unreadCount + 1,
  };
}

/**
 * Create a thread for an operating event
 */
export function createOperatingEventThread(
  event: SimulationEvent,
  phase: WorkflowPhase,
  personaId: string = 'asset_mgr' // Default to Asset Manager for operating events
): MessageThread {
  const message = createMessage(
    '',
    personaId,
    event.description,
    { relatedEventId: event.id }
  );
  
  const thread = createThread(
    `Operating Update: ${event.description.substring(0, 50)}...`,
    phase,
    'OPERATING_EVENT',
    message
  );
  
  message.threadId = thread.id;
  
  return thread;
}

/**
 * Mark a thread as read
 */
export function markThreadAsRead(thread: MessageThread): MessageThread {
  return {
    ...thread,
    messages: thread.messages.map(m => ({ ...m, read: true })),
    unreadCount: 0,
  };
}

/**
 * Get total unread count across all threads
 */
export function getTotalUnreadCount(threads: MessageThread[]): number {
  return threads.reduce((sum, t) => sum + t.unreadCount, 0);
}
