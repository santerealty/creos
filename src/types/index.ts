// Core domain types for CREOS simulation

// ═══════════════════════════════════════════════════════════════════════════
// SIMULATION WORKFLOW PHASES
// ═══════════════════════════════════════════════════════════════════════════
export type WorkflowPhase =
  | 'GUEST_ENTRY'
  | 'PORTFOLIO_VIEW'
  | 'DATA_REVIEW'
  | 'UNDERWRITING'
  | 'DUE_DILIGENCE'
  | 'FINANCING'
  | 'IC_APPROVAL'
  | 'ACQUISITION_CLOSE'
  | 'OPERATIONS'
  | 'HOLD_DECISION'
  | 'DISPOSITION'
  | 'SALE_CLOSE'
  | 'TAX_CLOSEOUT'
  | 'WATERFALL_DISTRIBUTION'
  | 'DISSOLUTION'
  | 'FINAL_SCORECARD';

// ═══════════════════════════════════════════════════════════════════════════
// PROPERTY & DEAL STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════
export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: 'Multifamily' | 'Office' | 'Retail' | 'Industrial' | 'Mixed-Use';
  units: number;
  builtYear: number;
  strategy: 'Core' | 'Core+' | 'Value-Add' | 'Opportunistic';
  
  // Current state (synthetic data)
  currentOccupancy: number; // percentage 0-1
  avgRentPerUnit: number;
  marketRentPerUnit: number;
  
  // Acquisition
  purchasePrice: number;
  closingCosts: number;
  
  // Operations
  annualGrossPotentialRent: number;
  annualOtherIncome: number;
  annualVacancy: number;
  annualConcessions: number;
  annualBadDebt: number;
  annualOperatingExpenses: number;
  
  // Capital structure
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  equityRequired: number;
  
  // Exit
  holdPeriodYears: number;
  exitCapRate: number;
}

export interface Unit {
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  currentRent: number;
  marketRent: number;
  leaseEndDate: string | null;
  tenantName: string | null;
  occupied: boolean;
}

export interface OperatingStatement {
  period: string; // e.g., "Year 1", "Q1 2024"
  grossPotentialRent: number;
  otherIncome: number;
  vacancy: number;
  concessions: number;
  badDebt: number;
  effectiveGrossIncome: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  debtService: number;
  cashFlow: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTNERSHIP & WATERFALL
// ═══════════════════════════════════════════════════════════════════════════
export interface PartnershipTerms {
  investorEquity: number;
  sponsorEquity: number;
  preferredReturn: number; // e.g., 0.08 = 8%
  catchUpPercentage: number; // e.g., 1.0 = 100% to sponsor
  investorSplit: number; // e.g., 0.70 = 70% to investors
  sponsorSplit: number; // e.g., 0.30 = 30% to sponsor
}

// ═══════════════════════════════════════════════════════════════════════════
// APPROVAL SYSTEM (CORE GAMEPLAY)
// ═══════════════════════════════════════════════════════════════════════════
export type ApprovalType =
  | 'DATA_VALIDATION'
  | 'UNDERWRITING_OPINION'
  | 'TITLE_EXCEPTION'
  | 'ENVIRONMENTAL_EXCEPTION'
  | 'LOAN_TERMS'
  | 'IC_DECISION'
  | 'OPERATIONAL_DECISION'
  | 'HOLD_SELL_DECISION'
  | 'BUYER_SELECTION'
  | 'TAX_STRATEGY'
  | 'DISSOLUTION_VOTE';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'DEFERRED';

export interface Approval {
  id: string;
  type: ApprovalType;
  phase: WorkflowPhase;
  propertyId: string;
  timestamp: string;
  
  // Content
  title: string;
  description: string;
  agentMessage: string; // Scripted "AI" message
  
  // Decision options
  primaryAction: string; // e.g., "Approve", "Accept", "Proceed"
  secondaryAction?: string; // e.g., "Decline", "Reject", "Negotiate"
  
  // State
  status: ApprovalStatus;
  userResponse?: string;
  decidedAt?: string;
  
  // Supporting data
  attachments?: {
    name: string;
    type: 'RENT_ROLL' | 'T12' | 'TITLE_REPORT' | 'ENV_REPORT' | 'APPRAISAL' | 'LOAN_TERM_SHEET' | 'FORECAST';
    url?: string; // Could be a blob URL for downloadable synthetic data
    preview?: string;
  }[];
  
  keyMetrics?: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
  }[];
  
  // MILESTONE 2: Revision tracking
  revisionHistory?: {
    revisionNumber: number;
    timestamp: string;
    reason: string;
    originalMetrics?: Approval['keyMetrics'];
    revisedMetrics?: Approval['keyMetrics'];
    originalMessage?: string;
    revisedMessage?: string;
  }[];
  currentRevision?: number; // Tracks which revision this is (0 = original)
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMULATION STATE
// ═══════════════════════════════════════════════════════════════════════════
export interface SimulationEvent {
  id: string;
  timestamp: string;
  phase: WorkflowPhase;
  type: 'STATE_CHANGE' | 'APPROVAL_CREATED' | 'APPROVAL_DECIDED' | 'METRIC_COMPUTED' | 'USER_ACTION' | 'OPERATING_EVENT';
  description: string;
  data?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNICATIONS (MILESTONE 3)
// Multi-agent message threading system
// ═══════════════════════════════════════════════════════════════════════════
export interface Message {
  id: string;
  threadId: string;
  personaId: string; // References AgentPersona.id
  timestamp: string;
  content: string;
  relatedApprovalId?: string;
  relatedEventId?: string;
  read: boolean;
}

export interface MessageThread {
  id: string;
  title: string;
  phase: WorkflowPhase;
  category: 'APPROVAL' | 'REVISION' | 'DECLINE' | 'OPERATING_EVENT' | 'PHASE_TRANSITION';
  messages: Message[];
  lastMessageAt: string;
  unreadCount: number;
}

export interface Simulation {
  id: string;
  propertyId: string;
  createdAt: string;
  currentPhase: WorkflowPhase;
  
  // Scenario data
  property: Property;
  units: Unit[];
  operatingStatements: OperatingStatement[];
  partnershipTerms: PartnershipTerms;
  
  // Approvals (gameplay)
  approvals: Approval[];
  pendingApprovals: Approval[];
  
  // Audit trail
  events: SimulationEvent[];
  
  // Communications (MILESTONE 3)
  messageThreads: MessageThread[];
  
  // Computed metrics (from deterministic finance engine)
  metrics: {
    entryCapRate?: number;
    exitCapRate?: number;
    irr?: number;
    moic?: number;
    cashOnCash?: number;
    totalDistributions?: number;
    investorNet?: number;
    sponsorNet?: number;
  };
  
  // Completion
  completed: boolean;
  completedAt?: string;
  finalScore?: number; // AI-native scorecard 0-100
}
