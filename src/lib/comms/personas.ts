import { ApprovalType, WorkflowPhase } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// AGENT PERSONAS
// Multi-agent communications layer for CREOS simulation
// ═══════════════════════════════════════════════════════════════════════════

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  avatarColor: string; // Tailwind color class for avatar badge
  voiceTone: string; // Description of communication style
}

// Core team of AI specialists
export const PERSONAS: Record<string, AgentPersona> = {
  ACQUISITIONS_ANALYST: {
    id: 'acq_analyst',
    name: 'Marcus Reed',
    role: 'Acquisitions Analyst',
    bio: 'Data-driven market researcher with 8+ years in multifamily acquisitions. Specializes in identifying value-add opportunities and market inefficiencies.',
    initials: 'MR',
    avatarColor: 'bg-blue-600',
    voiceTone: 'Analytical, detail-oriented, focuses on data validation and market comps',
  },
  
  UNDERWRITER: {
    id: 'underwriter',
    name: 'Sarah Chen',
    role: 'Senior Underwriter',
    bio: 'Rigorous financial modeler focused on risk-adjusted returns. Former analyst at a top institutional investor.',
    initials: 'SC',
    avatarColor: 'bg-purple-600',
    voiceTone: 'Precise, cautious, highlights assumptions and sensitivity analysis',
  },
  
  DEBT_BROKER: {
    id: 'debt_broker',
    name: 'James Liu',
    role: 'Debt & Capital Markets Broker',
    bio: 'Deep relationships across lender universe. Structures optimal capital stacks and negotiates terms.',
    initials: 'JL',
    avatarColor: 'bg-green-600',
    voiceTone: 'Optimistic, relationship-focused, emphasizes leverage and cost of capital',
  },
  
  DUE_DILIGENCE_LEAD: {
    id: 'dd_lead',
    name: 'Patricia Morales',
    role: 'Due Diligence Lead',
    bio: 'Cross-functional coordinator managing legal, environmental, and engineering workstreams.',
    initials: 'PM',
    avatarColor: 'bg-amber-600',
    voiceTone: 'Methodical, risk-aware, surfaces contingencies and red flags',
  },
  
  ASSET_MANAGER: {
    id: 'asset_mgr',
    name: 'David Park',
    role: 'Asset Manager',
    bio: 'Operational excellence specialist. Manages property performance, CapEx deployment, and value-creation initiatives.',
    initials: 'DP',
    avatarColor: 'bg-teal-600',
    voiceTone: 'Practical, operations-focused, monitors NOI and occupancy trends',
  },
  
  TAX_ADVISOR: {
    id: 'tax_advisor',
    name: 'Elena Vasquez',
    role: 'Tax Strategist',
    bio: 'Structures entity formations and exit strategies to optimize after-tax returns for investors.',
    initials: 'EV',
    avatarColor: 'bg-red-600',
    voiceTone: 'Technical, strategic, focuses on tax efficiency and investor distributions',
  },
  
  ORCHESTRATOR: {
    id: 'orchestrator',
    name: 'Alex Morgan',
    role: 'Chief of Staff',
    bio: 'Workflow orchestrator ensuring alignment across all workstreams. Escalates critical decisions.',
    initials: 'AM',
    avatarColor: 'bg-slate-700',
    voiceTone: 'Clear, directive, synthesizes inputs and drives toward decisions',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PERSONA MAPPING
// Which persona handles which approval type / phase
// ═══════════════════════════════════════════════════════════════════════════

export function getPersonaForApproval(
  approvalType: ApprovalType,
  phase: WorkflowPhase
): AgentPersona {
  // Map approval types to personas
  const typeMap: Partial<Record<ApprovalType, AgentPersona>> = {
    DATA_VALIDATION: PERSONAS.ACQUISITIONS_ANALYST,
    UNDERWRITING_OPINION: PERSONAS.UNDERWRITER,
    TITLE_EXCEPTION: PERSONAS.DUE_DILIGENCE_LEAD,
    ENVIRONMENTAL_EXCEPTION: PERSONAS.DUE_DILIGENCE_LEAD,
    LOAN_TERMS: PERSONAS.DEBT_BROKER,
    IC_DECISION: PERSONAS.ORCHESTRATOR,
    OPERATIONAL_DECISION: PERSONAS.ASSET_MANAGER,
    HOLD_SELL_DECISION: PERSONAS.ORCHESTRATOR,
    BUYER_SELECTION: PERSONAS.ACQUISITIONS_ANALYST,
    TAX_STRATEGY: PERSONAS.TAX_ADVISOR,
    DISSOLUTION_VOTE: PERSONAS.ORCHESTRATOR,
  };

  return typeMap[approvalType] ?? PERSONAS.ORCHESTRATOR;
}

// ═══════════════════════════════════════════════════════════════════════════
// PERSONA UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export function getPersonaById(id: string): AgentPersona | undefined {
  return Object.values(PERSONAS).find(p => p.id === id);
}

export function getAllPersonas(): AgentPersona[] {
  return Object.values(PERSONAS);
}
