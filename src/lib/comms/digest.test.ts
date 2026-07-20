import { describe, it, expect } from 'vitest';
import { generateOperationsDigest, formatDigestMessage } from './digest';
import { createParkviewSimulation } from '@/data/parkview';

describe('Operations Digest', () => {
  it('should generate digest with metric changes', () => {
    const sim = createParkviewSimulation();
    sim.currentPhase = 'OPERATIONS';
    
    const digest = generateOperationsDigest(sim);
    
    expect(digest).toBeDefined();
    expect(digest.periodDescription).toContain(sim.property.name);
    expect(digest.metricChanges.length).toBeGreaterThan(0);
    expect(digest.summary).toBeTruthy();
  });

  it('should include NOI metric', () => {
    const sim = createParkviewSimulation();
    sim.currentPhase = 'OPERATIONS';
    
    const digest = generateOperationsDigest(sim);
    
    const noiMetric = digest.metricChanges.find(m => m.title === 'Net Operating Income');
    expect(noiMetric).toBeDefined();
    expect(noiMetric?.value).toBeTruthy();
  });

  it('should include DSCR metric', () => {
    const sim = createParkviewSimulation();
    sim.currentPhase = 'OPERATIONS';
    
    const digest = generateOperationsDigest(sim);
    
    const dscrMetric = digest.metricChanges.find(m => m.title === 'Debt Service Coverage Ratio');
    expect(dscrMetric).toBeDefined();
    expect(dscrMetric?.value).toContain('x');
  });

  it('should include occupancy metric', () => {
    const sim = createParkviewSimulation();
    sim.currentPhase = 'OPERATIONS';
    
    const digest = generateOperationsDigest(sim);
    
    const occMetric = digest.metricChanges.find(m => m.title === 'Occupancy');
    expect(occMetric).toBeDefined();
    expect(occMetric?.value).toContain('%');
  });

  it('should list pending decisions', () => {
    const sim = createParkviewSimulation();
    sim.currentPhase = 'OPERATIONS';
    
    // Add a pending approval
    sim.pendingApprovals.push({
      id: 'test-1',
      type: 'OPERATIONAL_DECISION',
      phase: 'OPERATIONS',
      propertyId: sim.propertyId,
      timestamp: new Date().toISOString(),
      title: 'Test Decision',
      description: 'Test description',
      agentMessage: 'Test message',
      primaryAction: 'Approve',
      status: 'PENDING',
    });
    
    const digest = generateOperationsDigest(sim);
    
    expect(digest.pendingDecisions.length).toBe(1);
    expect(digest.pendingDecisions[0].title).toBe('Test Decision');
  });

  it('should format digest as message', () => {
    const sim = createParkviewSimulation();
    sim.currentPhase = 'OPERATIONS';
    
    const digest = generateOperationsDigest(sim);
    const message = formatDigestMessage(digest);
    
    expect(message).toContain(sim.property.name);
    expect(message).toContain('KEY METRICS');
    expect(message).toContain('Asset Manager');
  });

  it('should show correct impact indicators', () => {
    const sim = createParkviewSimulation();
    sim.currentPhase = 'OPERATIONS';
    
    const digest = generateOperationsDigest(sim);
    const message = formatDigestMessage(digest);
    
    // Should contain at least one indicator
    const hasIndicator = message.includes('↑') || message.includes('↓') || message.includes('—');
    expect(hasIndicator).toBe(true);
  });
});
