import { Simulation, SimulationEvent } from '@/types';
import { netOperatingIncome, dscr, effectiveGrossIncome } from '@/lib/finance';
import { PERSONAS } from './personas';

// ═══════════════════════════════════════════════════════════════════════════
// "WHILE YOU WERE AWAY" DIGEST
// Summary of what happened during OPERATIONS hold period
// ═══════════════════════════════════════════════════════════════════════════

export interface DigestItem {
  type: 'OPERATING_EVENT' | 'METRIC_CHANGE' | 'PENDING_DECISION';
  title: string;
  description: string;
  impact?: 'positive' | 'negative' | 'neutral';
  value?: string;
}

export interface OperationsDigest {
  periodDescription: string;
  operatingEvents: DigestItem[];
  metricChanges: DigestItem[];
  pendingDecisions: DigestItem[];
  summary: string;
}

/**
 * Generate a digest of what happened during OPERATIONS phase
 */
export function generateOperationsDigest(
  simulation: Simulation,
  lastSeenTimestamp?: string
): OperationsDigest {
  const prop = simulation.property;
  
  // Get events since last seen (or all if not specified)
  const cutoffTime = lastSeenTimestamp ? new Date(lastSeenTimestamp) : new Date(0);
  const recentEvents = simulation.events.filter(
    e => e.phase === 'OPERATIONS' && new Date(e.timestamp) > cutoffTime
  );

  // Extract operating events
  const operatingEventItems: DigestItem[] = recentEvents
    .filter(e => e.type === 'OPERATING_EVENT')
    .map(e => ({
      type: 'OPERATING_EVENT' as const,
      title: e.description,
      description: JSON.stringify(e.data || {}),
      impact: 'neutral' as const,
    }));

  // Calculate current metrics
  const egi = effectiveGrossIncome(
    prop.annualGrossPotentialRent,
    prop.annualOtherIncome,
    prop.annualVacancy,
    prop.annualConcessions,
    prop.annualBadDebt
  );
  const noi = netOperatingIncome(egi, prop.annualOperatingExpenses);
  
  // Calculate annual debt service from loan terms
  const monthlyRate = prop.interestRate / 100 / 12;
  const numPayments = prop.loanTermYears * 12;
  const monthlyPayment = prop.loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  const annualDebtService = monthlyPayment * 12;
  
  const currentDSCR = dscr(noi, annualDebtService);
  const occupancy = prop.currentOccupancy;

  // Build metric changes summary
  const metricChanges: DigestItem[] = [
    {
      type: 'METRIC_CHANGE',
      title: 'Net Operating Income',
      description: `Current annual NOI: $${(noi / 1000).toFixed(0)}K`,
      value: `$${(noi / 1000).toFixed(0)}K`,
      impact: noi > 0 ? 'positive' : 'negative',
    },
    {
      type: 'METRIC_CHANGE',
      title: 'Debt Service Coverage Ratio',
      description: `DSCR: ${currentDSCR.toFixed(2)}x`,
      value: `${currentDSCR.toFixed(2)}x`,
      impact: currentDSCR >= 1.25 ? 'positive' : currentDSCR >= 1.0 ? 'neutral' : 'negative',
    },
    {
      type: 'METRIC_CHANGE',
      title: 'Occupancy',
      description: `Current occupancy: ${(occupancy * 100).toFixed(0)}%`,
      value: `${(occupancy * 100).toFixed(0)}%`,
      impact: occupancy >= 0.9 ? 'positive' : occupancy >= 0.8 ? 'neutral' : 'negative',
    },
  ];

  // Check for pending decisions
  const pendingDecisions: DigestItem[] = simulation.pendingApprovals.map(approval => ({
    type: 'PENDING_DECISION',
    title: approval.title,
    description: approval.description,
    impact: 'neutral' as const,
  }));

  // Generate summary
  const eventCount = operatingEventItems.length;
  const pendingCount = pendingDecisions.length;
  const summary = `During the operating period, ${eventCount} event${eventCount !== 1 ? 's' : ''} occurred. ${
    pendingCount > 0 
      ? `${pendingCount} decision${pendingCount !== 1 ? 's' : ''} require${pendingCount === 1 ? 's' : ''} your attention.` 
      : 'No decisions pending at this time.'
  }`;

  return {
    periodDescription: `Operations Update: ${prop.name}`,
    operatingEvents: operatingEventItems,
    metricChanges,
    pendingDecisions,
    summary,
  };
}

/**
 * Format digest as a message for display
 */
export function formatDigestMessage(digest: OperationsDigest): string {
  const assetManager = PERSONAS.ASSET_MANAGER;
  
  let message = `${digest.periodDescription}\n\n`;
  message += `${digest.summary}\n\n`;
  
  if (digest.metricChanges.length > 0) {
    message += `KEY METRICS:\n`;
    digest.metricChanges.forEach(item => {
      const indicator = item.impact === 'positive' ? '↑' : item.impact === 'negative' ? '↓' : '—';
      message += `${indicator} ${item.title}: ${item.value}\n`;
    });
    message += `\n`;
  }
  
  if (digest.operatingEvents.length > 0) {
    message += `OPERATING EVENTS:\n`;
    digest.operatingEvents.forEach(item => {
      message += `• ${item.title}\n`;
    });
    message += `\n`;
  }
  
  if (digest.pendingDecisions.length > 0) {
    message += `PENDING DECISIONS:\n`;
    digest.pendingDecisions.forEach(item => {
      message += `• ${item.title}\n`;
    });
  }
  
  message += `\n— ${assetManager.name}, ${assetManager.role}`;
  
  return message;
}
